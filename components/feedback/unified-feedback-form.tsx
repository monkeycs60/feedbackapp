"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Star, 
  MessageSquare, 
  Euro, 
  CheckCircle, 
  Plus, 
  X,
  Heart,
  TrendingUp,
  Target,
  Info
} from "lucide-react";
import { createFeedback } from "@/lib/actions/feedback";
import { z } from "zod";

// Form-specific schema that matches the UI
const formFeedbackSchema = z.object({
  globalRating: z.number().min(1).max(5),
  firstImpression: z.string().min(10, "L'impression doit faire au moins 10 caractères"),
  strengths: z.array(z.string().min(1)).min(1, "Au moins un point fort requis"),
  weaknesses: z.array(z.string().min(1)).min(1, "Au moins un point faible requis"), 
  recommendations: z.array(z.string().min(1)).min(1, "Au moins une recommandation requise"),
  uxUiRating: z.number().min(1).max(5),
  valueRating: z.number().min(1).max(5),
  performanceRating: z.number().min(1).max(5),
  experienceRating: z.number().min(1).max(5),
  additionalComments: z.string().optional(),
  // Form uses Record format for easier form handling
  questionResponses: z.record(z.string(), z.string().min(10, "Réponse trop courte")).optional(),
});

type FormFeedbackData = z.infer<typeof formFeedbackSchema>;

interface RoastQuestion {
  id: string;
  domain: string;
  text: string;
  order: number;
}

interface UnifiedFeedbackFormProps {
  roastRequest: {
    id: string;
    title: string;
    pricePerRoaster?: number | null;
    maxPrice: number; // fallback
    questions: RoastQuestion[];
  };
  existingFeedback?: {
    id: string;
    globalRating?: number | null;
    firstImpression?: string | null;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    uxUiRating?: number | null;
    valueRating?: number | null;
    performanceRating?: number | null;
    experienceRating?: number | null;
    additionalComments?: string | null;
    finalPrice: number;
    status: string;
    createdAt: Date;
    questionResponses: Array<{
      id: string;
      questionId: string;
      response: string;
    }>;
  } | null;
}

