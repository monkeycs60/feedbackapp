'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Info, 
  TrendingUp, 
  Zap,
  DollarSign,
  HelpCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type FeedbackMode, FEEDBACK_MODES } from '@/lib/types/roast-request';
import { calculateRoastPricing, formatPricingBreakdown } from '@/lib/utils/pricing';

interface PricingCalculatorProps {
  mode: FeedbackMode;
  questionCount: number;
  roasterCount: number;
  isUrgent?: boolean;
  onModeChange?: (mode: FeedbackMode) => void;
  className?: string;
  showModeComparison?: boolean;
  compact?: boolean;
}

export function PricingCalculator({
  mode,
  questionCount,
  roasterCount,
  isUrgent = false,
  onModeChange,
  className = "",
  showModeComparison = false,
  compact = false
}: PricingCalculatorProps) {
  const [calculation, setCalculation] = useState(() =>
    calculateRoastPricing(mode, questionCount, roasterCount, isUrgent)
  );

  // Recalculate when inputs change
  useEffect(() => {
    setCalculation(calculateRoastPricing(mode, questionCount, roasterCount, isUrgent));
  }, [mode, questionCount, roasterCount, isUrgent]);

  const breakdown = formatPricingBreakdown(calculation);
  const config = FEEDBACK_MODES[mode];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="w-4 h-4 text-green-600" />
        <span className="font-semibold text-lg">
          {calculation.totalPrice.toFixed(2)}€
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1 text-sm">
                <div>{breakdown.baseLabel}</div>
                <div>{breakdown.questionsLabel}</div>
                <div className="font-semibold">{breakdown.totalLabel}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`border-l-4 border-l-green-500 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Prix calculé</h3>
              <Badge variant="outline" className="text-xs">
                {config.icon} {config.label}
              </Badge>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {calculation.totalPrice.toFixed(2)}€
              </div>
              <div className="text-sm text-muted-foreground">
                Total pour {roasterCount} roaster{roasterCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base</span>
              <span>{calculation.basePrice.toFixed(2)}€</span>
            </div>
            
            {calculation.questionCount > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Questions</span>
                  {calculation.freeQuestions > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{calculation.freeQuestions} questions offertes</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <span>
                  {calculation.billableQuestions > 0 
                    ? `${calculation.billableQuestions} × ${calculation.questionPrice.toFixed(2)}€ = ${calculation.questionsCost.toFixed(2)}€`
                    : 'Incluses'
                  }
                </span>
              </div>
            )}
            
            {calculation.isUrgent && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Urgence</span>
                <span className="text-orange-600">+{calculation.urgencyCost.toFixed(2)}€</span>
              </div>
            )}
            
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Par roaster</span>
              <span>{calculation.totalPerRoaster.toFixed(2)}€</span>
            </div>
          </div>

          {/* Mode comparison suggestion */}
          {showModeComparison && onModeChange && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">
                Comparer les modes :
              </div>
              <div className="grid grid-cols-2 gap-1">
                {(['FREE', 'STRUCTURED'] as FeedbackMode[]).map((modeOption) => {
                  const modeConfig = FEEDBACK_MODES[modeOption];
                  const modeCalc = calculateRoastPricing(modeOption, 
                    modeOption === 'FREE' ? 0 : questionCount, 
                    roasterCount,
                    false
                  );
                  
                  const isCurrentMode = modeOption === mode;
                  const isCheaper = modeCalc.totalPrice < calculation.totalPrice && !isCurrentMode;
                  
                  return (
                    <Button
                      key={modeOption}
                      variant={isCurrentMode ? "default" : "outline"}
                      size="sm"
                      className={`text-xs h-8 ${isCheaper ? 'ring-2 ring-green-400' : ''}`}
                      onClick={() => onModeChange(modeOption)}
                      disabled={modeOption === 'FREE' && questionCount > 0}
                    >
                      <div className="flex flex-col items-center">
                        <span>{modeConfig.icon}</span>
                        <span>{modeCalc.totalPrice.toFixed(0)}€</span>
                        {isCheaper && (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Savings indicator */}
          {calculation.freeQuestions > 0 && calculation.questionCount <= calculation.freeQuestions && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Économie : {(calculation.questionCount * calculation.questionPrice).toFixed(2)}€ 
                (questions offertes)
              </span>
            </div>
          )}

          {/* Suggestion for too many questions */}
          {calculation.billableQuestions > 5 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Conseil :</p>
                  <p>Avec {calculation.questionCount} questions, considérez diviser en plusieurs roasts plus ciblés.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

/**
 * Simplified pricing display for forms
 */
export function PricingDisplay({
  mode,
  questionCount,
  roasterCount,
  isUrgent = false,
  className = ""
}: Omit<PricingCalculatorProps, 'onModeChange' | 'showModeComparison' | 'compact'>) {
  const calculation = calculateRoastPricing(mode, questionCount, roasterCount, isUrgent);
  
  return (
    <div className={`text-right ${className}`}>
      <div className="text-lg font-semibold text-green-600">
        {calculation.totalPrice.toFixed(2)}€
      </div>
      <div className="text-xs text-muted-foreground">
        {calculation.totalPerRoaster.toFixed(2)}€ × {roasterCount} roaster{roasterCount > 1 ? 's' : ''}
      </div>
    </div>
  );
}