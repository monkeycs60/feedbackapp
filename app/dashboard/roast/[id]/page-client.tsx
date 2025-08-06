'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Calendar,
	Globe,
	Users,
	MessageSquare,
	ChevronLeft,
	CheckCircle2,
	Clock,
	Star,
	AlertCircle,
	User,
	ThumbsUp,
	ThumbsDown,
	CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { UnifiedFeedbackDisplay } from '@/components/dashboard/unified-feedback-display';
import { APP_CATEGORIES } from '@/lib/types/roast-request';
import { useRouter } from 'next/navigation';
import {
	acceptApplication,
	rejectApplication,
} from '@/lib/actions/roast-application';
import { UnifiedPricingDisplay } from '@/components/roast/unified-pricing-display';
import { SPECIALTY_OPTIONS, ROASTER_LEVELS } from '@/lib/config/onboarding';

interface RoastDetailPageClientProps {
	roastRequest: any; // Type this properly based on your data structure
}

export function RoastDetailPageClient({
	roastRequest,
}: RoastDetailPageClientProps) {
	const router = useRouter();
	const [processingApplication, setProcessingApplication] = useState<
		string | null
	>(null);

	const validAudiences =
		roastRequest.targetAudiences?.map((ta: any) => ta.targetAudience) || [];

	const statusColors = {
		open: 'bg-green-100 text-green-800 border-green-200',
		collecting_applications:
			'bg-orange-100 text-orange-800 border-orange-200',
		in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
		completed: 'bg-gray-100 text-gray-800 border-gray-200',
		cancelled: 'bg-red-100 text-red-800 border-red-200',
	};

	const statusLabels = {
		open: 'Open',
		collecting_applications: 'Collecting Applications',
		in_progress: 'In Progress',
		completed: 'Completed',
		cancelled: 'Cancelled',
	};

	// Organize applications and feedbacks for progress display
	const applications = roastRequest.applications || [];
	const feedbacks = roastRequest.feedbacks || [];

	const pendingApplications = applications.filter(
		(app: any) => app.status === 'pending'
	);
	const acceptedApplications = applications.filter(
		(app: any) => app.status === 'accepted' || app.status === 'auto_selected'
	);
	const rejectedApplications = applications.filter(
		(app: any) => app.status === 'rejected'
	);

	// Create progress slots for visualization
	const progressSlots = Array.from(
		{ length: roastRequest.feedbacksRequested },
		(_, index) => {
			const feedback = feedbacks[index];
			const acceptedApp = acceptedApplications[index];

			return {
				index,
				feedback,
				acceptedApp,
				isCompleted: !!feedback,
				isInProgress: !!acceptedApp && !feedback,
				isEmpty: !acceptedApp && !feedback,
			};
		}
	);

	const feedbackProgress = {
		total: roastRequest.feedbacksRequested,
		completed: feedbacks.length,
		inProgress: acceptedApplications.length - feedbacks.length,
		remaining: roastRequest.feedbacksRequested - acceptedApplications.length,
		percentage: Math.round(
			(feedbacks.length / roastRequest.feedbacksRequested) * 100
		),
	};

	const getInitials = (name: string) => {
		return (
			name
				?.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase() || 'U'
		);
	};

	// Helper function to get specialty info with icon
	const getSpecialtyInfo = (specialtyId: string) => {
		return (
			SPECIALTY_OPTIONS.find((spec) => spec.id === specialtyId) || {
				id: specialtyId,
				label: specialtyId,
				icon: '💼',
			}
		);
	};

	// Helper function to get roaster level info
	const getRoasterLevelInfo = (level: string) => {
		return (
			ROASTER_LEVELS[level] || {
				level: level,
				badge: '🔰',
				basePrice: 5,
			}
		);
	};

	// Helper function to get experience level display
	const getExperienceDisplay = (experience: string) => {
		const experienceMap = {
			Beginner: { label: 'Beginner', icon: '🌱' },
			Intermediate: { label: 'Intermediate', icon: '📈' },
			Expert: { label: 'Expert', icon: '🎯' },
		};
		return (
			experienceMap[experience as keyof typeof experienceMap] || {
				label: experience,
				icon: '📚',
			}
		);
	};

	const handleAcceptApplication = async (applicationId: string) => {
		try {
			setProcessingApplication(applicationId);
			await acceptApplication(applicationId);
			// Invalidation propre via router
			router.refresh();
		} catch (error) {
			console.error('Erreur acceptation:', error);
			alert("Erreur lors de l'acceptation de la candidature");
		} finally {
			setProcessingApplication(null);
		}
	};

	const handleRejectApplication = async (applicationId: string) => {
		try {
			setProcessingApplication(applicationId);
			await rejectApplication(applicationId);
			// Invalidation propre via router
			router.refresh();
		} catch (error) {
			console.error('Erreur refus:', error);
			alert('Erreur lors du refus de la candidature');
		} finally {
			setProcessingApplication(null);
		}
	};

	return (
		<div className='max-w-5xl mx-auto space-y-8'>
			{/* Header compact */}
			<div>
				<Button variant='ghost' size='sm' asChild className='mb-4'>
					<Link href='/dashboard'>
						<ChevronLeft className='w-4 h-4 mr-1' />
						Dashboard
					</Link>
				</Button>

				<div className='flex items-start justify-between gap-4 mb-6'>
					<div>
						<h1 className='text-4xl font-bold mb-4'>
							{roastRequest.title}
						</h1>

						<div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
							<Badge
								className={`border ${
									statusColors[
										roastRequest.status as keyof typeof statusColors
									]
								}`}>
								{
									statusLabels[
										roastRequest.status as keyof typeof statusLabels
									]
								}
							</Badge>

							<div className='flex items-center gap-1.5'>
								<Calendar className='w-4 h-4' />
								{new Date(roastRequest.createdAt).toLocaleDateString(
									'fr-FR'
								)}
							</div>

							<a
								href={roastRequest.appUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-1.5 hover:text-primary transition-colors'>
								<Globe className='w-4 h-4' />
								Voir l'app
							</a>
						</div>
					</div>

					<div className='text-right'>
						<UnifiedPricingDisplay
							pricePerRoaster={
								roastRequest.pricePerRoaster ||
								Math.round(
									roastRequest.maxPrice /
										roastRequest.feedbacksRequested
								)
							}
							roasterCount={roastRequest.feedbacksRequested}
							questionCount={roastRequest.questions?.length || 0}
							compact={true}
							className='justify-end'
						/>
					</div>
				</div>

				{roastRequest.coverImage && (
					<div className='relative aspect-video w-full overflow-hidden rounded-lg border mb-6'>
						<Image
							src={roastRequest.coverImage}
							alt={roastRequest.title}
							fill
							sizes='100vw'
							className='object-cover'
						/>
					</div>
				)}
			</div>

			{/* Progress Section avec avatars */}
			<Card className='border-2 border-blue-200 bg-blue-50/30'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-xl'>
						<Users className='w-6 h-6 text-blue-600' />
						Roaster Status ({feedbackProgress.completed}/
						{feedbackProgress.total})
						<Badge variant='secondary' className='ml-2'>
							{feedbackProgress.percentage}% completed
						</Badge>
					</CardTitle>
					<p className='text-muted-foreground'>
						{feedbackProgress.completed} feedback
						{feedbackProgress.completed > 1 ? 's' : ''} received,
						{feedbackProgress.inProgress > 0 &&
							` ${feedbackProgress.inProgress} in progress,`}
						{feedbackProgress.remaining > 0 &&
							` ${feedbackProgress.remaining} spot${
								feedbackProgress.remaining > 1 ? 's' : ''
							} remaining`}
					</p>
				</CardHeader>
				<CardContent>
					{/* Progress bar avec avatars */}
					<div className='space-y-4'>
						<div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
							<div
								className='h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500'
								style={{ width: `${feedbackProgress.percentage}%` }}
							/>
						</div>

						{/* Avatars des roasters sur les positions */}
						<div className='flex justify-between items-center'>
							{progressSlots.map((slot) => (
								<div
									key={slot.index}
									className='flex flex-col items-center gap-2'>
									{slot.isCompleted && slot.feedback ? (
										<div className='relative'>
											<Avatar className='h-12 w-12 border-2 border-green-500'>
												<AvatarImage
													src={slot.feedback.roaster?.avatar}
												/>
												<AvatarFallback className='bg-green-100 text-green-800'>
													{getInitials(
														slot.feedback.roaster?.name || 'U'
													)}
												</AvatarFallback>
											</Avatar>
											<CheckCircle2 className='absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full' />
										</div>
									) : slot.isInProgress && slot.acceptedApp ? (
										<div className='relative'>
											<Avatar className='h-12 w-12 border-2 border-blue-500'>
												<AvatarImage
													src={slot.acceptedApp.roaster?.avatar}
												/>
												<AvatarFallback className='bg-blue-100 text-blue-800'>
													{getInitials(
														slot.acceptedApp.roaster?.name || 'U'
													)}
												</AvatarFallback>
											</Avatar>
											<Clock className='absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full' />
										</div>
									) : (
										<div className='h-12 w-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center'>
											<User className='w-6 h-6 text-gray-400' />
										</div>
									)}

									<div className='text-xs text-center'>
										{slot.isCompleted ? (
											<span className='text-green-600 font-medium'>
												✓ Completed
											</span>
										) : slot.isInProgress ? (
											<span className='text-blue-600 font-medium'>
												⏳ In Progress
											</span>
										) : (
											<span className='text-gray-500'>Waiting</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Applications Section - Always visible and highlighted */}
			{applications.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<AlertCircle className='w-5 h-5 text-orange-600' />
							Applications
							{pendingApplications.length > 0 && (
								<Badge className='bg-orange-100 text-orange-800 border-orange-200'>
									{pendingApplications.length} pending
								</Badge>
							)}
						</CardTitle>
						<p className='text-muted-foreground'>
							{applications.length} application
							{applications.length > 1 ? 's' : ''} received (
							{acceptedApplications.length} accepted,
							{rejectedApplications.length} rejected,
							{pendingApplications.length} pending)
						</p>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{/* Pending applications - priority */}
							{pendingApplications.length > 0 && (
								<div className='space-y-3'>
									<h4 className='font-medium text-orange-800 flex items-center gap-2'>
										<Clock className='w-4 h-4' />
										Awaiting your decision (
										{pendingApplications.length})
									</h4>
									{pendingApplications.map((app: any) => (
										<div
											key={app.id}
											className='border border-orange-200 rounded-lg p-4 bg-orange-50'>
											<div className='flex items-start justify-between gap-4'>
												<div className='flex items-start gap-3'>
													<Avatar className='h-10 w-10'>
														<AvatarImage
															src={app.roaster?.avatar}
														/>
														<AvatarFallback>
															{getInitials(
																app.roaster?.name || 'U'
															)}
														</AvatarFallback>
													</Avatar>

													<div className='flex-1'>
														<div className='flex items-center gap-2 mb-2'>
															<h5 className='font-medium'>
																{app.roaster?.name ||
																	'Anonymous Roaster'}
															</h5>
															{app.roaster?.roasterProfile
																?.rating && (
																<div className='flex items-center gap-1'>
																	<Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
																	<span className='text-xs text-muted-foreground'>
																		{app.roaster
																			.roasterProfile
																			.rating === 0
																			? 'No rating yet'
																			: `${app.roaster.roasterProfile.rating.toFixed(
																					1
																			  )} stars`}
																	</span>
																</div>
															)}
															{/* Roaster Level Badge */}
															{app.roaster?.roasterProfile
																?.level && (
																<Badge
																	variant='secondary'
																	className='text-xs'>
																	{
																		getRoasterLevelInfo(
																			app.roaster
																				.roasterProfile
																				.level
																		).badge
																	}{' '}
																	{
																		getRoasterLevelInfo(
																			app.roaster
																				.roasterProfile
																				.level
																		).level
																	}
																</Badge>
															)}
														</div>

														{/* Specialties */}
														{app.roaster?.roasterProfile
															?.specialties &&
														app.roaster.roasterProfile.specialties
															.length > 0 ? (
															<div className='flex flex-wrap gap-1 mb-2'>
																{app.roaster.roasterProfile.specialties
																	.slice(0, 3)
																	.map((specialty: string) => {
																		const specialtyInfo =
																			getSpecialtyInfo(
																				specialty
																			);
																		return (
																			<Badge
																				key={specialty}
																				variant='outline'
																				className='text-xs'>
																				<span className='mr-1'>
																					{
																						specialtyInfo.icon
																					}
																				</span>
																				{
																					specialtyInfo.label
																				}
																			</Badge>
																		);
																	})}
																{app.roaster.roasterProfile
																	.specialties.length > 3 && (
																	<Badge
																		variant='outline'
																		className='text-xs'>
																		+
																		{app.roaster
																			.roasterProfile
																			.specialties.length -
																			3}{' '}
																		more{' '}
																		{app.roaster
																			.roasterProfile
																			.specialties.length -
																			3 ===
																		1
																			? 'specialty'
																			: 'specialties'}
																	</Badge>
																)}
															</div>
														) : (
															<div className='text-xs text-muted-foreground mb-2'>
																No specialties specified
															</div>
														)}

														{/* Experience and Performance Metrics */}
														<div className='flex items-center gap-4 text-xs text-muted-foreground mb-2'>
															{app.roaster?.roasterProfile
																?.experience && (
																<div className='flex items-center gap-1'>
																	<span>
																		{
																			getExperienceDisplay(
																				app.roaster
																					.roasterProfile
																					.experience
																			).icon
																		}
																	</span>
																	<span>
																		{
																			getExperienceDisplay(
																				app.roaster
																					.roasterProfile
																					.experience
																			).label
																		}
																	</span>
																</div>
															)}
															{app.roaster?.roasterProfile
																?.completedRoasts !==
																undefined && (
																<div className='flex items-center gap-1'>
																	<CheckCircle className='w-3 h-3' />
																	<span>
																		{app.roaster
																			.roasterProfile
																			.completedRoasts === 0
																			? 'New roaster (0 roasts completed)'
																			: `${
																					app.roaster
																						.roasterProfile
																						.completedRoasts
																			  } ${
																					app.roaster
																						.roasterProfile
																						.completedRoasts ===
																					1
																						? 'roast'
																						: 'roasts'
																			  } completed`}
																	</span>
																</div>
															)}
															{app.roaster?.roasterProfile
																?.completionRate !==
																undefined && (
																<>
																	{app.roaster.roasterProfile
																		.completedRoasts ===
																	0 ? null : (
																		<div className='flex items-center gap-1'>
																			<ThumbsUp className='w-3 h-3' />
																			<span>
																				{
																					app.roaster
																						.roasterProfile
																						.completionRate
																				}
																				% completion rate
																			</span>
																		</div>
																	)}
																</>
															)}
														</div>

														<p className='text-sm text-muted-foreground mb-2'>
															{app.roaster?.roasterProfile
																?.bio || 'No bio available'}
														</p>

														{app.motivation && (
															<div className='bg-white border rounded p-2 text-sm'>
																<strong>Motivation:</strong>{' '}
																{app.motivation}
															</div>
														)}
													</div>
												</div>

												<div className='flex gap-2'>
													<Button
														size='sm'
														className='bg-green-600 hover:bg-green-700'
														onClick={() =>
															handleAcceptApplication(app.id)
														}
														disabled={
															processingApplication === app.id
														}>
														<ThumbsUp className='w-4 h-4 mr-1' />
														{processingApplication === app.id
															? 'Accepting...'
															: 'Accept'}
													</Button>
													<Button
														size='sm'
														variant='outline'
														className='text-red-600 border-red-200 hover:bg-red-50'
														onClick={() =>
															handleRejectApplication(app.id)
														}
														disabled={
															processingApplication === app.id
														}>
														<ThumbsDown className='w-4 h-4 mr-1' />
														{processingApplication === app.id
															? 'Rejecting...'
															: 'Reject'}
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Accepted applications - Writing in progress only */}
							{acceptedApplications.filter(
								(app: any) =>
									!feedbacks.find(
										(f: any) =>
											f.roasterId === app.roaster.id &&
											f.status === 'completed'
									)
							).length > 0 && (
								<div className='space-y-3'>
									<h4 className='font-medium text-blue-800 flex items-center gap-2'>
										<Clock className='w-4 h-4' />
										Writing in progress (
										{
											acceptedApplications.filter(
												(app: any) =>
													!feedbacks.find(
														(f: any) =>
															f.roasterId === app.roaster.id &&
															f.status === 'completed'
													)
											).length
										}
										)
									</h4>
									{acceptedApplications
										.filter(
											(app: any) =>
												!feedbacks.find(
													(f: any) =>
														f.roasterId === app.roaster.id &&
														f.status === 'completed'
												)
										)
										.map((app: any) => (
											<div
												key={app.id}
												className='border border-blue-200 rounded-lg p-3 bg-blue-50'>
												<div className='flex items-center gap-3'>
													<Avatar className='h-8 w-8'>
														<AvatarImage
															src={app.roaster?.avatar}
														/>
														<AvatarFallback className='text-xs'>
															{getInitials(
																app.roaster?.name || 'U'
															)}
														</AvatarFallback>
													</Avatar>
													<div className='flex-1'>
														<div className='flex items-center gap-2'>
															<span className='font-medium text-sm'>
																{app.roaster?.name ||
																	'Anonymous Roaster'}
															</span>
															<Badge className='bg-blue-100 text-blue-800 text-xs'>
																⏳ Writing in progress
															</Badge>
														</div>
													</div>
												</div>
											</div>
										))}
								</div>
							)}

							{/* Roasters who completed their feedback */}
							{acceptedApplications.filter((app: any) =>
								feedbacks.find(
									(f: any) =>
										f.roasterId === app.roaster.id &&
										f.status === 'completed'
								)
							).length > 0 && (
								<div className='space-y-3'>
									<h4 className='font-medium text-green-800 flex items-center gap-2'>
										<CheckCircle2 className='w-4 h-4' />
										Feedback delivered (
										{
											acceptedApplications.filter((app: any) =>
												feedbacks.find(
													(f: any) =>
														f.roasterId === app.roaster.id &&
														f.status === 'completed'
												)
											).length
										}
										)
									</h4>
									{acceptedApplications
										.filter((app: any) =>
											feedbacks.find(
												(f: any) =>
													f.roasterId === app.roaster.id &&
													f.status === 'completed'
											)
										)
										.map((app: any) => (
											<div
												key={app.id}
												className='border border-green-200 rounded-lg p-3 bg-green-50'>
												<div className='flex items-center gap-3'>
													<Avatar className='h-8 w-8'>
														<AvatarImage
															src={app.roaster?.avatar}
														/>
														<AvatarFallback className='text-xs'>
															{getInitials(
																app.roaster?.name || 'U'
															)}
														</AvatarFallback>
													</Avatar>
													<div className='flex-1'>
														<div className='flex items-center gap-2'>
															<span className='font-medium text-sm'>
																{app.roaster?.name ||
																	'Anonymous Roaster'}
															</span>
															<Badge className='bg-green-100 text-green-800 text-xs'>
																✓ Feedback delivered
															</Badge>
														</div>
													</div>
												</div>
											</div>
										))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Received feedbacks */}
			{feedbacks.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<MessageSquare className='w-5 h-5 text-green-600' />
							Received feedbacks ({feedbacks.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<UnifiedFeedbackDisplay feedbacks={feedbacks} />
					</CardContent>
				</Card>
			)}

			{/* Project information */}
			<Card>
				<CardHeader>
					<CardTitle>Project Information</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Description */}
					<div>
						<h3 className='font-semibold mb-3 flex items-center gap-2'>
							<MessageSquare className='w-5 h-5' />
							Description
						</h3>
						<p className='text-muted-foreground whitespace-pre-wrap leading-relaxed'>
							{roastRequest.description}
						</p>
					</div>

					{/* URL de l'app */}
					<div>
						<h3 className='font-semibold mb-3 flex items-center gap-2'>
							<Globe className='w-5 h-5' />
							Test the application
						</h3>
						<a
							href={roastRequest.appUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium'>
							Open application
							<Globe className='w-4 h-4' />
						</a>
						<p className='text-sm text-muted-foreground mt-1 break-all'>
							{roastRequest.appUrl}
						</p>
					</div>

					{/* Informations générales */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Category */}
						<div>
							<h3 className='font-semibold mb-3'>Project Type</h3>
							{roastRequest.category && (
								<div className='flex items-center gap-2'>
									{(() => {
										const categoryInfo = APP_CATEGORIES.find(
											(cat) => cat.id === roastRequest.category
										);
										return categoryInfo ? (
											<>
												<span className='text-xl'>
													{categoryInfo.icon}
												</span>
												<div>
													<span className='font-medium'>
														{categoryInfo.label}
													</span>
													<p className='text-sm text-muted-foreground'>
														{categoryInfo.description}
													</p>
												</div>
											</>
										) : (
											<span>{roastRequest.category}</span>
										);
									})()}
								</div>
							)}
						</div>

						{/* Target Audiences */}
						<div>
							<h3 className='font-semibold mb-3'>Target Audiences</h3>
							<div className='flex flex-wrap gap-2'>
								{validAudiences.map((audience: any) => (
									<Badge key={audience.id} variant='secondary'>
										{audience.name}
									</Badge>
								))}
							</div>
						</div>
					</div>

					{/* Type de feedback */}
					<div>
						<h3 className='font-semibold mb-4 flex items-center gap-2'>
							<MessageSquare className='w-5 h-5' />
							Feedback Configuration
						</h3>

						<div className='space-y-4'>
							{/* Feedback structuré de base */}
							<div className='border rounded-lg p-4 bg-blue-50'>
								<div className='flex items-center gap-2 mb-3'>
									<span className='text-xl'>📋</span>
									<h4 className='font-medium'>
										Structured feedback included
									</h4>
									<Badge variant='secondary' className='ml-auto'>
										Always included
									</Badge>
								</div>

								<div className='text-sm text-gray-700 space-y-1'>
									<p>
										• <strong>Overall rating</strong> and first
										impression
									</p>
									<p>
										• <strong>Strengths</strong> identified
									</p>
									<p>
										• <strong>Weaknesses</strong> to improve
									</p>
									<p>
										• <strong>Concrete recommendations</strong>
									</p>
									<p>
										• <strong>Detailed ratings</strong> (UX/UI,
										Performance, Experience, Value)
									</p>
								</div>
							</div>

							{/* Questions personnalisées optionnelles */}
							{roastRequest.questions &&
								roastRequest.questions.length > 0 && (
									<div className='border rounded-lg p-4 bg-purple-50'>
										<div className='flex items-center gap-2 mb-3'>
											<span className='text-xl'>💬</span>
											<h4 className='font-medium'>
												Custom Questions
											</h4>
											<Badge variant='outline' className='ml-auto'>
												{roastRequest.questions.length} question
												{roastRequest.questions.length > 1
													? 's'
													: ''}
											</Badge>
										</div>

										<div className='space-y-2'>
											{roastRequest.questions
												.sort((a: any, b: any) => a.order - b.order)
												.map((question: any, index: number) => (
													<div
														key={question.id}
														className='flex items-start gap-3 text-sm'>
														<span className='flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600'>
															{index + 1}
														</span>
														<p className='flex-1'>
															{question.text}
														</p>
														{question.domain && (
															<Badge
																variant='secondary'
																className='text-xs'>
																{question.domain}
															</Badge>
														)}
													</div>
												))}
										</div>
									</div>
								)}

							{roastRequest.questions?.length === 0 && (
								<div className='border rounded-lg p-4 bg-gray-50'>
									<div className='flex items-center gap-2 text-gray-600'>
										<span className='text-lg'>ℹ️</span>
										<p className='text-sm'>
											No custom questions added. Roasters will
											provide standard structured feedback.
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
