'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Target, MessageSquare, Lightbulb, CheckCircle, TrendingUp } from 'lucide-react';
import { getRoasterAverageRating } from '@/lib/actions/feedback-rating';

interface RoasterRatingDisplayProps {
  roaster: {
    id: string;
    name: string | null;
    image: string | null;
    roasterProfile: {
      specialties: string[];
      rating: number;
      level: string;
      completedRoasts: number;
    } | null;
  };
  domain?: string; // Pour les notes spécifiques à un domaine
  className?: string;
}

interface RatingData {
  domain?: string;
  count: number;
  averages: {
    clarity: number;
    relevance: number;
    depth: number;
    actionable: number;
    overall: number;
  };
}

const criteriaIcons = {
  clarity: MessageSquare,
  relevance: Target,
  depth: Lightbulb,
  actionable: CheckCircle,
  overall: Star
};

const criteriaLabels = {
  clarity: 'Clarté',
  relevance: 'Pertinence', 
  depth: 'Profondeur',
  actionable: 'Actionnable',
  overall: 'Global'
};

export function RoasterRatingDisplay({ 
  roaster, 
  domain, 
  className = "" 
}: RoasterRatingDisplayProps) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRatings() {
      try {
        setLoading(true);
        const data = await getRoasterAverageRating(roaster.id, domain);
        setRatingData(data);
      } catch (error) {
        console.error('Erreur chargement ratings:', error);
        setRatingData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRatings();
  }, [roaster.id, domain]);

  if (loading) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={roaster.image || undefined} />
              <AvatarFallback>
                {roaster.name?.charAt(0) || 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { text: 'Excellent', class: 'bg-green-100 text-green-800' };
    if (rating >= 4.0) return { text: 'Très bon', class: 'bg-blue-100 text-blue-800' };
    if (rating >= 3.5) return { text: 'Bon', class: 'bg-yellow-100 text-yellow-800' };
    if (rating >= 3.0) return { text: 'Moyen', class: 'bg-orange-100 text-orange-800' };
    return { text: 'À améliorer', class: 'bg-red-100 text-red-800' };
  };

  return (
    <Card className={`border-gray-200 hover:border-blue-300 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={roaster.image || undefined} />
            <AvatarFallback>
              {roaster.name?.charAt(0) || 'R'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-lg">{roaster.name || 'Roaster anonyme'}</h4>
              {roaster.roasterProfile && (
                <Badge variant="secondary" className="text-xs">
                  {roaster.roasterProfile.level}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {roaster.roasterProfile && (
                <>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    {roaster.roasterProfile.rating.toFixed(1)}
                  </span>
                  <span>{roaster.roasterProfile.completedRoasts} roasts</span>
                </>
              )}
              {domain && (
                <Badge variant="outline" className="text-xs">
                  {domain}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {ratingData ? (
          <div className="space-y-4">
            {/* Note globale */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Note qualité globale</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getRatingColor(ratingData.averages.overall)}`}>
                  {ratingData.averages.overall.toFixed(1)}
                </span>
                <Badge className={getRatingBadge(ratingData.averages.overall).class}>
                  {getRatingBadge(ratingData.averages.overall).text}
                </Badge>
              </div>
            </div>

            {/* Détail des critères */}
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(ratingData.averages) as Array<keyof typeof ratingData.averages>)
                .filter(key => key !== 'overall')
                .map((criteria) => {
                  const Icon = criteriaIcons[criteria];
                  const rating = ratingData.averages[criteria];
                  
                  return (
                    <div key={criteria} className="flex items-center gap-2 p-2 border rounded">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">
                          {criteriaLabels[criteria]}
                        </div>
                        <div className={`font-medium ${getRatingColor(rating)}`}>
                          {rating.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Statistiques */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>Basé sur {ratingData.count} feedback{ratingData.count > 1 ? 's' : ''}</span>
              {domain && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Spécialiste {domain}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-gray-300" />
              <span className="text-sm">
                {domain 
                  ? `Pas encore de notes pour ${domain}`
                  : 'Pas encore de notes qualité'
                }
              </span>
              <span className="text-xs">
                Les notes apparaîtront après les premiers feedbacks
              </span>
            </div>
          </div>
        )}

        {/* Spécialités */}
        {roaster.roasterProfile?.specialties && roaster.roasterProfile.specialties.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Spécialités :</div>
            <div className="flex flex-wrap gap-1">
              {roaster.roasterProfile.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}