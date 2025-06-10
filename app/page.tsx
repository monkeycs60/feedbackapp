import { requireOnboardingComplete } from '@/lib/auth-guards';

export default async function Home() {
	// Ensure user has completed onboarding before accessing home page
	await requireOnboardingComplete();

	return (
		<div>
			<h1>Hello World</h1>
		</div>
	);
}
