'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Clock, DollarSign, Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type AvailableRoast = {
  id: string;
  title: string;
  appUrl: string;
  description: string;
  targetAudience: string | null;
  focusAreas: string[];
  maxPrice: number;
  deadline?: Date | null;
  createdAt: Date;
  creator: {
    id: string;
    name: string | null;
    creatorProfile: {
      company: string | null;
    } | null;
  };
  feedbacks: { id: string; status: string }[];
  _count: {
    feedbacks: number;
  };
};

interface AvailableRoastsListProps {
  availableRoasts: AvailableRoast[];
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Il y a moins d&apos;une heure';
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.round(diffInHours / 24);
  if (diffInDays === 1) return 'Il y a 1 jour';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  
  const diffInWeeks = Math.round(diffInDays / 7);
  if (diffInWeeks === 1) return 'Il y a 1 semaine';
  return `Il y a ${diffInWeeks} semaines`;
}

function getRoastPriority(roast: AvailableRoast): 'high' | 'medium' | 'low' {
  const hoursOld = (new Date().getTime() - roast.createdAt.getTime()) / (1000 * 60 * 60);
  const feedbackCount = roast._count.feedbacks;
  
  // Récent ET sans feedback = priorité haute
  if (hoursOld < 24 && feedbackCount === 0) return 'high';
  
  // Plus d'une semaine OU beaucoup de feedbacks = priorité basse
  if (hoursOld > 168 || feedbackCount > 2) return 'low';
  
  return 'medium';
}

function PriorityIndicator({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  
  const labels = {
    high: 'Urgent',
    medium: 'Modéré',
    low: 'Tranquille'
  };
  
  return (
    <Badge variant="outline" className={colors[priority]}>
      {labels[priority]}
    </Badge>
  );
}

export function AvailableRoastsList({ availableRoasts }: AvailableRoastsListProps) {
  // Trier par priorité puis par date
  const sortedRoasts = [...availableRoasts].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = getRoastPriority(a);
    const bPriority = getRoastPriority(b);
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    }
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  if (availableRoasts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune app à roaster pour le moment
          </h3>
          <p className="text-gray-600">
            Les nouvelles demandes de roast apparaîtront ici. 
            Revenez bientôt pour découvrir de nouveaux projets !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Apps disponibles ({availableRoasts.length})
        </h2>
        <div className="text-sm text-gray-600">
          Triées par priorité et fraîcheur
        </div>
      </div>

      <div className="grid gap-4">
        {sortedRoasts.map((roast) => {
          const priority = getRoastPriority(roast);
          
          return (
            <Card key={roast.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{roast.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <span>{roast.creator.name}</span>
                      {roast.creator.creatorProfile?.company && (
                        <>
                          <span>•</span>
                          <span>{roast.creator.creatorProfile.company}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(roast.createdAt)}</span>
                    </CardDescription>
                  </div>
                  <PriorityIndicator priority={priority} />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {roast.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span className="truncate">{roast.targetAudience || 'Non spécifié'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Jusqu'à {roast.maxPrice}€</span>
                  </div>
                  
                  {roast.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Deadline: {new Date(roast.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {roast.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{roast._count.feedbacks} roast(s) en cours</span>
                    <Link 
                      href={roast.appUrl} 
                      target="_blank" 
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir l'app
                    </Link>
                  </div>

                  <Button asChild>
                    <Link href={`/roast/${roast.id}`}>
                      Commencer le roast
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}