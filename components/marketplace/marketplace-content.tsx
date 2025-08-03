'use client';

import { useState, useMemo, useEffect } from 'react';
import { MarketplaceFilterBar } from './marketplace-filter-bar';
import { AvailableRoastsList } from '@/components/dashboard/available-roasts-list';
import type { RoastFilters } from '@/lib/actions/roast-request';
import { getFilteredRoastRequests } from '@/lib/actions/roast-request';
import { Skeleton } from '@/components/ui/skeleton';

type AvailableRoast = {
	id: string;
	title: string;
	appUrl: string;
	description: string;
	targetAudiences: Array<{
		targetAudience: {
			id: string;
			name: string;
		};
	}>;
	focusAreas: string[];
	maxPrice: number | null;
	feedbacksRequested: number;
	deadline?: Date | null;
	createdAt: Date;
	coverImage?: string | null;
	creator: {
		id: string;
		name: string | null;
		creatorProfile: {
			company: string | null;
		} | null;
	};
	feedbacks: { id: string; status: string }[];
	applications: { id: string; status: string; roasterId: string }[];
	_count: {
		feedbacks: number;
		applications: number;
	};
	questions: { domain: string }[];
};

interface MarketplaceContentProps {
	initialRoasts: AvailableRoast[];
}

export function MarketplaceContent({ initialRoasts }: MarketplaceContentProps) {
	const [filters, setFilters] = useState<RoastFilters>({});
	const [filteredRoasts, setFilteredRoasts] = useState(initialRoasts);
	const [isLoading, setIsLoading] = useState(false);

	// Extract available filter data from all roasts
	const availableFilterData = useMemo(() => {
		const domains = new Set<string>();
		const targetAudiences = new Set<string>();
		let minPrice = Infinity;
		let maxPrice = 0;

		initialRoasts.forEach((roast) => {
			// Extract domains from focus areas
			roast.focusAreas.forEach((area) => domains.add(area));

			// Extract target audiences
			roast.targetAudiences.forEach(ta => {
				targetAudiences.add(ta.targetAudience.name);
			});

			// Calculate price range
			const pricePerRoast = Math.round(
				roast.maxPrice / roast.feedbacksRequested
			);
			minPrice = Math.min(minPrice, pricePerRoast);
			maxPrice = Math.max(maxPrice, pricePerRoast);
		});

		return {
			domains: Array.from(domains).sort(),
			targetAudiences: Array.from(targetAudiences).sort(),
			priceRange: {
				min: minPrice === Infinity ? 0 : minPrice,
				max: maxPrice,
			},
		};
	}, [initialRoasts]);

	useEffect(() => {
		const applyFilters = async () => {
			// If no filters are applied, use initial roasts
			if (Object.keys(filters).length === 0) {
				setFilteredRoasts(initialRoasts);
				return;
			}

			setIsLoading(true);
			try {
				const filtered = await getFilteredRoastRequests(filters);
				setFilteredRoasts(filtered);
			} catch (error) {
				console.error('Error filtering roasts:', error);
				setFilteredRoasts(initialRoasts);
			} finally {
				setIsLoading(false);
			}
		};

		applyFilters();
	}, [filters, initialRoasts]);

	return (
		<div className='space-y-6 mt-6'>
			<div>
				<p className='font-semibold mb-6'>
					Discover apps that need your expertise and
					apply for roasts that interest you
				</p>
				<MarketplaceFilterBar
					filters={filters}
					onFiltersChange={setFilters}
					availableData={availableFilterData}
				/>
			</div>

			{isLoading ? (
				<div className='grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Skeleton key={i} className='h-80' />
					))}
				</div>
			) : (
				<AvailableRoastsList availableRoasts={filteredRoasts} />
			)}
		</div>
	);
}
