"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Calcule les statistiques du roaster en temps réel
 * Cette approche évite complètement les problèmes de désynchronisation
 */
export async function getRealTimeRoasterStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const userId = session.user.id;

    // Récupérer le profil roaster pour les données statiques
    const roasterProfile = await prisma.roasterProfile.findUnique({
      where: { userId },
      select: {
        id: true,
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

    // Calculer les roasts complétés en temps réel
    const completedRoasts = await prisma.feedback.count({
      where: {
        roasterId: userId,
        status: 'completed',
        // S'assurer que l'utilisateur avait une application acceptée
        roastRequest: {
          applications: {
            some: {
              roasterId: userId,
              status: {
                in: ['accepted', 'auto_selected']
              }
            }
          }
        }
      }
    });

    // Calculer le total gagné en temps réel
    const totalEarnedResult = await prisma.feedback.aggregate({
      where: {
        roasterId: userId,
        status: 'completed',
        roastRequest: {
          applications: {
            some: {
              roasterId: userId,
              status: {
                in: ['accepted', 'auto_selected']
              }
            }
          }
        }
      },
      _sum: {
        finalPrice: true
      }
    });

    const totalEarned = totalEarnedResult._sum.finalPrice || 0;

    // Calculer les missions actives (applications acceptées sans feedback complété)
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

    // Calculer le taux de complétion
    const totalAcceptedApplications = await prisma.roastApplication.count({
      where: {
        roasterId: userId,
        status: {
          in: ['accepted', 'auto_selected']
        }
      }
    });

    const completionRate = totalAcceptedApplications > 0 
      ? Math.round((completedRoasts / totalAcceptedApplications) * 100)
      : 100;

    return {
      ...roasterProfile,
      completedRoasts,
      totalEarned,
      currentActive,
      completionRate
    };

  } catch (error) {
    console.error('Erreur calcul statistiques roaster:', error);
    throw new Error('Erreur lors du calcul des statistiques');
  }
}

/**
 * Récupère les statistiques détaillées par période
 */
export async function getRoasterStatsByPeriod(period: 'week' | 'month' | 'all' = 'all') {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      throw new Error("Non authentifié");
    }

    const userId = session.user.id;
    
    // Calculer la date de début selon la période
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(2000); // Date très ancienne pour avoir tout
    }

    const whereClause = {
      roasterId: userId,
      status: 'completed',
      createdAt: {
        gte: startDate
      }
    };

    // Statistiques de la période
    const periodStats = await prisma.feedback.aggregate({
      where: whereClause,
      _count: true,
      _sum: {
        finalPrice: true
      },
      _avg: {
        finalPrice: true
      }
    });

    return {
      period,
      count: periodStats._count,
      totalEarned: periodStats._sum.finalPrice || 0,
      averageEarning: periodStats._avg.finalPrice || 0
    };

  } catch (error) {
    console.error('Erreur calcul statistiques par période:', error);
    return null;
  }
}