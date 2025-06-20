import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getAvailableRoastRequests } from '@/lib/actions/roast-request';
import { AvailableRoastsList } from '@/components/dashboard/available-roasts-list';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata = {
	title: 'Marketplace Roaster - RoastMyApp',
	description: "Trouvez des missions de roast et gagnez de l'argent",
};

export default async function MarketplacePage() {
	await requireOnboardingComplete();
	const availableRoasts = await getAvailableRoastRequests();

	return (
		<DashboardLayout>
			<div className='space-y-8'>
				<div>
					<h1 className='text-3xl font-bold text-white mb-2'>
						Marketplace Roaster
					</h1>
					<p className='text-gray-300'>
						Découvrez les apps qui ont besoin de votre expertise et
						candidatez pour les roasts qui vous intéressent.
					</p>
				</div>
				<AvailableRoastsList availableRoasts={availableRoasts} />
			</div>
		</DashboardLayout>
	);
}
