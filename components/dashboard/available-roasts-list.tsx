'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type AvailableRoast = {
	id: string;
	title: string;
	appUrl: string;
	description: string;
	targetAudience: string | null;
	focusAreas: string[];
	maxPrice: number;
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
	applications: { id: string; status: string }[];
	_count: {
		feedbacks: number;
		applications: number;
	};
};

interface AvailableRoastsListProps {
	availableRoasts: AvailableRoast[];
}

function formatTimeAgo(date: Date) {
	const now = new Date();
	const diffInHours = Math.round(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60)
	);

	if (diffInHours < 1) return 'Il y a moins d&apos;une heure';
	if (diffInHours < 24) return `Il y a ${diffInHours}h`;

	const diffInDays = Math.round(diffInHours / 24);
	if (diffInDays === 1) return 'Il y a 1 jour';
	if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

	const diffInWeeks = Math.round(diffInDays / 7);
	if (diffInWeeks === 1) return 'Il y a 1 semaine';
	return `Il y a ${diffInWeeks} semaines`;
}

function getRoastPriority(roast: AvailableRoast): 'high' | 'medium' | 'low' {
	const hoursOld =
		(new Date().getTime() - roast.createdAt.getTime()) / (1000 * 60 * 60);
	const applicationCount = roast._count.applications;
	const spotsRemaining = roast.feedbacksRequested - applicationCount;

	// Récent ET places disponibles = priorité haute
	if (hoursOld < 24 && spotsRemaining > 0) return 'high';

	// Plus d'une semaine OU toutes les places prises = priorité basse
	if (hoursOld > 168 || spotsRemaining <= 0) return 'low';

	return 'medium';
}

function PriorityIndicator({
	priority,
}: {
	priority: 'high' | 'medium' | 'low';
}) {
	const colors = {
		high: 'bg-red-500/20 text-red-600 border-red-500/30 dark:bg-red-500/30 dark:text-red-400',
		medium: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:bg-yellow-500/30 dark:text-yellow-400',
		low: 'bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/30 dark:text-green-400',
	};

	const labels = {
		high: 'Forte',
		medium: 'Moyenne',
		low: 'Faible',
	};

	return (
		<Badge variant='outline' className={`${colors[priority]} font-medium`}>
			Priorité {labels[priority]}
		</Badge>
	);
}

export function AvailableRoastsList({
	availableRoasts,
}: AvailableRoastsListProps) {
	// Trier par priorité puis par date
	const sortedRoasts = [...availableRoasts].sort((a, b) => {
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		const aPriority = getRoastPriority(a);
		const bPriority = getRoastPriority(b);

		if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
			return priorityOrder[aPriority] - priorityOrder[bPriority];
		}

		return b.createdAt.getTime() - a.createdAt.getTime();
	});


	if (availableRoasts.length === 0) {
		return (
			<Card>
				<CardContent className='p-8 text-center'>
					<CheckCircle2 className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
					<h3 className='text-lg font-medium text-foreground mb-2'>
						Aucune app à roaster pour le moment
					</h3>
					<p className='text-muted-foreground'>
						Les nouvelles demandes de roast apparaîtront ici. Revenez
						bientôt pour découvrir de nouveaux projets !
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h2 className='text-lg font-semibold'>
					Apps disponibles ({availableRoasts.length})
				</h2>
				<div className='text-sm text-muted-foreground'>
					Triées par priorité et fraîcheur
				</div>
			</div>

			<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{sortedRoasts.map((roast) => {
					const priority = getRoastPriority(roast);
					const spotsLeft =
						roast.feedbacksRequested - roast._count.applications;
					const pricePerRoast = Math.round(roast.maxPrice / roast.feedbacksRequested);

					return (
						<Card
							key={roast.id}
							className='group hover:shadow-lg transition-all duration-200 overflow-hidden'>
							{/* Image with overlay info */}
							<div className='relative h-48 overflow-hidden'>
								{roast.coverImage ? (
									<Image
										src={roast.coverImage}
										alt={roast.title}
										fill
										className='object-cover transition-transform duration-300 group-hover:scale-105'
										sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									/>
								) : (
									<div className='w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center'>
										<ExternalLink className='h-12 w-12 text-muted-foreground/50' />
									</div>
								)}
								
								{/* Overlay gradient */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />
								
								{/* Priority badge */}
								<div className='absolute top-3 left-3'>
									<PriorityIndicator priority={priority} />
								</div>
								
								{/* Price badge */}
								<div className='absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full'>
									{pricePerRoast}€/roast
								</div>
								
								{/* Title on image */}
								<div className='absolute bottom-3 left-3 right-3'>
									<h3 className='text-lg font-bold text-white line-clamp-2 drop-shadow-lg'>
										{roast.title}
									</h3>
								</div>
							</div>

							<CardContent className='p-4 space-y-3'>
								{/* Creator info & time */}
								<div className='flex items-center justify-between text-sm'>
									<div className='flex items-center gap-2'>
										<span className='text-muted-foreground'>
											{roast.creator.name}
											{roast.creator.creatorProfile?.company && (
												<span className='text-muted-foreground/70'> • {roast.creator.creatorProfile.company}</span>
											)}
										</span>
									</div>
									<span className='text-xs text-muted-foreground'>
										{formatTimeAgo(roast.createdAt)}
									</span>
								</div>

								{/* Description */}
								<p className='text-sm text-muted-foreground line-clamp-2 h-10'>
									{roast.description}
								</p>

								{/* Focus areas as badges */}
								{roast.focusAreas.length > 0 && (
									<div className='flex flex-wrap gap-1'>
										{roast.focusAreas.slice(0, 3).map((area) => (
											<Badge
												key={area}
												variant='secondary'
												className='text-xs px-2 py-0.5'>
												{area}
											</Badge>
										))}
										{roast.focusAreas.length > 3 && (
											<Badge
												variant='secondary'
												className='text-xs px-2 py-0.5 opacity-70'>
												+{roast.focusAreas.length - 3}
											</Badge>
										)}
									</div>
								)}

								{/* Stats & actions */}
								<div className='flex items-center justify-between pt-2 border-t'>
									<div className='flex items-center gap-3 text-sm'>
										{/* Spots left */}
										<div className='flex items-center gap-1 text-muted-foreground'>
											<Users className='h-4 w-4' />
											<span className={spotsLeft > 0 ? 'text-blue-600 font-medium' : 'text-red-600'}>
												{spotsLeft > 0
													? `${spotsLeft}/${roast.feedbacksRequested}`
													: 'Complet'}
											</span>
										</div>
										
										{/* View app link */}
										<Link
											href={roast.appUrl}
											target='_blank'
											className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors'>
											<ExternalLink className='h-3 w-3' />
											<span className='text-xs'>App</span>
										</Link>
									</div>

									{/* Action button */}
									<Button
										asChild
										size='sm'
										variant={spotsLeft > 0 ? 'default' : 'secondary'}
										className={spotsLeft > 0 ? 'bg-orange-500 hover:bg-orange-600' : ''}
										disabled={spotsLeft <= 0}>
										<Link href={`/roast/${roast.id}`}>
											{spotsLeft > 0 ? 'Postuler' : 'Complet'}
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
