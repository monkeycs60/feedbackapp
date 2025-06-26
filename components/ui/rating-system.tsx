'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Target, Lightbulb, CheckCircle } from 'lucide-react';

interface RatingCriteria {
  overall: number;
}

interface DomainRating extends RatingCriteria {
  domain: string;
  comment?: string;
}

interface RatingSystemProps {
  mode: 'FREE' | 'STRUCTURED';
  domains?: string[];
  onRatingChange: (ratings: DomainRating[]) => void;
  initialRatings?: DomainRating[];
  className?: string;
}

export interface RatingSystemRef {
  getRatings: () => DomainRating[];
}

const criteriaLabels = {
  overall: { label: 'Note globale', icon: Star, description: 'Qualité globale du feedback reçu' }
};

export const RatingSystem = forwardRef<RatingSystemRef, RatingSystemProps>(({ 
  mode, 
  domains = [], 
  onRatingChange, 
  initialRatings = [],
  className = "" 
}, ref) => {
  const [ratings, setRatings] = useState<DomainRating[]>(() => {
    if (initialRatings.length > 0) {
      return initialRatings;
    }
    
    if (mode === 'FREE') {
      return [{
        domain: 'general',
        overall: 0,
        comment: ''
      }];
    }
    
    return domains.map(domain => ({
      domain,
      overall: 0,
      comment: ''
    }));
  });

  useImperativeHandle(ref, () => ({
    getRatings: () => ratings
  }));

  const updateRating = (domainIndex: number, criteria: keyof RatingCriteria, value: number) => {
    const newRatings = [...ratings];
    newRatings[domainIndex] = {
      ...newRatings[domainIndex],
      [criteria]: value
    };
    
    setRatings(newRatings);
    onRatingChange(newRatings);
  };

  const updateComment = (domainIndex: number, comment: string) => {
    const newRatings = [...ratings];
    newRatings[domainIndex] = {
      ...newRatings[domainIndex],
      comment
    };
    setRatings(newRatings);
    onRatingChange(newRatings);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    description 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    description: string;
  }) => (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-lg font-medium">{label}</span>
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {value}/5
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {mode === 'FREE' ? '🎯 Noter le feedback général' : '📋 Noter par domaine'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'FREE' 
            ? 'Évaluez la qualité globale du feedback reçu'
            : 'Évaluez la qualité du feedback pour chaque domaine'
          }
        </p>
      </div>

      {ratings.map((domainRating, index) => (
        <Card key={domainRating.domain} className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'STRUCTURED' ? (
                <>
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {domainRating.domain}
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 text-yellow-500" />
                  Feedback général
                </>
              )}
              {domainRating.overall > 0 && (
                <Badge className="ml-auto bg-yellow-100 text-yellow-800">
                  {domainRating.overall}/5 ⭐
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Note globale */}
            <div className="text-center space-y-4">
              <StarRating
                value={domainRating.overall}
                onChange={(value) => updateRating(index, 'overall', value)}
                label={criteriaLabels.overall.label}
                description={criteriaLabels.overall.description}
              />
            </div>

            {/* Commentaire optionnel */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Commentaire (optionnel)
              </label>
              <Textarea
                placeholder={`Commentaire sur ${mode === 'FREE' ? 'le feedback' : `le domaine ${domainRating.domain}`}...`}
                value={domainRating.comment || ''}
                onChange={(e) => updateComment(index, e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Résumé de la notation */}
            {domainRating.overall > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{domainRating.overall}/5</span>
                  <span className="text-muted-foreground">
                    ({domainRating.overall >= 4 ? 'Excellent' : 
                      domainRating.overall >= 3 ? 'Bon' : 
                      domainRating.overall >= 2 ? 'Moyen' : 'À améliorer'})
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

RatingSystem.displayName = 'RatingSystem';