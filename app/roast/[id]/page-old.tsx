import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { hasAppliedForRoast } from '@/lib/actions/roast-application';
import { getFeedbackByRoastRequest } from '@/lib/actions/feedback';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RoastApplicationForm } from '@/components/feedback/roast-application-form';
import { RoastFeedbackForm } from '@/components/feedback/roast-feedback-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Calendar,
	Globe,
	Target,
	Users,
	MessageSquare,
	ImageIcon,
	ArrowLeft,
	CheckCircle,
	Clock,
	AlertCircle,
	Euro,
	Star,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FEEDBACK_MODES, FOCUS_AREAS, APP_CATEGORIES, type FeedbackMode } from '@/lib/types/roast-request';

interface RoastPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function RoastPage({ params }: RoastPageProps) {
	await requireOnboardingComplete();

	const { id } = await params;
	const roastRequest = await getRoastRequestById(id);
	const hasApplied = await hasAppliedForRoast(id);
	const existingFeedback = await getFeedbackByRoastRequest(id);

	if (!roastRequest) {
		notFound();
	}

	// Vérifier si l'utilisateur actuel a une candidature acceptée
	const session = await auth.api.getSession({ headers: await headers() });
	const userApplication = await prisma.roastApplication.findUnique({
		where: {
			roastRequestId_roasterId: {
				roastRequestId: id,
				roasterId: session?.user?.id || '',
			},
		},
	});

	const isAcceptedRoaster =
		userApplication?.status === 'accepted' ||
		userApplication?.status === 'auto_selected';

	console.log('roastRequest.status', roastRequest.status);
	console.log('isAcceptedRoaster', isAcceptedRoaster);

