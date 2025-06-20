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

const feedbackSchema = z.object({
  roastRequestId: z.string(),
  questionResponses: z.record(z.string(), z.string().min(10, "Réponse trop courte (min 10 caractères)")),
  generalFeedback: z.string().min(50, "Feedback général trop court (min 50 caractères)"),
  screenshots: z.array(z.string()).optional(),
  finalPrice: z.number().min(1, "Prix minimum de 1€"),
});


export async function createFeedback(data: z.infer<typeof feedbackSchema>) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a un profil roaster ET que son rôle principal est roaster
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roasterProfile: true }
    });

    if (!userWithProfile?.roasterProfile) {
      throw new Error("Profil roaster requis");
    }

    if (userWithProfile.primaryRole !== 'roaster') {
      throw new Error("Seuls les roasters peuvent créer des feedbacks. Changez de rôle pour accéder à cette fonctionnalité.");
    }

    const validation = feedbackSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validData = validation.data;

    // Vérifier que le roast request existe et est ouvert
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: validData.roastRequestId },
      include: { creator: true }
    });

    if (!roastRequest) {
      throw new Error("Demande de roast non trouvée");
    }

    if (!['open', 'in_progress'].includes(roastRequest.status)) {
      throw new Error("Cette demande n'est plus ouverte");
    }

    if (roastRequest.creatorId === user.id) {
      throw new Error("Vous ne pouvez pas faire un feedback sur votre propre demande");
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
      throw new Error("Vous devez avoir une candidature acceptée pour soumettre un feedback");
    }

    // Vérifier que l'utilisateur n'a pas déjà soumis un feedback pour cette demande
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id
      }
    });

    if (existingFeedback) {
      throw new Error("Vous avez déjà soumis un feedback pour cette demande");
    }

    // Vérifier que le prix ne dépasse pas le budget maximum
    if (validData.finalPrice > roastRequest.maxPrice) {
      throw new Error(`Le prix ne peut pas dépasser le budget maximum de ${roastRequest.maxPrice}€`);
    }

    // Créer le feedback principal
    const feedback = await prisma.feedback.create({
      data: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id,
        generalFeedback: validData.generalFeedback,
        screenshots: validData.screenshots || [],
        finalPrice: validData.finalPrice,
        status: 'completed'
      }
    });

    // Créer les réponses aux questions
    if (validData.questionResponses && Object.keys(validData.questionResponses).length > 0) {
      const questionResponsesData = Object.entries(validData.questionResponses).map(([questionId, response]) => ({
        feedbackId: feedback.id,
        questionId,
        response
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
    console.error('Erreur création feedback:', error);
    throw new Error('Erreur lors de la création du feedback');
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
    console.error('Erreur récupération feedbacks:', error);
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
        questionResponses: true,
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
    console.error('Erreur récupération feedback:', error);
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
      throw new Error("Feedback non trouvé");
    }

    await prisma.feedback.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/marketplace');
    return { success: true };
  } catch (error) {
    console.error('Erreur mise à jour statut feedback:', error);
    throw new Error('Erreur lors de la mise à jour du statut');
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
      throw new Error("Feedback non trouvé");
    }

    // Ne peut supprimer que si le feedback est encore en pending
    if (feedback.status !== 'pending') {
      throw new Error("Impossible de supprimer un feedback qui n'est plus en attente");
    }

    await prisma.feedback.delete({
      where: { id }
    });

    // Ne plus décrémenter les compteurs - on calculera en temps réel
    // Ceci évite toute désynchronisation

    revalidatePath('/marketplace');
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression feedback:', error);
    throw new Error('Erreur lors de la suppression');
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
      throw new Error("Profil créateur introuvable");
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
        questionResponses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return feedbacks;
  } catch (error) {
    console.error('Erreur récupération feedbacks créateur:', error);
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
      throw new Error("Profil créateur introuvable");
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
    console.error('Erreur récupération stats feedbacks:', error);
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
        questionResponses: true
      }
    });

    if (!feedback) {
      throw new Error("Feedback introuvable");
    }

    // Vérifier que l'utilisateur est le créateur ou le roaster
    const isCreator = feedback.roastRequest.creator.id === user.id;
    const isRoaster = feedback.roasterId === user.id;

    if (!isCreator && !isRoaster) {
      throw new Error("Accès non autorisé");
    }

    return feedback;
  } catch (error) {
    console.error('Erreur récupération détails feedback:', error);
    return null;
  }
}