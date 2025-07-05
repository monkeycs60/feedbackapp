"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Zap,
  Target
} from "lucide-react";
import { createFeedback, structuredFeedbackSchema, type StructuredFeedbackData } from "@/lib/actions/feedback";

interface StructuredFeedbackFormProps {
  roastRequest: {
    id: string;
    title: string;
    maxPrice: number;
    basePriceMode?: number | null;
  };
  existingFeedback?: {
    id: string;
    globalRating: number;
    firstImpression: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    uxUiRating: number;
    valueRating: number;
    performanceRating: number;
    experienceRating: number;
    additionalComments?: string;
    finalPrice: number;
    status: string;
    createdAt: Date;
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
    if (value.length > minItems) {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, newValue: string) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {value.filter(item => item.trim().length > 0).length}/{minItems}-{maxItems}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {value.length > minItems && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="shrink-0 px-2"
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
            Ajouter un élément
          </Button>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export function StructuredFeedbackForm({ roastRequest, existingFeedback }: StructuredFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isCompleted = existingFeedback?.status === 'completed';
  const finalPrice = roastRequest.basePriceMode || 3;

  const form = useForm<StructuredFeedbackData>({
    resolver: zodResolver(structuredFeedbackSchema),
    defaultValues: {
      roastRequestId: roastRequest.id,
      globalRating: existingFeedback?.globalRating || 3,
      firstImpression: existingFeedback?.firstImpression || "",
      strengths: existingFeedback?.strengths || ["", ""],
      weaknesses: existingFeedback?.weaknesses || [""],
      recommendations: existingFeedback?.recommendations || [""],
      uxUiRating: existingFeedback?.uxUiRating || 3,
      valueRating: existingFeedback?.valueRating || 3,
      performanceRating: existingFeedback?.performanceRating || 3,
      experienceRating: existingFeedback?.experienceRating || 3,
      additionalComments: existingFeedback?.additionalComments || "",
      finalPrice: finalPrice,
    }
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;
  const watchedValues = watch();

  const onSubmit = async (data: StructuredFeedbackData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...data,
        strengths: data.strengths.filter(s => s.trim().length > 0),
        weaknesses: data.weaknesses.filter(w => w.trim().length > 0),
        recommendations: data.recommendations.filter(r => r.trim().length > 0),
      };

      await createFeedback(cleanedData);
      // La redirection est gérée dans l'action
    } catch (error) {
      console.error("Erreur:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Si le feedback est déjà terminé, afficher le mode lecture
  if (isCompleted && existingFeedback) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Feedback terminé
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <Euro className="w-3 h-3 mr-1" />
                {existingFeedback.finalPrice}€ gagné
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Statut: Terminé
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Affichage du feedback structuré */}
        <div className="space-y-6">
          {/* Note globale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Note globale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-5 h-5 ${
                        rating <= existingFeedback.globalRating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-lg">{existingFeedback.globalRating}/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Première impression */}
          <Card>
            <CardHeader>
              <CardTitle>Première impression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700">{existingFeedback.firstImpression}</p>
              </div>
            </CardContent>
          </Card>

          {/* Points forts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Points forts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {existingFeedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Points faibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Points d'amélioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {existingFeedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recommandations prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {existingFeedback.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs mt-0.5 shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Notes détaillées */}
          <Card>
            <CardHeader>
              <CardTitle>Évaluation détaillée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">UX/UI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-4 h-4 ${
                            rating <= existingFeedback.uxUiRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{existingFeedback.uxUiRating}/5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Proposition de valeur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-4 h-4 ${
                            rating <= existingFeedback.valueRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{existingFeedback.valueRating}/5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Performance & Fiabilité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-4 h-4 ${
                            rating <= existingFeedback.performanceRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{existingFeedback.performanceRating}/5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Expérience globale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-4 h-4 ${
                            rating <= existingFeedback.experienceRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{existingFeedback.experienceRating}/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commentaires additionnels */}
          {existingFeedback.additionalComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Commentaires additionnels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{existingFeedback.additionalComments}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Feedback structuré
        </CardTitle>
        <p className="text-sm text-gray-600">
          Évaluez l'application avec notre formulaire guidé
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Euro className="w-3 h-3 mr-1" />
            {finalPrice}€
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Nouveau format
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Note globale */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Note globale
            </h3>
            <StarRating
              value={watchedValues.globalRating}
              onChange={(value) => setValue('globalRating', value)}
              label="Notez votre expérience générale"
              description="Votre impression d'ensemble de l'application"
            />
          </div>

          {/* Première impression */}
          <div className="space-y-3">
            <Label htmlFor="firstImpression" className="text-base font-medium">
              Première impression
            </Label>
            <p className="text-sm text-gray-600">
              Décrivez votre première réaction en ouvrant l'app (20-300 caractères)
            </p>
            <Textarea
              id="firstImpression"
              {...form.register("firstImpression")}
              placeholder="Ex: L'interface est moderne et intuitive, j'ai immédiatement compris le concept..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>20-300 caractères</span>
              <span>{watchedValues.firstImpression?.length || 0} caractères</span>
            </div>
            {errors.firstImpression && (
              <p className="text-red-500 text-sm">{errors.firstImpression.message}</p>
            )}
          </div>

          {/* Points forts */}
          <MultiInputField
            label="Points forts"
            description="Les 2-5 aspects que vous avez le plus appréciés"
            placeholder="Ex: Design moderne et épuré"
            value={watchedValues.strengths}
            onChange={(value) => setValue('strengths', value)}
            minItems={2}
            maxItems={5}
            error={errors.strengths?.message}
          />

          {/* Points faibles */}
          <MultiInputField
            label="Points d'amélioration"
            description="Les 1-5 principaux problèmes rencontrés"
            placeholder="Ex: Navigation confuse dans le menu"
            value={watchedValues.weaknesses}
            onChange={(value) => setValue('weaknesses', value)}
            minItems={1}
            maxItems={5}
            error={errors.weaknesses?.message}
          />

          {/* Recommandations */}
          <MultiInputField
            label="Recommandations prioritaires"
            description="Vos 1-3 suggestions d'amélioration les plus importantes"
            placeholder="Ex: Ajouter un onboarding pour les nouveaux utilisateurs"
            value={watchedValues.recommendations}
            onChange={(value) => setValue('recommendations', value)}
            minItems={1}
            maxItems={3}
            error={errors.recommendations?.message}
          />

          {/* Notes détaillées */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Évaluation détaillée</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarRating
                value={watchedValues.uxUiRating}
                onChange={(value) => setValue('uxUiRating', value)}
                label="🎨 UX/UI"
                description="Design, ergonomie et facilité d'utilisation"
              />
              
              <StarRating
                value={watchedValues.valueRating}
                onChange={(value) => setValue('valueRating', value)}
                label="💎 Proposition de valeur"
                description="Utilité, pertinence et réponse au besoin"
              />
              
              <StarRating
                value={watchedValues.performanceRating}
                onChange={(value) => setValue('performanceRating', value)}
                label="⚡ Performance & Fiabilité"
                description="Rapidité, stabilité et absence de bugs"
              />
              
              <StarRating
                value={watchedValues.experienceRating}
                onChange={(value) => setValue('experienceRating', value)}
                label="🎯 Expérience globale"
                description="Satisfaction générale et recommandation"
              />
            </div>
          </div>

          {/* Commentaires additionnels */}
          <div className="space-y-3">
            <Label htmlFor="additionalComments" className="text-base font-medium">
              Commentaires additionnels (optionnel)
            </Label>
            <p className="text-sm text-gray-600">
              Autres remarques ou contexte particulier
            </p>
            <Textarea
              id="additionalComments"
              {...form.register("additionalComments")}
              placeholder="Ex: J'ai testé l'app sur mobile et desktop, voici mes observations..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Résumé de votre feedback
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Note globale :</span>
                <span className="font-medium">{watchedValues.globalRating}/5 ⭐</span>
              </div>
              <div className="flex justify-between">
                <span>Points forts :</span>
                <span className="font-medium">{watchedValues.strengths.filter(s => s.trim()).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Points d'amélioration :</span>
                <span className="font-medium">{watchedValues.weaknesses.filter(w => w.trim()).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Recommandations :</span>
                <span className="font-medium">{watchedValues.recommendations.filter(r => r.trim()).length}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span>Rémunération :</span>
                  <span className="text-green-600">{finalPrice}€</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? "Envoi en cours..." : "Soumettre le feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}