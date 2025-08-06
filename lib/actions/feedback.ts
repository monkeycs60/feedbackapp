"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { feedbackSubmissionSchema } from "@/lib/schemas/feedback";

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

// Use the feedback submission schema
const feedbackSchema = feedbackSubmissionSchema;

// Type guards to check which schema is used
function isStructuredFeedback(data: any): data is z.infer<typeof feedbackSchema> {
  return 'globalRating' in data && 'firstImpression' in data;
}

// Export the structured schema for use in components


export async function createFeedback(data: z.infer<typeof feedbackSchema>) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a un profil roaster ET que son rôle principal est roaster
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roasterProfile: true }
    });

    if (!userWithProfile?.roasterProfile) {
      throw new Error("Roaster profile required");
    }

    if (userWithProfile.primaryRole !== 'roaster') {
      throw new Error("Only roasters can create feedbacks. Switch roles to access this feature");
    }

    const validation = feedbackSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Invalid data: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validData = validation.data;

    // Vérifier que le roast request existe et est ouvert
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: validData.roastRequestId },
      include: { creator: true }
    });

    if (!roastRequest) {
      throw new Error("Roast request not found");
    }

    if (!['open', 'in_progress', 'collecting_applications'].includes(roastRequest.status)) {
      throw new Error("This request is no longer open");
    }

    if (roastRequest.creatorId === user.id) {
      throw new Error("You cannot provide feedback on your own request");
    }

    // Vérifier que l'utilisateur a une candidature acceptée
    const userApplication = await prisma.roastApplication.findUnique({
      where: {
        roastRequestId_roasterId: {
          roastRequestId: validData.roastRequestId,
          roasterId: user.id
        }
      }
    });

    if (!userApplication || !['accepted', 'auto_selected'].includes(userApplication.status)) {
      throw new Error("You must have an accepted application to submit feedback");
    }

    // Vérifier que l'utilisateur n'a pas déjà soumis un feedback pour cette demande
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id
      }
    });

    if (existingFeedback) {
      throw new Error("You have already submitted feedback for this request");
    }

    // Vérifier que le prix ne dépasse pas le budget maximum
    if (validData.finalPrice > roastRequest.maxPrice) {
      throw new Error(`Price cannot exceed the maximum budget of €${roastRequest.maxPrice}`);
    }

    // Créer le feedback principal avec les bons champs selon le type
    const isStructured = isStructuredFeedback(validData);
    
    const feedback = await prisma.feedback.create({
      data: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id,
        // Legacy fields
        generalFeedback: isStructured ? null : (validData as any).generalFeedback,
        // New structured fields
        globalRating: isStructured ? (validData as any).globalRating : null,
        firstImpression: isStructured ? (validData as any).firstImpression : null,
        strengths: isStructured ? (validData as any).strengths : [],
        weaknesses: isStructured ? (validData as any).weaknesses : [],
        recommendations: isStructured ? (validData as any).recommendations : [],
        uxUiRating: isStructured ? (validData as any).uxUiRating : null,
        valueRating: isStructured ? (validData as any).valueRating : null,
        performanceRating: isStructured ? (validData as any).performanceRating : null,
        experienceRating: isStructured ? (validData as any).experienceRating : null,
        additionalComments: isStructured ? (validData as any).additionalComments : null,
        // Common fields
        screenshots: validData.screenshots || [],
        finalPrice: validData.finalPrice,
        status: 'completed'
      }
    });

    // Créer les réponses aux questions  
    if (validData.questionResponses && validData.questionResponses.length > 0) {
      const questionResponsesData = validData.questionResponses.map((qr) => ({
        feedbackId: feedback.id,
        questionId: qr.questionId,
        response: qr.response
      }));

      await prisma.questionResponse.createMany({
        data: questionResponsesData
      });
    }

    // Ne plus mettre à jour les compteurs - on calculera en temps réel
    // Ceci évite toute désynchronisation

    // Mettre à jour le statut du roast request si nécessaire
    await prisma.roastRequest.update({
      where: { id: validData.roastRequestId },
      data: { status: 'in_progress' }
    });

    revalidatePath('/marketplace');
    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    // Allow Next.js redirects to pass through
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Error creating feedback:', error);
    throw new Error('Error creating feedback');
  }
}

