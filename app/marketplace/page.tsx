import { requireOnboardingComplete } from '@/lib/auth-guards';

export const metadata = {
  title: "Marketplace Roaster - RoastMyApp", 
  description: "Trouvez des missions de roast et gagnez de l'argent"
};

export default async function MarketplacePage() {
  // Ensure user has completed onboarding before accessing marketplace
  await requireOnboardingComplete();
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Marketplace Roaster
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Bienvenue sur la marketplace !
          </h2>
          <p className="text-gray-300">
            Ici tu pourras bientôt :
          </p>
          <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
            <li>Parcourir les missions disponibles</li>
            <li>Postuler aux roasts qui t'intéressent</li>
            <li>Gérer tes missions en cours</li>
            <li>Suivre tes gains et statistiques</li>
          </ul>
          
          <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-300">
              🚧 Marketplace en cours de développement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}