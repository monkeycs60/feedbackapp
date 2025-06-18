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
  firstImpression: z.string().min(10, "Première impression trop courte"),
  strengthsFound: z.array(z.string()).min(1, "Au moins un point fort requis"),
  weaknessesFound: z.array(z.string()).min(1, "Au moins un point faible requis"),
  actionableSteps: z.array(z.string()).min(1, "Au moins une action recommandée"),
  competitorComparison: z.string().optional(),
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

    // Créer le feedback
    const feedback = await prisma.feedback.create({
      data: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id,
        firstImpression: validData.firstImpression,
        strengthsFound: validData.strengthsFound,
        weaknessesFound: validData.weaknessesFound,
        actionableSteps: validData.actionableSteps,
        competitorComparison: validData.competitorComparison || null,
        screenshots: validData.screenshots || [],
        finalPrice: validData.finalPrice,
        status: 'completed'
      }
    });

    // Mettre à jour les statistiques du roaster
    await prisma.roasterProfile.update({
      where: { userId: user.id },
      data: { 
        completedRoasts: { increment: 1 },
        totalEarned: { increment: validData.finalPrice }
      }
    });

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

    // Décrémenter les statistiques du roaster
    await prisma.roasterProfile.update({
      where: { userId: user.id },
      data: { 
        completedRoasts: { decrement: 1 },
        totalEarned: { decrement: feedback.finalPrice || 0 }
      }
    });

    revalidatePath('/marketplace');
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression feedback:', error);
    throw new Error('Erreur lors de la suppression');
  }
}