import { RoleSelectionForm } from "@/components/onboarding/role-selection-form";
import { getUserProfiles } from "@/lib/actions/user-profiles";

export const metadata = {
  title: "Choisir son rôle - RoastMyApp",
  description: "Commencez votre parcours sur RoastMyApp en choisissant votre rôle principal"
};

export default async function RoleSelectionPage() {
  const userProfiles = await getUserProfiles();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur RoastMyApp
          </h1>
          <p className="text-xl text-gray-600">
            Comment veux-tu commencer ?
          </p>
        </div>
        
        <RoleSelectionForm 
          hasCreatorProfile={userProfiles?.hasCreatorProfile || false}
          hasRoasterProfile={userProfiles?.hasRoasterProfile || false}
        />
        
        <div className="text-center mt-8">
          <p className="text-gray-500 flex items-center justify-center gap-2">
            💡 Tu pourras facilement switcher plus tard
          </p>
        </div>
      </div>
    </div>
  );
}