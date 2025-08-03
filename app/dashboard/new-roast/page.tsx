import { requireOnboardingComplete } from '@/lib/auth-guards';
import { NewRoastWizardV2 } from '@/components/roast/new-roast-wizard-v2';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "New roast - RoastMyApp",
  description: "Create your feedback request with the new system"
};

export default async function NewRoastPage() {
  await requireOnboardingComplete();

  // Fetch target audiences for the form
  const targetAudiences = await prisma.targetAudience.findMany({
    where: { isDefault: true },
    select: {
      id: true,
      name: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen py-8">
        <NewRoastWizardV2 targetAudiences={targetAudiences} />
      </div>
    </DashboardLayout>
  );
}