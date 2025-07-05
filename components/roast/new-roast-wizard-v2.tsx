'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	AlertCircle,
	Sparkles,
	Info,
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { createNewRoastRequest } from '@/lib/actions/roast-request';
import {
	type FocusArea,
	APP_CATEGORIES,
} from '@/lib/types/roast-request';
import { z } from 'zod';

// Simplified schema for new model
const simplifiedRoastSchema = z.object({
	title: z.string().min(3).max(100),
	appUrl: z.string().url(),
	description: z.string().min(20).max(1000),
	category: z.string(),
	coverImage: z.string().optional(),
	feedbacksRequested: z.number().min(1).max(10),
	targetAudienceIds: z.array(z.string()).min(1).max(2),
	customTargetAudience: z.object({ name: z.string() }).optional(),
	pricePerRoaster: z.number().min(3).max(50),
	deadline: z.date().optional(),
	questions: z.array(z.object({
		domain: z.string().optional(),
		text: z.string(),
		order: z.number(),
	})).optional(),
	focusAreas: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof simplifiedRoastSchema>;

interface Question {
	id: string;
	text: string;
	domain?: string;
	order: number;
}

interface NewRoastWizardV2Props {
	targetAudiences: Array<{
		id: string;
		name: string;
	}>;
	className?: string;
}

export function NewRoastWizardV2({
	targetAudiences,
	className = '',
}: NewRoastWizardV2Props) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedDomains, setSelectedDomains] = useState<FocusArea[]>([]);
	const [confirmSubmit, setConfirmSubmit] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(simplifiedRoastSchema),
		defaultValues: {
			feedbacksRequested: 2,
			pricePerRoaster: 5,
			targetAudienceIds: [],
			questions: [],
			focusAreas: [],
		},
	});

	const watchedValues = form.watch();

	const steps = [
		{
			id: 'basics',
			title: 'Informations',
			description: 'Titre, description et audience',
		},
		{
			id: 'feedback',
			title: 'Feedback',
			description: 'Questions et domaines (optionnel)',
		},
		{
			id: 'pricing',
			title: 'Tarification',
			description: 'Prix par roaster et récapitulatif',
		},
	];

	const currentStepData = steps[currentStep];
	const progress = ((currentStep + 1) / steps.length) * 100;

	const goToNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const goToPrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const calculateSuggestedPrice = () => {
		const basePrice = 3;
		const questionFactor = Math.min(questions.length * 0.5, 5);
		const complexityFactor = selectedDomains.length > 3 ? 2 : 1;
		return Math.round((basePrice + questionFactor) * complexityFactor);
	};

	const onSubmit = async (data: FormData) => {
		// Prevent automatic submission - require explicit confirmation
		if (!confirmSubmit) {
			setConfirmSubmit(true);
			return;
		}

		try {
			setIsSubmitting(true);
			setSubmitError(null);

			// Transform data to match server expectations
			const submitData = {
				...data,
				feedbackMode: 'STRUCTURED' as const, // Keep for backward compatibility
				isUrgent: false, // Always false now
				questions: questions.map(q => ({
					domain: q.domain,
					text: q.text,
					order: q.order,
				})),
				focusAreas: selectedDomains,
			};

			await createNewRoastRequest(submitData);
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'Une erreur est survenue'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const isStepValid = (stepIndex: number) => {
		switch (stepIndex) {
			case 0: // Basic info
				return !!(
					watchedValues.title &&
					watchedValues.appUrl &&
					watchedValues.description &&
					watchedValues.category &&
					watchedValues.targetAudienceIds?.length > 0
				);
			case 1: // Feedback config - always valid (questions are optional)
				return true;
			case 2: // Pricing - require valid price
				const price = watchedValues.pricePerRoaster;
				return !!(price && price >= 3 && price <= 50);
			default:
				return false;
		}
	};

	const canProceed = isStepValid(currentStep);

	return (
		<div className={`max-w-4xl mx-auto ${className}`}>
			{/* Header */}
			<div className='mb-8'>
				<div className='mb-4'>
					<h1 className='text-3xl font-bold text-foreground'>
						Créer un nouveau roast
					</h1>
					<p className='text-muted-foreground mt-2'>
						{currentStepData.description}
					</p>
				</div>

				{/* Progress */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-sm'>
						<span className='font-medium'>
							Étape {currentStep + 1} sur {steps.length}
						</span>
						<span className='text-muted-foreground'>
							{Math.round(progress)}% complété
						</span>
					</div>
					<Progress value={progress} className='h-2' />
				</div>

				{/* Steps indicator */}
				<div className='flex items-center justify-between mt-4'>
					{steps.map((step, index) => (
						<div
							key={step.id}
							className={`flex items-center gap-2 ${
								index <= currentStep
									? 'text-foreground'
									: 'text-muted-foreground'
							}`}>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
									index < currentStep
										? 'bg-green-500 text-white'
										: index === currentStep
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-600'
								}`}>
								{index < currentStep ? (
									<CheckCircle2 className='w-4 h-4' />
								) : (
									index + 1
								)}
							</div>
							<div className='hidden sm:block'>
								<p className='font-medium text-sm'>{step.title}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				{/* Step Content */}
				<div className='mb-8'>
					{currentStep === 0 && (
						<BasicInfoStep
							form={form}
							targetAudiences={targetAudiences}
						/>
					)}

					{currentStep === 1 && (
						<FeedbackConfigStep
							questions={questions}
							setQuestions={setQuestions}
							selectedDomains={selectedDomains}
							setSelectedDomains={setSelectedDomains}
						/>
					)}

					{currentStep === 2 && (
						<PricingStep
							form={form}
							questions={questions}
							suggestedPrice={calculateSuggestedPrice()}
						/>
					)}
				</div>

				{/* Error Display */}
				{submitError && (
					<Alert variant='destructive' className='mb-6'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{submitError}</AlertDescription>
					</Alert>
				)}

				{/* Confirmation Display */}
				{confirmSubmit && (
					<Alert className='mb-6 border-orange-200 bg-orange-50'>
						<AlertCircle className='h-4 w-4 text-orange-600' />
						<AlertDescription className='text-orange-800'>
							<strong>Dernière étape :</strong> Cliquez à nouveau sur "Confirmer et créer" pour publier votre roast.
						</AlertDescription>
					</Alert>
				)}

				{/* Navigation */}
				<div className='flex items-center justify-between'>
					<Button
						type='button'
						variant='outline'
						onClick={goToPrevious}
						disabled={currentStep === 0}>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Précédent
					</Button>

					{currentStep < steps.length - 1 ? (
						<Button
							type='button'
							onClick={goToNext}
							disabled={!canProceed}>
							Suivant
							<ArrowRight className='w-4 h-4 ml-2' />
						</Button>
					) : (
						<Button
							type='submit'
							disabled={!canProceed || isSubmitting}
							className={confirmSubmit ? 'bg-green-600 hover:bg-green-700' : ''}>
							{isSubmitting ? (
								'Création...'
							) : confirmSubmit ? (
								<>
									<Sparkles className='w-4 h-4 mr-2' />
									Confirmer et créer
								</>
							) : (
								<>
									<Sparkles className='w-4 h-4 mr-2' />
									Créer le roast
								</>
							)}
						</Button>
					)}
				</div>
			</form>
		</div>
	);
}

// Step 1: Basic Info
function BasicInfoStep({
	form,
	targetAudiences,
}: {
	form: ReturnType<typeof useForm<FormData>>;
	targetAudiences: Array<{ id: string; name: string }>;
}) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const watchedValues = watch();

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<span className='text-2xl'>📝</span>
					Informations de base
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Title */}
				<div className='space-y-2'>
					<Label htmlFor='title'>Titre de votre application *</Label>
					<Input
						id='title'
						placeholder='Ex: TaskFlow - Gestionnaire de tâches pour équipes'
						{...register('title')}
					/>
					{errors.title && (
						<p className='text-red-500 text-sm'>{errors.title.message}</p>
					)}
				</div>

				{/* URL */}
				<div className='space-y-2'>
					<Label htmlFor='appUrl'>URL de votre application *</Label>
					<Input
						id='appUrl'
						type='url'
						placeholder='https://votre-app.com'
						{...register('appUrl')}
					/>
					{errors.appUrl && (
						<p className='text-red-500 text-sm'>{errors.appUrl.message}</p>
					)}
				</div>

				{/* Category */}
				<div className='space-y-3'>
					<Label>Catégorie *</Label>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
						{APP_CATEGORIES.map((cat) => (
							<div
								key={cat.id}
								onClick={() => setValue('category', cat.id)}
								className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
									watchedValues.category === cat.id
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}>
								<div className='text-center space-y-1'>
									<div className='text-xl'>{cat.icon}</div>
									<p className='font-medium text-sm'>{cat.label}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Target Audiences */}
				<div className='space-y-3'>
					<Label>Audience cible * (max 2)</Label>
					<div className='max-h-40 overflow-y-auto border rounded-lg p-3'>
						{targetAudiences.map((audience) => {
							const isSelected = watchedValues.targetAudienceIds?.includes(audience.id);
							const isDisabled = watchedValues.targetAudienceIds?.length >= 2 && !isSelected;
							
							return (
								<label
									key={audience.id}
									className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
										isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
									}`}>
									<input
										type='checkbox'
										checked={isSelected}
										disabled={isDisabled}
										onChange={(e) => {
											const current = watchedValues.targetAudienceIds || [];
											if (e.target.checked) {
												setValue('targetAudienceIds', [...current, audience.id]);
											} else {
												setValue('targetAudienceIds', current.filter((id: string) => id !== audience.id));
											}
										}}
										className='w-4 h-4'
									/>
									<span className='text-sm'>{audience.name}</span>
								</label>
							);
						})}
					</div>
				</div>

				{/* Description */}
				<div className='space-y-2'>
					<Label htmlFor='description'>Description *</Label>
					<textarea
						id='description'
						rows={4}
						placeholder='Décrivez votre application et ce sur quoi vous aimeriez des retours...'
						className='w-full px-3 py-2 border rounded-md'
						{...register('description')}
					/>
					<div className='text-xs text-muted-foreground text-right'>
						{watchedValues.description?.length || 0}/1000
					</div>
				</div>

				{/* Cover Image */}
				<div className='space-y-2'>
					<Label>Image de couverture (optionnel)</Label>
					<ImageUpload
						value={watchedValues.coverImage}
						onChange={(url) => setValue('coverImage', url || '')}
					/>
				</div>

				{/* Number of Roasters */}
				<div className='space-y-4'>
					<Label>
						Nombre de roasters souhaités *
						<span className='ml-2 text-lg font-bold text-blue-600'>
							{watchedValues.feedbacksRequested || 2}
						</span>
					</Label>
					<Slider
						min={1}
						max={10}
						step={1}
						value={[watchedValues.feedbacksRequested || 2]}
						onValueChange={([value]) => setValue('feedbacksRequested', value)}
					/>
					<div className='flex justify-between text-xs text-muted-foreground'>
						<span>1 roaster</span>
						<span className='text-green-600 font-medium'>2-3 recommandé</span>
						<span>10 roasters</span>
					</div>
				</div>

				{/* Deadline */}
				<div className='space-y-2'>
					<Label htmlFor='deadline'>Date limite (optionnel)</Label>
					<Input
						id='deadline'
						type='date'
						min={new Date().toISOString().split('T')[0]}
						onChange={(e) => setValue('deadline', e.target.value ? new Date(e.target.value) : undefined)}
					/>
					<p className='text-xs text-muted-foreground'>
						Laissez vide pour une collecte standard de 24h
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

// Step 2: Feedback Configuration
function FeedbackConfigStep({
	questions,
	setQuestions,
}: {
	questions: Question[];
	setQuestions: (questions: Question[]) => void;
	selectedDomains: string[];
	setSelectedDomains: (domains: string[]) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<span className='text-2xl'>💬</span>
					Configuration du feedback
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Info box */}
				<Alert>
					<Info className='h-4 w-4' />
					<AlertDescription>
						<strong>Feedback structuré inclus :</strong> Chaque roaster fournira automatiquement :
						<ul className='list-disc list-inside mt-2'>
							<li>Note globale et première impression</li>
							<li>Points forts et points faibles</li>
							<li>Recommandations concrètes</li>
							<li>Notes détaillées (UX, Valeur, Performance)</li>
						</ul>
					</AlertDescription>
				</Alert>

				{/* Custom Questions Section */}
				<div className='space-y-4'>
					<div>
						<h3 className='font-semibold mb-2'>Questions personnalisées (optionnel)</h3>
						<p className='text-sm text-muted-foreground'>
							Ajoutez des questions spécifiques pour obtenir des retours ciblés
						</p>
					</div>

					{/* Simplified question interface */}
					<div className='space-y-3'>
						{questions.map((question, index) => (
							<div key={question.id} className='flex gap-2'>
								<Input
									value={question.text}
									onChange={(e) => {
										const updated = [...questions];
										updated[index].text = e.target.value;
										setQuestions(updated);
									}}
									placeholder='Votre question...'
								/>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										setQuestions(questions.filter(q => q.id !== question.id));
									}}>
									Supprimer
								</Button>
							</div>
						))}
						
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								const newQuestion: Question = {
									id: Date.now().toString(),
									text: '',
									order: questions.length,
								};
								setQuestions([...questions, newQuestion]);
							}}>
							Ajouter une question
						</Button>
					</div>

					{questions.length > 0 && (
						<p className='text-sm text-muted-foreground'>
							{questions.length} question{questions.length > 1 ? 's' : ''} personnalisée{questions.length > 1 ? 's' : ''}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// Step 3: Pricing
function PricingStep({
	form,
	questions,
	suggestedPrice,
}: {
	form: ReturnType<typeof useForm<FormData>>;
	questions: Question[];
	suggestedPrice: number;
}) {
	const { watch, setValue } = form;
	const watchedValues = watch();
	const pricePerRoaster = watchedValues.pricePerRoaster || 5;
	const totalPrice = pricePerRoaster * (watchedValues.feedbacksRequested || 2);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<span className='text-2xl'>💰</span>
					Tarification
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Price Setting */}
				<div className='space-y-4'>
					<Label>
						Prix par roaster
						<span className='ml-2 text-2xl font-bold text-green-600'>
							{pricePerRoaster}€
						</span>
					</Label>
					
					<Slider
						min={3}
						max={50}
						step={0.5}
						value={[pricePerRoaster]}
						onValueChange={([value]) => setValue('pricePerRoaster', value)}
						className='w-full'
					/>
					
					<div className='flex justify-between text-xs text-muted-foreground'>
						<span>3€ (minimum)</span>
						<span>50€ (maximum)</span>
					</div>

					{/* Market Indicator */}
					<div className='bg-blue-50 p-4 rounded-lg'>
						<p className='text-sm font-medium text-blue-900'>
							Prix suggéré : {suggestedPrice}€
						</p>
						<p className='text-xs text-blue-700 mt-1'>
							Basé sur {questions.length} question{questions.length !== 1 ? 's' : ''} personnalisée{questions.length !== 1 ? 's' : ''}
						</p>
					</div>
				</div>

				{/* Summary */}
				<div className='space-y-4'>
					<h3 className='font-semibold'>Récapitulatif</h3>
					
					<div className='bg-gray-50 rounded-lg p-4 space-y-3'>
						<div className='flex justify-between'>
							<span>Titre</span>
							<span className='font-medium'>{watchedValues.title || 'Non défini'}</span>
						</div>
						<div className='flex justify-between'>
							<span>Catégorie</span>
							<span className='font-medium'>{watchedValues.category || 'Non définie'}</span>
						</div>
						<div className='flex justify-between'>
							<span>Roasters demandés</span>
							<span className='font-medium'>{watchedValues.feedbacksRequested || 2}</span>
						</div>
						<div className='flex justify-between'>
							<span>Questions personnalisées</span>
							<span className='font-medium'>{questions.length}</span>
						</div>
						<hr />
						<div className='flex justify-between text-lg font-semibold'>
							<span>Coût total maximum</span>
							<span className='text-green-600'>{totalPrice}€</span>
						</div>
					</div>

					<Alert>
						<Info className='h-4 w-4' />
						<AlertDescription>
							Vous ne payez que pour les feedbacks effectivement reçus. 
							Le montant affiché est le coût maximum si tous les roasters complètent leur feedback.
						</AlertDescription>
					</Alert>
				</div>
			</CardContent>
		</Card>
	);
}