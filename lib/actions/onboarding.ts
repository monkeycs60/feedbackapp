'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
	RoasterProfileFormData,
	CreatorProfileFormData,
	ROASTER_SPECIALTIES,
} from '@/lib/types/onboarding';

/**
 * Helper function to get the current authenticated user
 */
async function getCurrentUser() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.id) {
		throw new Error('Not authenticated');
	}

	return session.user;
}

// Schémas de validation Zod
const roleSelectionSchema = z.object({
	role: z.enum(['creator', 'roaster']),
});

const roasterProfileSchema = z.object({
	specialty: z.enum(ROASTER_SPECIALTIES, {
		required_error: 'Please select a specialty'
	}),
	languages: z.array(z.string()).min(1, 'At least one language required'),
	experience: z.enum(['Beginner', 'Intermediate', 'Expert']),
	bio: z.string().max(500, 'Bio too long (max 500 characters)').optional(),
	portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const creatorProfileSchema = z.object({
	company: z.string().max(100, 'Company name too long').optional(),
});

/**
 * Sélectionne le rôle principal de l'utilisateur et crée le profil correspondant
 */
export async function selectPrimaryRole(role: 'creator' | 'roaster') {
	try {
		const user = await getCurrentUser();

		const validation = roleSelectionSchema.safeParse({ role });
		if (!validation.success) {
			throw new Error('Invalid role');
		}

		// Vérifier si l'utilisateur a déjà des profils
		const existingUser = await prisma.user.findUnique({
			where: { id: user.id },
			include: {
				creatorProfile: true,
				roasterProfile: true,
			},
		});

		if (!existingUser) {
			throw new Error('User not found');
		}

		// Si l'utilisateur a déjà un profil et en ajoute un second
		const isAddingSecondRole =
			(existingUser.creatorProfile && role === 'roaster') ||
			(existingUser.roasterProfile && role === 'creator');

		// Mise à jour de l'utilisateur
		await prisma.user.update({
			where: { id: user.id },
			data: {
				primaryRole: isAddingSecondRole ? existingUser.primaryRole : role,
				onboardingStep: 1,
			},
		});

		// Créer le profil correspondant
		if (role === 'creator') {
			await prisma.creatorProfile.upsert({
				where: { userId: user.id },
				update: {},
				create: { userId: user.id },
			});
		} else {
			await prisma.roasterProfile.upsert({
				where: { userId: user.id },
				update: {},
				create: {
					userId: user.id,
					specialties: [],
					languages: ['English'],
				},
			});
		}

		revalidatePath('/onboarding');
		return { success: true, isAddingSecondRole };
	} catch (error) {
		console.error('Role selection error:', error);
		throw new Error('Error during role selection');
	}
}

/**
 * Configure le profil roaster avec les spécialités et informations
 */
export async function setupRoasterProfile(data: RoasterProfileFormData) {
	try {
		const user = await getCurrentUser();

		const validation = roasterProfileSchema.safeParse(data);
		if (!validation.success) {
			throw new Error(
				'Invalid data: ' +
					validation.error.issues.map((i) => i.message).join(', ')
			);
		}

		const validatedData = validation.data;

		// Mise à jour du profil roaster
		await prisma.roasterProfile.update({
			where: { userId: user.id },
			data: {
				specialties: [validatedData.specialty],
				languages: validatedData.languages,
				experience: validatedData.experience,
				bio: validatedData.bio || null,
				portfolio: validatedData.portfolio || null,
			},
		});

		// Mise à jour de l'étape d'onboarding
		await prisma.user.update({
			where: { id: user.id },
			data: { onboardingStep: 2 },
		});

		revalidatePath('/onboarding');
		return { success: true };
	} catch (error) {
		console.error('Roaster profile setup error:', error);
		throw new Error('Error during profile setup');
	}
}

/**
 * Configure le profil creator (version simplifiée)
 */
export async function setupCreatorProfile(data: CreatorProfileFormData) {
	try {
		const user = await getCurrentUser();

		const validation = creatorProfileSchema.safeParse(data);
		if (!validation.success) {
			throw new Error('Invalid data');
		}

		const validatedData = validation.data;

		// Mise à jour du profil creator
		await prisma.creatorProfile.update({
			where: { userId: user.id },
			data: {
				company: validatedData.company || null,
			},
		});

		// Mise à jour de l'étape d'onboarding
		await prisma.user.update({
			where: { id: user.id },
			data: { onboardingStep: 2 },
		});

		revalidatePath('/onboarding');
		return { success: true };
	} catch (error) {
		console.error('Creator profile setup error:', error);
		throw new Error('Error during profile setup');
	}
}

/**
 * Finalise l'onboarding et redirige vers la bonne page
 */
export async function completeOnboarding() {
	try {
		const currentUser = await getCurrentUser();

		// Récupérer l'utilisateur pour connaître son rôle
		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				primaryRole: true,
				onboardingStep: true,
			},
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Marquer l'onboarding comme terminé
		await prisma.user.update({
			where: { id: currentUser.id },
			data: {
				onboardingStep: 4,
				daysSinceSignup: 0, // Reset pour le calcul des nudges
			},
		});

		revalidatePath('/');

		// Redirection selon le rôle
		const redirectUrl =
			user.primaryRole === 'roaster' ? '/marketplace' : '/dashboard';
		redirect(redirectUrl);
	} catch (error) {
		// Allow Next.js redirects to pass through
		if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
			throw error;
		}
		console.error('Onboarding completion error:', error);
		throw new Error('Error during completion');
	}
}

