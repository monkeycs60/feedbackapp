"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const ratingSchema = z.object({
  domain: z.string().nullable(),
  overall: z.number().min(1).max(5),
  comment: z.string().optional(),
});

const feedbackRatingsSchema = z.object({
  feedbackId: z.string(),
  ratings: z.array(ratingSchema),
});

export async function submitFeedbackRatings(data: z.infer<typeof feedbackRatingsSchema>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const validation = feedbackRatingsSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides");
    }

    const { feedbackId, ratings } = validation.data;

    // Vérifier que l'utilisateur est le créateur du roast
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { roastRequest: true }
    });

    if (!feedback) {
      throw new Error("Feedback non trouvé");
    }

    if (feedback.roastRequest.creatorId !== session.user.id) {
      throw new Error("Non autorisé");
    }

    // Supprimer les anciennes notes si elles existent
    await prisma.feedbackRating.deleteMany({
      where: { feedbackId }
    });

    // Créer les nouvelles notes
    await prisma.feedbackRating.createMany({
      data: ratings.map(rating => ({
        feedbackId,
        domain: rating.domain,
        clarity: rating.overall, // Use overall for all criteria for backwards compatibility
        relevance: rating.overall,
        depth: rating.overall,
        actionable: rating.overall,
        overall: rating.overall,
        comment: rating.comment,
      }))
    });

    // Mettre à jour la note globale du feedback (moyenne des notes overall)
    const averageRating = ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length;
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { creatorRating: Math.round(averageRating) }
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur soumission notes:', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la soumission');
  }
}

export async function getFeedbackRatings(feedbackId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const ratings = await prisma.feedbackRating.findMany({
      where: { feedbackId },
      orderBy: { domain: 'asc' }
    });

    return ratings;
  } catch (error) {
    console.error('Erreur récupération notes:', error);
    return [];
  }
}

export async function getRoasterAverageRating(roasterId: string, domain?: string) {
  try {
    const whereClause: any = {
      feedback: {
        roasterId: roasterId,
        status: 'completed'
      }
    };

    if (domain) {
      whereClause.domain = domain;
    }

    const ratings = await prisma.feedbackRating.findMany({
      where: whereClause,
      include: {
        feedback: {
          include: {
            roastRequest: true
          }
        }
      }
    });

    if (ratings.length === 0) {
      return null;
    }

    const avgClarity = ratings.reduce((sum, r) => sum + r.clarity, 0) / ratings.length;
    const avgRelevance = ratings.reduce((sum, r) => sum + r.relevance, 0) / ratings.length;
    const avgDepth = ratings.reduce((sum, r) => sum + r.depth, 0) / ratings.length;
    const avgActionable = ratings.reduce((sum, r) => sum + r.actionable, 0) / ratings.length;
    const avgOverall = ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length;

    return {
      domain,
      count: ratings.length,
      averages: {
        clarity: Number(avgClarity.toFixed(1)),
        relevance: Number(avgRelevance.toFixed(1)),
        depth: Number(avgDepth.toFixed(1)),
        actionable: Number(avgActionable.toFixed(1)),
        overall: Number(avgOverall.toFixed(1)),
      }
    };
  } catch (error) {
    console.error('Erreur calcul moyenne roaster:', error);
    return null;
  }
}