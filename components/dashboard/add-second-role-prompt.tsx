'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Star, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AddSecondRolePromptProps {
  currentRole: 'creator' | 'roaster';
}

export function AddSecondRolePrompt({ currentRole }: AddSecondRolePromptProps) {
  const oppositeRole = currentRole === 'creator' ? 'roaster' : 'creator';
  const oppositeRoleLabel = oppositeRole === 'creator' ? 'Créateur' : 'Roaster';
  
  const benefits = currentRole === 'creator' 
    ? [
        'Donne des feedbacks constructifs aux autres créateurs',
        'Monétise ton expertise en UX/développement',
        'Apprends des projets des autres',
        'Construis ta réputation dans la communauté'
      ]
    : [
        'Obtiens des feedbacks brutalement honnêtes sur tes projets',
        'Améliore ton app avec l\'aide d\'experts',
        'Accélère ton développement produit',
        'Rejoins une communauté de créateurs passionnés'
      ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-400" />
              Débloquer le mode {oppositeRoleLabel}
            </CardTitle>
            <CardDescription className="mt-2">
              Tu utilises actuellement RoastMyApp en tant que {currentRole === 'creator' ? 'Créateur' : 'Roaster'}.
              Découvre l&apos;autre côté de la plateforme !
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-400/20 text-purple-300 border-purple-400/30">
            Nouveau
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
            {oppositeRole === 'creator' ? (
              <User className="h-8 w-8 text-blue-400 flex-shrink-0" />
            ) : (
              <Star className="h-8 w-8 text-purple-400 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-foreground">
                Deviens aussi {oppositeRoleLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                Accède aux deux côtés de la plateforme et switch quand tu veux
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              En devenant {oppositeRoleLabel}, tu pourras :
            </p>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/onboarding/role-selection?add_role=true">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              Ajouter le profil {oppositeRoleLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}