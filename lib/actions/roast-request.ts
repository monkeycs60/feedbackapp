"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { roastRequestSchema, newRoastRequestSchema } from "@/lib/schemas/roast-request";

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  
  return session.user;
}

export async function createRoastRequest(data: z.infer<typeof roastRequestSchema>) {
  try {
    const user = await getCurrentUser();

    // Verify that the user has a creator profile AND that their primary role is creator
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { creatorProfile: true }
    });

    if (!userWithProfile?.creatorProfile) {
      throw new Error("Creator profile required");
    }

    if (userWithProfile.primaryRole === 'roaster') {
      throw new Error("Roasters cannot create roast requests. Switch roles to access this feature");
    }

    const validation = roastRequestSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Invalid data: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validData = validation.data;

    console.log({validData});

    // Handle custom target audience if needed
    let targetAudienceIds = validData.targetAudienceIds;
    
    if (validData.targetAudienceIds.includes('custom') && validData.customTargetAudience) {
      // Check if custom audience already exists
      const existing = await prisma.targetAudience.findFirst({
        where: { 
          name: {
            equals: validData.customTargetAudience.name,
            mode: 'insensitive'
          }
        }
      });
      
      let customAudienceId: string;
      
      if (existing) {
        customAudienceId = existing.id;
      } else {
        // Create new custom audience
        const newAudience = await prisma.targetAudience.create({
          data: {
            name: validData.customTargetAudience.name,
            isDefault: false,
            createdBy: user.id
          }
        });
        customAudienceId = newAudience.id;
      }
      
      // Replace 'custom' with the actual audience ID
      targetAudienceIds = targetAudienceIds.map(id => id === 'custom' ? customAudienceId : id);
    }

    const roastRequest = await prisma.roastRequest.create({
      data: {
        creatorId: user.id,
        title: validData.title,
        appUrl: validData.appUrl,
        description: validData.description,
        category: validData.category,
        maxPrice: validData.maxPrice,
        feedbacksRequested: validData.feedbacksRequested,
        deadline: validData.deadline,
        status: 'open',
        coverImage: validData.coverImage,
        targetAudiences: {
          create: targetAudienceIds.map(audienceId => ({
            targetAudienceId: audienceId
          }))
        }
      }
    });

    // Create questions if they exist
    if (validData.selectedDomains && validData.selectedDomains.length > 0) {
      const questionsToCreate = validData.selectedDomains.flatMap(domain => 
        domain.questions.map(question => ({
          roastRequestId: roastRequest.id,
          domain: domain.id,
          text: question.text,
          order: question.order,
          isDefault: question.isDefault
        }))
      );

      await prisma.roastQuestion.createMany({
        data: questionsToCreate
      });
    }

    // Update posted projects counter
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data: { projectsPosted: { increment: 1 } }
    });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    // Allow Next.js redirects to pass through
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error creating roast request:', error);
    throw new Error('Error creating the request');
  }
}

/**
 * Create a new roast request with the new feedback mode system
 */
