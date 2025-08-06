import { requireOnboardingComplete } from '@/lib/auth-guards';
import { NewRoastWizardV2 } from '@/components/roast/new-roast-wizard-v2';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata = {
  title: "New roast - RoastMyApp",
  description: "Create your feedback request with the new system"
};

export default async function NewRoastPage() {
  await requireOnboardingComplete();

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8">
        <NewRoastWizardV2 />
      </div>
    </DashboardLayout>
  );
}