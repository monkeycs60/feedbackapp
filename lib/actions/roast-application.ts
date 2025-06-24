"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

const applicationSchema = z.object({
  roastRequestId: z.string(),
  motivation: z.string().max(500, "Message trop long (max 500 caractères)").optional(),
});

/**
 * Calcule le score d'un roaster pour un roast donné
 */
function calculateRoasterScore(roasterProfile: any, roastRequest: any): number {
  let score = 0;
  
  // Score basé sur l'expérience (0-30 points)
  const experienceScores = { 'Débutant': 10, 'Intermédiaire': 20, 'Expert': 30 };
  score += experienceScores[roasterProfile.experience as keyof typeof experienceScores] || 10;
  
  // Score basé sur le rating (0-25 points)
  score += (roasterProfile.rating / 5) * 25;
  
  // Score basé sur les spécialités qui matchent (0-30 points)
  const matchingSpecialties = roasterProfile.specialties.filter((spec: string) => 
    roastRequest.focusAreas.includes(spec)
  );
  score += (matchingSpecialties.length / roastRequest.focusAreas.length) * 30;
  
  // Score basé sur le niveau (0-10 points)
  const levelScores = { 'rookie': 2, 'verified': 5, 'expert': 8, 'master': 10 };
  score += levelScores[roasterProfile.level as keyof typeof levelScores] || 2;
  
  // Score basé sur le taux de complétion (0-5 points)
  score += (roasterProfile.completionRate / 100) * 5;
  
  return Math.round(score);
}

/**
 * Permet à un roaster de candidater pour un roast
 */
export async function applyForRoast(data: z.infer<typeof applicationSchema>) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur a un profil roaster
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roasterProfile: true }
    });

    if (!userWithProfile?.roasterProfile) {
      throw new Error("Profil roaster requis pour candidater");
    }

    const validation = applicationSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validData = validation.data;

    // Vérifier que le roast existe et est ouvert aux candidatures
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: validData.roastRequestId },
      include: { applications: true }
    });

    if (!roastRequest) {
      throw new Error("Demande de roast non trouvée");
    }

    // Vérifier qu'il reste des places disponibles d'abord
    const acceptedApplications = roastRequest.applications.filter(
      app => app.status === 'accepted' || app.status === 'auto_selected'
    ).length;

    // Permettre les candidatures si statut ouvert/collecte OU si en cours mais avec des places libres
    if (roastRequest.status !== 'open' && 
        roastRequest.status !== 'collecting_applications' && 
        !(roastRequest.status === 'in_progress' && acceptedApplications < roastRequest.feedbacksRequested)) {
      throw new Error("Cette demande n'accepte plus de candidatures");
    }
    
    if (acceptedApplications >= roastRequest.feedbacksRequested) {
      throw new Error("Toutes les places ont déjà été attribuées");
    }

    if (roastRequest.creatorId === user.id) {
      throw new Error("Vous ne pouvez pas candidater sur votre propre demande");
    }

    // Vérifier que le roaster n'a pas déjà candidaté
    const existingApplication = await prisma.roastApplication.findUnique({
      where: {
        roastRequestId_roasterId: {
          roastRequestId: validData.roastRequestId,
          roasterId: user.id
        }
      }
    });

    if (existingApplication) {
      throw new Error("Vous avez déjà candidaté pour cette demande");
    }

    // Calculer le score du roaster
    const score = calculateRoasterScore(userWithProfile.roasterProfile, roastRequest);

    // Créer la candidature
    await prisma.roastApplication.create({
      data: {
        roastRequestId: validData.roastRequestId,
        roasterId: user.id,
        motivation: validData.motivation,
        score: score,
        status: 'pending'
      }
    });

    // Passer le roast en mode "collecting_applications" s'il vient d'être créé
    if (roastRequest.applications.length === 0) {
      await prisma.roastRequest.update({
        where: { id: validData.roastRequestId },
        data: { status: 'collecting_applications' }
      });
    }

    revalidatePath('/marketplace');
    return { success: true, score };
  } catch (error) {
    console.error('Erreur candidature roast:', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la candidature');
  }
}

/**
 * Sélection automatique des meilleurs roasters (utilisée après 24h)
 */