	// Si le roast est fermé, annulé ou complété
	// OU si le roast est en cours mais l'utilisateur n'est pas un roaster accepté
	if (
		roastRequest.status === 'cancelled' ||
		roastRequest.status === 'completed'
	) {
		return (
			<div className='min-h-screen bg-gray-50 py-8'>
				<div className='max-w-4xl mx-auto px-4 text-center'>
					<Card>
						<CardContent className='py-12'>
							<h1 className='text-2xl font-bold text-gray-900 mb-4'>
								Cette demande n&apos;est plus disponible
							</h1>
							<p className='text-gray-600 mb-6'>
								Cette demande de roast a été fermée ou est déjà en cours
								de traitement.
							</p>
							<Button asChild>
								<Link href='/marketplace'>
									Voir d&apos;autres demandes
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4'>
				{/* Header compact */}
				<div className='mb-8'>
					<div className='flex items-center justify-between mb-6'>
						<Button variant='outline' size='sm' asChild>
							<Link href='/marketplace'>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Retour au marketplace
							</Link>
						</Button>
						<div className='flex items-center gap-3'>
							<Badge
								className={
									roastRequest.status === 'open'
										? 'bg-green-100 text-green-800'
										: roastRequest.status === 'collecting_applications'
										? 'bg-orange-100 text-orange-800'
										: roastRequest.status === 'in_progress' &&
										  isAcceptedRoaster
										? 'bg-blue-100 text-blue-800'
										: 'bg-gray-100 text-gray-800'
								}>
								{roastRequest.status === 'open'
									? 'Ouvert aux candidatures'
									: roastRequest.status === 'collecting_applications'
									? 'Candidatures en cours'
									: roastRequest.status === 'in_progress' &&
									  isAcceptedRoaster
									? 'Mission acceptée'
									: roastRequest.status === 'in_progress' &&
									  !isAcceptedRoaster
									? 'Candidatures ouvertes'
									: roastRequest.status === 'completed'
									? 'Mission terminée'
									: 'Fermé'}
							</Badge>
							{FEEDBACK_MODES[roastRequest.feedbackMode] && (
								<Badge variant='secondary' className='bg-purple-100 text-purple-800'>
									{FEEDBACK_MODES[roastRequest.feedbackMode].icon} {FEEDBACK_MODES[roastRequest.feedbackMode].label}
								</Badge>
							)}
						</div>
					</div>

					<h1 className='text-4xl font-bold text-gray-900 mb-4'>
						{roastRequest.title}
					</h1>

					<div className='flex items-center gap-6 text-sm text-gray-600 mb-4'>
						<div className='flex items-center gap-2'>
							<Calendar className='w-4 h-4' />
							<span>
								Créé le{' '}
								{new Date(roastRequest.createdAt).toLocaleDateString(
									'fr-FR'
								)}
							</span>
						</div>
						<div className='flex items-center gap-2'>
							<Users className='w-4 h-4' />
							<span>
								Par {roastRequest.creator.name || 'Créateur anonyme'}
							</span>
						</div>
						{roastRequest.category && (
							<div className='flex items-center gap-2'>
								<span>
									{APP_CATEGORIES.find(cat => cat.id === roastRequest.category)?.icon} {APP_CATEGORIES.find(cat => cat.id === roastRequest.category)?.label}
								</span>
							</div>
						)}
					</div>

					<div className='flex items-center gap-2 text-lg'>
						<Euro className='w-5 h-5 text-green-600' />
						<span className='font-bold text-green-600 text-xl'>
							{roastRequest.maxPrice}€ total
						</span>
						<span className='text-gray-500 text-sm'>
							• {roastRequest.feedbacksRequested} feedback{roastRequest.feedbacksRequested > 1 ? 's' : ''} demandé{roastRequest.feedbacksRequested > 1 ? 's' : ''}
						</span>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Informations du roast */}
					<div className='space-y-6'>
						{/* Image de couverture */}
						{roastRequest.coverImage ? (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<ImageIcon className='w-5 h-5' />
										Aperçu de l&apos;application
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='relative aspect-video w-full overflow-hidden rounded-lg'>
										<Image
											src={roastRequest.coverImage}
											alt={roastRequest.title}
											fill
											sizes='(max-width: 768px) 100vw, 50vw'
											className='object-cover'
										/>
									</div>
								</CardContent>
							</Card>
						) : (
							<Card>
								<CardContent className='py-8'>
									<div className='flex flex-col items-center justify-center text-gray-400'>
										<ImageIcon className='w-12 h-12 mb-2' />
										<p className='text-sm'>
											Aucune image de couverture
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Description */}
						<Card>
							<CardHeader>
								<CardTitle>Description du projet</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-gray-700 whitespace-pre-wrap'>
									{roastRequest.description}
								</p>
							</CardContent>
						</Card>

						{/* Roasters status */}
						{(roastRequest.applications.length > 0 ||
							roastRequest.feedbacks.length > 0) && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Users className='w-5 h-5' />
										Roasters (
										{
											roastRequest.applications.filter(
												(app) =>
													app.status === 'accepted' ||
													app.status === 'auto_selected'
											).length
										}
										/{roastRequest.feedbacksRequested})
									</CardTitle>
									<p className='text-sm text-gray-600'>
										Statut des roasters sélectionnés et candidats
									</p>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										{/* Completed feedbacks */}
										{roastRequest.feedbacks
											.filter((f) => f.status === 'completed')
											.map((feedback) => (
												<div
													key={feedback.id}
													className='flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200'>
													<div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center'>
														<CheckCircle className='w-5 h-5 text-green-600' />
													</div>
													<div className='flex-1'>
														<p className='text-sm font-medium text-gray-900'>
															{feedback.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-xs text-green-600'>
															Feedback envoyé
														</p>
													</div>
												</div>
											))}

										{/* In progress feedbacks */}
										{roastRequest.applications
											.filter(
												(app) =>
													app.status === 'accepted' ||
													app.status === 'auto_selected'
											)
											.filter(
												(app) =>
													!roastRequest.feedbacks.some(
														(f) => f.roasterId === app.roasterId
													)
											)
											.map((application) => (
												<div
													key={application.id}
													className='flex items-center gap-3 p-2 rounded-lg bg-blue-50 border border-blue-200'>
													<div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
														<Clock className='w-5 h-5 text-blue-600' />
													</div>
													<div className='flex-1'>
														<p className='text-sm font-medium text-gray-900'>
															{application.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-xs text-blue-600'>
															Feedback en cours de rédaction
														</p>
													</div>
												</div>
											))}

										{/* Pending applications */}
										{roastRequest.applications
											.filter((app) => app.status === 'pending')
											.slice(0, 5)
											.map((application) => (
												<div
													key={application.id}
													className='flex items-center gap-3 p-2 rounded-lg bg-orange-50 border border-orange-200'>
													<div className='w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center'>
														<AlertCircle className='w-5 h-5 text-orange-600' />
													</div>
													<div className='flex-1'>
														<p className='text-sm font-medium text-gray-900'>
															{application.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-xs text-orange-600'>
															Candidature en attente
														</p>
													</div>
												</div>
											))}

										{roastRequest.applications.filter(
											(app) => app.status === 'pending'
										).length > 5 && (
											<p className='text-sm text-gray-500 text-center'>
												+{' '}
												{roastRequest.applications.filter(
													(app) => app.status === 'pending'
												).length - 5}{' '}
												autres candidatures en attente
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Audience cible */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Target className='w-5 h-5' />
									Audience cible
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-gray-700'>
									{roastRequest.targetAudience}
								</p>
							</CardContent>
						</Card>

						{/* URL de l'app */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Globe className='w-5 h-5' />
									Tester l&apos;application
								</CardTitle>
							</CardHeader>
							<CardContent>
								<a
									href={roastRequest.appUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium'>
									Ouvrir l&apos;application
									<Globe className='w-4 h-4' />
								</a>
								<p className='text-sm text-gray-500 mt-1 break-all'>
									{roastRequest.appUrl}
								</p>
							</CardContent>
						</Card>

						{/* Domaines de feedback */}
						<Card>
							<CardHeader>
								<CardTitle>Domaines à analyser</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex flex-wrap gap-2'>
									{roastRequest.focusAreas.map((area) => (
										<Badge
											key={area}
											variant='secondary'
											className='text-sm'>
											{area}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Questions spécifiques */}
						{roastRequest.questions &&
							roastRequest.questions.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className='flex items-center gap-2'>
											<MessageSquare className='w-5 h-5' />
											Questions à traiter
										</CardTitle>
										<p className='text-sm text-gray-600'>
											Points spécifiques à aborder dans votre
											feedback
										</p>
									</CardHeader>
									<CardContent>
										<div className='space-y-6'>
											{roastRequest.focusAreas.map((domain) => {
												const domainQuestions =
													roastRequest.questions
														.filter((q) => q.domain === domain)
														.sort((a, b) => a.order - b.order);

												if (domainQuestions.length === 0)
													return null;

												return (
													<div
														key={domain}
														className='border rounded-lg p-4'>
														<div className='flex items-center gap-2 mb-3'>
															<Badge variant='outline'>
																{domain}
															</Badge>
															<span className='text-sm text-gray-500'>
																{domainQuestions.length}{' '}
																question
																{domainQuestions.length > 1
																	? 's'
																	: ''}
															</span>
														</div>
														<div className='space-y-2'>
															{domainQuestions.map(
																(question, index) => (
																	<div
																		key={question.id}
																		className='flex items-start gap-3'>
																		<span className='flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600'>
																			{index + 1}
																		</span>
																		<p className='text-gray-800 text-sm'>
																			{question.text}
																		</p>
																	</div>
																)
															)}
														</div>
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							)}
					</div>

					{/* Formulaire de candidature ou de feedback */}
					<div className='lg:sticky lg:top-8'>
						{isAcceptedRoaster &&
						roastRequest.status === 'in_progress' ? (
							<RoastFeedbackForm
								roastRequest={roastRequest}
								existingFeedback={existingFeedback}
							/>
						) : (
							<RoastApplicationForm
								roastRequest={roastRequest}
								hasApplied={hasApplied}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
