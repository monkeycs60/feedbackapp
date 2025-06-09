"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { 
  RoasterProfileFormData, 
  CreatorProfileFormData,
  ROASTER_SPECIALTIES
} from "@/lib/types/onboarding";

// Schémas de validation Zod
const roleSelectionSchema = z.object({
  role: z.enum(['creator', 'roaster'])
});

const roasterProfileSchema = z.object({
  specialties: z.array(z.enum(ROASTER_SPECIALTIES)).min(1, "Sélectionne au moins une spécialité"),
  languages: z.array(z.string()).min(1, "Au moins une langue requise"),
  experience: z.enum(['Débutant', 'Intermédiaire', 'Expert']),
  bio: z.string().max(500, "Bio trop longue (max 500 caractères)").optional(),
  portfolio: z.string().url("URL invalide").optional().or(z.literal(''))
});

const creatorProfileSchema = z.object({
  company: z.string().max(100, "Nom d'entreprise trop long").optional()
});

/**
 * Sélectionne le rôle principal de l'utilisateur et crée le profil correspondant
 */
export async function selectPrimaryRole(role: 'creator' | 'roaster') {
  try {
    // Vérification de l'authentification - version simplifiée pour le MVP
    // TODO: Implémenter la vraie vérification avec Better Auth
    const mockUserId = "mock-user-id"; // En attendant l'intégration auth

    const validation = roleSelectionSchema.safeParse({ role });
    if (!validation.success) {
      throw new Error("Rôle invalide");
    }

    // Mise à jour de l'utilisateur
    await prisma.user.upsert({
      where: { id: mockUserId },
      update: {
        primaryRole: role,
        onboardingStep: 1
      },
      create: {
        id: mockUserId,
        email: "mock@example.com",
        name: "Mock User",
        primaryRole: role,
        onboardingStep: 1
      }
    });

    // Créer le profil correspondant
    if (role === 'creator') {
      await prisma.creatorProfile.upsert({
        where: { userId: mockUserId },
        update: {},
        create: { userId: mockUserId }
      });
    } else {
      await prisma.roasterProfile.upsert({
        where: { userId: mockUserId },
        update: {},
        create: { 
          userId: mockUserId,
          specialties: [],
          languages: ['Français']
        }
      });
    }

    revalidatePath('/onboarding');
    return { success: true };
  } catch (error) {
    console.error('Erreur sélection rôle:', error);
    throw new Error('Erreur lors de la sélection du rôle');
  }
}

/**
 * Configure le profil roaster avec les spécialités et informations
 */
export async function setupRoasterProfile(data: RoasterProfileFormData) {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    const validation = roasterProfileSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
    }

    const validatedData = validation.data;

    // Mise à jour du profil roaster
    await prisma.roasterProfile.update({
      where: { userId: mockUserId },
      data: {
        specialties: validatedData.specialties,
        languages: validatedData.languages,
        experience: validatedData.experience,
        bio: validatedData.bio || null,
        portfolio: validatedData.portfolio || null
      }
    });

    // Mise à jour de l'étape d'onboarding
    await prisma.user.update({
      where: { id: mockUserId },
      data: { onboardingStep: 2 }
    });

    revalidatePath('/onboarding');
    return { success: true };
  } catch (error) {
    console.error('Erreur setup profil roaster:', error);
    throw new Error('Erreur lors de la configuration du profil');
  }
}

/**
 * Configure le profil creator (version simplifiée)
 */
export async function setupCreatorProfile(data: CreatorProfileFormData) {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    const validation = creatorProfileSchema.safeParse(data);
    if (!validation.success) {
      throw new Error("Données invalides");
    }

    const validatedData = validation.data;

    // Mise à jour du profil creator
    await prisma.creatorProfile.update({
      where: { userId: mockUserId },
      data: {
        company: validatedData.company || null
      }
    });

    // Mise à jour de l'étape d'onboarding
    await prisma.user.update({
      where: { id: mockUserId },
      data: { onboardingStep: 2 }
    });

    revalidatePath('/onboarding');
    return { success: true };
  } catch (error) {
    console.error('Erreur setup profil creator:', error);
    throw new Error('Erreur lors de la configuration du profil');
  }
}

