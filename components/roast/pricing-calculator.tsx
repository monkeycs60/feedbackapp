'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Info, 
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
import { calculateRoastPricing, formatPricingBreakdown } from '@/lib/utils/pricing';

interface PricingCalculatorProps {
  questionCount: number;
  roasterCount: number;
  isUrgent?: boolean;
  className?: string;
  compact?: boolean;
}

export function PricingCalculator({
  questionCount,
  roasterCount,
  isUrgent = false,
  className = "",
  compact = false
}: PricingCalculatorProps) {
  const [calculation, setCalculation] = useState(() =>
    calculateRoastPricing(questionCount, roasterCount, isUrgent)
  );

  // Recalculate when inputs change
  useEffect(() => {
    setCalculation(calculateRoastPricing(questionCount, roasterCount, isUrgent));
  }, [questionCount, roasterCount, isUrgent]);

  const breakdown = formatPricingBreakdown(calculation);

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
                📋 Feedback structuré
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
                </div>
                <span>
                  {calculation.questionCount} × {calculation.questionPrice.toFixed(2)}€ = {calculation.questionsCost.toFixed(2)}€
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

          {/* Info about pricing */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Tarification unifiée :</p>
                <p>4€ de base + 0,50€ par question personnalisée</p>
                {calculation.questionCount === 0 && (
                  <p className="mt-1 text-green-700">✓ Feedback structuré complet inclus</p>
                )}
              </div>
            </div>
          </div>

          {/* Suggestion for too many questions */}
          {calculation.questionCount > 10 && (
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
  questionCount,
  roasterCount,
  isUrgent = false,
  className = ""
}: Omit<PricingCalculatorProps, 'compact'>) {
  const calculation = calculateRoastPricing(questionCount, roasterCount, isUrgent);
  
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