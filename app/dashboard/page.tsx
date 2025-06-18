import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getUserRoastRequests, getAvailableRoastRequests } from '@/lib/actions/roast-request';
import { getRoasterAcceptedApplications } from '@/lib/actions/roast-application';
import { AvailableRoastsList } from '@/components/dashboard/available-roasts-list';
import { AcceptedApplicationsList } from '@/components/dashboard/accepted-applications-list';
import { RoasterStats } from '@/components/dashboard/roaster-stats';
import { AddSecondRolePrompt } from '@/components/dashboard/add-second-role-prompt';
import { CreatorDashboardContent } from '@/components/dashboard/creator-dashboard-content';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
  let acceptedApplications: Awaited<ReturnType<typeof getRoasterAcceptedApplications>> = [];
  
  if (currentRole === 'creator' && hasCreatorProfile) {
    roastRequests = await getUserRoastRequests();
  } else if (currentRole === 'roaster' && hasRoasterProfile) {
    availableRoasts = await getAvailableRoastRequests();
    acceptedApplications = await getRoasterAcceptedApplications();
  }

  return (
    <DashboardLayout
      hasCreatorProfile={hasCreatorProfile}
      hasRoasterProfile={hasRoasterProfile}
    >
      <div className="space-y-8">
        <div>
          <p className="text-lg text-gray-400">
            {currentRole === 'creator' 
              ? 'Voici tes demandes de roast et leur progression'
              : 'Voici les apps disponibles pour du roasting'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentRole === 'creator' ? (
              <CreatorDashboardContent roastRequests={roastRequests} />
            ) : (
              <div className="space-y-8">
                {/* Missions acceptées */}
                <AcceptedApplicationsList applications={acceptedApplications} />
                
                {/* Apps disponibles */}
                <AvailableRoastsList availableRoasts={availableRoasts} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            {currentRole === 'roaster' && hasRoasterProfile ? (
              <RoasterStats 
                acceptedApplications={acceptedApplications}
                roasterProfile={fullUser.roasterProfile}
              />
            ) : !canSwitchRoles ? (
              <AddSecondRolePrompt currentRole={currentRole} />
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}