export async function createNewRoastRequest(data: z.infer<typeof newRoastRequestSchema>) {
  try {
    const user = await getCurrentUser();

    // Verify user has creator profile and correct role
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { creatorProfile: true }
    });

    if (!userWithProfile?.creatorProfile) {
      throw new Error("Creator profile required");
    }

    if (userWithProfile.primaryRole === 'roaster') {
      throw new Error("Roasters cannot create roast requests. Switch roles to access this feature");
    }

    // Validate input data
    const validation = newRoastRequestSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Invalid data: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validData = validation.data;

    // Simple validation for new model
    const pricePerRoaster = validData.pricePerRoaster || 3;
    
    // Validate price range
    if (pricePerRoaster < 3 || pricePerRoaster > 50) {
      throw new Error("Price per roaster must be between €3 and €50");
    }

    // Handle target audiences - create them if they don't exist
    const audienceIds = [];
    
    for (const audienceId of validData.targetAudienceIds) {
      // Check if it's a fake ID from the English audience list (en_X format)
      if (audienceId.startsWith('en_')) {
        const index = parseInt(audienceId.replace('en_', ''));
        const { TARGET_AUDIENCES_EN } = await import('@/lib/data/target-audiences');
        const audienceName = TARGET_AUDIENCES_EN[index];
        
        if (audienceName) {
          // Check if this audience already exists
          let existingAudience = await prisma.targetAudience.findFirst({
            where: { 
              name: {
                equals: audienceName,
                mode: 'insensitive'
              }
            }
          });
          
          // Create it if it doesn't exist
          if (!existingAudience) {
            existingAudience = await prisma.targetAudience.create({
              data: {
                name: audienceName,
                isDefault: true,
                createdBy: user.id
              }
            });
          }
          
          audienceIds.push(existingAudience.id);
        }
      } else {
        // Regular audience ID - just use it directly
        audienceIds.push(audienceId);
      }
    }

    // Handle custom target audience creation
    let customAudienceId = null;
    if (validData.customTargetAudience?.name) {
      const customAudience = await prisma.targetAudience.create({
        data: {
          name: validData.customTargetAudience.name,
          isDefault: false,
          createdBy: user.id
        }
      });
      customAudienceId = customAudience.id;
    }

    // Create the roast request with new fields
    const roastRequest = await prisma.roastRequest.create({
      data: {
        creatorId: user.id,
        title: validData.title,
        appUrl: validData.appUrl,
        description: validData.description,
        deadline: validData.deadline,
        status: 'collecting_applications',
        feedbacksRequested: validData.feedbacksRequested,
        category: validData.category,
        coverImage: validData.coverImage,
        
        // New simplified pricing model
        pricePerRoaster: pricePerRoaster,
        
        // Keep legacy fields for backward compatibility
        maxPrice: pricePerRoaster * validData.feedbacksRequested,
        
        // Create target audience relationships
        targetAudiences: {
          create: [
            ...audienceIds.map(id => ({ targetAudienceId: id })),
            ...(customAudienceId ? [{ targetAudienceId: customAudienceId }] : [])
          ]
        }
      }
    });

    // Create questions if any
    if (validData.questions && validData.questions.length > 0) {
      await prisma.roastQuestion.createMany({
        data: validData.questions.map(question => ({
          roastRequestId: roastRequest.id,
          domain: question.domain || 'General',
          text: question.text,
          order: question.order,
          isDefault: false
        }))
      });
    }

    revalidatePath('/marketplace');
    revalidatePath('/dashboard');
    
    redirect(`/dashboard/roast/${roastRequest.id}`);

  } catch (error: unknown) {
    // Allow Next.js redirects to pass through
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error creating roast request (new system):', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la création de la demande');
  }
}

