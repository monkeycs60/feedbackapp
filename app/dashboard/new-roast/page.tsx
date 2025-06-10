import { requireOnboardingComplete } from '@/lib/auth-guards';
import { NewRoastForm } from '@/components/dashboard/new-roast-form';

export const metadata = {
  title: "Nouvelle demande de roast - RoastMyApp",
  description: "Poste ton app pour recevoir des feedbacks d'experts"
};

export default async function NewRoastPage() {
  await requireOnboardingComplete();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouvelle demande de roast
          </h1>
          <p className="text-gray-600">
            Plus tu donnes de détails, meilleurs seront les feedbacks
          </p>
        </div>
        
        <NewRoastForm />
      </div>
    </div>
  );
}