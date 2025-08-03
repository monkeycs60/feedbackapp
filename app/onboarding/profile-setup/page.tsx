import { RoasterProfileForm } from "@/components/onboarding/roaster-profile-form";
import { CreatorProfileForm } from "@/components/onboarding/creator-profile-form";
import { getOnboardingState } from "@/lib/actions/onboarding";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile setup - RoastMyApp",
  description: "Finalize your profile to get started on RoastMyApp"
};

export default async function ProfileSetupPage() {
  // TODO: Verify authentication with Better Auth
  // const session = await auth();
  // if (!session?.user) redirect("/login");

  const onboardingState = await getOnboardingState();
  
  if (!onboardingState || onboardingState.currentStep < 1) {
    redirect("/onboarding/role-selection");
  }

  const { user } = onboardingState;
  const isRoaster = user.primaryRole === 'roaster';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Finalize your profile
          </h1>
          <p className="text-gray-600">
            {isRoaster 
              ? "A few details to match you with the right tasks"
              : "A few details to personalize your experience"
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