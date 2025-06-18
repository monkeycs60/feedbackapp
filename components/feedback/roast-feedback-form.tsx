"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Star, MessageSquare, Euro, CheckCircle } from "lucide-react";
import { createFeedback } from "@/lib/actions/feedback";
import { PRICING } from "@/lib/types/roast-request";

// Schéma basé sur les réponses aux questions
const feedbackSchema = z.object({
  questionResponses: z.record(z.string(), z.string().min(10, "Réponse trop courte (min 10 caractères)")),
  generalFeedback: z.string().min(50, "Feedback général trop court (min 50 caractères)"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface RoastQuestion {
  id: string;
  domain: string;
  text: string;
  order: number;
  isDefault: boolean;
}

interface RoastFeedbackFormProps {
  roastRequest: {
    id: string;
    title: string;
    maxPrice: number;
    focusAreas: string[];
    questions: RoastQuestion[];
  };
  existingFeedback?: {
    id: string;
    generalFeedback: string;
    screenshots: string[];
    finalPrice: number;
    status: string;
    createdAt: Date;
    questionResponses: Array<{
      id: string;
      questionId: string;
      response: string;
      createdAt: Date;
    }>;
  } | null;
}

export function RoastFeedbackForm({ roastRequest, existingFeedback }: RoastFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isCompleted = existingFeedback?.status === 'completed';

  // Fonction pour récupérer la réponse à une question spécifique
  const getQuestionResponse = (questionId: string): string => {
    if (!existingFeedback?.questionResponses) return '';
    const response = existingFeedback.questionResponses.find(qr => qr.questionId === questionId);
    return response?.response || '';
  };

  // Calculer le prix automatiquement basé sur la grille tarifaire
  const calculatePrice = () => {
    const domainsPrice = roastRequest.focusAreas.length * PRICING.DOMAIN_PRICE;
    const additionalQuestionsPrice = roastRequest.questions.filter(q => !q.isDefault).length * PRICING.ADDITIONAL_QUESTION;
    return domainsPrice + additionalQuestionsPrice;
  };

  const finalPrice = calculatePrice();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      questionResponses: {},
      generalFeedback: "",
    }
  });

  const questionResponses = form.watch("questionResponses") || {};
  const generalFeedback = form.watch("generalFeedback") || "";

  // Grouper les questions par domaine
  const questionsByDomain = roastRequest.focusAreas.reduce((acc, domain) => {
    const domainQuestions = roastRequest.questions
      .filter(q => q.domain === domain)
      .sort((a, b) => a.order - b.order);
    acc[domain] = domainQuestions;
    return acc;
  }, {} as Record<string, RoastQuestion[]>);

  // Compter les réponses complétées
  const totalQuestions = roastRequest.questions.length;
  const completedResponses = Object.values(questionResponses).filter(response => response && response.length >= 10).length;

  const onSubmit = async (data: FeedbackFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser la nouvelle structure avec réponses par questions
      await createFeedback({
        roastRequestId: roastRequest.id,
        questionResponses: data.questionResponses,
        generalFeedback: data.generalFeedback,
        finalPrice: finalPrice,
      });
      // La redirection est gérée dans l'action
    } catch (error) {
      console.error("Erreur:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Si le feedback est déjà terminé, afficher les questions avec les réponses
  if (isCompleted) {
    const questionsByDomain = roastRequest.focusAreas.reduce((acc, domain) => {
      const domainQuestions = roastRequest.questions
        .filter(q => q.domain === domain)
        .sort((a, b) => a.order - b.order);
      acc[domain] = domainQuestions;
      return acc;
    }, {} as Record<string, RoastQuestion[]>);

    return (
      <div className="space-y-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Feedback terminé
            </CardTitle>
            <p className="text-sm text-gray-600">
              Votre feedback a été soumis avec succès
            </p>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <Euro className="w-3 h-3 mr-1" />
                {existingFeedback?.finalPrice || finalPrice}€ gagné
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Statut: Terminé
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Soumis le {existingFeedback ? new Date(existingFeedback.createdAt).toLocaleDateString('fr-FR') : 'aujourd\'hui'}
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Merci pour votre feedback détaillé ! Le créateur pourra maintenant consulter vos réponses et améliorer son application.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Affichage des questions avec réponses */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Vos réponses</h3>
          
          {/* Feedback général */}
          {existingFeedback?.generalFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Feedback général et recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {existingFeedback.generalFeedback}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {Object.entries(questionsByDomain).map(([domain, questions]) => (
            <Card key={domain}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {domain}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {questions.length} question{questions.length > 1 ? 's' : ''} traitée{questions.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{question.text}</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="whitespace-pre-wrap text-sm text-gray-700">
                            {existingFeedback ? (
                              getQuestionResponse(question.id) || (
                                <div className="text-gray-400 italic">
                                  Aucune réponse fournie pour cette question
                                </div>
                              )
                            ) : (
                              <div className="text-gray-400 italic">
                                Réponse non disponible
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Créer votre feedback
        </CardTitle>
        <p className="text-sm text-gray-600">
          Répondez aux questions spécifiques du créateur
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Euro className="w-3 h-3 mr-1" />
            {finalPrice}€ (prix automatique)
          </Badge>
          <Badge variant="secondary">
            {completedResponses}/{totalQuestions} réponses
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Questions par domaine */}
          <div className="space-y-8">
            {roastRequest.focusAreas.map((domain) => {
              const domainQuestions = questionsByDomain[domain] || [];
              if (domainQuestions.length === 0) return null;

              // Couleurs pour différencier les domaines
              const domainColors = {
                UX: 'from-purple-500 to-purple-600',
                Onboarding: 'from-blue-500 to-blue-600', 
                Pricing: 'from-green-500 to-green-600',
                Performance: 'from-orange-500 to-orange-600',
                Marketing: 'from-pink-500 to-pink-600',
                Development: 'from-indigo-500 to-indigo-600',
                Business: 'from-teal-500 to-teal-600',
                Technical: 'from-gray-500 to-gray-600',
                Copy: 'from-yellow-500 to-yellow-600',
                Mobile: 'from-red-500 to-red-600'
              };
              
              const gradientClass = domainColors[domain as keyof typeof domainColors] || 'from-gray-500 to-gray-600';

              return (
                <div key={domain} className="space-y-4">
                  {/* Header du domaine */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${gradientClass} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {domain.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{domain}</h3>
                      <p className="text-sm text-gray-500">
                        {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''} à traiter
                      </p>
                    </div>
                  </div>

                  {/* Questions du domaine */}
                  <div className="space-y-4 pl-11">
                    {domainQuestions.map((question, questionIndex) => {
                      const fieldName = `questionResponses.${question.id}`;
                      const response = questionResponses[question.id] || "";

                      return (
                        <div key={question.id} className="space-y-2">
                          <Label htmlFor={fieldName} className="text-sm font-medium flex items-start gap-2">
                            <span className={`flex-shrink-0 w-6 h-6 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                              {questionIndex + 1}
                            </span>
                            <span className="flex-1">{question.text}</span>
                            {!question.isDefault && (
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2">
                                +1€
                              </Badge>
                            )}
                          </Label>
                          <Textarea
                            id={fieldName}
                            value={response}
                            onChange={(e) => form.setValue(`questionResponses.${question.id}`, e.target.value)}
                            placeholder="Votre réponse détaillée..."
                            rows={3}
                            className="resize-none"
                          />
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">
                              Minimum 10 caractères
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {response.length} caractères
                              </span>
                              {response.length >= 10 && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          {form.formState.errors.questionResponses?.[question.id] && (
                            <p className="text-red-500 text-sm">
                              {form.formState.errors.questionResponses[question.id]?.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback général */}
          <div className="space-y-3 pt-6 border-t">
            <Label htmlFor="generalFeedback" className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback général et recommandations
            </Label>
            <p className="text-sm text-gray-600">
              Synthèse globale, points d&apos;amélioration prioritaires et recommandations stratégiques
            </p>
            <Textarea
              id="generalFeedback"
              {...form.register("generalFeedback")}
              placeholder="Ex: Globalement, l'application a un bon potentiel mais souffre de problèmes de navigation. Je recommande de..."
              rows={5}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimum 50 caractères pour un feedback de qualité</span>
              <span>{generalFeedback.length} caractères</span>
            </div>
            {form.formState.errors.generalFeedback && (
              <p className="text-red-500 text-sm">{form.formState.errors.generalFeedback.message}</p>
            )}
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Résumé de votre feedback
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questions répondues :</span>
                <span className="font-medium">{completedResponses}/{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Domaines couverts :</span>
                <span className="font-medium">{roastRequest.focusAreas.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions personnalisées :</span>
                <span className="font-medium">{roastRequest.questions.filter(q => !q.isDefault).length}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span>Tarif automatique :</span>
                  <span className="text-green-600">{finalPrice}€</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {roastRequest.focusAreas.length} domaines × 2€ + {roastRequest.questions.filter(q => !q.isDefault).length} questions custom × 1€
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || completedResponses < totalQuestions || generalFeedback.length < 50}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? "Envoi en cours..." : 
             completedResponses < totalQuestions ? `Complétez toutes les questions (${completedResponses}/${totalQuestions})` :
             generalFeedback.length < 50 ? "Ajoutez votre feedback général" :
             "Soumettre le feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}