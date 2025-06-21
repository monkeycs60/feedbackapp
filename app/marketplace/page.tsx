import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getFilteredRoastRequests } from '@/lib/actions/roast-request';
import { MarketplaceContent } from '@/components/marketplace/marketplace-content';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export const metadata = {
	title: 'Marketplace Roaster - RoastMyApp',
	description: "Trouvez des missions de roast et gagnez de l'argent",
};

export default async function MarketplacePage() {
	await requireOnboardingComplete();
	const availableRoasts = await getFilteredRoastRequests();

	return (
		<DashboardLayout>
			<MarketplaceContent initialRoasts={availableRoasts} />
		</DashboardLayout>
	);
}
