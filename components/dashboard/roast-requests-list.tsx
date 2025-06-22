'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Calendar,
	MessageSquare,
	Users,
	ExternalLink,
	CheckCircle2,
	AlertCircle,
	Clock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { APP_CATEGORIES } from '@/lib/types/roast-request';

interface RoastRequestsListProps {
	roastRequests: Array<{
		id: string;
		title: string;
		description: string;
		status: string;
		maxPrice: number;
		feedbacksRequested: number;
		createdAt: Date;
		focusAreas: string[];
		coverImage?: string | null;
		category?: string | null;
		feedbacks: Array<{ id: string; status: string }>;
		applications?: Array<{ id: string; status: string }>;
		_count: {
			feedbacks: number;
			applications?: number;
		};
	}>;
}

function formatTimeAgo(date: Date) {
	const now = new Date();
	const diffInHours = Math.round(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60)
	);

	if (diffInHours < 1) return "À l'instant";
	if (diffInHours < 24) return `Il y a ${diffInHours}h`;

	const diffInDays = Math.round(diffInHours / 24);
	if (diffInDays === 1) return 'Hier';
	if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

	const diffInWeeks = Math.round(diffInDays / 7);
	if (diffInWeeks === 1) return 'Il y a 1 semaine';
	return `Il y a ${diffInWeeks} semaines`;
}