/**
 * Finalise l'onboarding et redirige vers la bonne page
 */
export async function completeOnboarding() {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    // Récupérer l'utilisateur pour connaître son rôle
    const user = await prisma.user.findUnique({
      where: { id: mockUserId },
      select: { primaryRole: true }
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Marquer l'onboarding comme terminé
    await prisma.user.update({
      where: { id: mockUserId },
      data: { 
        onboardingStep: 4,
        daysSinceSignup: 0 // Reset pour le calcul des nudges
      }
    });

    revalidatePath('/');
    
    // Redirection selon le rôle
    const redirectUrl = user.primaryRole === 'roaster' ? '/marketplace' : '/dashboard';
    redirect(redirectUrl);
  } catch (error) {
    console.error('Erreur finalisation onboarding:', error);
    throw new Error('Erreur lors de la finalisation');
  }
}

/**
 * Récupère l'état d'onboarding de l'utilisateur
 */
export async function getOnboardingState() {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    const user = await prisma.user.findUnique({
      where: { id: mockUserId },
      include: {
        creatorProfile: true,
        roasterProfile: true
      }
    });

    if (!user) {
      // Retourner un état par défaut pour le développement
      return {
        currentStep: 0,
        selectedRole: null,
        profileComplete: false,
        canProceed: true,
        user: {
          id: mockUserId,
          email: "mock@example.com",
          name: "Mock User",
          primaryRole: null,
          onboardingStep: 0,
          hasTriedBothRoles: false,
          daysSinceSignup: 0,
          creatorProfile: null,
          roasterProfile: null
        }
      };
    }

    return {
      currentStep: user.onboardingStep || 0,
      selectedRole: user.primaryRole,
      profileComplete: (user.onboardingStep || 0) >= 2,
      canProceed: true,
      user: {
        ...user,
        primaryRole: user.primaryRole || null,
        onboardingStep: user.onboardingStep || 0,
        hasTriedBothRoles: user.hasTriedBothRoles || false,
        daysSinceSignup: user.daysSinceSignup || 0
      }
    };
  } catch (error) {
    console.error('Erreur récupération état onboarding:', error);
    // Retourner un état par défaut en cas d'erreur
    return {
      currentStep: 0,
      selectedRole: null,
      profileComplete: false,
      canProceed: true,
      user: {
        id: "mock-user-id",
        email: "mock@example.com",
        name: "Mock User",
        primaryRole: null,
        onboardingStep: 0,
        hasTriedBothRoles: false,
        daysSinceSignup: 0,
        creatorProfile: null,
        roasterProfile: null
      }
    };
  }
}

/**
 * Vérifie si l'utilisateur a complété l'onboarding
 */
export async function checkOnboardingStatus() {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    const user = await prisma.user.findUnique({
      where: { id: mockUserId },
      select: { 
        onboardingStep: true,
        primaryRole: true
      }
    });

    return {
      isComplete: user?.onboardingStep === 4,
      currentStep: user?.onboardingStep || 0,
      primaryRole: user?.primaryRole
    };
  } catch (error) {
    console.error('Erreur vérification onboarding:', error);
    return {
      isComplete: false,
      currentStep: 0,
      primaryRole: null
    };
  }
}

/**
 * Action pour déclencher un nudge vers l'autre rôle
 */
export async function triggerRoleDiscoveryNudge(targetRole: 'creator' | 'roaster') {
  try {
    const mockUserId = "mock-user-id"; // TODO: Récupérer l'ID utilisateur réel

    // Enregistrer que l'utilisateur a vu le nudge
    // TODO: Implémenter un système de tracking des nudges
    
    console.log(`Nudge vers ${targetRole} déclenché pour utilisateur ${mockUserId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Erreur déclenchement nudge:', error);
    return { success: false };
  }
}