/**
 * Récupère l'état d'onboarding de l'utilisateur
 */
export async function getOnboardingState() {
	try {
		const currentUser = await getCurrentUser();

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			include: {
				creatorProfile: true,
				roasterProfile: true,
			},
		});

		if (!user) {
			throw new Error('User not found');
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
				daysSinceSignup: user.daysSinceSignup || 0,
			},
		};
	} catch (error) {
		console.error('Onboarding state retrieval error:', error);
		throw error;
	}
}

/**
 * Vérifie si l'utilisateur a complété l'onboarding
 */
export async function checkOnboardingStatus() {
	try {
		const currentUser = await getCurrentUser();

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				onboardingStep: true,
				primaryRole: true,
			},
		});

		return {
			isComplete: user?.onboardingStep === 4,
			currentStep: user?.onboardingStep || 0,
			primaryRole: user?.primaryRole,
		};
	} catch (error) {
		console.error('Onboarding verification error:', error);
		return {
			isComplete: false,
			currentStep: 0,
			primaryRole: null,
		};
	}
}

/**
 * Action pour déclencher un nudge vers l'autre rôle
 */
export async function triggerRoleDiscoveryNudge(
	targetRole: 'creator' | 'roaster'
) {
	try {
		const user = await getCurrentUser();

		// Enregistrer que l'utilisateur a vu le nudge
		// TODO: Implémenter un système de tracking des nudges

		console.log(
			`Role discovery nudge to ${targetRole} triggered for user ${user.id}`
		);

		return { success: true };
	} catch (error) {
		console.error('Nudge trigger error:', error);
		return { success: false };
	}
}

/**
 * Permet de changer le rôle primaire de l'utilisateur
 */
export async function switchUserRole(newRole: 'creator' | 'roaster') {
	try {
		const user = await getCurrentUser();

		// Vérifier que l'utilisateur a les profils nécessaires
		const fullUser = await prisma.user.findUnique({
			where: { id: user.id },
			include: {
				creatorProfile: true,
				roasterProfile: true,
			},
		});

		if (!fullUser) {
			throw new Error('User not found');
		}

		// Vérifier que l'utilisateur a le profil correspondant au nouveau rôle
		if (newRole === 'creator' && !fullUser.creatorProfile) {
			throw new Error('You must first create a creator profile');
		}

		if (newRole === 'roaster' && !fullUser.roasterProfile) {
			throw new Error('You must first create a roaster profile');
		}

		// Mettre à jour le rôle primaire
		await prisma.user.update({
			where: { id: user.id },
			data: {
				primaryRole: newRole,
				hasTriedBothRoles: true,
			},
		});

		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('Role change error:', error);
		throw new Error(
			error instanceof Error
				? error.message
				: 'Error during role change'
		);
	}
}
