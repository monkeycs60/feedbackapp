import { RoasterProfileForm } from "@/components/onboarding/roaster-profile-form";
import { CreatorProfileForm } from "@/components/onboarding/creator-profile-form";
import { getOnboardingState } from "@/lib/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Configuration du profil - RoastMyApp",
  description: "Finalisez votre profil pour commencer sur RoastMyApp"
};

export default async function ProfileSetupPage() {
  // TODO: Vérifier l'authentification avec Better Auth
  // const session = await auth();
  // if (!session?.user) redirect("/login");

  const onboardingState = await getOnboardingState();
  
  if (!onboardingState || onboardingState.currentStep < 1) {
    redirect("/onboarding/role-selection");
  }

  const { user } = onboardingState;
  const isRoaster = user.primaryRole === 'roaster';

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Finalise ton profil
          </h1>
          <p className="text-gray-300">
            {isRoaster 
              ? "Quelques infos pour matcher avec les bonnes missions"
              : "Quelques infos pour personnaliser ton expérience"
            }
          </p>
        </div>

        {isRoaster ? (
          <RoasterProfileForm />
        ) : (
          <CreatorProfileForm />
        )}
      </div>
    </div>
  );
}