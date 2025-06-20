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
		high: 'bg-red-100 text-red-700 border-red-200/50',
		medium: 'bg-yellow-100 text-yellow-700 border-yellow-200/50',
		low: 'bg-green-100 text-green-700 border-green-200/50',
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

			<div className='grid gap-4'>
				{sortedRoasts.map((roast) => {
					const priority = getRoastPriority(roast);
					const spotsLeft =
						roast.feedbacksRequested - roast._count.applications;

					return (
						<Card
							key={roast.id}
							className='bg-white border py-0 hover:border-gray-300 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-orange-500/10 group overflow-hidden'>
							<div className='flex'>
								<div className='w-1/3 relative'>
									{roast.coverImage ? (
										<Image
											src={roast.coverImage}
											alt={roast.title}
											fill
											className='object-cover'
											sizes='(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 224px'
										/>
									) : (
										<div className='w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center'>
											<ExternalLink className='h-8 w-8 text-gray-400' />
										</div>
									)}
								</div>

								<div className='w-2/3 p-4 flex flex-col justify-between'>
									<div>
										<div className='flex justify-between items-start mb-1'>
											<h3 className='text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight pr-2'>
												{roast.title}
											</h3>
											<div className='hidden sm:block flex-shrink-0'>
												<PriorityIndicator priority={priority} />
											</div>
										</div>

										<div className='flex items-center gap-2 text-sm text-gray-500 mb-3'>
											<span>{roast.creator.name}</span>
											<span className='text-gray-400'>•</span>
											<span>{formatTimeAgo(roast.createdAt)}</span>
										</div>

										<p className='text-gray-600 text-sm line-clamp-2 mb-4'>
											{roast.description}
										</p>

										{roast.focusAreas.length > 0 && (
											<div className='mb-4'>
												<div className='flex flex-wrap gap-2'>
													{roast.focusAreas
														.slice(0, 3)
														.map((area) => (
															<Badge
																key={area}
																variant='secondary'
																className='bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-0.5'>
																{area}
															</Badge>
														))}
													{roast.focusAreas.length > 3 && (
														<Badge
															variant='secondary'
															className='bg-gray-100 text-gray-500 border-gray-200 text-xs px-2 py-0.5'>
															+{roast.focusAreas.length - 3}
														</Badge>
													)}
												</div>
											</div>
										)}
									</div>

									<div className='border-t pt-3'>
										<div className='flex items-end justify-between'>
											<div className='flex items-center gap-x-4 gap-y-2 text-sm flex-wrap'>
												<div className='flex items-center gap-1.5 text-green-600 font-medium'>
													<Euro className='h-4 w-4' />
													<span>
														Jusqu&apos;à {roast.maxPrice}€
													</span>
												</div>

												<div className='flex items-center gap-1.5 text-blue-600 font-medium'>
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

												<span className='text-xs text-gray-400 hidden md:inline'>
													{roast._count.applications} candidature
													{roast._count.applications !== 1
														? 's'
														: ''}
												</span>
											</div>

											<div className='flex items-center gap-2 flex-shrink-0'>
												<Button
													variant='outline'
													size='sm'
													asChild
													className='text-gray-600 border-gray-300 hover:text-gray-800 hover:bg-gray-50'>
													<Link
														href={roast.appUrl}
														target='_blank'>
														<ExternalLink className='h-3 w-3 mr-1.5' />
														Voir l&apos;app
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
						</Card>
					);
				})}
			</div>
		</div>
	);
}
