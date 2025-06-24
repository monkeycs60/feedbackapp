'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings, 
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { FOCUS_AREAS, type FocusArea } from '@/lib/types/roast-request';
import { PricingCalculator } from '../pricing-calculator';

interface Question {
  id: string;
  text: string;
  domain: string;
  order: number;
  isDefault: boolean;
}

interface FeedbackStructuredStepProps {
  selectedDomains: FocusArea[];
  questions: Question[];
  onDomainsChange: (domains: FocusArea[]) => void;
  onQuestionsChange: (questions: Question[]) => void;
  roasterCount: number;
  className?: string;
}

export function FeedbackStructuredStep({
  selectedDomains,
  questions,
  onDomainsChange,
  onQuestionsChange,
  roasterCount,
  className = ""
}: FeedbackStructuredStepProps) {
  const [newQuestions, setNewQuestions] = useState<Record<string, string>>({});

  const toggleDomain = (domainId: FocusArea) => {
    if (selectedDomains.includes(domainId)) {
      // Remove domain and its questions
      onDomainsChange(selectedDomains.filter(d => d !== domainId));
      onQuestionsChange(questions.filter(q => q.domain !== domainId));
    } else {
      // Add domain with default questions
      onDomainsChange([...selectedDomains, domainId]);
      
      const domainConfig = FOCUS_AREAS.find(area => area.id === domainId);
      if (domainConfig?.questions) {
        const defaultQuestions: Question[] = domainConfig.questions.map((questionText, index) => ({
          id: `${domainId}-default-${index}`,
          text: questionText,
          domain: domainId,
          order: index,
          isDefault: true
        }));
        onQuestionsChange([...questions, ...defaultQuestions]);
      }
    }
  };

  const addCustomQuestion = (domain: string) => {
    const questionText = newQuestions[domain]?.trim();
    if (questionText) {
      const domainQuestions = questions.filter(q => q.domain === domain);
      const newQuestion: Question = {
        id: `${domain}-custom-${Date.now()}`,
        text: questionText,
        domain,
        order: domainQuestions.length,
        isDefault: false
      };
      onQuestionsChange([...questions, newQuestion]);
      setNewQuestions({ ...newQuestions, [domain]: '' });
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

  const getQuestionsForDomain = (domain: string) => {
    return questions.filter(q => q.domain === domain).sort((a, b) => a.order - b.order);
  };

  const totalQuestions = questions.length;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl">📋</span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Feedback Structuré
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Settings className="w-3 h-3 mr-1" />
              Organisé par domaines
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sélectionnez les domaines qui vous intéressent et personnalisez les questions 
          pour obtenir un feedback structuré et actionnable.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 max-w-7xl mx-auto">
        {/* Left: Domain Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Domaines d'expertise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FOCUS_AREAS.filter(area => area.id !== 'General').map((area) => {
              const isSelected = selectedDomains.includes(area.id);
              const domainQuestions = getQuestionsForDomain(area.id);
              
              return (
                <div
                  key={area.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleDomain(area.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => {}} // Handled by onClick on parent
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{area.icon}</span>
                        <span className="font-medium text-sm">{area.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {area.description}
                      </p>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Center: Questions by Domain */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDomains.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Sélectionnez au moins un domaine pour commencer
                </p>
              </CardContent>
            </Card>
          ) : (
            selectedDomains.map((domainId) => {
              const domain = FOCUS_AREAS.find(area => area.id === domainId);
              const domainQuestions = getQuestionsForDomain(domainId);
              
              if (!domain) return null;
              
              return (
                <Card key={domainId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">{domain.icon}</span>
                      <span>{domain.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Default questions */}
                    {domainQuestions.filter(q => q.isDefault).map((question, index) => (
                      <div key={question.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Défaut
                          </Badge>
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

                    {/* Custom questions */}
                    {domainQuestions.filter(q => !q.isDefault).map((question, index) => (
                      <div key={question.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 shrink-0">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {domainQuestions.filter(q => q.isDefault).length + index + 1}.
                          </span>
                        </div>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          className="resize-none"
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

                    {/* Add custom question */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={`Ajouter une question ${domain.label}...`}
                        value={newQuestions[domainId] || ''}
                        onChange={(e) => setNewQuestions({ 
                          ...newQuestions, 
                          [domainId]: e.target.value 
                        })}
                        className="resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addCustomQuestion(domainId);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => addCustomQuestion(domainId)}
                        disabled={!newQuestions[domainId]?.trim()}
                        size="sm"
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right: Pricing & Info */}
        <div className="space-y-4">
          <PricingCalculator
            mode="STRUCTURED"
            questionCount={totalQuestions}
            roasterCount={roasterCount}
          />

          {totalQuestions <= 2 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>2 questions offertes !</strong> 
                Les questions suivantes coûtent 0.20€ chacune.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Avantages du mode structuré</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-xs">Feedback organisé par expertise</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-xs">Questions optimisées par domaine</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-xs">Plus facile à analyser</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-xs">Roasters spécialisés par domaine</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                Comment ça marche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p>• Chaque domaine vient avec 2 questions par défaut</p>
              <p>• Vous pouvez modifier ou supprimer ces questions</p>
              <p>• Ajoutez vos propres questions par domaine</p>
              <p>• Les roasters répondent par section</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}