const StarRating = ({ value, onChange, label, description }: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description: string;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="secondary" className="text-xs">
          {value}/5
        </Badge>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-6 h-6 ${
              rating <= value 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-300'
            } transition-colors`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
};

const MultiInputField = ({ 
  label, 
  description, 
  placeholder, 
  value, 
  onChange, 
  minItems, 
  maxItems, 
  error 
}: {
  label: string;
  description: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  minItems: number;
  maxItems: number;
  error?: string;
}) => {
  const addItem = () => {
    if (value.length < maxItems) {
      onChange([...value, ""]);
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              className="flex-1"
            />
            {value.length > minItems && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        
        {value.length < maxItems && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter {label.toLowerCase()}
          </Button>
        )}
      </div>
    </div>
  );
};

export function UnifiedFeedbackForm({ roastRequest, existingFeedback }: UnifiedFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isCompleted = existingFeedback?.status === 'completed';
  const finalPrice = roastRequest.pricePerRoaster || Math.round(roastRequest.maxPrice / 1); // fallback

  // Grouper les questions par domaine
  const questionsByDomain = roastRequest.questions.reduce((acc, question) => {
    if (!acc[question.domain]) {
      acc[question.domain] = [];
    }
    acc[question.domain].push(question);
    return acc;
  }, {} as Record<string, RoastQuestion[]>);

  // Trier les questions par ordre
  Object.keys(questionsByDomain).forEach(domain => {
    questionsByDomain[domain].sort((a, b) => a.order - b.order);
  });

  const form = useForm<FormFeedbackData>({
    resolver: zodResolver(formFeedbackSchema),
    defaultValues: {
      globalRating: existingFeedback?.globalRating || 4,
      firstImpression: existingFeedback?.firstImpression || "",
      strengths: existingFeedback?.strengths?.length > 0 ? existingFeedback.strengths : ["", ""],
      weaknesses: existingFeedback?.weaknesses?.length > 0 ? existingFeedback.weaknesses : [""],
      recommendations: existingFeedback?.recommendations?.length > 0 ? existingFeedback.recommendations : [""],
      uxUiRating: existingFeedback?.uxUiRating || 4,
      valueRating: existingFeedback?.valueRating || 4,
      performanceRating: existingFeedback?.performanceRating || 4,
      experienceRating: existingFeedback?.experienceRating || 4,
      additionalComments: existingFeedback?.additionalComments || "",
      questionResponses: existingFeedback?.questionResponses?.reduce((acc, qr) => {
        acc[qr.questionId] = qr.response;
        return acc;
      }, {} as Record<string, string>) || {},
    }
  });

  const onSubmit = async (data: FormFeedbackData) => {
    console.log("Form submission started", data);
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert questionResponses from Record<string, string> to array format
      const questionResponsesArray = data.questionResponses ? 
        Object.entries(data.questionResponses)
          .filter(([, response]) => response.trim())
          .map(([questionId, response]) => ({ questionId, response })) : 
        [];

      const submissionData = {
        ...data,
        roastRequestId: roastRequest.id,
        finalPrice: finalPrice,
        // Filter out empty strings for better data quality
        strengths: data.strengths.filter(s => s.trim()),
        weaknesses: data.weaknesses.filter(w => w.trim()),
        recommendations: data.recommendations.filter(r => r.trim()),
        // Convert question responses to expected format
        questionResponses: questionResponsesArray,
        // Add missing fields
        screenshots: [],
        generalFeedback: "", // Not used in new system but required by schema
      };
      
      console.log("Submitting data:", submissionData);
      await createFeedback(submissionData);
      console.log("Feedback created successfully");
    } catch (error) {
      console.error("Erreur:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted && existingFeedback) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Feedback complété</strong> - Merci pour votre contribution !
          </AlertDescription>
        </Alert>

        {/* Feedback structuré */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Feedback structuré
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Note globale</Label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-5 h-5 ${
                        rating <= (existingFeedback.globalRating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {existingFeedback.globalRating}/5
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Prix final</Label>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-1 mt-1">
                  <Euro className="w-4 h-4" />
                  {existingFeedback.finalPrice}€
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Première impression</Label>
              <p className="mt-1 text-sm text-gray-700">{existingFeedback.firstImpression}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Points forts
                </Label>
                <ul className="mt-2 space-y-1">
                  {existingFeedback.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Label className="text-sm font-medium text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Points à améliorer
                </Label>
                <ul className="mt-2 space-y-1">
                  {existingFeedback.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-blue-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Recommandations
              </Label>
              <ul className="mt-2 space-y-1">
                {existingFeedback.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {existingFeedback.additionalComments && (
              <div>
                <Label className="text-sm font-medium">Commentaires additionnels</Label>
                <p className="mt-1 text-sm text-gray-700">{existingFeedback.additionalComments}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions personnalisées */}
        {Object.keys(questionsByDomain).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Questions personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(questionsByDomain).map(([domain, questions]) => (
                <div key={domain}>
                  <h4 className="font-medium text-sm text-gray-700 mb-3 uppercase tracking-wide">
                    {domain}
                  </h4>
                  <div className="space-y-4">
                    {questions.map((question) => {
                      const response = existingFeedback.questionResponses.find(
                        qr => qr.questionId === question.id
                      );
                      return (
                        <div key={question.id} className="border-l-2 border-gray-200 pl-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {question.text}
                          </p>
                          <p className="text-sm text-gray-600">
                            {response?.response || "Pas de réponse"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
      console.log("Form validation errors:", errors);
      setError("Veuillez corriger les erreurs dans le formulaire");
    })} className="space-y-6">
      {/* Informations */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Nouveau système unifié :</strong> Chaque feedback comprend automatiquement une évaluation structurée 
          {roastRequest.questions.length > 0 && ` + ${roastRequest.questions.length} questions personnalisées`}.
          Rémunération : <strong>{finalPrice}€</strong>
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Feedback structuré de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Évaluation structurée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note globale */}
          <StarRating
            value={form.watch("globalRating")}
            onChange={(value) => form.setValue("globalRating", value)}
            label="Note globale"
            description="Votre impression générale de l'application"
          />

          {/* Première impression */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Première impression</Label>
            <p className="text-xs text-gray-600">
              Décrivez votre première impression en découvrant l'application (20-300 caractères)
            </p>
            <Textarea
              {...form.register("firstImpression")}
              placeholder="Ma première impression en découvrant cette application..."
              className="min-h-[80px]"
              maxLength={300}
            />
            <div className="text-xs text-gray-500 text-right">
              {form.watch("firstImpression")?.length || 0}/300
            </div>
            {form.formState.errors.firstImpression && (
              <p className="text-xs text-red-500">{form.formState.errors.firstImpression.message}</p>
            )}
          </div>

          {/* Points forts */}
          <MultiInputField
            label="Points forts"
            description="Listez les aspects positifs de l'application (2-5 points)"
            placeholder="Point fort"
            value={form.watch("strengths")}
            onChange={(value) => form.setValue("strengths", value)}
            minItems={2}
            maxItems={5}
            error={form.formState.errors.strengths?.message}
          />

          {/* Points faibles */}
          <MultiInputField
            label="Points à améliorer"
            description="Identifiez les aspects qui mériteraient d'être améliorés (1-5 points)"
            placeholder="Point à améliorer"
            value={form.watch("weaknesses")}
            onChange={(value) => form.setValue("weaknesses", value)}
            minItems={1}
            maxItems={5}
            error={form.formState.errors.weaknesses?.message}
          />

          {/* Recommandations */}
          <MultiInputField
            label="Recommandations"
            description="Donnez des suggestions concrètes d'amélioration (1-3 recommandations)"
            placeholder="Recommandation concrète"
            value={form.watch("recommendations")}
            onChange={(value) => form.setValue("recommendations", value)}
            minItems={1}
            maxItems={3}
            error={form.formState.errors.recommendations?.message}
          />

          {/* Notes détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StarRating
              value={form.watch("uxUiRating")}
              onChange={(value) => form.setValue("uxUiRating", value)}
              label="UX/UI Design"
              description="Ergonomie et facilité d'utilisation"
            />
            
            <StarRating
              value={form.watch("valueRating")}
              onChange={(value) => form.setValue("valueRating", value)}
              label="Proposition de valeur"
              description="Utilité, pertinence et réponse au besoin"
            />
            
            <StarRating
              value={form.watch("performanceRating")}
              onChange={(value) => form.setValue("performanceRating", value)}
              label="Performance & Fiabilité"
              description="Rapidité, stabilité et absence de bugs"
            />
            
            <StarRating
              value={form.watch("experienceRating")}
              onChange={(value) => form.setValue("experienceRating", value)}
              label="Expérience globale"
              description="Satisfaction générale et recommandation"
            />
          </div>

          {/* Commentaires additionnels */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Commentaires additionnels (optionnel)</Label>
            <p className="text-xs text-gray-600">
              Ajoutez tout autre commentaire pertinent
            </p>
            <Textarea
              {...form.register("additionalComments")}
              placeholder="Commentaires supplémentaires..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions personnalisées */}
      {Object.keys(questionsByDomain).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Questions personnalisées ({roastRequest.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(questionsByDomain).map(([domain, questions]) => (
              <div key={domain}>
                <h4 className="font-medium text-sm text-gray-700 mb-3 uppercase tracking-wide border-b pb-1">
                  {domain}
                </h4>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {question.text}
                      </Label>
                      <Textarea
                        {...form.register(`questionResponses.${question.id}`)}
                        placeholder="Votre réponse détaillée..."
                        className="min-h-[100px]"
                      />
                      {form.formState.errors.questionResponses?.[question.id] && (
                        <p className="text-xs text-red-500">
                          {form.formState.errors.questionResponses[question.id]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Rémunération</p>
              <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                <Euro className="w-4 h-4" />
                {finalPrice}€
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                "Envoi en cours..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Soumettre le feedback
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}