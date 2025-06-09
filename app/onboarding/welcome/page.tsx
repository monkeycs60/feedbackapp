import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { getOnboardingState } from "@/lib/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Bienvenue - RoastMyApp",
  description: "Félicitations ! Votre profil est maintenant configuré"
};

export default async function WelcomePage() {
  // TODO: Vérifier l'authentification avec Better Auth
  // const session = await auth();
  // if (!session?.user) redirect("/login");

  const onboardingState = await getOnboardingState();
  
  if (!onboardingState || onboardingState.currentStep < 2) {
    redirect("/onboarding/profile-setup");
  }

  return <WelcomeScreen user={onboardingState.user} />;
}