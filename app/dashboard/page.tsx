import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getUserRoastRequests } from '@/lib/actions/roast-request';
import { getRoasterAcceptedApplications } from '@/lib/actions/roast-application';
import { AcceptedApplicationsList } from '@/components/dashboard/accepted-applications-list';
import { RoasterStatsRealTime } from '@/components/dashboard/roaster-stats-real-time';
import { AddSecondRolePrompt } from '@/components/dashboard/add-second-role-prompt';
import { CreatorDashboardContent } from '@/components/dashboard/creator-dashboard-content';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const metadata = {
	title: 'Dashboard - RoastMyApp',
	description: 'Gérez vos demandes de roast et vos feedbacks',
};

export default async function DashboardPage() {
	await requireOnboardingComplete();

	// Récupérer les informations complètes de l'utilisateur avec ses profils
	const session = await auth.api.getSession({ headers: await headers() });
	const fullUser = await prisma.user.findUnique({
		where: { id: session!.user!.id },
		include: {
			creatorProfile: true,
			roasterProfile: true,
		},
	});

	if (!fullUser) {
		throw new Error('Utilisateur non trouvé');
	}

	const currentRole =
		(fullUser.primaryRole as 'creator' | 'roaster') || 'creator';
	const hasCreatorProfile = !!fullUser.creatorProfile;
	const hasRoasterProfile = !!fullUser.roasterProfile;
	const canSwitchRoles = hasCreatorProfile && hasRoasterProfile;

	// Récupérer les données selon le rôle
	let roastRequests: Awaited<ReturnType<typeof getUserRoastRequests>> = [];
	let acceptedApplications: Awaited<
		ReturnType<typeof getRoasterAcceptedApplications>
	> = [];

	if (currentRole === 'creator' && hasCreatorProfile) {
		roastRequests = await getUserRoastRequests();
	} else if (currentRole === 'roaster' && hasRoasterProfile) {
		acceptedApplications = await getRoasterAcceptedApplications();
	}

	return (
		<DashboardLayout
			hasCreatorProfile={hasCreatorProfile}
			hasRoasterProfile={hasRoasterProfile}>
			<div className='space-y-8 pt-6'>
				<div className='gap-4 flex flex-col'>
					<div>
						{currentRole === 'roaster' && hasRoasterProfile ? (
							<RoasterStatsRealTime
								acceptedApplications={acceptedApplications}
							/>
						) : !canSwitchRoles ? (
							<AddSecondRolePrompt currentRole={currentRole} />
						) : null}
					</div>
					<div>
						{currentRole === 'creator' ? (
							<CreatorDashboardContent roastRequests={roastRequests} />
						) : (
							<div className='space-y-8'>
								{/* Missions acceptées */}
								<AcceptedApplicationsList
									applications={acceptedApplications}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
