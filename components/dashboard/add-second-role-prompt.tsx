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
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Débloquer le mode {oppositeRoleLabel}
            </CardTitle>
            <CardDescription className="mt-2">
              Tu utilises actuellement RoastMyApp en tant que {currentRole === 'creator' ? 'Créateur' : 'Roaster'}.
              Découvre l&apos;autre côté de la plateforme !
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Nouveau
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
            {oppositeRole === 'creator' ? (
              <User className="h-8 w-8 text-blue-600 flex-shrink-0" />
            ) : (
              <Star className="h-8 w-8 text-purple-600 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                Deviens aussi {oppositeRoleLabel}
              </p>
              <p className="text-sm text-gray-600">
                Accède aux deux côtés de la plateforme et switch quand tu veux
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              En devenant {oppositeRoleLabel}, tu pourras :
            </p>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/onboarding/role-selection?add_role=true">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              Ajouter le profil {oppositeRoleLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}