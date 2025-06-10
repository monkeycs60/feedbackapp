import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-side function to check if user has completed onboarding
 * Redirects to appropriate onboarding step if not completed
 * Should be called on protected pages (/, /dashboard, /profile, /marketplace)
 */
export async function requireOnboardingComplete() {
  // Get the current session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If no session, redirect to login
  if (!session?.user) {
    redirect('/login');
  }

  // Get full user data from database to access onboardingStep
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingStep: true,
      primaryRole: true,
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Check onboarding step - if not 4 (completed), redirect to onboarding
  if (user.onboardingStep < 4) {
    // Determine which onboarding step to redirect to based on current progress
    const currentStep = user.onboardingStep;
    
    if (currentStep === 0) {
      // Not started - go to welcome
      redirect('/onboarding/welcome');
    } else if (currentStep === 1) {
      // Started but no role selected
      redirect('/onboarding/role-selection');
    } else if (currentStep === 2 || currentStep === 3) {
      // Role selected but profile not complete
      redirect('/onboarding/profile-setup');
    }
  }

  // Return user data if onboarding is complete
  return user;
}

/**
 * Check if user exists and has a session (lighter check for auth-only pages)
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}