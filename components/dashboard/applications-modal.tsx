'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Star,
	User,
	Award,
	TrendingUp,
	MessageCircle,
	CheckCircle2,
	AlertCircle,
	Clock,
	X,
} from 'lucide-react';
import { manualSelectRoasters } from '@/lib/actions/roast-application';
import { useRouter } from 'next/navigation';

interface RoastApplication {
	id: string;
	motivation: string | null;
	status: string;
	score: number;
	createdAt: Date;
	roaster: {
		id: string;
		name: string | null;
		roasterProfile: {
			specialties: string[];
			experience: string;
			rating: number;
			completedRoasts: number;
			level: string;
			bio: string | null;
			completionRate: number;
		} | null;
	};
}

interface ApplicationsModalProps {
	isOpen: boolean;
	onClose: () => void;
	roastRequest: {
		id: string;
		title: string;
		feedbacksRequested: number;
		focusAreas: string[];
		status: string;
	};
	applications: RoastApplication[];
}

export function ApplicationsModal({
	isOpen,
	onClose,
	roastRequest,
	applications,
}: ApplicationsModalProps) {
	const router = useRouter();
	const [selectedApplications, setSelectedApplications] = useState<string[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pendingApplications = applications.filter(
		(app) => app.status === 'pending'
	);
	const selectedApplicationsData = applications.filter((app) =>
		['accepted', 'auto_selected'].includes(app.status)
	);
	const canSelect =
		roastRequest.status === 'collecting_applications' ||
		roastRequest.status === 'open';

	const handleApplicationToggle = (applicationId: string) => {
		if (selectedApplications.includes(applicationId)) {
			setSelectedApplications((prev) =>
				prev.filter((id) => id !== applicationId)
			);
		} else {
			if (selectedApplications.length < roastRequest.feedbacksRequested) {
				setSelectedApplications((prev) => [...prev, applicationId]);
			}
		}
	};

	const handleSelectRoasters = async () => {
		if (selectedApplications.length === 0) return;

		setIsLoading(true);
		setError(null);

		try {
			await manualSelectRoasters(roastRequest.id, selectedApplications);
			router.refresh();
			onClose();
		} catch (error) {
			console.error('Erreur sélection:', error);
			setError(
				error instanceof Error
					? error.message
					: 'Erreur lors de la sélection'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const getLevelBadge = (level: string) => {
		const levelConfig = {
			rookie: { color: 'bg-gray-100 text-gray-800', label: 'Rookie' },
			verified: { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
			expert: { color: 'bg-purple-100 text-purple-800', label: 'Expert' },
			master: { color: 'bg-yellow-100 text-yellow-800', label: 'Master' },
		};

		const config =
			levelConfig[level as keyof typeof levelConfig] || levelConfig.rookie;
		return <Badge className={config.color}>{config.label}</Badge>;
	};

	const getExperienceColor = (experience: string) => {
		switch (experience) {
			case 'Expert':
				return 'text-green-600';
			case 'Intermédiaire':
				return 'text-blue-600';
			default:
				return 'text-gray-600';
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<DialogTitle className='text-xl font-semibold'>
							Candidatures • {roastRequest.title}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className='space-y-6'>
					{error && (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{pendingApplications.length === 0 &&
					selectedApplicationsData.length === 0 ? (
						<div className='py-12 text-center'>
							<MessageCircle className='mx-auto h-12 w-12 text-gray-400 mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								Aucune candidature pour le moment
							</h3>
							<p className='text-gray-600'>
								Les roasters n'ont pas encore candidaté pour cette
								mission.
							</p>
						</div>
					) : (
						<>
							{/* Candidatures déjà sélectionnées */}
							{selectedApplicationsData.length > 0 && (
								<div>
									<h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
										<CheckCircle2 className='w-5 h-5 text-green-600' />
										Roasters sélectionnés (
										{selectedApplicationsData.length})
									</h3>

									<div className='space-y-3'>
										{selectedApplicationsData.map((application) => (
											<Card
												key={application.id}
												className='border-green-200 bg-green-50'>
												<CardContent className='p-4'>
													<div className='flex items-center justify-between'>
														<div className='flex items-center gap-3'>
															<h4 className='font-medium'>
																{application.roaster.name ||
																	'Roaster anonyme'}
															</h4>
															{getLevelBadge(
																application.roaster
																	.roasterProfile?.level ||
																	'rookie'
															)}
															<Badge className='bg-green-100 text-green-800 text-xs'>
																{application.status ===
																'auto_selected'
																	? 'Auto'
																	: 'Sélectionné'}
															</Badge>
														</div>
														<div className='flex items-center gap-4 text-sm text-gray-600'>
															<div className='flex items-center gap-1'>
																<Star className='w-3 h-3 text-yellow-500' />
																<span>
																	{application.roaster.roasterProfile?.rating.toFixed(
																		1
																	) || '0.0'}
																</span>
															</div>
															<div className='flex items-center gap-1'>
																<Award className='w-3 h-3 text-blue-500' />
																<span>
																	{application.roaster
																		.roasterProfile
																		?.completedRoasts || 0}
																</span>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}

							{/* Candidatures en attente */}
							{pendingApplications.length > 0 && (
								<div>
									<div className='flex items-center justify-between mb-4'>
										<h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
											<Clock className='w-5 h-5 text-blue-600' />
											Candidatures en attente (
											{pendingApplications.length})
										</h3>

										{canSelect && selectedApplications.length > 0 && (
											<Button
												onClick={handleSelectRoasters}
												disabled={isLoading}
												size='sm'>
												{isLoading
													? 'Sélection...'
													: `Sélectionner ${selectedApplications.length}`}
											</Button>
										)}
									</div>

									{canSelect && (
										<Alert className='mb-4'>
											<AlertCircle className='h-4 w-4' />
											<AlertDescription className='text-sm'>
												Vous pouvez sélectionner jusqu'à{' '}
												{roastRequest.feedbacksRequested -
													selectedApplicationsData.length}{' '}
												roaster
												{roastRequest.feedbacksRequested -
													selectedApplicationsData.length >
												1
													? 's'
													: ''}{' '}
												supplémentaire
												{roastRequest.feedbacksRequested -
													selectedApplicationsData.length >
												1
													? 's'
													: ''}
												.
											</AlertDescription>
										</Alert>
									)}

									<div className='space-y-4'>
										{pendingApplications
											.sort((a, b) => b.score - a.score)
											.map((application, index) => (
												<Card
													key={application.id}
													className='hover:shadow-md transition-shadow'>
													<CardContent className='p-4'>
														<div className='flex items-start gap-3'>
															{canSelect && (
																<Checkbox
																	checked={selectedApplications.includes(
																		application.id
																	)}
																	onCheckedChange={() =>
																		handleApplicationToggle(
																			application.id
																		)
																	}
																	disabled={
																		!selectedApplications.includes(
																			application.id
																		) &&
																		selectedApplications.length >=
																			roastRequest.feedbacksRequested -
																				selectedApplicationsData.length
																	}
																	className='mt-1'
																/>
															)}

															<div className='flex-1'>
																<div className='flex items-center justify-between mb-3'>
																	<div className='flex items-center gap-2'>
																		<h4 className='font-medium'>
																			{application.roaster
																				.name ||
																				'Roaster anonyme'}
																		</h4>
																		{getLevelBadge(
																			application.roaster
																				.roasterProfile
																				?.level || 'rookie'
																		)}
																		<Badge
																			variant='outline'
																			className='text-xs'>
																			#{index + 1} •{' '}
																			{application.score}/100
																		</Badge>
																	</div>
																	<div className='text-xs text-gray-500'>
																		{new Date(
																			application.createdAt
																		).toLocaleDateString(
																			'fr-FR'
																		)}
																	</div>
																</div>

																{/* Stats compact */}
																<div className='grid grid-cols-3 gap-3 mb-3 text-sm'>
																	<div className='flex items-center gap-1'>
																		<Star className='w-3 h-3 text-yellow-500' />
																		<span>
																			{application.roaster.roasterProfile?.rating.toFixed(
																				1
																			) || '0.0'}
																			/5
																		</span>
																	</div>
																	<div className='flex items-center gap-1'>
																		<Award className='w-3 h-3 text-blue-500' />
																		<span>
																			{application.roaster
																				.roasterProfile
																				?.completedRoasts ||
																				0}{' '}
																			roasts
																		</span>
																	</div>
																	<div className='flex items-center gap-1'>
																		<TrendingUp className='w-3 h-3 text-green-500' />
																		<span
																			className={getExperienceColor(
																				application.roaster
																					.roasterProfile
																					?.experience ||
																					'Débutant'
																			)}>
																			{application.roaster
																				.roasterProfile
																				?.experience ||
																				'Débutant'}
																		</span>
																	</div>
																</div>

																{/* Spécialités */}
																<div className='mb-3'>
																	<div className='flex flex-wrap gap-1'>
																		{application.roaster.roasterProfile?.specialties
																			.slice(0, 3)
																			.map((specialty) => {
																				const isMatching =
																					roastRequest.focusAreas.includes(
																						specialty
																					);
																				return (
																					<Badge
																						key={
																							specialty
																						}
																						variant={
																							isMatching
																								? 'default'
																								: 'secondary'
																						}
																						className={`text-xs ${
																							isMatching
																								? 'bg-green-100 text-green-800'
																								: ''
																						}`}>
																						{specialty}
																						{isMatching &&
																							' ✓'}
																					</Badge>
																				);
																			}) || (
																			<span className='text-gray-500 text-xs'>
																				Aucune spécialité
																			</span>
																		)}
																	</div>
																</div>

																{/* Message de motivation */}
																{application.motivation && (
																	<div className='bg-gray-50 rounded-lg p-3'>
																		<p className='text-xs text-gray-700 italic'>
																			"
																			{
																				application.motivation
																			}
																			"
																		</p>
																	</div>
																)}
															</div>
														</div>
													</CardContent>
												</Card>
											))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
