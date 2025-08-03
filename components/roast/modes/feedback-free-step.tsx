'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Zap, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { PricingCalculator } from '../pricing-calculator';

interface FeedbackFreeStepProps {
  roasterCount: number;
  className?: string;
}

export function FeedbackFreeStep({
  roasterCount,
  className = ""
}: FeedbackFreeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl">🎯</span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Feedback Libre
            </h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Mode le plus rapide
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Les roasters vont explorer votre app librement et donner leur impression générale.
          Parfait pour valider une idée ou obtenir des premiers retours.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Ce que vont faire les roasters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Explorer votre app</p>
                  <p className="text-xs text-muted-foreground">
                    Navigation libre, test des fonctionnalités principales
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Identifier les points forts</p>
                  <p className="text-xs text-muted-foreground">
                    Ce qui fonctionne bien, ce qui les impressionne
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Signaler les problèmes</p>
                  <p className="text-xs text-muted-foreground">
                    Bugs, éléments confus, points de friction
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Donner des suggestions</p>
                  <p className="text-xs text-muted-foreground">
                    Améliorations possibles, idées de fonctionnalités
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Avantage :</strong> Retours authentiques et spontanés, 
                sans biais de questions prédéfinies.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Publication (immédiate)</p>
                    <p className="text-xs text-muted-foreground">Votre roast est visible par les roasters</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Candidatures (2-6h)</p>
                    <p className="text-xs text-muted-foreground">Les roasters postulent rapidement</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Retours (24-48h)</p>
                    <p className="text-xs text-muted-foreground">Feedback détaillé disponible</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Idéal pour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Validation d'idée rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Tests de prototypes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Feedback spontané</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Budget serré</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Urgence (moins de 48h)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <PricingCalculator
          mode="FREE"
          questionCount={0}
          roasterCount={roasterCount}
          compact={false}
        />
      </div>
    </div>
  );
}