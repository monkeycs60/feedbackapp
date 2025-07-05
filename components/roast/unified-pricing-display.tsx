'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Info, 
  TrendingUp, 
  DollarSign,
  Users,
  MessageSquare 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UnifiedPricingDisplayProps {
  pricePerRoaster: number;
  roasterCount: number;
  questionCount?: number;
  className?: string;
  compact?: boolean;
  showBreakdown?: boolean;
}

export function UnifiedPricingDisplay({
  pricePerRoaster,
  roasterCount,
  questionCount = 0,
  className = "",
  compact = false,
  showBreakdown = false
}: UnifiedPricingDisplayProps) {
  const totalPrice = pricePerRoaster * roasterCount;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <DollarSign className="w-3 h-3 mr-1" />
          {pricePerRoaster}€/roaster
        </Badge>
        <span className="text-sm text-muted-foreground">
          Total: {totalPrice}€
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Tarification unifiée</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prix fixe par roaster, incluant le feedback structuré complet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Main pricing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Prix par roaster</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {pricePerRoaster}€
                </div>
                <div className="text-xs text-muted-foreground">
                  Feedback structuré inclus
                </div>
              </div>
            </div>

            {questionCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Questions personnalisées</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {questionCount} incluses
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Aucun coût supplémentaire
                  </div>
                </div>
              </div>
            )}

            {showBreakdown && (
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nombre de roasters</span>
                  <span className="font-medium">×{roasterCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Prix unitaire</span>
                  <span className="font-medium">{pricePerRoaster}€</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="font-semibold">Coût total maximum</span>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  {totalPrice}€
                </div>
                <div className="text-xs text-muted-foreground">
                  Payé uniquement si feedbacks complétés
                </div>
              </div>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tarification libre
            </Badge>
            {questionCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="w-3 h-3 mr-1" />
                {questionCount} questions custom
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple display component for pricing information
export function PricingBadge({ 
  pricePerRoaster, 
  roasterCount,
  className = "" 
}: { 
  pricePerRoaster: number; 
  roasterCount: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="text-green-600 border-green-600 font-semibold">
        {pricePerRoaster}€ × {roasterCount}
      </Badge>
      <span className="text-sm font-semibold text-green-600">
        = {pricePerRoaster * roasterCount}€
      </span>
    </div>
  );
}