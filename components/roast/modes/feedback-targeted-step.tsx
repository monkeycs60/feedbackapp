'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Target, 
  Lightbulb,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PricingCalculator } from '../pricing-calculator';

interface Question {
  id: string;
  text: string;
  order: number;
}

interface FeedbackTargetedStepProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  roasterCount: number;
  className?: string;
}

export function FeedbackTargetedStep({
  questions,
  onQuestionsChange,
  roasterCount,
  className = ""
}: FeedbackTargetedStepProps) {
  const [newQuestionText, setNewQuestionText] = useState('');

  const addQuestion = () => {
    if (newQuestionText.trim()) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: newQuestionText.trim(),
        order: questions.length
      };
      onQuestionsChange([...questions, newQuestion]);
      setNewQuestionText('');
    }
  };

  const removeQuestion = (questionId: string) => {
    onQuestionsChange(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, newText: string) => {
    onQuestionsChange(
      questions.map(q => 
        q.id === questionId ? { ...q, text: newText } : q
      )
    );
  };

  const suggestedQuestions = [
    "Comment améliorer l'onboarding pour les nouveaux utilisateurs ?",
    "Le pricing est-il clair et attractif ?",
    "Quels sont les points de friction dans le parcours utilisateur ?",
    "Comment simplifier l'interface sans perdre de fonctionnalités ?",
    "Que manque-t-il pour vous convaincre de payer ?",
    "L'app résout-elle un vrai problème pour vous ?",
    "Comment améliorer la performance et la vitesse ?",
    "Quelles fonctionnalités vous semblent inutiles ?"
  ];

  const addSuggestedQuestion = (questionText: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      order: questions.length
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🔍</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Feedback Ciblé
              </h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Target className="w-3 h-3 mr-1" />
                Questions personnalisées
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez vos propres questions pour obtenir des réponses précises 
            sur les aspects qui vous intéressent le plus.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Left: Question Builder */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vos questions ({questions.length})</span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.max(0, questions.length - 2)} payantes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new question */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Écrivez votre question..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addQuestion();
                        }
                      }}
                    />
                    <Button 
                      onClick={addQuestion}
                      disabled={!newQuestionText.trim()}
                      size="sm"
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Soyez spécifique pour obtenir des réponses utiles. 
                    Appuyez sur Entrée pour ajouter.
                  </p>
                </div>

                {/* Questions list */}
                {questions.length > 0 && (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-2 shrink-0">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                        </div>
                        
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          className="resize-none bg-white"
                          rows={2}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="shrink-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {questions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Commencez par ajouter votre première question</p>
                  </div>
                )}

                {/* Free questions indicator */}
                {questions.length <= 2 && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <strong>2 questions offertes !</strong> 
                      {questions.length === 0 && " Vous pouvez ajouter 2 questions gratuitement."}
                      {questions.length === 1 && " Vous pouvez encore ajouter 1 question gratuite."}
                      {questions.length === 2 && " Les questions suivantes coûtent 0.25€ chacune."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Suggested questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Questions suggérées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestedQuestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-3 whitespace-normal"
                      onClick={() => addSuggestedQuestion(suggestion)}
                    >
                      <Plus className="w-3 h-3 mr-2 shrink-0" />
                      <span className="text-xs">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Pricing & Tips */}
          <div className="space-y-4">
            <PricingCalculator
              mode="TARGETED"
              questionCount={questions.length}
              roasterCount={roasterCount}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Conseils
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">✅ Bonnes questions :</p>
                  <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                    <li>• Spécifiques et actionnables</li>
                    <li>• Focalisées sur un problème</li>
                    <li>• Demandent des suggestions concrètes</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">❌ À éviter :</p>
                  <ul className="space-y-1 text-xs text-muted-foreground ml-3">
                    <li>• Questions trop générales</li>
                    <li>• Questions fermées (oui/non)</li>
                    <li>• Plus de 8 questions (fatigue)</li>
                  </ul>
                </div>

                <Alert>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Les roasters répondront à toutes vos questions</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDescription className="text-xs">
                    <strong>Astuce :</strong> 3-5 questions bien choisies 
                    donnent de meilleurs résultats que 10 questions générales.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exemple de réponse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-800 mb-1">
                    Q: "Comment améliorer l'onboarding ?"
                  </p>
                  <p className="text-xs text-blue-700">
                    "L'onboarding est trop long. Je suggère : 1) Réduire à 3 étapes max, 
                    2) Ajouter une barre de progression, 3) Permettre de passer les étapes optionnelles."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}