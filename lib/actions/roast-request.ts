"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  
  return session.user;
}

const roastRequestSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudienceIds: z.array(z.string()).min(1, "Sélectionne au moins une audience cible").max(2, "Maximum 2 audiences cibles"),
  customTargetAudience: z.object({
    name: z.string()
  }).optional(),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1, "Sélectionne au moins un domaine"),
  maxPrice: z.number().min(2, "Le prix minimum est de 2€"),
  feedbacksRequested: z.number().min(1, "Au moins 1 feedback").max(20, "Maximum 20 feedbacks"),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  additionalContext: z.string().max(500).optional(),
  coverImage: z.string().optional(), // URL de l'image uploadée
  // Nouveau : pour gérer les questions
  selectedDomains: z.array(z.object({
    id: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      text: z.string(),
      isDefault: z.boolean(),
      order: z.number()
    }))
  })).optional()
});

export async function createRoastRequest(data: z.infer<typeof roastRequestSchema>) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a un profil créateur ET que son rôle principal est creator
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { creatorProfile: true }
    });

    if (!userWithProfile?.creatorProfile) {
      throw new Error("Profil créateur requis");
    }

    if (userWithProfile.primaryRole === 'roaster') {
      throw new Error("Les roasters ne peuvent pas créer de demandes de roast. Changez de rôle pour accéder à cette fonctionnalité.");
    }

    const validation = roastRequestSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
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
        focusAreas: validData.focusAreas,
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

    // Créer les questions si elles existent
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

    // Mettre à jour le compteur de projets postés
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
    console.error('Erreur création roast request:', error);
    throw new Error('Erreur lors de la création de la demande');
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
            questionResponses: true,
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
    console.error('Erreur récupération roast requests:', error);
    return [];
  }
}

export async function updateRoastRequestStatus(id: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est propriétaire de la demande
    const roastRequest = await prisma.roastRequest.findFirst({
      where: { 
        id,
        creatorId: user.id 
      }
    });

    if (!roastRequest) {
      throw new Error("Demande non trouvée");
    }

    await prisma.roastRequest.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    throw new Error('Erreur lors de la mise à jour du statut');
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
    console.error('Erreur récupération demandes disponibles:', error);
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
          where: { roasterId: user.id },
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

    // Filter by domains (focus areas)
    if (filters.domains && filters.domains.length > 0) {
      filteredRoasts = filteredRoasts.filter(roast =>
        roast.focusAreas.some(area => filters.domains!.includes(area))
      );
    }

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
        const pricePerRoast = Math.round(roast.maxPrice / roast.feedbacksRequested);
        if (filters.minPrice !== undefined && pricePerRoast < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && pricePerRoast > filters.maxPrice) return false;
        return true;
      });
    }

    return filteredRoasts;
  } catch (error) {
    console.error('Erreur récupération demandes filtrées:', error);
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
            questionResponses: true,
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
    console.error('Erreur récupération roast request:', error);
    return null;
  }
}

export async function deleteRoastRequest(id: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est propriétaire
    const roastRequest = await prisma.roastRequest.findFirst({
      where: { 
        id,
        creatorId: user.id 
      }
    });

    if (!roastRequest) {
      throw new Error("Demande non trouvée");
    }

    // Ne peut supprimer que si pas de feedbacks commencés
    const hasFeedbacks = await prisma.feedback.findFirst({
      where: { roastRequestId: id }
    });

    if (hasFeedbacks) {
      throw new Error("Impossible de supprimer une demande avec des feedbacks");
    }

    await prisma.roastRequest.delete({
      where: { id }
    });

    // Décrémenter le compteur
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data: { projectsPosted: { decrement: 1 } }
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression roast request:', error);
    throw new Error('Erreur lors de la suppression');
  }
}