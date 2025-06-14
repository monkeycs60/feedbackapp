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
  targetAudience: z.string().min(10, "Décris ton audience cible").max(200),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1, "Sélectionne au moins un domaine").max(4, "Maximum 4 domaines"),
  maxPrice: z.number().min(25).max(100),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  additionalContext: z.string().max(500).optional()
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

    await prisma.roastRequest.create({
      data: {
        creatorId: user.id,
        title: validData.title,
        appUrl: validData.appUrl,
        description: validData.description,
        targetAudience: validData.targetAudience,
        focusAreas: validData.focusAreas,
        maxPrice: validData.maxPrice,
        deadline: validData.deadline,
        status: 'open'
      }
    });

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
          select: { id: true, status: true }
        },
        _count: {
          select: { feedbacks: true }
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
        status: 'open' 
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
        feedbacks: {
          select: { id: true, status: true }
        },
        _count: {
          select: { feedbacks: true }
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération demandes disponibles:', error);
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
              select: {
                id: true,
                name: true,
                roasterProfile: {
                  select: {
                    rating: true,
                    completedRoasts: true,
                    level: true
                  }
                }
              }
            }
          }
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