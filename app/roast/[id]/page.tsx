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
	ArrowLeft,
	CheckCircle,
	Clock,
	AlertCircle,
	Euro,
	Star,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
	APP_CATEGORIES,
} from '@/lib/types/roast-request';
import { UnifiedPricingDisplay } from '@/components/roast/unified-pricing-display';

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

	console.log('roastRequest.applications', roastRequest.applications);
	console.log('roastRequest', roastRequest);

	// Si le roast est fermé, annulé ou complété
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
			<div className='max-w-7xl mx-auto px-4'>
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
										: roastRequest.status ===
										  'collecting_applications'
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
							<Badge
								variant='secondary'
								className='bg-purple-100 text-purple-800'>
								📋 Feedback structuré
							</Badge>
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
									{
										APP_CATEGORIES.find(
											(cat) => cat.id === roastRequest.category
										)?.icon
									}{' '}
									{
										APP_CATEGORIES.find(
											(cat) => cat.id === roastRequest.category
										)?.label
									}
								</span>
							</div>
						)}
					</div>

					<div className='flex items-center gap-2'>
						<UnifiedPricingDisplay
							pricePerRoaster={roastRequest.pricePerRoaster || Math.round((roastRequest.maxPrice || 0) / roastRequest.feedbacksRequested)}
							roasterCount={roastRequest.feedbacksRequested}
							questionCount={roastRequest.questions?.length || 0}
							compact={true}
						/>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Colonne principale - Informations du roast */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Statuts des roasters - TRÈS APPARENT */}
						{(roastRequest.applications.length > 0 ||
							roastRequest.feedbacks.length > 0) && (
							<Card className='border-2 border-blue-200 bg-blue-50/30'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2 text-lg'>
										<Users className='w-6 h-6 text-blue-600' />
										État des roasters (
										{
											roastRequest.applications.filter(
												(app) =>
													app.status === 'accepted' ||
													app.status === 'auto_selected'
											).length
										}
										/{roastRequest.feedbacksRequested})
										<Badge variant='secondary' className='ml-2'>
											{
												roastRequest.feedbacks.filter(
													(f) => f.status === 'completed'
												).length
											}{' '}
											terminé
											{roastRequest.feedbacks.filter(
												(f) => f.status === 'completed'
											).length > 1
												? 's'
												: ''}
										</Badge>
									</CardTitle>
									<p className='text-sm text-gray-600'>
										Suivi en temps réel des feedbacks
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
													className='flex items-center gap-3 p-3 rounded-lg bg-green-50 border-2 border-green-200'>
													<div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
														<CheckCircle className='w-6 h-6 text-green-600' />
													</div>
													<div className='flex-1'>
														<p className='font-semibold text-gray-900'>
															{feedback.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-sm text-green-600 font-medium'>
															✓ Feedback livré
														</p>
													</div>
													<Star className='w-5 h-5 text-yellow-500' />
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
														(f) =>
															f.roasterId === app.roaster.id &&
															f.status === 'completed'
													)
											)
											.map((application) => (
												<div
													key={application.id}
													className='flex items-center gap-3 p-3 rounded-lg bg-blue-50 border-2 border-blue-200'>
													<div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
														<Clock className='w-6 h-6 text-blue-600' />
													</div>
													<div className='flex-1'>
														<p className='font-semibold text-gray-900'>
															{application.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-sm text-blue-600 font-medium'>
															⏳ En cours de rédaction
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
													className='flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200'>
													<div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center'>
														<AlertCircle className='w-6 h-6 text-orange-600' />
													</div>
													<div className='flex-1'>
														<p className='font-medium text-gray-900'>
															{application.roaster.name ||
																'Roaster anonyme'}
														</p>
														<p className='text-sm text-orange-600'>
															🗓 Candidature en attente
														</p>
													</div>
												</div>
											))}

										{roastRequest.applications.filter(
											(app) => app.status === 'pending'
										).length > 5 && (
											<p className='text-sm text-gray-500 text-center italic'>
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

						{/* Informations essentielles - Card unique */}
						<Card>
							<CardHeader>
								<CardTitle className='text-xl'>
									Informations de la mission
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Image de couverture */}
								{roastRequest.coverImage && (
									<div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
										<Image
											src={roastRequest.coverImage}
											alt={roastRequest.title}
											fill
											sizes='(max-width: 768px) 100vw, 66vw'
											className='object-cover'
										/>
									</div>
								)}

								{/* Description */}
								<div>
									<h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
										<MessageSquare className='w-5 h-5' />
										Description du projet
									</h3>
									<p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
										{roastRequest.description}
									</p>
								</div>

								{/* URL de l'app */}
								<div>
									<h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
										<Globe className='w-5 h-5' />
										Tester l&apos;application
									</h3>
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
								</div>

								{/* Audiences cibles (nouveau système) */}
								<div>
									<h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
										<Target className='w-5 h-5' />
										Audiences cibles
									</h3>
									<div className='flex flex-wrap gap-2'>
										{roastRequest.targetAudiences?.map((ta) => (
											<Badge
												key={ta.targetAudience.id}
												variant='outline'
												className='text-sm'>
												{ta.targetAudience.name}
											</Badge>
										)) || (
											<p className='text-gray-500 text-sm'>
												Aucune audience spécifiée
											</p>
										)}
									</div>
								</div>

								{/* Configuration du feedback */}
								<div>
									<h3 className='font-semibold text-gray-900 mb-3'>
										📋 Feedback structuré requis
									</h3>
									
									<div className='space-y-4'>
										{/* Feedback de base */}
										<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
											<p className='text-blue-800 text-sm mb-2'>
												<strong>Feedback structuré inclus :</strong>
											</p>
											<ul className='text-blue-700 text-sm space-y-1'>
												<li>• Note globale et première impression</li>
												<li>• Points forts et points faibles identifiés</li>
												<li>• Recommandations d'amélioration</li>
												<li>• Notes détaillées (UX/UI, Performance, Expérience, Valeur)</li>
											</ul>
										</div>

										{/* Questions personnalisées */}
										{roastRequest.questions && roastRequest.questions.length > 0 && (
											<div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
												<h4 className='font-medium text-purple-900 mb-3'>
													💬 Questions personnalisées ({roastRequest.questions.length})
												</h4>
												<div className='space-y-2'>
													{roastRequest.questions
														.sort((a, b) => a.order - b.order)
														.map((question, index) => (
															<div key={question.id} className='flex items-start gap-3'>
																<span className='flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600'>
																	{index + 1}
																</span>
																<p className='text-purple-800 text-sm'>
																	{question.text}
																</p>
															</div>
														))
													}
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Formulaire de candidature ou de feedback */}
					<div className='lg:sticky lg:top-8'>
						{isAcceptedRoaster &&
						(roastRequest.status === 'in_progress' || 
						 roastRequest.status === 'collecting_applications' ||
						 roastRequest.status === 'open') ? (
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
