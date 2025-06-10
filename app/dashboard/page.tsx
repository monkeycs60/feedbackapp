import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getUserRoastRequests } from '@/lib/actions/roast-request';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RoastRequestsList } from '@/components/dashboard/roast-requests-list';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

export const metadata = {
  title: "Dashboard - RoastMyApp",
  description: "Gérez vos demandes de roast et vos feedbacks"
};

export default async function DashboardPage() {
  const user = await requireOnboardingComplete();
  const roastRequests = await getUserRoastRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Salut {user.name} ! 👋
          </h1>
          <p className="text-gray-600">
            Voici tes demandes de roast et leur progression
          </p>
        </div>

        <DashboardStats roastRequests={roastRequests} />
        
        <div className="mt-8">
          <RoastRequestsList roastRequests={roastRequests} />
        </div>
      </div>
    </div>
  );
}