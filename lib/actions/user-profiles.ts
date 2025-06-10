"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Récupère les profils de l'utilisateur pour déterminer quel rôle il possède déjà
 */
export async function getUserProfiles() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return null;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        creatorProfile: true,
        roasterProfile: true
      }
    });
    
    if (!user) {
      return null;
    }
    
    return {
      hasCreatorProfile: !!user.creatorProfile,
      hasRoasterProfile: !!user.roasterProfile,
      primaryRole: user.primaryRole as 'creator' | 'roaster' | null,
      onboardingStep: user.onboardingStep
    };
  } catch (error) {
    console.error('Erreur récupération profils:', error);
    return null;
  }
}