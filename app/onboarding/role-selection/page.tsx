import { RoleSelectionForm } from "@/components/onboarding/role-selection-form";

export const metadata = {
  title: "Choisir son rôle - RoastMyApp",
  description: "Commencez votre parcours sur RoastMyApp en choisissant votre rôle principal"
};

export default async function RoleSelectionPage() {
  // TODO: Vérifier l'authentification avec Better Auth
  // const session = await auth();
  // if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue sur RoastMyApp
          </h1>
          <p className="text-xl text-gray-300">
            Comment veux-tu commencer ?
          </p>
        </div>
        
        <RoleSelectionForm />
        
        <div className="text-center mt-8">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            💡 Tu pourras facilement switcher plus tard
          </p>
        </div>
      </div>
    </div>
  );
}