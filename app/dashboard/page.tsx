import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getUserRoastRequests, getAvailableRoastRequests } from '@/lib/actions/roast-request';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RoastRequestsList } from '@/components/dashboard/roast-requests-list';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { AvailableRoastsList } from '@/components/dashboard/available-roasts-list';
import { RoleSwitch } from '@/components/dashboard/role-switch';
import { AddSecondRolePrompt } from '@/components/dashboard/add-second-role-prompt';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "Dashboard - RoastMyApp",
  description: "Gérez vos demandes de roast et vos feedbacks"
};

export default async function DashboardPage() {
  const user = await requireOnboardingComplete();
  
  // Récupérer les informations complètes de l'utilisateur avec ses profils
  const session = await auth.api.getSession({ headers: await headers() });
  const fullUser = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      creatorProfile: true,
      roasterProfile: true
    }
  });

  if (!fullUser) {
    throw new Error('Utilisateur non trouvé');
  }

  const currentRole = (fullUser.primaryRole as 'creator' | 'roaster') || 'creator';
  const hasCreatorProfile = !!fullUser.creatorProfile;
  const hasRoasterProfile = !!fullUser.roasterProfile;
  const canSwitchRoles = hasCreatorProfile && hasRoasterProfile;

  // Récupérer les données selon le rôle
  let roastRequests: Awaited<ReturnType<typeof getUserRoastRequests>> = [];
  let availableRoasts: Awaited<ReturnType<typeof getAvailableRoastRequests>> = [];
  
  if (currentRole === 'creator' && hasCreatorProfile) {
    roastRequests = await getUserRoastRequests();
  } else if (currentRole === 'roaster' && hasRoasterProfile) {
    availableRoasts = await getAvailableRoastRequests();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Salut {user.name} ! 👋
            </h1>
            <p className="text-gray-600">
              {currentRole === 'creator' 
                ? 'Voici tes demandes de roast et leur progression'
                : 'Voici les apps disponibles pour du roasting'
              }
            </p>
          </div>
          
          {canSwitchRoles && (
            <RoleSwitch 
              currentRole={currentRole}
              hasCreatorProfile={hasCreatorProfile}
              hasRoasterProfile={hasRoasterProfile}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentRole === 'creator' ? (
              <>
                <DashboardStats roastRequests={roastRequests} />
                <div className="mt-8">
                  <RoastRequestsList roastRequests={roastRequests} />
                </div>
              </>
            ) : (
              <div className="mt-8">
                <AvailableRoastsList availableRoasts={availableRoasts} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            {!canSwitchRoles && (
              <AddSecondRolePrompt currentRole={currentRole} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}