export async function getUserRoastRequests() {
  try {
    const user = await getCurrentUser();

    return await prisma.roastRequest.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        feedbacks: {
          include: {
            roaster: {
              include: {
                roasterProfile: true
              }
            },
            questionResponses: {
              include: {
                question: true
              }
            },
            roastRequest: {
              select: {
                id: true,
                title: true,
                questions: {
                  orderBy: [
                    { domain: 'asc' },
                    { order: 'asc' }
                  ]
                }
              }
            }
          }
        },
        applications: {
          select: { id: true, status: true }
        },
        _count: {
          select: { 
            feedbacks: true,
            applications: true 
          }
        },
        questions: {
          orderBy: [
            { domain: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching roast requests:', error);
    return [];
  }
}

export async function updateRoastRequestStatus(id: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    const user = await getCurrentUser();

    // Verify that the user owns the request
    const roastRequest = await prisma.roastRequest.findFirst({
      where: { 
        id,
        creatorId: user.id 
      }
    });

    if (!roastRequest) {
      throw new Error("Request not found");
    }

    await prisma.roastRequest.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error('Error updating status');
  }
}

export async function getAvailableRoastRequests() {
  try {
    return await prisma.roastRequest.findMany({
      where: { 
        OR: [
          { status: 'open' },
          { status: 'in_progress' },
          { status: 'collecting_applications' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            creatorProfile: {
              select: {
                company: true
              }
            }
          }
        },
        targetAudiences: {
          include: {
            targetAudience: true
          }
        },
        feedbacks: {
          select: { id: true, status: true }
        },
        applications: {
          select: { id: true, status: true }
        },
        _count: {
          select: { 
            feedbacks: true,
            applications: true 
          }
        },
        questions: {
          orderBy: [
            { domain: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching available requests:', error);
    return [];
  }
}

export type RoastFilters = {
  applicationStatus?: 'not_applied' | 'in_progress' | 'completed';
  domains?: string[];
  targetAudiences?: string[];
  dateFilter?: 'today' | 'yesterday' | 'last_week' | 'last_month';
  minPrice?: number;
  maxPrice?: number;
};

export async function getFilteredRoastRequests(filters?: RoastFilters) {
  try {
    const user = await getCurrentUser();
    
    // Base query for available roasts
    const roasts = await prisma.roastRequest.findMany({
      where: { 
        OR: [
          { status: 'open' },
          { status: 'in_progress' },
          { status: 'collecting_applications' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            creatorProfile: {
              select: {
                company: true
              }
            }
          }
        },
        targetAudiences: {
          include: {
            targetAudience: true
          }
        },
        feedbacks: {
          where: { roasterId: user.id },
          select: { id: true, status: true }
        },
        applications: {
          select: { id: true, status: true, roasterId: true }
        },
        _count: {
          select: { 
            feedbacks: true,
            applications: true 
          }
        },
        questions: {
          orderBy: [
            { domain: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });

    if (!filters) return roasts;

    // Filter by application status
    let filteredRoasts = roasts;
    if (filters.applicationStatus) {
      filteredRoasts = roasts.filter(roast => {
        const hasApplication = roast.applications.length > 0;
        const hasFeedback = roast.feedbacks.length > 0;
        const hasCompletedFeedback = roast.feedbacks.some(f => f.status === 'completed');
        
        switch (filters.applicationStatus) {
          case 'not_applied':
            return !hasApplication && !hasFeedback;
          case 'in_progress':
            return (hasApplication || hasFeedback) && !hasCompletedFeedback;
          case 'completed':
            return hasCompletedFeedback;
          default:
            return true;
        }
      });
    }

    // Filter by domains (focus areas) - DEPRECATED: focusAreas field removed from schema
    // if (filters.domains && filters.domains.length > 0) {
    //   filteredRoasts = filteredRoasts.filter(roast =>
    //     roast.focusAreas.some(area => filters.domains!.includes(area))
    //   );
    // }

    // Filter by target audiences
    if (filters.targetAudiences && filters.targetAudiences.length > 0) {
      filteredRoasts = filteredRoasts.filter(roast =>
        roast.targetAudiences.some(ta => 
          filters.targetAudiences!.includes(ta.targetAudience.name)
        )
      );
    }

    // Filter by date
    if (filters.dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filteredRoasts = filteredRoasts.filter(roast => {
        const roastDate = new Date(roast.createdAt);
        switch (filters.dateFilter) {
          case 'today':
            return roastDate >= today;
          case 'yesterday':
            return roastDate >= yesterday && roastDate < today;
          case 'last_week':
            return roastDate >= lastWeek;
          case 'last_month':
            return roastDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filteredRoasts = filteredRoasts.filter(roast => {
        const pricePerRoast = Math.round((roast.maxPrice ?? 0) / roast.feedbacksRequested);
        if (filters.minPrice !== undefined && pricePerRoast < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && pricePerRoast > filters.maxPrice) return false;
        return true;
      });
    }

    return filteredRoasts;
  } catch (error) {
    console.error('Error fetching filtered requests:', error);
    return [];
  }
}

export async function getRoastRequestById(id: string) {
  try {
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            creatorProfile: {
              select: {
                company: true,
                projectsPosted: true,
                avgRating: true
              }
            }
          }
        },
        feedbacks: {
          include: {
            roaster: {
              include: {
                roasterProfile: true
              }
            },
            questionResponses: {
              include: {
                question: true
              }
            },
            roastRequest: {
              select: {
                id: true,
                title: true,
                questions: {
                  orderBy: [
                    { domain: 'asc' },
                    { order: 'asc' }
                  ]
                }
              }
            }
          }
        },
        applications: {
          select: {
            id: true,
            motivation: true,
            status: true,
            score: true,
            createdAt: true,
            roaster: {
              select: {
                id: true,
                name: true,
                roasterProfile: {
                  select: {
                    specialties: true,
                    experience: true,
                    rating: true,
                    completedRoasts: true,
                    level: true,
                    bio: true,
                    completionRate: true
                  }
                }
              }
            }
          }
        },
        targetAudiences: {
          include: {
            targetAudience: true
          }
        },
        questions: {
          orderBy: [
            { domain: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });

    return roastRequest;
  } catch (error) {
    console.error('Error fetching roast request:', error);
    return null;
  }
}

export async function deleteRoastRequest(id: string) {
  try {
    const user = await getCurrentUser();

    // Verify that the user is the owner
    const roastRequest = await prisma.roastRequest.findFirst({
      where: { 
        id,
        creatorId: user.id 
      }
    });

    if (!roastRequest) {
      throw new Error("Request not found");
    }

    // Can only delete if no feedbacks have been started
    const hasFeedbacks = await prisma.feedback.findFirst({
      where: { roastRequestId: id }
    });

    if (hasFeedbacks) {
      throw new Error("Cannot delete a request with existing feedbacks");
    }

    await prisma.roastRequest.delete({
      where: { id }
    });

    // Decrement the counter
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data: { projectsPosted: { decrement: 1 } }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting roast request:', error);
    throw new Error('Error during deletion');
  }
}