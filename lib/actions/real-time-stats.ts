"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Calcule TOUTES les statistiques roaster en temps réel
 * Aucun compteur stocké = aucune désynchronisation possible
 */
export async function getRoasterStatsRealTime() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const userId = session.user.id;

    // Récupérer le profil pour les données statiques seulement
    const roasterProfile = await prisma.roasterProfile.findUnique({
      where: { userId },
      select: {
        specialties: true,
        languages: true,
        experience: true,
        bio: true,
        portfolio: true,
        rating: true,
        avgResponseTime: true,
        maxActiveRoasts: true,
        level: true,
        verified: true
      }
    });

    if (!roasterProfile) {
      throw new Error("Profil roaster non trouvé");
    }

    // 1. Compter les roasts complétés (toujours exact)
    const completedRoasts = await prisma.feedback.count({
      where: {
        roasterId: userId,
        status: 'completed'
      }
    });

    // 2. Calculer les gains totaux (toujours exact)
    const totalEarnedResult = await prisma.feedback.aggregate({
      where: {
        roasterId: userId,
        status: 'completed'
      },
      _sum: {
        finalPrice: true
      }
    });

    const totalEarned = totalEarnedResult._sum.finalPrice || 0;

    // 3. Missions actives (applications acceptées sans feedback complété)
    const currentActive = await prisma.roastApplication.count({
      where: {
        roasterId: userId,
        status: {
          in: ['accepted', 'auto_selected']
        },
        roastRequest: {
          feedbacks: {
            none: {
              roasterId: userId,
              status: 'completed'
            }
          }
        }
      }
    });

    // 4. Taux de complétion
    const totalApplications = await prisma.roastApplication.count({
      where: {
        roasterId: userId,
        status: {
          in: ['accepted', 'auto_selected']
        }
      }
    });

    const completionRate = totalApplications > 0 
      ? Math.round((completedRoasts / totalApplications) * 100)
      : 100;

    // 5. Calculer le niveau basé sur les roasts complétés
    let calculatedLevel = 'rookie';
    if (completedRoasts >= 50) calculatedLevel = 'expert';
    else if (completedRoasts >= 20) calculatedLevel = 'senior';
    else if (completedRoasts >= 10) calculatedLevel = 'confirmed';
    else if (completedRoasts >= 5) calculatedLevel = 'junior';

    return {
      ...roasterProfile,
      completedRoasts,
      totalEarned,
      currentActive,
      completionRate,
      level: calculatedLevel, // Toujours calculé en temps réel
    };

  } catch (error) {
    console.error('Erreur calcul stats temps réel:', error);
    throw new Error('Erreur lors du calcul des statistiques');
  }
}