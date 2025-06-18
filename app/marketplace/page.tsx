import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getAvailableRoastRequests } from '@/lib/actions/roast-request';
import { AvailableRoastsList } from '@/components/dashboard/available-roasts-list';

export const metadata = {
  title: "Marketplace Roaster - RoastMyApp", 
  description: "Trouvez des missions de roast et gagnez de l'argent"
};

export default async function MarketplacePage() {
  await requireOnboardingComplete();
  const availableRoasts = await getAvailableRoastRequests();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace Roaster
          </h1>
          <p className="text-gray-600">
            Découvrez les apps qui ont besoin de votre expertise et candidatez pour les roasts qui vous intéressent.
          </p>
        </div>
        
        <AvailableRoastsList availableRoasts={availableRoasts} />
      </div>
    </div>
  );
}