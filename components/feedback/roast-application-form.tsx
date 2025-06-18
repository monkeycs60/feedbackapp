'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
	AlertCircle,
	Star,
	Send,
	CheckCircle,
	Clock,
	Users,
} from 'lucide-react';
import { applyForRoast } from '@/lib/actions/roast-application';
import { PRICING } from '@/lib/types/roast-request';

const applicationSchema = z.object({
	motivation: z
		.string()
		.max(500, 'Message trop long (max 500 caractères)')
		.optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface RoastApplicationFormProps {
	roastRequest: {
		id: string;
		title: string;
		maxPrice: number;
		feedbacksRequested: number;
		focusAreas: string[];
		status: string;
	};
	hasApplied: boolean;
}

export function RoastApplicationForm({
	roastRequest,
	hasApplied,
}: RoastApplicationFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [applied, setApplied] = useState(hasApplied);

	const calculatePricePerFeedback = () => {
		const totalPrice = roastRequest.maxPrice;
		const domainsPrice = totalPrice / roastRequest.feedbacksRequested;
		return domainsPrice;
	};

	const pricePerFeedback = calculatePricePerFeedback();

	const form = useForm<ApplicationFormData>({
		resolver: zodResolver(applicationSchema),
		defaultValues: {
			motivation: '',
		},
	});

	const motivation = form.watch('motivation') || '';

	const onSubmit = async (data: ApplicationFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			await applyForRoast({
				roastRequestId: roastRequest.id,
				motivation: data.motivation,
			});
			setApplied(true);
		} catch (error) {
			console.error('Erreur:', error);
			setError(
				error instanceof Error ? error.message : 'Une erreur est survenue'
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (applied) {
		return (
			<Card className='h-fit'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<CheckCircle className='w-5 h-5 text-green-600' />
						Candidature envoyée
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='bg-green-50 rounded-lg p-4 border border-green-200'>
						<div className='flex items-start gap-3'>
							<CheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
							<div>
								<h4 className='font-medium text-green-900 mb-1'>
									Candidature confirmée !
								</h4>
								<p className='text-sm text-green-800'>
									Votre candidature a été soumise avec succès. Le
									créateur examinera les candidatures dans les
									prochaines 24h.
								</p>
							</div>
						</div>
					</div>

					<div className='space-y-3'>
						<h4 className='font-medium text-gray-900'>
							Prochaines étapes :
						</h4>
						<div className='space-y-2 text-sm text-gray-600'>
							<div className='flex items-center gap-2'>
								<Clock className='w-4 h-4' />
								<span>
									Sélection automatique dans 24h si pas de choix manuel
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<Users className='w-4 h-4' />
								<span>
									{roastRequest.feedbacksRequested} roaster
									{roastRequest.feedbacksRequested > 1 ? 's' : ''}{' '}
									seront sélectionné
									{roastRequest.feedbacksRequested > 1 ? 's' : ''}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<Star className='w-4 h-4' />
								<span>
									Sélection basée sur votre score et vos spécialités
								</span>
							</div>
						</div>
					</div>

					<div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
						<p className='text-sm text-blue-800'>
							<strong>Conseil :</strong> Consultez régulièrement vos
							notifications pour savoir si vous avez été sélectionné(e).
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className='h-fit'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Star className='w-5 h-5' />
					Candidater pour ce roast
				</CardTitle>
				<p className='text-sm text-gray-600'>
					Postulez pour faire partie des {roastRequest.feedbacksRequested}{' '}
					roaster{roastRequest.feedbacksRequested > 1 ? 's' : ''}{' '}
					sélectionné{roastRequest.feedbacksRequested > 1 ? 's' : ''}
				</p>
				<div className='flex items-center gap-2'>
					<Badge
						variant='outline'
						className='bg-green-50 text-green-700 border-green-200'>
						~{pricePerFeedback}€ par feedback
					</Badge>
					<Badge variant='secondary'>
						{roastRequest.feedbacksRequested} place
						{roastRequest.feedbacksRequested > 1 ? 's' : ''} disponible
						{roastRequest.feedbacksRequested > 1 ? 's' : ''}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					{error && (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Spécialités requises */}
					<div className='space-y-3'>
						<Label className='text-base font-medium'>
							Domaines à traiter
						</Label>
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
						<p className='text-sm text-gray-600'>
							Assurez-vous d&apos;avoir de l&apos;expérience dans ces
							domaines
						</p>
					</div>

					{/* Message de motivation */}
					<div className='space-y-3'>
						<Label htmlFor='motivation' className='text-base font-medium'>
							Message de motivation (optionnel)
						</Label>
						<p className='text-sm text-gray-600'>
							Expliquez pourquoi vous êtes le bon roaster pour ce projet
						</p>
						<Textarea
							id='motivation'
							{...form.register('motivation')}
							placeholder="Ex: J'ai 5 ans d'expérience en UX design et j'ai déjà aidé plusieurs startups à améliorer leur onboarding..."
							rows={4}
							className='resize-none'
						/>
						<div className='flex justify-between text-xs text-gray-500'>
							<span>
								Augmentez vos chances avec un message personnalisé
							</span>
							<span>{motivation.length}/500</span>
						</div>
						{form.formState.errors.motivation && (
							<p className='text-red-500 text-sm'>
								{form.formState.errors.motivation.message}
							</p>
						)}
					</div>

					{/* Processus de sélection */}
					<div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
						<h4 className='font-medium text-blue-900 mb-3'>
							Comment ça marche ?
						</h4>
						<div className='space-y-2 text-sm text-blue-800'>
							<div className='flex items-start gap-2'>
								<span className='flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold'>
									1
								</span>
								<span>
									Candidature envoyée avec calcul automatique de votre
									score
								</span>
							</div>
							<div className='flex items-start gap-2'>
								<span className='flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold'>
									2
								</span>
								<span>
									Le créateur peut sélectionner manuellement (24h max)
								</span>
							</div>
							<div className='flex items-start gap-2'>
								<span className='flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold'>
									3
								</span>
								<span>
									Sinon, sélection automatique des meilleurs scores
								</span>
							</div>
							<div className='flex items-start gap-2'>
								<span className='flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold'>
									4
								</span>
								<span>
									Les sélectionnés peuvent alors rédiger leur feedback
								</span>
							</div>
						</div>
					</div>

					{/* Score factors */}
					<div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
						<h4 className='font-medium mb-2'>
							Votre score est calculé sur :
						</h4>
						<ul className='text-sm text-gray-600 space-y-1'>
							<li>
								• <strong>Spécialités matching</strong> : Correspondance
								avec les domaines
							</li>
							<li>
								• <strong>Expérience</strong> : Niveau déclaré
								(Débutant/Intermédiaire/Expert)
							</li>
							<li>
								• <strong>Rating</strong> : Notes reçues sur vos
								précédents feedbacks
							</li>
							<li>
								• <strong>Niveau</strong> : Badge
								(Rookie/Verified/Expert/Master)
							</li>
							<li>
								• <strong>Fiabilité</strong> : Taux de complétion de vos
								missions
							</li>
						</ul>
					</div>

					<Button
						type='submit'
						disabled={isLoading}
						className='w-full bg-blue-600 hover:bg-blue-700'
						size='lg'>
						<Send className='w-4 h-4 mr-2' />
						{isLoading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
