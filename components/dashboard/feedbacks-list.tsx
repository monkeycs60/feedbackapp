'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	ChevronRight,
	Star,
	Calendar,
	MessageSquare,
	CheckCircle2,
	Clock,
	TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedbacksListProps {
	feedbacks: Array<{
		id: string;
		status: string;
		roaster: {
			id: string;
			name: string | null;
			image?: string | null;
			roasterProfile: {
				bio: string | null;
				specialties: string[];
				rating: number;
			} | null;
		};
		generalFeedback: string;
		finalPrice: number | null;
		createdAt: Date;
		roastRequest: {
			id: string;
			title: string;
			coverImage?: string | null;
			questions?: Array<{
				id: string;
				domain: string;
				text: string;
				order: number;
				isDefault: boolean;
			}>;
		};
		questionResponses?: Array<{
			id: string;
			questionId: string;
			response: string;
			createdAt: Date;
		}>;
	}>;
}

export function FeedbacksList({ feedbacks }: FeedbacksListProps) {
	const statusConfig = {
		completed: {
			label: 'Complété',
			icon: <CheckCircle2 className='w-3 h-3' />,
			color: 'text-green-600 bg-green-50 border-green-200',
		},
		pending: {
			label: 'En attente',
			icon: <Clock className='w-3 h-3' />,
			color: 'text-orange-600 bg-orange-50 border-orange-200',
		},
		disputed: {
			label: 'Contesté',
			icon: <TrendingUp className='w-3 h-3' />,
			color: 'text-red-600 bg-red-50 border-red-200',
		},
	};

	if (feedbacks.length === 0) {
		return (
			<Card className='border-dashed'>
				<CardContent className='flex flex-col items-center justify-center py-12'>
					<MessageSquare className='h-12 w-12 text-muted-foreground/30 mb-4' />
					<p className='text-muted-foreground text-center mb-2'>
						Aucun feedback reçu pour le moment
					</p>
					<p className='text-sm text-muted-foreground/80 text-center'>
						Les feedbacks de vos roasters apparaîtront ici
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>
					Feedbacks reçus ({feedbacks.length})
				</h2>
			</div>

			<div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
				{feedbacks.map((feedback) => {
					const status =
						statusConfig[feedback.status as keyof typeof statusConfig] ||
						statusConfig.pending;
					const domains =
						feedback.questionResponses && feedback.roastRequest.questions
							? [
									...new Set(
										feedback.questionResponses
											.map(
												(qr) =>
													feedback.roastRequest.questions?.find(
														(q) => q.id === qr.questionId
													)?.domain
											)
											.filter(Boolean)
									),
							  ]
							: [];

					return (
						<Card
							key={feedback.id}
							className='group py-0 gap-1 hover:shadow-lg transition-all duration-200 overflow-hidden'>
							<div className='flex bg-orange-100 px-4 py-2 justify-between overflow-hidden'>
								{/* Roast title */}
								<div className=''>
									<h3 className='text-sm font-semibold text-black line-clamp-1 drop-shadow'>
										{feedback.roastRequest.title}
									</h3>
								</div>

								{/* Status badge */}
								<div className=''>
									<Badge
										className={`border ${status.color} text-xs flex items-center gap-1`}>
										{status.icon}
										{status.label}
									</Badge>
								</div>
							</div>

							<CardContent className='p-4 space-y-3'>
								{/* Roaster info */}
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
											{feedback.roaster.image ? (
												<Image
													src={feedback.roaster.image}
													alt={feedback.roaster.name || 'Roaster'}
													width={32}
													height={32}
													className='rounded-full'
												/>
											) : (
												<span className='text-xs font-medium'>
													{(feedback.roaster.name ||
														'R')[0].toUpperCase()}
												</span>
											)}
										</div>
										<div>
											<p className='text-sm font-medium line-clamp-1'>
												{feedback.roaster.name || 'Roaster anonyme'}
											</p>
											{feedback.roaster.roasterProfile && (
												<div className='flex items-center gap-1'>
													<Star className='h-3 w-3 text-yellow-500 fill-current' />
													<span className='text-xs text-muted-foreground'>
														{feedback.roaster.roasterProfile.rating.toFixed(
															1
														)}
													</span>
												</div>
											)}
										</div>
									</div>
									{feedback.finalPrice && (
										<span className='text-lg font-bold text-primary'>
											{feedback.finalPrice}€
										</span>
									)}
								</div>

								{/* General feedback preview */}
								<p className='text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]'>
									{feedback.generalFeedback}
								</p>

								{/* Domains covered */}
								<div className='h-6'>
									{domains.length > 0 && (
										<div className='flex flex-wrap gap-1'>
											{domains.slice(0, 2).map((domain) => (
												<span
													key={domain}
													className='text-xs px-2 py-0.5 bg-muted rounded-full'>
													{domain}
												</span>
											))}
											{domains.length > 2 && (
												<span className='text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground'>
													+{domains.length - 2}
												</span>
											)}
										</div>
									)}
								</div>

								{/* Stats */}
								<div className='flex items-center justify-between text-sm text-muted-foreground pt-2 border-t'>
									<div className='flex items-center gap-1'>
										<Calendar className='h-3 w-3' />
										<span className='text-xs'>
											{formatDistanceToNow(
												new Date(feedback.createdAt),
												{
													addSuffix: true,
													locale: fr,
												}
											)}
										</span>
									</div>
									<div className='flex items-center gap-1'>
										<MessageSquare className='h-3 w-3' />
										<span className='text-xs'>
											{feedback.questionResponses?.length || 0}{' '}
											réponses
										</span>
									</div>
								</div>

								{/* Action */}
								<Button
									asChild
									variant='default'
									size='sm'
									className='w-full'>
									<Link
										href={`/dashboard/roast/${feedback.roastRequest.id}#feedback-${feedback.id}`}>
										Voir le feedback
										<ChevronRight className='h-3.5 w-3.5 ml-1' />
									</Link>
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
