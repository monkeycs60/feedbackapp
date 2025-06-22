'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { APP_CATEGORIES } from '@/lib/types/roast-request';

type AvailableRoast = {
	id: string;
	title: string;
	appUrl: string;
	description: string;
	category?: string | null;
	targetAudiences: Array<{
		targetAudience: {
			id: string;
			name: string;
		};
	}>;
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

			<div className='grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{sortedRoasts.map((roast) => {
					const priority = getRoastPriority(roast);
					const spotsLeft =
						roast.feedbacksRequested - roast._count.applications;
					const pricePerRoast = Math.round(
						roast.maxPrice / roast.feedbacksRequested
					);

					return (
						<Card
							key={roast.id}
							className='group hover:shadow-lg bg-backgroundlighter py-0 gap-0 transition-all duration-200 overflow-hidden'>
							{/* Image with overlay info */}
							<div className='relative h-40 overflow-hidden'>
								{roast.coverImage ? (
									<Image
										src={roast.coverImage}
										alt={roast.title}
										fill
										className='object-cover transition-transform duration-300 group-hover:scale-105'
										sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									/>
								) : (
									<div className='w-full h-full bg-muted flex items-center justify-center'>
										<ExternalLink className='h-10 w-10 text-muted-foreground/30' />
									</div>
								)}

								{/* Overlay gradient */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

								{/* Priority badge */}
								<div className='absolute top-3 left-3'>
									<div
										className={`px-2 py-1 rounded text-xs font-medium ${
											priority === 'high'
												? 'bg-black/70 text-white'
												: priority === 'medium'
												? 'bg-black/50 text-white/90'
												: 'bg-black/30 text-white/80'
										}`}>
										{priority === 'high'
											? 'Urgent'
											: priority === 'medium'
											? 'Normal'
											: 'Faible'}
									</div>
								</div>

								{/* Title on image */}
								<div className='absolute bottom-3 left-3 right-3'>
									<h3 className='text-base font-bold text-white line-clamp-2 drop-shadow-lg'>
										{roast.title}
									</h3>
								</div>
							</div>

							<CardContent className='px-4 pb-3 pt-3 space-y-2.5'>
								{/* Creator info & time */}
								<div className='flex items-center justify-between text-xs'>
									<span className='text-muted-foreground'>
										{roast.creator.name}
										{roast.creator.creatorProfile?.company && (
											<span className='text-muted-foreground/70'>
												{' '}
												• {roast.creator.creatorProfile.company}
											</span>
										)}
									</span>
									<span className='text-muted-foreground/70'>
										{formatTimeAgo(roast.createdAt)}
									</span>
								</div>

								{/* Description */}
								<div className='h-10'>
									<p className='text-sm text-muted-foreground line-clamp-2'>
										{roast.description}
									</p>
								</div>

								{/* Category and Focus areas */}
								<div className='my-3 flex justify-between'>
									{/* Category */}
									{roast.category && (
										<div className='flex items-center gap-1.5'>
											{(() => {
												const categoryInfo = APP_CATEGORIES.find(
													(cat) => cat.id === roast.category
												);
												return categoryInfo ? (
													<>
														<span className='text-sm'>
															{categoryInfo.icon}
														</span>
														<span className='text-xs font-medium text-foreground/80'>
															{categoryInfo.label}
														</span>
													</>
												) : (
													<span className='text-xs text-muted-foreground'>
														{roast.category}
													</span>
												);
											})()}
										</div>
									)}

									{/* Focus areas as badges */}
									{roast.focusAreas.length > 0 && (
										<div className='flex flex-wrap gap-1'>
											{roast.focusAreas.slice(0, 2).map((area) => (
												<span
													key={area}
													className='text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground'>
													{area}
												</span>
											))}
											{roast.focusAreas.length > 2 && (
												<span className='text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground/70'>
													+{roast.focusAreas.length - 2}
												</span>
											)}
										</div>
									)}
								</div>

								{/* Stats & actions */}
								<div className='flex items-center justify-between pt-3 pb-2 border-t'>
									<div className='flex items-center gap-3 text-sm'>
										{/* Price */}
										<span className='text-foreground font-medium'>
											{pricePerRoast}€
										</span>

										{/* Spots left - more explicit */}
										{spotsLeft > 0 ? (
											<div className='flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded'>
												<Users className='h-3.5 w-3.5' />
												<span className='font-medium text-foreground'>
													{spotsLeft} place
													{spotsLeft > 1 ? 's' : ''}
												</span>
											</div>
										) : (
											<span className='text-muted-foreground line-through'>
												Complet
											</span>
										)}

										{/* View app link */}
										<Link
											href={roast.appUrl}
											target='_blank'
											className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors'>
											<ExternalLink className='h-3 w-3' />
										</Link>
									</div>

									{/* Action button */}
									{(() => {
										const hasApplication =
											roast.applications.length > 0;
										const hasFeedback = roast.feedbacks.length > 0;
										const hasCompletedFeedback = roast.feedbacks.some(
											(f) => f.status === 'completed'
										);

										if (hasCompletedFeedback) {
											return (
												<Button asChild size='sm' variant='outline'>
													<Link href={`/roast/${roast.id}`}>
														Consulter
													</Link>
												</Button>
											);
										}

										if (hasApplication || hasFeedback) {
											return (
												<Button
													asChild
													size='sm'
													variant='default'
													className='bg-blue-500 hover:bg-blue-600'>
													<Link href={`/roast/${roast.id}`}>
														Continuer
													</Link>
												</Button>
											);
										}

										return (
											<Button
												asChild
												size='sm'
												variant={
													spotsLeft > 0 ? 'default' : 'ghost'
												}
												className={
													spotsLeft > 0
														? 'bg-orange-500 hover:bg-orange-600'
														: ''
												}
												disabled={spotsLeft <= 0}>
												<Link href={`/roast/${roast.id}`}>
													{spotsLeft > 0 ? 'Postuler' : 'Complet'}
												</Link>
											</Button>
										);
									})()}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