export async function autoSelectRoasters(roastRequestId: string) {
  try {
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: roastRequestId },
      include: { 
        applications: {
          include: { roaster: { include: { roasterProfile: true } } },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!roastRequest) {
      throw new Error("Demande de roast non trouvée");
    }

    const applicationsNeeded = roastRequest.feedbacksRequested;
    const topApplications = roastRequest.applications.slice(0, applicationsNeeded);

    // Marquer les applications sélectionnées
    for (const application of topApplications) {
      await prisma.roastApplication.update({
        where: { id: application.id },
        data: { 
          status: 'auto_selected',
          selectedAt: new Date()
        }
      });
    }

    // Marquer les autres comme rejetées
    const rejectedApplications = roastRequest.applications.slice(applicationsNeeded);
    for (const application of rejectedApplications) {
      await prisma.roastApplication.update({
        where: { id: application.id },
        data: { status: 'rejected' }
      });
    }

    // Mettre à jour le statut du roast
    await prisma.roastRequest.update({
      where: { id: roastRequestId },
      data: { status: 'in_progress' }
    });

    revalidatePath('/dashboard');
    return { success: true, selectedCount: topApplications.length };
  } catch (error) {
    console.error('Erreur sélection automatique:', error);
    throw new Error('Erreur lors de la sélection automatique');
  }
}

/**
 * Sélection manuelle par le créateur
 */
export async function manualSelectRoasters(roastRequestId: string, selectedApplicationIds: string[]) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est le créateur de la demande
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: roastRequestId },
      include: { applications: true }
    });

    if (!roastRequest) {
      throw new Error("Demande de roast non trouvée");
    }

    if (roastRequest.creatorId !== user.id) {
      throw new Error("Seul le créateur peut sélectionner les roasters");
    }

    // Compter les roasters déjà acceptés
    const alreadyAcceptedCount = roastRequest.applications.filter(
      app => app.status === 'accepted' || app.status === 'auto_selected'
    ).length;
    
    if (selectedApplicationIds.length + alreadyAcceptedCount > roastRequest.feedbacksRequested) {
      throw new Error(`Vous ne pouvez sélectionner que ${roastRequest.feedbacksRequested - alreadyAcceptedCount} roasters supplémentaires (${alreadyAcceptedCount}/${roastRequest.feedbacksRequested} déjà sélectionnés)`);
    }

    // Marquer les applications sélectionnées
    await prisma.roastApplication.updateMany({
      where: {
        id: { in: selectedApplicationIds },
        roastRequestId: roastRequestId
      },
      data: { 
        status: 'accepted',
        selectedAt: new Date()
      }
    });

    // Marquer seulement les applications en attente comme rejetées (préserver les acceptées/auto_selected)
    await prisma.roastApplication.updateMany({
      where: {
        roastRequestId: roastRequestId,
        id: { notIn: selectedApplicationIds },
        status: 'pending' // Seulement rejeter les pending, pas les déjà acceptées
      },
      data: { status: 'rejected' }
    });

    // Mettre à jour le statut du roast
    await prisma.roastRequest.update({
      where: { id: roastRequestId },
      data: { status: 'in_progress' }
    });

    revalidatePath('/dashboard');
    return { success: true, selectedCount: selectedApplicationIds.length };
  } catch (error) {
    console.error('Erreur sélection manuelle:', error);
    throw new Error('Erreur lors de la sélection manuelle');
  }
}

/**
 * Récupère les candidatures pour un roast (pour le créateur)
 */
export async function getRoastApplications(roastRequestId: string) {
  try {
    const user = await getCurrentUser();

    // Vérifier que l'utilisateur est le créateur
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: roastRequestId },
      include: {
        applications: {
          include: {
            roaster: {
              include: { roasterProfile: true }
            }
          },
          orderBy: { score: 'desc' }
        }
      }
    });

    if (!roastRequest) {
      throw new Error("Demande de roast non trouvée");
    }

    if (roastRequest.creatorId !== user.id) {
      throw new Error("Accès non autorisé");
    }

    return roastRequest.applications;
  } catch (error) {
    console.error('Erreur récupération candidatures:', error);
    return [];
  }
}

/**
 * Vérifie si un roaster a déjà candidaté
 */
export async function hasAppliedForRoast(roastRequestId: string) {
  try {
    const user = await getCurrentUser();

    const application = await prisma.roastApplication.findUnique({
      where: {
        roastRequestId_roasterId: {
          roastRequestId: roastRequestId,
          roasterId: user.id
        }
      }
    });

    return !!application;
  } catch (error) {
    console.error('Erreur vérification candidature:', error);
    return false;
  }
}

/**
 * Récupère les candidatures acceptées d'un roaster
 */
export async function getRoasterAcceptedApplications() {
  try {
    const user = await getCurrentUser();

    const applications = await prisma.roastApplication.findMany({
      where: {
        roasterId: user.id,
        status: {
          in: ['accepted', 'auto_selected']
        }
      },
      include: {
        roastRequest: {
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
            questions: {
              orderBy: [
                { domain: 'asc' },
                { order: 'asc' }
              ]
            },
            feedbacks: {
              where: {
                roasterId: user.id
              },
              select: {
                id: true,
                status: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: {
        selectedAt: 'desc'
      }
    });

    return applications;
  } catch (error) {
    console.error('Erreur récupération candidatures acceptées:', error);
    return [];
  }
}