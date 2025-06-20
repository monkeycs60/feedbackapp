'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Euro, Users, CheckCircle2 } from 'lucide-react';
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
		high: 'bg-red-500/20 text-red-300 border-red-500/30',
		medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
		low: 'bg-green-500/20 text-green-300 border-green-500/30',
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

	console.log(sortedRoasts);

	if (availableRoasts.length === 0) {
		return (
			<Card className='bg-gray-800/50 border-gray-700'>
				<CardContent className='p-8 text-center'>
					<CheckCircle2 className='mx-auto h-12 w-12 text-gray-400 mb-4' />
					<h3 className='text-lg font-medium text-gray-100 mb-2'>
						Aucune app à roaster pour le moment
					</h3>
					<p className='text-gray-300'>
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
				<h2 className='text-xl font-semibold text-white'>
					Apps disponibles ({availableRoasts.length})
				</h2>
				<div className='text-sm text-gray-300'>
					Triées par priorité et fraîcheur
				</div>
			</div>

			<div className='grid gap-6'>
				{sortedRoasts.map((roast) => {
					const priority = getRoastPriority(roast);
					const spotsLeft =
						roast.feedbacksRequested - roast._count.applications;

					return (
						<Card
							key={roast.id}
							className='bg-gray-800/90 border-gray-700 hover:border-gray-600 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-orange-500/10 group overflow-hidden'>
							<CardContent className='p-6'>
								<div className='flex items-start gap-6'>
									{/* Creator Avatar */}
									<div className='flex-shrink-0'>
										<div className='w-24 h-24 relative rounded-md overflow-hidden border-2 border-gray-700 group-hover:border-orange-500/50 transition-all'>
											{roast.coverImage ? (
												<Image
													src={roast.coverImage}
													alt={
														roast.creator.name || 'Creator avatar'
													}
													fill
													className='object-cover'
													sizes='96px'
												/>
											) : (
												<div className='w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center'>
													<ExternalLink className='h-8 w-8 text-gray-400' />
												</div>
											)}
										</div>
									</div>

									{/* Main Content */}
									<div className='flex-1'>
										<div className='flex justify-between items-start mb-2'>
											<h3 className='text-xl font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-2 leading-tight'>
												{roast.title}
											</h3>
											<div className='hidden sm:block'>
												<PriorityIndicator priority={priority} />
											</div>
										</div>

										<div className='flex items-center gap-2 text-sm text-gray-400 mb-4'>
											<span>{roast.creator.name}</span>
											<span className='text-gray-600'>•</span>
											<span>{formatTimeAgo(roast.createdAt)}</span>
										</div>

										<p className='text-gray-300 text-sm line-clamp-3 mb-5'>
											{roast.description}
										</p>

										{roast.focusAreas.length > 0 && (
											<div className='mb-5'>
												<div className='flex flex-wrap gap-2'>
													{roast.focusAreas
														.slice(0, 4)
														.map((area) => (
															<Badge
																key={area}
																variant='secondary'
																className='bg-gray-700/60 text-gray-300 border-gray-600 text-xs px-2.5 py-1'>
																{area}
															</Badge>
														))}
													{roast.focusAreas.length > 4 && (
														<Badge
															variant='secondary'
															className='bg-gray-700/60 text-gray-400 border-gray-600 text-xs px-2.5 py-1'>
															+{roast.focusAreas.length - 4}{' '}
															autres
														</Badge>
													)}
												</div>
											</div>
										)}

										<div className='border-t border-gray-700/80 pt-4'>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-x-5 gap-y-2 text-sm flex-wrap'>
													<div className='flex items-center gap-1.5 text-green-400 font-medium'>
														<Euro className='h-4 w-4' />
														<span>Jusqu'à {roast.maxPrice}€</span>
													</div>

													<div className='flex items-center gap-1.5 text-blue-400 font-medium'>
														<Users className='h-4 w-4' />
														<span>
															{spotsLeft > 0
																? `${spotsLeft} place${
																		spotsLeft > 1 ? 's' : ''
																  } restante${
																		spotsLeft > 1 ? 's' : ''
																  }`
																: 'Complet'}
														</span>
													</div>

													<span className='text-xs text-gray-500 hidden md:inline'>
														{roast._count.applications}{' '}
														candidature
														{roast._count.applications !== 1
															? 's'
															: ''}
													</span>
												</div>

												<div className='flex items-center gap-3'>
													<Button
														variant='outline'
														size='sm'
														asChild
														className='border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200'>
														<Link
															href={roast.appUrl}
															target='_blank'>
															<ExternalLink className='h-3 w-3 mr-1.5' />
															Voir l'app
														</Link>
													</Button>

													<Button
														asChild
														size='sm'
														className='bg-orange-500 hover:bg-orange-600 text-white font-semibold'
														disabled={spotsLeft <= 0}>
														<Link href={`/roast/${roast.id}`}>
															{spotsLeft > 0
																? 'Postuler'
																: 'Complet'}
														</Link>
													</Button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
