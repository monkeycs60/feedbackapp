import { RoleSelectionForm } from "@/components/onboarding/role-selection-form";
import { getUserProfiles } from "@/lib/actions/user-profiles";

export const metadata = {
  title: "Choose your role - RoastMyApp",
  description: "Start your journey on RoastMyApp by choosing your primary role"
};

export default async function RoleSelectionPage() {
  const userProfiles = await getUserProfiles();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RoastMyApp
          </h1>
          <p className="text-xl text-gray-600">
            How do you want to start?
          </p>
        </div>
        
        <RoleSelectionForm 
          hasCreatorProfile={userProfiles?.hasCreatorProfile || false}
          hasRoasterProfile={userProfiles?.hasRoasterProfile || false}
        />
        
        <div className="text-center mt-8">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            💡 You can easily switch later
          </p>
        </div>
      </div>
    </div>
  );
}