export async function getUserFeedbacks() {
  try {
    const user = await getCurrentUser();

    return await prisma.feedback.findMany({
      where: { roasterId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        roastRequest: {
          select: {
            id: true,
            title: true,
            maxPrice: true,
            creator: {
              select: { name: true }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return [];
  }
}

export async function getFeedbackByRoastRequest(roastRequestId: string) {
  try {
    const user = await getCurrentUser();

    return await prisma.feedback.findFirst({
      where: {
        roastRequestId: roastRequestId,
        roasterId: user.id
      },
      include: {
        questionResponses: {
          include: {
            question: true
          }
        },
        roastRequest: {
          include: {
            questions: {
              orderBy: [
                { domain: 'asc' },
                { order: 'asc' }
              ]
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }
}

export async function updateFeedbackStatus(id: string, status: 'pending' | 'completed' | 'disputed') {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est propriétaire du feedback
    const feedback = await prisma.feedback.findFirst({
      where: { 
        id,
        roasterId: user.id 
      }
    });

    if (!feedback) {
      throw new Error("Feedback not found");
    }

    await prisma.feedback.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/marketplace');
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw new Error('Error updating status');
  }
}

export async function deleteFeedback(id: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est propriétaire
    const feedback = await prisma.feedback.findFirst({
      where: { 
        id,
        roasterId: user.id 
      }
    });

    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Ne peut supprimer que si le feedback est encore en pending
    if (feedback.status !== 'pending') {
      throw new Error("Cannot delete a feedback that is no longer pending");
    }

    await prisma.feedback.delete({
      where: { id }
    });

    // Ne plus décrémenter les compteurs - on calculera en temps réel
    // Ceci évite toute désynchronisation

    revalidatePath('/marketplace');
    return { success: true };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Error during deletion');
  }
}

export async function getCreatorFeedbacks(status: 'all' | 'pending' | 'completed' | 'disputed' = 'all') {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a un profil créateur
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: user.id }
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    const where = {
      roastRequest: {
        creatorId: creator.id
      },
      ...(status !== 'all' && { status })
    };

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        roastRequest: {
          select: {
            id: true,
            title: true,
            questions: true
          }
        },
        roaster: {
          include: {
            roasterProfile: true
          }
        },
        questionResponses: {
          include: {
            question: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return feedbacks;
  } catch (error) {
    console.error('Error fetching creator feedbacks:', error);
    return [];
  }
}

export async function getCreatorFeedbackStats() {
  try {
    const user = await getCurrentUser();

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: user.id }
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    const stats = await prisma.feedback.groupBy({
      by: ['status'],
      where: {
        roastRequest: {
          creatorId: creator.id
        }
      },
      _count: true
    });

    const totalFeedbacks = await prisma.feedback.count({
      where: {
        roastRequest: {
          creatorId: creator.id
        }
      }
    });

    const avgRating = await prisma.feedback.aggregate({
      where: {
        roastRequest: {
          creatorId: creator.id
        },
        creatorRating: { not: null }
      },
      _avg: {
        creatorRating: true
      }
    });

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalFeedbacks,
      pending: statsMap.pending || 0,
      completed: statsMap.completed || 0,
      disputed: statsMap.disputed || 0,
      averageRating: avgRating._avg.creatorRating || 0
    };
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      disputed: 0,
      averageRating: 0
    };
  }
}

export async function getFullFeedbackDetails(feedbackId: string) {
  try {
    const user = await getCurrentUser();

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        roastRequest: {
          include: {
            creator: true,
            questions: true
          }
        },
        roaster: {
          include: {
            roasterProfile: true
          }
        },
        questionResponses: {
          include: {
            question: true
          }
        }
      }
    });

    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Vérifier que l'utilisateur est le créateur ou le roaster
    const isCreator = feedback.roastRequest.creator.id === user.id;
    const isRoaster = feedback.roasterId === user.id;

    if (!isCreator && !isRoaster) {
      throw new Error("Unauthorized access");
    }

    return feedback;
  } catch (error) {
    console.error('Error fetching feedback details:', error);
    return null;
  }
}