export function RoastRequestsList({ roastRequests }: RoastRequestsListProps) {
	const statusConfig = {
		open: {
			color: 'bg-green-500',
			label: 'Actif',
			icon: (
				<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
			),
		},
		collecting_applications: {
			color: 'bg-orange-500',
			label: 'Candidatures',
			icon: <Users className='w-3 h-3' />,
		},
		in_progress: {
			color: 'bg-blue-500',
			label: 'En cours',
			icon: <Clock className='w-3 h-3' />,
		},
		completed: {
			color: 'bg-gray-500',
			label: 'Terminé',
			icon: <CheckCircle2 className='w-3 h-3' />,
		},
		cancelled: {
			color: 'bg-red-500',
			label: 'Annulé',
			icon: <AlertCircle className='w-3 h-3' />,
		},
	};

	if (roastRequests.length === 0) {
		return (
			<Card>
				<CardContent className='py-12'>
					<div className='text-center'>
						<div className='text-6xl mb-4'>🚀</div>
						<h3 className='text-lg font-medium mb-2'>
							Aucune demande de roast
						</h3>
						<p className='text-muted-foreground mb-6'>
							Commence par poster ta première app pour recevoir des
							feedbacks
						</p>
						<Button asChild>
							<Link href='/dashboard/new-roast'>
								Créer ma première demande
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>Tes demandes de roast</h2>
				<Button asChild size='sm'>
					<Link href='/dashboard/new-roast'>Nouvelle demande</Link>
				</Button>
			</div>

			<div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{roastRequests.map((request) => {
					const status =
						statusConfig[request.status as keyof typeof statusConfig];
					const feedbackProgress =
						(request._count.feedbacks / request.feedbacksRequested) * 100;
					const pricePerFeedback = Math.round(
						request.maxPrice / request.feedbacksRequested
					);

					return (
						<Card
							key={request.id}
							className='group hover:shadow-lg py-0 gap-1 transition-all duration-200 overflow-hidden'>
							{/* Cover image with status overlay */}
							<div className='relative h-40 overflow-hidden'>
								{request.coverImage ? (
									<Image
										src={request.coverImage}
										alt={request.title}
										fill
										className='object-cover transition-transform duration-300 group-hover:scale-105'
										sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
									/>
								) : (
									<div className='w-full h-full bg-muted flex items-center justify-center'>
										<MessageSquare className='h-10 w-10 text-muted-foreground/30' />
									</div>
								)}

								{/* Gradient overlay */}
								<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

								{/* Status badge */}
								<div className='absolute top-3 left-3'>
									<div
										className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-sm text-white flex items-center gap-1.5`}>
										{status.icon}
										<span>{status.label}</span>
									</div>
								</div>

								{/* Title on image */}
								<div className='absolute bottom-3 left-3 right-3'>
									<h3 className='text-base font-bold text-white line-clamp-2 drop-shadow-lg'>
										{request.title}
									</h3>
								</div>

								{/* Time badge */}
								<div className='absolute top-3 right-3'>
									<div className='px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-white text-xs'>
										{formatTimeAgo(request.createdAt)}
									</div>
								</div>
							</div>

							<CardContent className='p-4 space-y-3'>
								{/* Description */}
								<p className='text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]'>
									{request.description}
								</p>

								{/* Category and Focus areas */}
								<div className='space-y-2'>
									{/* Category */}
									{request.category && (
										<div className='flex items-center gap-1.5'>
											{(() => {
												const categoryInfo = APP_CATEGORIES.find(cat => cat.id === request.category);
												return categoryInfo ? (
													<>
														<span className='text-sm'>{categoryInfo.icon}</span>
														<span className='text-xs font-medium text-muted-foreground'>
															{categoryInfo.label}
														</span>
													</>
												) : (
													<span className='text-xs text-muted-foreground'>{request.category}</span>
												);
											})()}
										</div>
									)}

									{/* Focus areas */}
									{request.focusAreas.length > 0 && (
										<div className='flex flex-wrap gap-1'>
											{request.focusAreas.slice(0, 2).map((area) => (
												<span
													key={area}
													className='text-xs px-2 py-0.5 bg-muted rounded-full'>
													{area}
												</span>
											))}
											{request.focusAreas.length > 2 && (
												<span className='text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground'>
													+{request.focusAreas.length - 2}
												</span>
											)}
										</div>
									)}
								</div>

								{/* Feedback progress */}
								<div className='space-y-2'>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-muted-foreground'>
											Feedbacks
										</span>
										<span className='font-medium'>
											{request._count.feedbacks}/
											{request.feedbacksRequested}
										</span>
									</div>
									<Progress value={feedbackProgress} className='h-2' />
								</div>

								{/* Stats row */}
								<div className='flex items-center justify-between pb-1 text-sm'>
									<div className='flex items-center gap-3'>
										{/* Price */}
										<div className='font-semibold'>
											{pricePerFeedback}€
											<span className='text-xs text-muted-foreground font-normal'>
												{' '}
												/feedback
											</span>
										</div>

										{/* Pending applications count if any */}
										{(() => {
											const pendingApplications = request.applications?.filter(app => app.status === 'pending') || [];
											return pendingApplications.length > 0 && (
												<div className='flex items-center gap-1 text-muted-foreground'>
													<Users className='h-3.5 w-3.5' />
													<span>
														{pendingApplications.length}
													</span>
												</div>
											);
										})()}
									</div>

									{/* Status-specific info */}
									{request.status === 'completed' && (
										<Badge variant='secondary' className='text-xs'>
											<CheckCircle2 className='w-3 h-3 mr-1' />
											Complété
										</Badge>
									)}
								</div>

								{/* Actions */}
								<div className='flex gap-2 pt-3 pb-2 border-t'>
									<Button
										asChild
										variant='default'
										size='sm'
										className='flex-1'>
										<Link href={`/dashboard/roast/${request.id}`}>
											<ExternalLink className='w-3.5 h-3.5 mr-1.5' />
											Voir détails
										</Link>
									</Button>

									{(() => {
										// Count pending applications
										const pendingApplications = request.applications?.filter(app => app.status === 'pending') || [];
										const hasPendingApplications = pendingApplications.length > 0;
										
										return hasPendingApplications && (
											<Button asChild variant='outline' size='sm'>
												<Link
													href={`/dashboard/roast/${request.id}?tab=applications`}>
													<Users className='w-3.5 h-3.5' />
													Candidatures (
													{pendingApplications.length})
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
