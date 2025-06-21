"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, X, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FOCUS_AREAS, PRICING, APP_CATEGORIES, type FocusArea, type SelectedDomain, type DomainQuestion } from '@/lib/types/roast-request';
import { createRoastRequest } from '@/lib/actions/roast-request';
import { getTargetAudiences, initializeTargetAudiences, createTargetAudience } from '@/lib/actions/target-audiences';
import { ImageUpload } from '@/components/ui/image-upload';

const formSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudienceId: z.string().min(1, "Sélectionne une audience cible"),
  customTargetAudience: z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caractères")
  }).optional(),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  coverImage: z.string().optional(),
  feedbacksRequested: z.number().min(1, "Au moins 1 feedback").max(20, "Maximum 20 feedbacks"),
  selectedDomains: z.array(z.object({
    id: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      text: z.string().min(5, "Question trop courte"),
      isDefault: z.boolean(),
      order: z.number()
    })).min(1, "Au moins 1 question par domaine")
  })).min(1, "Sélectionne au moins un domaine"),
  totalPrice: z.number().min(2),
  additionalContext: z.string().max(500).optional()
});

type FormData = z.infer<typeof formSchema>;

export function NewRoastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionIdCounter, setQuestionIdCounter] = useState(1);
  const [targetAudiences, setTargetAudiences] = useState<Array<{id: string; name: string}>>([]);
  const [showCustomAudience, setShowCustomAudience] = useState(false);
  const [isCreatingAudience, setIsCreatingAudience] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedDomains: [],
      totalPrice: 0,
      category: undefined,
      feedbacksRequested: 1
    }
  });

  const selectedDomains = form.watch('selectedDomains') || [];
  const description = form.watch('description') || '';
  const feedbacksRequested = form.watch('feedbacksRequested') || 1;
  const targetAudienceId = form.watch('targetAudienceId');

  // Load target audiences on mount
  useEffect(() => {
    async function loadAudiences() {
      // Initialize default audiences if needed
      await initializeTargetAudiences();
      // Load all audiences
      const audiences = await getTargetAudiences();
      setTargetAudiences(audiences);
    }
    loadAudiences();
  }, []);

  // Handle target audience selection
  useEffect(() => {
    setShowCustomAudience(targetAudienceId === 'custom');
  }, [targetAudienceId]);

  // Handle custom audience creation
  const handleCreateCustomAudience = async () => {
    const customAudienceName = form.watch('customTargetAudience.name');
    if (!customAudienceName || customAudienceName.trim().length < 2) {
      form.setError('customTargetAudience.name', {
        message: 'Le nom doit faire au moins 2 caractères'
      });
      return;
    }

    setIsCreatingAudience(true);
    try {
      const newAudience = await createTargetAudience({ name: customAudienceName.trim() });
      
      // Add to local list
      setTargetAudiences(prev => [newAudience, ...prev]);
      
      // Select the new audience
      form.setValue('targetAudienceId', newAudience.id);
      form.setValue('customTargetAudience.name', '');
      setShowCustomAudience(false);
      
    } catch (error) {
      console.error('Error creating audience:', error);
      form.setError('customTargetAudience.name', {
        message: 'Erreur lors de la création de l\'audience'
      });
    } finally {
      setIsCreatingAudience(false);
    }
  };

  // Calculer le prix total
  const calculatePrice = () => {
    const domainsPrice = selectedDomains.length * PRICING.DOMAIN_PRICE;
    const additionalQuestionsPrice = selectedDomains.reduce((total, domain) => {
      const additionalQuestions = domain.questions.filter(q => !q.isDefault).length;
      return total + additionalQuestions;
    }, 0) * PRICING.ADDITIONAL_QUESTION;
    const feedbacksPrice = (domainsPrice + additionalQuestionsPrice) * feedbacksRequested;
    form.setValue('totalPrice', feedbacksPrice);
    return feedbacksPrice;
  };

  const toggleDomain = (domainId: FocusArea) => {
    const isDomainAlreadySelected = selectedDomains.some(d => d.id === domainId);
    
    if (isDomainAlreadySelected) {
      // Désélectionner le domaine
      const updated = selectedDomains.filter(d => d.id !== domainId);
      form.setValue('selectedDomains', updated);
      calculatePrice();
    } else {
      // Sélectionner le domaine
      const focusArea = FOCUS_AREAS.find(area => area.id === domainId);
      if (focusArea) {
        const defaultQuestions: DomainQuestion[] = focusArea.questions.map((text, index) => ({
          id: `${domainId}-default-${index}`,
          text,
          isDefault: true,
          order: index
        }));
        
        const newDomain: SelectedDomain = {
          id: domainId,
          questions: defaultQuestions
        };
        
        const updated = [...selectedDomains, newDomain];
        form.setValue('selectedDomains', updated);
        calculatePrice();
      }
    }
  };

  const removeDomain = (domainId: FocusArea) => {
    const updated = selectedDomains.filter(d => d.id !== domainId);
    form.setValue('selectedDomains', updated);
    calculatePrice();
  };

  const addQuestion = (domainId: FocusArea) => {
    const updated = selectedDomains.map(domain => {
      if (domain.id === domainId) {
        const maxOrder = Math.max(...domain.questions.map(q => q.order), -1);
        const newQuestion: DomainQuestion = {
          id: `${domainId}-custom-${questionIdCounter}`,
          text: '',
          isDefault: false,
          order: maxOrder + 1
        };
        return {
          ...domain,
          questions: [...domain.questions, newQuestion]
        };
      }
      return domain;
    });
    form.setValue('selectedDomains', updated);
    setQuestionIdCounter(prev => prev + 1);
    calculatePrice();
  };

  const updateQuestion = (domainId: FocusArea, questionId: string, text: string) => {
    const updated = selectedDomains.map(domain => {
      if (domain.id === domainId) {
        return {
          ...domain,
          questions: domain.questions.map(q => 
            q.id === questionId ? { ...q, text } : q
          )
        };
      }
      return domain;
    });
    form.setValue('selectedDomains', updated);
  };

  const removeQuestion = (domainId: FocusArea, questionId: string) => {
    const updated = selectedDomains.map(domain => {
      if (domain.id === domainId) {
        const remainingQuestions = domain.questions.filter(q => q.id !== questionId);
        // Empêcher la suppression si c'est la dernière question
        if (remainingQuestions.length === 0) {
          return domain;
        }
        return {
          ...domain,
          questions: remainingQuestions
        };
      }
      return domain;
    });
    form.setValue('selectedDomains', updated);
    calculatePrice();
  };

  const reorderQuestions = (domainId: FocusArea, newQuestions: DomainQuestion[]) => {
    const updated = selectedDomains.map(domain => {
      if (domain.id === domainId) {
        // Mettre à jour les ordres
        const reorderedQuestions = newQuestions.map((q, index) => ({
          ...q,
          order: index
        }));
        
        return {
          ...domain,
          questions: reorderedQuestions
        };
      }
      return domain;
    });
    form.setValue('selectedDomains', updated);
  };

  const isSelected = (domainId: FocusArea) => {
    return selectedDomains.some(d => d.id === domainId);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Transformer les données pour correspondre à l'ancien format
      const transformedData = {
        ...data,
        focusAreas: data.selectedDomains.map(d => d.id),
        maxPrice: data.totalPrice,
        isUrgent: false, // Plus d'urgence
        selectedDomains: data.selectedDomains, // Envoyer aussi les domaines avec questions
        coverImage: data.coverImage,
        feedbacksRequested: data.feedbacksRequested
      };
      await createRoastRequest(transformedData);
      // La redirection est gérée dans l'action
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Étape 1: Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                Présente ton app
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de ta demande</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Ex: Feedback sur l'onboarding de mon SaaS de gestion"
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="appUrl">URL de ton app</Label>
                <Input
                  id="appUrl"
                  {...form.register('appUrl')}
                  placeholder="https://monapp.com"
                  type="url"
                  className="mt-1"
                />
                {form.formState.errors.appUrl && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.appUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select 
                  id="category"
                  {...form.register('category')} 
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Sélectionne une catégorie</option>
                  {APP_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label>Image de couverture (optionnel)</Label>
                <p className="text-sm text-gray-600 mb-2">Ajoute une capture d&apos;écran pour illustrer ton app</p>
                <ImageUpload
                  value={form.watch('coverImage')}
                  onChange={(url) => form.setValue('coverImage', url)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Étape 2: Description détaillée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                Contexte et objectifs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Description de ton app</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Décris ce que fait ton app, ses fonctionnalités principales, ce qui la rend unique..."
                  rows={4}
                  className="mt-1"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Min 50 caractères pour un feedback de qualité</span>
                  <span>{description.length}/1000</span>
                </div>
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <Label>Audience cible</Label>
                <Select
                  value={form.watch('targetAudienceId')}
                  onValueChange={(value) => form.setValue('targetAudienceId', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionne ton audience cible" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">+ Ajouter une nouvelle audience</SelectItem>
                    {targetAudiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.targetAudienceId && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.targetAudienceId.message}</p>
                )}
              </div>

              {/* Custom audience fields */}
              {showCustomAudience && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="customAudienceName">Nom de l'audience</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="customAudienceName"
                        placeholder="Ex: Agences SEO"
                        {...form.register('customTargetAudience.name')}
                        disabled={isCreatingAudience}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateCustomAudience}
                        disabled={isCreatingAudience}
                        size="sm"
                      >
                        {isCreatingAudience ? 'Création...' : 'Ajouter'}
                      </Button>
                    </div>
                    {form.formState.errors.customTargetAudience?.name && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.customTargetAudience.name.message}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Cette audience sera ajoutée à la liste pour tous les utilisateurs
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Étape 3: Sélection des domaines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                Domaines de feedback
              </CardTitle>
              <p className="text-sm text-gray-600">Sélectionne un ou plusieurs domaines (2€ par domaine)</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FOCUS_AREAS.map((area) => {
                  const selected = isSelected(area.id as FocusArea);
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleDomain(area.id as FocusArea)}
                      className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                        selected 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                          : 'border-dashed border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="absolute top-2 right-2">
                        <Badge variant={selected ? "default" : "secondary"}>
                          {selected ? "✓ 2€" : "2€"}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{area.icon}</span>
                        <div>
                          <div className="font-medium">{area.label}</div>
                          <div className="text-sm text-gray-600">{area.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.selectedDomains && (
                <p className="text-red-500 text-sm mt-2">{form.formState.errors.selectedDomains.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Étape 4: Questions par domaine */}
          {selectedDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  Questions par domaine
                </CardTitle>
                <p className="text-sm text-gray-600">Personnalise tes questions (+1€ par question supplémentaire)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedDomains.map((selectedDomain) => {
                  const domainInfo = FOCUS_AREAS.find(area => area.id === selectedDomain.id);
                  if (!domainInfo) return null;
                  
                  return (
                    <div key={selectedDomain.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{domainInfo.icon}</span>
                          <h4 className="font-medium">{domainInfo.label}</h4>
                          <Badge variant="secondary">2€</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDomain(selectedDomain.id as FocusArea)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Questions pour ce domaine */}
                      <div className="space-y-3">
                        <Reorder.Group 
                          axis="y" 
                          values={selectedDomain.questions.sort((a, b) => a.order - b.order)}
                          onReorder={(newQuestions) => reorderQuestions(selectedDomain.id as FocusArea, newQuestions)}
                          className="space-y-3"
                        >
                          {selectedDomain.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question) => (
                              <Reorder.Item 
                                key={question.id} 
                                value={question}
                                className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing ${
                                  question.isDefault ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <div className="relative">
                                  {!question.isDefault && (
                                    <div className="absolute top-0 right-0">
                                      <Badge variant="secondary" className="text-xs">+1€</Badge>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2 pr-8">
                                    <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                                    <div className="flex-1">
                                      <Input
                                        value={question.text}
                                        onChange={(e) => updateQuestion(selectedDomain.id as FocusArea, question.id, e.target.value)}
                                        placeholder="Écris ta question..."
                                        className="border-none bg-transparent p-0 text-sm focus:ring-0"
                                      />
                                    </div>
                                    {selectedDomain.questions.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(selectedDomain.id as FocusArea, question.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        {/* Bouton ajouter question */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(selectedDomain.id as FocusArea)}
                          className="w-full border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une question (+1€)
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Étape 5: Nombre de feedbacks */}
          {selectedDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  Nombre de feedbacks souhaités
                </CardTitle>
                <p className="text-sm text-gray-600">Plus de feedbacks = plus d&apos;opinions diverses et complètes</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="feedbacksRequested">
                    {feedbacksRequested} feedback{feedbacksRequested > 1 ? 's' : ''} demandé{feedbacksRequested > 1 ? 's' : ''}
                  </Label>
                  <input
                    id="feedbacksRequested"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={feedbacksRequested}
                    onChange={(e) => form.setValue('feedbacksRequested', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mt-2">
                    <div className="text-center">
                      <span className="font-medium">1-3</span>
                      <p>Feedback ciblé</p>
                    </div>
                    <div className="text-center">
                      <span className="font-medium">4-7</span>
                      <p>Consensus solide</p>
                    </div>
                    <div className="text-center">
                      <span className="font-medium">8-15</span>
                      <p>Vision complète</p>
                    </div>
                    <div className="text-center">
                      <span className="font-medium">16-20</span>
                      <p>Étude approfondie</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Avantages des feedbacks multiples :</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Diversité d&apos;expertise</strong> : UX, dev, business, marketing</li>
                    <li>• <strong>Points de consensus</strong> : Identifier les vrais problèmes</li>
                    <li>• <strong>Perspectives variées</strong> : Débutants vs experts</li>
                    <li>• <strong>Couverture complète</strong> : Aucun aspect oublié</li>
                  </ul>
                </div>
                
                {form.formState.errors.feedbacksRequested && (
                  <p className="text-red-500 text-sm">{form.formState.errors.feedbacksRequested.message}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/dashboard')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Publication...' : 'Publier la demande'}
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar - Facture */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Récapitulatif de commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {selectedDomains.length > 0 && (
                <div className="flex justify-between">
                  <span>Domaines ({selectedDomains.length})</span>
                  <span>{selectedDomains.length * PRICING.DOMAIN_PRICE}€</span>
                </div>
              )}

              {selectedDomains.reduce((total, domain) => total + domain.questions.filter(q => !q.isDefault).length, 0) > 0 && (
                <div className="flex justify-between">
                  <span>Questions supplémentaires ({selectedDomains.reduce((total, domain) => total + domain.questions.filter(q => !q.isDefault).length, 0)})</span>
                  <span>+{selectedDomains.reduce((total, domain) => total + domain.questions.filter(q => !q.isDefault).length, 0) * PRICING.ADDITIONAL_QUESTION}€</span>
                </div>
              )}

              {selectedDomains.length > 0 && feedbacksRequested > 1 && (
                <div className="flex justify-between">
                  <span>× {feedbacksRequested} feedbacks</span>
                  <span>×{feedbacksRequested}</span>
                </div>
              )}

              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{calculatePrice()}€</span>
              </div>
            </div>

            {/* Détails de ce qui est inclus */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Inclus dans votre commande:</h4>
              <ul className="text-sm space-y-1">
                {selectedDomains.map(domain => {
                  const domainInfo = FOCUS_AREAS.find(a => a.id === domain.id);
                  return domainInfo ? <li key={domain.id}>• Feedback {domainInfo.label}</li> : null;
                })}
                <li>• {selectedDomains.reduce((total, domain) => total + domain.questions.length, 0)} questions au total</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}