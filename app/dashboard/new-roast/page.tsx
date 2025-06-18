import { requireOnboardingComplete } from '@/lib/auth-guards';
import { NewRoastForm } from '@/components/dashboard/new-roast-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata = {
  title: "Nouvelle demande de roast - RoastMyApp",
  description: "Poste ton app pour recevoir des feedbacks d'experts"
};

export default async function NewRoastPage() {
  await requireOnboardingComplete();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Nouvelle demande de roast
          </h1>
          <p className="text-gray-400">
            Plus tu donnes de détails, meilleurs seront les feedbacks
          </p>
        </div>
        
        <NewRoastForm />
      </div>
    </DashboardLayout>
  );
}