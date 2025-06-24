'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Upload,
  X,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { FeedbackModeSelection } from './feedback-mode-selection';
import { FeedbackFreeStep } from './modes/feedback-free-step';
import { FeedbackTargetedStep } from './modes/feedback-targeted-step';
import { FeedbackStructuredStep } from './modes/feedback-structured-step';
import { PricingDisplay } from './pricing-calculator';
import { UploadDropzone } from '@uploadthing/react';
import { newRoastRequestSchema } from '@/lib/schemas/roast-request';
import { createNewRoastRequest } from '@/lib/actions/roast-request';
import { type FeedbackMode, type FocusArea, APP_CATEGORIES } from '@/lib/types/roast-request';
import { z } from 'zod';

// Form data type
type FormData = z.infer<typeof newRoastRequestSchema>;

interface Question {
  id: string;
  text: string;
  domain?: string;
  order: number;
}

interface NewRoastWizardProps {
  targetAudiences: Array<{
    id: string;
    name: string;
  }>;
  className?: string;
}

export function NewRoastWizard({ targetAudiences, className = "" }: NewRoastWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form state
  const [selectedMode, setSelectedMode] = useState<FeedbackMode | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<FocusArea[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(newRoastRequestSchema),
    defaultValues: {
      feedbacksRequested: 2,
      isUrgent: false,
      targetAudienceIds: [],
      questions: [],
      focusAreas: []
    }
  });

  const watchedValues = form.watch();

  const steps = [
    { 
      id: 'basic', 
      title: 'Informations de base', 
      description: 'Titre, URL et description' 
    },
    { 
      id: 'mode', 
      title: 'Type de feedback', 
      description: 'Choisissez votre approche' 
    },
    { 
      id: 'questions', 
      title: 'Questions', 
      description: 'Personnalisez votre feedback' 
    },
    { 
      id: 'settings', 
      title: 'Paramètres', 
      description: 'Audience et finalisation' 
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModeSelect = (mode: FeedbackMode) => {
    setSelectedMode(mode);
    form.setValue('feedbackMode', mode);
    
    // Reset questions and domains when mode changes
    if (mode === 'FREE') {
      setQuestions([]);
      setSelectedDomains([]);
      form.setValue('questions', []);
      form.setValue('focusAreas', []);
    }
  };

  const handleQuestionsChange = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    form.setValue('questions', newQuestions.map(q => ({
      domain: q.domain,
      text: q.text,
      order: q.order
    })));
  };

  const handleDomainsChange = (domains: FocusArea[]) => {
    setSelectedDomains(domains);
    form.setValue('focusAreas', domains);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await createNewRoastRequest(data);
      // Redirect handled by server action
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic info
        return !!(watchedValues.title && watchedValues.appUrl && watchedValues.description && watchedValues.category);
      case 1: // Mode selection
        return !!selectedMode;
      case 2: // Questions
        return selectedMode === 'FREE' || questions.length > 0;
      case 3: // Settings
        return watchedValues.targetAudienceIds?.length > 0;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Créer un nouveau roast
            </h1>
            <p className="text-muted-foreground mt-2">
              {currentStepData.description}
            </p>
          </div>
          
          {selectedMode && questions.length >= 0 && (
            <PricingDisplay
              mode={selectedMode}
              questionCount={questions.length}
              roasterCount={watchedValues.feedbacksRequested || 2}
              className="text-right"
            />
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% complété
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-sm">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 0 && (
            <BasicInfoStep form={form} />
          )}
          
          {currentStep === 1 && (
            <FeedbackModeSelection
              selectedMode={selectedMode}
              onModeSelect={handleModeSelect}
              onContinue={goToNext}
              roasterCount={watchedValues.feedbacksRequested || 2}
            />
          )}
          
          {currentStep === 2 && selectedMode === 'FREE' && (
            <FeedbackFreeStep
              roasterCount={watchedValues.feedbacksRequested || 2}
            />
          )}
          
          {currentStep === 2 && selectedMode === 'TARGETED' && (
            <FeedbackTargetedStep
              questions={questions}
              onQuestionsChange={handleQuestionsChange}
              roasterCount={watchedValues.feedbacksRequested || 2}
            />
          )}
          
          {currentStep === 2 && selectedMode === 'STRUCTURED' && (
            <FeedbackStructuredStep
              selectedDomains={selectedDomains}
              questions={questions}
              onDomainsChange={handleDomainsChange}
              onQuestionsChange={handleQuestionsChange}
              roasterCount={watchedValues.feedbacksRequested || 2}
            />
          )}
          
          {currentStep === 3 && (
            <SettingsStep 
              form={form} 
              targetAudiences={targetAudiences}
              selectedMode={selectedMode}
              questionsCount={questions.length}
            />
          )}
        </div>

        {/* Error Display */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        {currentStep !== 1 && ( // Mode selection step handles its own navigation
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={goToNext}
                disabled={!canProceed}
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canProceed || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  'Création...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer le roast
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

// Basic Info Step Component
function BasicInfoStep({ form }: { form: ReturnType<typeof useForm<FormData>> }) {
  const { register, watch, formState: { errors } } = form;
  const watchedValues = watch();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Informations de base
          </CardTitle>
          <p className="text-muted-foreground">
            Décrivez votre application pour attirer les meilleurs roasters
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre de votre application *
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex: TaskFlow - Gestionnaire de tâches pour équipes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('title')}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Soyez descriptif et accrocheur</span>
              <span>{watchedValues.title?.length || 0}/100</span>
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* App URL */}
          <div className="space-y-2">
            <label htmlFor="appUrl" className="text-sm font-medium">
              URL de votre application *
            </label>
            <input
              id="appUrl"
              type="url"
              placeholder="https://votre-app.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('appUrl')}
            />
            <p className="text-xs text-muted-foreground">
              URL publique accessible aux roasters pour tester votre app
            </p>
            {errors.appUrl && (
              <p className="text-red-500 text-sm">{errors.appUrl.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Catégorie d'application *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {APP_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => form.setValue('category', cat.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    watchedValues.category === cat.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{cat.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description détaillée *
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Décrivez votre application, son objectif, les fonctionnalités principales à tester, et ce sur quoi vous aimeriez avoir des retours spécifiques..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('description')}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Plus c'est détaillé, meilleurs seront les retours</span>
              <span>{watchedValues.description?.length || 0}/1000</span>
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>


          {/* Cover Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Image de couverture (optionnel)
            </label>
            {watchedValues.coverImage ? (
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={watchedValues.coverImage}
                    alt="Aperçu de l'image de couverture"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue('coverImage', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cette image sera visible sur la marketplace pour attirer les roasters
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <UploadDropzone
                  endpoint="roastCover"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      form.setValue('coverImage', res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error('Upload error:', error);
                  }}
                  appearance={{
                    container: "border-none p-0",
                    uploadIcon: "text-gray-400",
                    label: "text-sm text-gray-600",
                    allowedContent: "text-xs text-gray-500"
                  }}
                />
              </div>
            )}
          </div>

          {/* Number of Roasters with Slider */}
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Nombre de roasters souhaités * 
              <span className="ml-2 text-lg font-bold text-blue-600">
                {watchedValues.feedbacksRequested || 2}
              </span>
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="10"
                value={watchedValues.feedbacksRequested || 2}
                onChange={(e) => form.setValue('feedbacksRequested', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((watchedValues.feedbacksRequested || 2) - 1) * 11.11}%, #e5e7eb ${((watchedValues.feedbacksRequested || 2) - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 roaster</span>
                <span className="text-green-600 font-medium">2-3 recommandé</span>
                <span>10 roasters</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Plus vous avez de retours, plus vous aurez de perspectives différentes
            </p>
            {errors.feedbacksRequested && (
              <p className="text-red-500 text-sm">{errors.feedbacksRequested.message}</p>
            )}
          </div>

          {/* Urgency toggle */}
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <input
              id="isUrgent"
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              {...register('isUrgent')}
            />
            <div className="flex-1">
              <label htmlFor="isUrgent" className="text-sm font-medium text-orange-800 flex items-center gap-2">
                🚨 Demande urgente 
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                  +0,50€ par roaster
                </span>
              </label>
              <p className="text-xs text-orange-700 mt-1">
                • Mis en avant dans l'algorithme de la marketplace<br/>
                • Publication immédiate (pas de collecte de 24h)<br/>
                • Rémunération bonus pour attirer les meilleurs roasters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Step Component  
function SettingsStep({ 
  form, 
  targetAudiences, 
  selectedMode, 
  questionsCount 
}: { 
  form: ReturnType<typeof useForm<FormData>>; 
  targetAudiences: Array<{ id: string; name: string }>; 
  selectedMode?: FeedbackMode;
  questionsCount: number;
}) {
  const { register, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();
  const selectedAudiences = watchedValues.targetAudienceIds || [];

  const handleAudienceToggle = (audienceId: string) => {
    const newSelection = selectedAudiences.includes(audienceId)
      ? selectedAudiences.filter((id: string) => id !== audienceId)
      : [...selectedAudiences, audienceId].slice(0, 2); // Max 2 audiences
    
    setValue('targetAudienceIds', newSelection);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Paramètres finaux
          </CardTitle>
          <p className="text-muted-foreground">
            Définissez votre audience cible et finalisez votre demande
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary of configuration */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Mode sélectionné :</strong> {selectedMode}</p>
                <p><strong>Questions :</strong> {questionsCount} question{questionsCount > 1 ? 's' : ''}</p>
                <p><strong>Roasters :</strong> {watchedValues.feedbacksRequested || 2}</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Target Audiences */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Audience cible * (sélectionnez 1-2 audiences)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {targetAudiences.map((audience) => (
                <div
                  key={audience.id}
                  onClick={() => handleAudienceToggle(audience.id)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAudiences.includes(audience.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${selectedAudiences.length >= 2 && !selectedAudiences.includes(audience.id) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAudiences.includes(audience.id)}
                      onChange={() => {}} // Handled by div onClick
                      className="w-4 h-4 text-blue-600 rounded"
                      disabled={selectedAudiences.length >= 2 && !selectedAudiences.includes(audience.id)}
                    />
                    <span className="text-sm font-medium">{audience.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Choisissez qui sont vos utilisateurs cibles</span>
              <span>{selectedAudiences.length}/2 sélectionnées</span>
            </div>
            {errors.targetAudienceIds && (
              <p className="text-red-500 text-sm">{errors.targetAudienceIds.message}</p>
            )}
          </div>

          {/* Custom Target Audience */}
          <div className="space-y-2">
            <label htmlFor="customAudience" className="text-sm font-medium">
              Audience personnalisée (optionnel)
            </label>
            <input
              id="customAudience"
              type="text"
              placeholder="Ex: Développeurs iOS avec plus de 5 ans d'expérience"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setValue('customTargetAudience', { name: value });
                } else {
                  setValue('customTargetAudience', undefined);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Si aucune audience prédéfinie ne correspond exactement
            </p>
          </div>

          {/* Deadline (Optional) */}
          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              Date limite souhaitée (optionnel)
            </label>
            <input
              id="deadline"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('deadline', { 
                valueAsDate: true,
                setValueAs: (value) => value ? new Date(value) : undefined 
              })}
            />
            <p className="text-xs text-muted-foreground">
              Les roasters essaieront de respecter cette échéance
            </p>
          </div>

          {/* Final confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">🚀 Prêt à publier</h4>
            <p className="text-sm text-green-700">
              Votre roast sera {watchedValues.isUrgent ? 'publié immédiatement' : 'mis en collecte de candidatures pendant 24h'}.
              Les roasters recevront une notification et pourront postuler.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}