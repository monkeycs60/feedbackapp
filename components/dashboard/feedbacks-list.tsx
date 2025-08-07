'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Star,
	MessageSquare,
	CheckCircle2,
	Clock,
	TrendingUp,
	ExternalLink,
	Users,
	Target,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { APP_CATEGORIES } from '@/lib/types/roast-request';

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
		// Legacy field
		generalFeedback?: string | null;
		// New unified feedback fields  
		globalRating?: number | null;
		firstImpression?: string | null;
		strengths: string[];
		weaknesses: string[];
		recommendations: string[];
		finalPrice: number | null;
		createdAt: Date;
		// Detailed ratings
		uxUiRating?: number | null;
		valueRating?: number | null;
		performanceRating?: number | null;
		experienceRating?: number | null;
		// Additional fields
		aiQualityScore?: number | null;
		creatorRating?: number | null;
		screenshots: string[];
		roastRequest: {
			id: string;
			title: string;
			appUrl: string;
			description: string;
			category?: string | null;
			coverImage?: string | null;
			pricePerRoaster: number;
			feedbacksRequested: number;
			targetAudiences: Array<{
				targetAudience: {
					id: string;
					name: string;
				};
			}>;
			questions: Array<{
				id: string;
				domain: string | null;
				text: string;
				order: number;
			}>;
		};
		questionResponses: Array<{
			id: string;
			questionId: string;
			response: string;
			question?: {
				id: string;
				domain: string | null;
				text: string;
			};
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

	// Group feedbacks by project
	const feedbacksByProject = feedbacks.reduce((acc, feedback) => {
		const projectId = feedback.roastRequest.id;
		if (!acc[projectId]) {
			acc[projectId] = {
				roastRequest: feedback.roastRequest,
				feedbacks: []
			};
		}
		acc[projectId].feedbacks.push(feedback);
		return acc;
	}, {} as Record<string, { roastRequest: FeedbacksListProps['feedbacks'][0]['roastRequest'], feedbacks: typeof feedbacks }>);

	const projects = Object.values(feedbacksByProject);

	return (
		<div className='space-y-8'>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold'>
					Feedbacks reçus ({feedbacks.length})
				</h2>
				<div className='text-sm text-muted-foreground'>
					{projects.length} projet{projects.length > 1 ? 's' : ''}
				</div>
			</div>

			{projects.map(({ roastRequest, feedbacks: projectFeedbacks }) => {
				const categoryInfo = roastRequest.category ? 
					APP_CATEGORIES.find(cat => cat.id === roastRequest.category) : null;
				const completedFeedbacks = projectFeedbacks.filter(f => f.status === 'completed').length;
				const avgRating = completedFeedbacks > 0 ? 
					projectFeedbacks.filter(f => f.globalRating).reduce((sum, f) => sum + (f.globalRating || 0), 0) / completedFeedbacks : null;

				return (
					<div key={roastRequest.id} className='space-y-4'>
						{/* Project Header */}
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-start gap-4'>
									{/* Cover Image */}
									<div className='w-20 h-20 flex-shrink-0'>
										{roastRequest.coverImage ? (
											<Image
												src={roastRequest.coverImage}
												alt={roastRequest.title}
												width={80}
												height={80}
												className='w-full h-full object-cover rounded-lg'
											/>
										) : (
											<div className='w-full h-full bg-muted rounded-lg flex items-center justify-center'>
												<MessageSquare className='h-6 w-6 text-muted-foreground/50' />
											</div>
										)}
									</div>

									{/* Project Info */}
									<div className='flex-1 space-y-3'>
										<div>
											<div className='flex items-start justify-between'>
												<h3 className='text-lg font-semibold line-clamp-2'>
													{roastRequest.title}
												</h3>
												<Button variant='outline' size='sm' asChild>
													<Link href={roastRequest.appUrl} target='_blank'>
														<ExternalLink className='h-3 w-3 mr-1' />
														Voir l'app
													</Link>
												</Button>
											</div>
											<p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
												{roastRequest.description}
											</p>
										</div>

										<div className='flex items-center gap-6 text-sm'>
											{/* Category */}
											{categoryInfo && (
												<div className='flex items-center gap-1'>
													<span>{categoryInfo.icon}</span>
													<span className='text-muted-foreground'>{categoryInfo.label}</span>
												</div>
											)}

											{/* Target Audiences */}
											{(roastRequest.targetAudiences && roastRequest.targetAudiences.length > 0) && (
												<div className='flex items-center gap-1'>
													<Target className='h-3 w-3 text-muted-foreground' />
													<span className='text-muted-foreground'>
														{roastRequest.targetAudiences.slice(0, 2).map((ta: any) => ta.targetAudience.name).join(', ')}
														{roastRequest.targetAudiences.length > 2 && ` +${roastRequest.targetAudiences.length - 2}`}
													</span>
												</div>
											)}

											{/* Price */}
											<div className='flex items-center gap-1'>
												<span className='font-medium'>{roastRequest.pricePerRoaster}€</span>
												<span className='text-muted-foreground text-xs'>/roaster</span>
											</div>
										</div>

										{/* Project Stats */}
										<div className='flex items-center gap-6 text-sm'>
											<div className='flex items-center gap-1'>
												<Users className='h-3 w-3 text-blue-500' />
												<span>{completedFeedbacks}/{roastRequest.feedbacksRequested} feedbacks</span>
											</div>
											{avgRating && (
												<div className='flex items-center gap-1'>
													<Star className='h-3 w-3 text-yellow-500 fill-current' />
													<span>{avgRating.toFixed(1)}/5 moyenne</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Feedbacks for this project */}
						<div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pl-6'>
							{projectFeedbacks.map((feedback) => {
								const status = statusConfig[feedback.status as keyof typeof statusConfig] || statusConfig.pending;
								const domains = feedback.questionResponses
									? [...new Set(feedback.questionResponses.map((qr) => qr.question?.domain).filter(Boolean))]
									: [];

								return (
									<Card key={feedback.id} className='group hover:shadow-lg transition-all duration-200'>
										<CardContent className='p-4 space-y-3'>
											{/* Roaster Info */}
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
																{(feedback.roaster.name || 'R')[0].toUpperCase()}
															</span>
														)}
													</div>
													<div>
														<p className='text-sm font-medium'>
															{feedback.roaster.name || 'Roaster anonyme'}
														</p>
														{feedback.roaster.roasterProfile && (
															<div className='flex items-center gap-1'>
																<Star className='h-3 w-3 text-yellow-500 fill-current' />
																<span className='text-xs text-muted-foreground'>
																	{feedback.roaster.roasterProfile.rating.toFixed(1)}
																</span>
															</div>
														)}
													</div>
												</div>
												<Badge className={`border ${status.color} text-xs flex items-center gap-1`}>
													{status.icon}
													{status.label}
												</Badge>
											</div>

											{/* Ratings */}
											{feedback.globalRating && (
												<div className='space-y-2'>
													<div className='flex items-center gap-2'>
														<div className='flex'>
															{Array.from({ length: 5 }, (_, i) => (
																<Star
																	key={i}
																	className={`w-3 h-3 ${
																		i < feedback.globalRating!
																			? 'text-yellow-400 fill-current'
																			: 'text-gray-300'
																	}`}
																/>
															))}
														</div>
														<span className='text-sm font-medium'>{feedback.globalRating}/5</span>
													</div>
													
													{/* Detailed ratings */}
													{(feedback.uxUiRating || feedback.valueRating || feedback.performanceRating) && (
														<div className='grid grid-cols-3 gap-2 text-xs'>
															{feedback.uxUiRating && (
																<div className='text-center'>
																	<div className='text-muted-foreground'>UX</div>
																	<div className='font-medium'>{feedback.uxUiRating}/5</div>
																</div>
															)}
															{feedback.valueRating && (
																<div className='text-center'>
																	<div className='text-muted-foreground'>Value</div>
																	<div className='font-medium'>{feedback.valueRating}/5</div>
																</div>
															)}
															{feedback.performanceRating && (
																<div className='text-center'>
																	<div className='text-muted-foreground'>Perf</div>
																	<div className='font-medium'>{feedback.performanceRating}/5</div>
																</div>
															)}
														</div>
													)}
												</div>
											)}

											{/* Feedback preview */}
											<p className='text-sm text-muted-foreground line-clamp-2'>
												{feedback.firstImpression || feedback.generalFeedback || "Aucun aperçu disponible"}
											</p>

											{/* Domains */}
											{domains.length > 0 && (
												<div className='flex flex-wrap gap-1'>
													{domains.slice(0, 2).map((domain) => (
														<span key={domain} className='text-xs px-2 py-0.5 bg-muted rounded-full'>
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

											{/* Footer */}
											<div className='flex items-center justify-between pt-2 border-t'>
												<div className='flex items-center gap-3 text-xs text-muted-foreground'>
													<span>
														{formatDistanceToNow(new Date(feedback.createdAt), {
															addSuffix: true,
															locale: enUS,
														})}
													</span>
													{feedback.finalPrice && (
														<span className='font-medium text-primary'>
															{feedback.finalPrice}€
														</span>
													)}
												</div>
												<Button variant='outline' size='sm' asChild>
													<Link href={`/dashboard/roast/${roastRequest.id}#feedback-${feedback.id}`}>
														<MessageSquare className='h-3 w-3 mr-1' />
														Voir
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
			})}
		</div>
	);
}
