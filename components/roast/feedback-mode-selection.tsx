'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type FeedbackMode, FEEDBACK_MODES } from '@/lib/types/roast-request';
import { calculateRoastPricing } from '@/lib/utils/pricing';

interface FeedbackModeSelectionProps {
  selectedMode?: FeedbackMode;
  onModeSelect: (mode: FeedbackMode) => void;
  roasterCount?: number;
  className?: string;
}

export function FeedbackModeSelection({
  selectedMode,
  onModeSelect,
  roasterCount = 2,
  className = ""
}: FeedbackModeSelectionProps) {
  const [hoveredMode, setHoveredMode] = useState<FeedbackMode | null>(null);

  const getModeExample = (mode: FeedbackMode) => {
    switch (mode) {
      case 'FREE':
        return {
          description: 'Les roasters donnent leur impression générale de votre app sans questions spécifiques.',
          useCase: 'Parfait pour : Validation d\'idée, premiers retours, tests de concept',
          timeline: '⚡ Retours en 24-48h',
          questionCount: 0
        };
      case 'STRUCTURED':
        return {
          description: '3€ de base + 0,25€ par question. Questions organisées par domaines d\'expertise.',
          useCase: 'Parfait pour : Audit complet, amélioration globale, roadmap produit',
          timeline: '📋 Retours en 3-5 jours',
          questionCount: 0
        };
    }
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Quel type de feedback cherchez-vous ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choisissez le mode qui correspond le mieux à vos objectifs. 
            Vous pourrez toujours personnaliser ensuite.
          </p>
          
          {/* Pricing explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💰 Comment ça marche ?</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <strong>Mode FREE :</strong> Prix fixe 3€ par roaster - feedback libre uniquement</p>
              <p>• <strong>Mode STRUCTURED :</strong> 3€ par roaster + 0,25€ par question (pas de questions offertes)</p>
              <p>• <strong>Option urgence :</strong> +0,50€ par roaster pour traitement prioritaire</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          {(['FREE', 'STRUCTURED'] as FeedbackMode[]).map((mode) => {
            const config = FEEDBACK_MODES[mode];
            const example = getModeExample(mode);
            const calculation = calculateRoastPricing(mode, example.questionCount, roasterCount, false);
            const isSelected = selectedMode === mode;
            const isHovered = hoveredMode === mode;

            return (
              <Card
                key={mode}
                className={`cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-blue-500 border-blue-200 shadow-lg'
                    : 'hover:shadow-md hover:border-gray-300'
                } ${isHovered ? 'scale-[1.02]' : ''}`}
                onClick={() => onModeSelect(mode)}
                onMouseEnter={() => setHoveredMode(mode)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                )}

                {/* Popularity badge */}
                {mode === 'STRUCTURED' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{config.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {calculation.totalPrice.toFixed(0)}€
                          </Badge>
                          {example.questionCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {example.questionCount} questions
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {config.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {example.description}
                    </p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span>{example.useCase}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{example.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prix par roaster</span>
                      <span className="text-sm font-medium">
                        {calculation.totalPerRoaster.toFixed(2)}€
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span>Total ({roasterCount} roaster{roasterCount > 1 ? 's' : ''})</span>
                        <span className="font-bold text-lg text-green-600">
                          {calculation.totalPrice.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special features */}
                  {mode === 'FREE' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-2">
                      <div className="flex items-center gap-2 text-green-800 text-xs">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium">Super rapide & économique</span>
                      </div>
                    </div>
                  )}


                  {mode === 'STRUCTURED' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-2">
                      <div className="flex items-center gap-2 text-purple-800 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">Questions optimisées par domaine</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mode selected indication */}
        {selectedMode && (
          <div className="flex justify-center pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">
                  Mode {FEEDBACK_MODES[selectedMode].label} sélectionné
                </span>
              </div>
              <p className="text-sm text-green-700 text-center mt-2">
                Cliquez sur "Suivant" en bas pour continuer
              </p>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-sm text-muted-foreground">
            <p>
              💡 <strong>Conseil :</strong> Commencez par le mode FREE pour des premiers retours rapides, 
              puis utilisez STRUCTURED pour un audit complet avec questions organisées par domaines.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              <strong>📊 Tarification simple :</strong> Prix fixe pour FREE, prix transparent par question pour STRUCTURED. 
              Aucun coût caché !
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}