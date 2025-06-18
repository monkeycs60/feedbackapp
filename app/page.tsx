import { requireOnboardingComplete } from '@/lib/auth-guards';
import { redirect } from 'next/navigation';

export default async function Home() {
	// Ensure user has completed onboarding, then redirect to dashboard
	await requireOnboardingComplete();
	
	// If user is authenticated and onboarding is complete, redirect to dashboard
	redirect('/dashboard');
}
