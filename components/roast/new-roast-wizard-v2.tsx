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
import { type FocusArea, APP_CATEGORIES } from '@/lib/types/roast-request';
import { TARGET_AUDIENCES_EN } from '@/lib/data/target-audiences';
import { z } from 'zod';

// Simplified schema for new model
const simplifiedRoastSchema = z.object({
	title: z.string().min(3).max(100),
	appUrl: z.string().url(),
	description: z.string().min(20).max(1000),
	category: z.string(),
	coverImage: z.string().optional(),
	feedbacksRequested: z.number().min(1).max(10),
	targetAudienceNames: z.array(z.string()).min(1).max(2),
	customTargetAudience: z.object({ name: z.string() }).optional(),
	questions: z
		.array(
			z.object({
				domain: z.string().optional(),
				text: z.string(),
				order: z.number(),
			})
		)
		.optional(),
	focusAreas: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof simplifiedRoastSchema>;

interface Question {
	id: string;
	text: string;
	domain?: string;
	order: number;
}

export function NewRoastWizardV2() {
	const audiencesToUse = TARGET_AUDIENCES_EN.map((name) => ({
		id: name,
		name,
	}));
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
			targetAudienceNames: [],
			questions: [],
			focusAreas: [],
		},
	});

	const watchedValues = form.watch();

	const steps = [
		{
			id: 'basics',
			title: 'Information',
			description: 'Title, description and audience',
		},
		{
			id: 'feedback',
			title: 'Feedback',
			description: 'Questions and domains (optional)',
		},
		{
			id: 'pricing',
			title: 'Pricing',
			description: 'Price per roaster and summary',
		},
	];

	const currentStepData = steps[currentStep];
	const progress = ((currentStep + 1) / steps.length) * 100;

	const goToNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
			setConfirmSubmit(false);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const goToPrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
			setConfirmSubmit(false);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const calculateSuggestedPrice = () => {
		const basePrice = 4;
		const questionsCost = questions.length * 0.5;
		return basePrice + questionsCost;
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
				pricePerRoaster: calculateSuggestedPrice(), // Price calculated automatically
				isUrgent: false, // Always false now
				questions: questions.map((q) => ({
					domain: q.domain,
					text: q.text,
					order: q.order,
				})),
				focusAreas: selectedDomains,
			};

			await createNewRoastRequest(submitData);
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'An error occurred'
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
					watchedValues.targetAudienceNames?.length > 0
				);
			case 1: // Feedback config - always valid (questions are optional)
				return true;
			case 2: // Pricing - always valid (price calculated automatically)
				return true;
			default:
				return false;
		}
	};

	const canProceed = isStepValid(currentStep);

	return (
		<div className='max-w-4xl mx-auto'>
			{/* Header */}
			<div className='mb-8'>
				<div className='mb-4'>
					<h1 className='text-3xl font-bold text-foreground'>
						Create a new roast
					</h1>
					<p className='text-muted-foreground mt-2'>
						{currentStepData.description}
					</p>
				</div>

				{/* Progress */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-sm'>
						<span className='font-medium'>
							Step {currentStep + 1} of {steps.length}
						</span>
						<span className='text-muted-foreground'>
							{Math.round(progress)}% completed
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
						<BasicInfoStep form={form} targetAudiences={audiencesToUse} />
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
							targetAudiences={audiencesToUse}
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
							<strong>Final step:</strong> Click "Confirm and create" again to publish your roast.
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
						Previous
					</Button>

					{currentStep < steps.length - 1 ? (
						<Button
							type='button'
							onClick={goToNext}
							disabled={!canProceed}>
							Next
							<ArrowRight className='w-4 h-4 ml-2' />
						</Button>
					) : (
						<Button
							type='submit'
							disabled={!canProceed || isSubmitting}
							className={
								confirmSubmit ? 'bg-green-600 hover:bg-green-700' : ''
							}>
							{isSubmitting ? (
								'Creating...'
							) : confirmSubmit ? (
								<>
									<Sparkles className='w-4 h-4 mr-2' />
									Confirm and create
								</>
							) : (
								<>
									<Sparkles className='w-4 h-4 mr-2' />
									Create roast
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
					Basic information
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Title */}
				<div className='space-y-2'>
					<Label htmlFor='title'>Your application title *</Label>
					<Input
						id='title'
						placeholder='Ex: TaskFlow - Task manager for teams'
						{...register('title')}
					/>
					{errors.title && (
						<p className='text-red-500 text-sm'>{errors.title.message}</p>
					)}
				</div>

				{/* URL */}
				<div className='space-y-2'>
					<Label htmlFor='appUrl'>Your application URL *</Label>
					<Input
						id='appUrl'
						type='url'
						placeholder='https://your-app.com'
						{...register('appUrl')}
					/>
					{errors.appUrl && (
						<p className='text-red-500 text-sm'>
							{errors.appUrl.message}
						</p>
					)}
				</div>

				{/* Category */}
				<div className='space-y-3'>
					<Label>Category *</Label>
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
					<Label>Target audience * (max 2)</Label>
					<div className='max-h-40 overflow-y-auto border rounded-lg p-3'>
						{targetAudiences.map((audience) => {
							const isSelected =
								watchedValues.targetAudienceNames?.includes(audience.id);
							const isDisabled =
								watchedValues.targetAudienceNames?.length >= 2 &&
								!isSelected;

							return (
								<label
									key={audience.id}
									className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
										isDisabled
											? 'opacity-50 cursor-not-allowed'
											: 'hover:bg-gray-50'
									}`}>
									<input
										type='checkbox'
										checked={isSelected}
										disabled={isDisabled}
										onChange={(e) => {
											const current =
												watchedValues.targetAudienceNames || [];
											if (e.target.checked) {
												setValue('targetAudienceNames', [
													...current,
													audience.id,
												]);
											} else {
												setValue(
													'targetAudienceNames',
													current.filter(
														(id: string) => id !== audience.id
													)
												);
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
						placeholder='Describe your application and what you would like feedback on...'
						className='w-full px-3 py-2 border rounded-md'
						{...register('description')}
					/>
					<div className='text-xs text-muted-foreground text-right'>
						{watchedValues.description?.length || 0}/1000
					</div>
				</div>

				{/* Cover Image */}
				<div className='space-y-2'>
					<Label>Cover image (optional)</Label>
					<ImageUpload
						value={watchedValues.coverImage}
						onChange={(url) => setValue('coverImage', url || '')}
					/>
				</div>

				{/* Number of Roasters */}
				<div className='space-y-4'>
					<Label>
						Number of roasters requested *
						<span className='ml-2 text-lg font-bold text-blue-600'>
							{watchedValues.feedbacksRequested || 2}
						</span>
					</Label>
					<Slider
						min={1}
						max={10}
						step={1}
						value={[watchedValues.feedbacksRequested || 2]}
						onValueChange={([value]) =>
							setValue('feedbacksRequested', value)
						}
					/>
					<div className='flex justify-between text-xs text-muted-foreground'>
						<span>1 roaster</span>
						<span className='text-green-600 font-medium'>
							2-3 recommended
						</span>
						<span>10 roasters</span>
					</div>
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
	selectedDomains: FocusArea[];
	setSelectedDomains: (domains: FocusArea[]) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<span className='text-2xl'>💬</span>
					Feedback configuration
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-6'>
				{/* Info box */}
				<Alert>
					<Info className='h-4 w-4' />
					<AlertDescription>
						<strong>Structured feedback included:</strong> Each roaster will automatically provide:
						<ul className='list-disc list-inside mt-2'>
							<li>Overall rating and first impression</li>
							<li>Strengths and weaknesses</li>
							<li>Concrete recommendations</li>
							<li>Detailed ratings (UX, Value, Performance)</li>
						</ul>
					</AlertDescription>
				</Alert>

				{/* Custom Questions Section */}
				<div className='space-y-4'>
					<div>
						<h3 className='font-semibold mb-2'>
							Custom questions (optional)
						</h3>
						<p className='text-sm text-muted-foreground'>
							Add specific questions to get targeted feedback
						</p>
						<div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2'>
							<p className='text-xs text-blue-800'>
								💰 <strong>Pricing:</strong> €4 base + €0.50
								per additional question
							</p>
						</div>
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
									placeholder='Your question...'
								/>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										setQuestions(
											questions.filter((q) => q.id !== question.id)
										);
									}}>
									Remove
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
							Add a question
						</Button>
					</div>

					{questions.length > 0 && (
						<div className='bg-green-50 border border-green-200 rounded-lg p-3'>
							<p className='text-sm font-medium text-green-800'>
								{questions.length} custom question{questions.length > 1 ? 's' : ''}
							</p>
							<p className='text-xs text-green-700 mt-1'>
								Additional cost: +
								€{(questions.length * 0.5).toFixed(2)} per roaster
							</p>
						</div>
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
	targetAudiences,
}: {
	form: ReturnType<typeof useForm<FormData>>;
	questions: Question[];
	suggestedPrice: number;
	targetAudiences: Array<{ id: string; name: string }>;
}) {
	const { watch } = form;
	const watchedValues = watch();
	const calculatedPrice = suggestedPrice;
	const totalPrice = calculatedPrice * (watchedValues.feedbacksRequested || 2);

	// Get category information
	const selectedCategory = APP_CATEGORIES.find(
		(cat) => cat.id === watchedValues.category
	);

	// Get selected audiences
	const selectedAudiences = targetAudiences.filter((audience) =>
		watchedValues.targetAudienceNames?.includes(audience.id)
	);

	return (
		<div className='space-y-6'>
			{/* Complete request summary */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<span className='text-2xl'>📋</span>
						Your roast summary
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{/* Main information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-3'>
							<div>
								<h4 className='font-medium text-gray-700 mb-1'>
									Title
								</h4>
								<p className='text-foreground font-medium'>
									{watchedValues.title || 'Not defined'}
								</p>
							</div>

							<div>
								<h4 className='font-medium text-gray-700 mb-1'>URL</h4>
								<p className='text-blue-600 text-sm break-all'>
									{watchedValues.appUrl || 'Not defined'}
								</p>
							</div>

							<div>
								<h4 className='font-medium text-gray-700 mb-1'>
									Category
								</h4>
								<div className='flex items-center gap-2'>
									<span className='text-lg'>
										{selectedCategory?.icon}
									</span>
									<span className='font-medium'>
										{selectedCategory?.label ||
											watchedValues.category}
									</span>
								</div>
							</div>
						</div>

						<div className='space-y-3'>
							<div>
								<h4 className='font-medium text-gray-700 mb-1'>
									Target audiences
								</h4>
								<div className='space-y-1'>
									{selectedAudiences.map((audience) => (
										<div
											key={audience.id}
											className='bg-blue-50 px-2 py-1 rounded text-sm'>
											{audience.name}
										</div>
									))}
									{watchedValues.customTargetAudience?.name && (
										<div className='bg-purple-50 px-2 py-1 rounded text-sm'>
											{watchedValues.customTargetAudience.name}{' '}
											<span className='text-xs text-purple-600'>
												(custom)
											</span>
										</div>
									)}
								</div>
							</div>

							<div>
								<h4 className='font-medium text-gray-700 mb-1'>
									Number of roasters
								</h4>
								<p className='font-semibold text-lg text-blue-600'>
									{watchedValues.feedbacksRequested || 2}
								</p>
							</div>
						</div>
					</div>

					{/* Description */}
					<div>
						<h4 className='font-medium text-gray-700 mb-1'>
							Description
						</h4>
						<p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-md'>
							{watchedValues.description &&
							watchedValues.description.length > 200
								? watchedValues.description.substring(0, 200) + '...'
								: watchedValues.description || 'Not defined'}
						</p>
					</div>

					{/* Custom questions */}
					{questions.length > 0 && (
						<div>
							<h4 className='font-medium text-gray-700 mb-2'>
								Custom questions ({questions.length})
							</h4>
							<div className='space-y-2'>
								{questions.map((question, index) => (
									<div
										key={question.id}
										className='bg-amber-50 border border-amber-200 p-3 rounded-md'>
										<div className='flex items-start gap-2'>
											<span className='bg-amber-500 text-white text-xs px-2 py-1 rounded font-medium'>
												Q{index + 1}
											</span>
											<p className='text-sm text-amber-800 flex-1'>
												{question.text}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pricing calculation - Compact table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<span className='text-2xl'>🧮</span>
						Price calculation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='bg-green-50 border border-green-200 rounded-lg overflow-hidden'>
						<table className='w-full text-sm'>
							<tbody className='divide-y divide-green-200'>
								<tr>
									<td className='px-4 py-3 text-green-700'>
										Structured feedback (base)
									</td>
									<td className='px-4 py-3 font-medium text-green-800 text-right'>
										€4.00
									</td>
								</tr>
								{questions.length > 0 && (
									<tr>
										<td className='px-4 py-3 text-green-700'>
											Custom questions ({questions.length} ×
											€0.50)
										</td>
										<td className='px-4 py-3 font-medium text-green-800 text-right'>
											+€{(questions.length * 0.5).toFixed(2)}
										</td>
									</tr>
								)}
								<tr className='bg-green-100 border-t-2 border-green-300'>
									<td className='px-4 py-3 font-bold text-green-900'>
										Price per roaster
									</td>
									<td className='px-4 py-3 font-bold text-green-900 text-right text-lg'>
										{calculatedPrice.toFixed(2).replace('.', ',')}€
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Visual display of total */}
			<Card className='border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50'>
				<CardContent className='p-6'>
					<div className='text-center space-y-4'>
						<h3 className='text-lg font-semibold text-gray-800'>
							Maximum total cost
						</h3>

						<div className='flex items-center justify-center gap-4 text-3xl font-bold'>
							<div className='flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border'>
								<span className='text-2xl'>💰</span>
								<span className='text-green-600'>
									{calculatedPrice.toFixed(2).replace('.', ',')}€
								</span>
							</div>

							<span className='text-gray-400'>×</span>

							<div className='bg-white px-4 py-3 rounded-lg shadow-sm border'>
								<span className='text-blue-600'>
									{watchedValues.feedbacksRequested || 2}
								</span>
							</div>

							<span className='text-gray-400'>=</span>

							<div className='bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg'>
								<span className='text-4xl font-bold'>
									{totalPrice}€
								</span>
							</div>
						</div>

						<p className='text-sm text-gray-600'>
							€{calculatedPrice.toFixed(2)} per roaster
							× {watchedValues.feedbacksRequested || 2} roaster
							{(watchedValues.feedbacksRequested || 2) > 1 ? 's' : ''}
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Important information */}
			<Alert>
				<Info className='h-4 w-4' />
				<AlertDescription>
					<strong>Important:</strong> You only pay for feedbacks actually received. The displayed amount is the maximum cost if all roasters complete their feedback.
				</AlertDescription>
			</Alert>
		</div>
	);
}
