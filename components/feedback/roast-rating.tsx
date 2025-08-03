'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageSquare, Target, CheckCircle } from 'lucide-react';

interface RoastRatingProps {
  roastRequestId: string;
  onRatingSubmit?: () => void;
  className?: string;
}

interface RatingCriteria {
  clarity: number;
  organization: number;
  usefulness: number;
  overall: number;
}

const criteriaLabels = {
  clarity: { label: 'Clarté de la demande', icon: MessageSquare, description: 'Les instructions étaient-elles claires ?' },
  organization: { label: 'Organisation', icon: Target, description: 'La mission était-elle bien structurée ?' },
  usefulness: { label: 'Utilité', icon: ThumbsUp, description: 'Cette mission vous a-t-elle semblé utile ?' },
  overall: { label: 'Global', icon: Star, description: 'Note globale de la mission' }
};

export function RoastRating({ roastRequestId, onRatingSubmit, className = "" }: RoastRatingProps) {
  const [ratings, setRatings] = useState<RatingCriteria>({
    clarity: 0,
    organization: 0,
    usefulness: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateRating = (criteria: keyof RatingCriteria, value: number) => {
    const newRatings = { ...ratings, [criteria]: value };
    
    // Auto-calculate overall rating based on other criteria
    if (criteria !== 'overall') {
      const { clarity, organization, usefulness } = newRatings;
      if (clarity > 0 && organization > 0 && usefulness > 0) {
        newRatings.overall = Math.round((clarity + organization + usefulness) / 3);
      }
    }
    
    setRatings(newRatings);
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{value}/5</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  const handleSubmit = async () => {
    if (ratings.overall === 0) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit roast rating
      console.log('Submitting roast rating:', { roastRequestId, ratings, comment });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      onRatingSubmit?.();
    } catch (error) {
      console.error('Error submitting roast rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-900 mb-2">Merci pour votre évaluation !</h3>
          <p className="text-sm text-green-700">
            Votre note aide à améliorer la qualité des missions sur la plateforme.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Évaluez cette mission
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Aidez-nous à améliorer la qualité des missions en évaluant votre expérience
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critères de notation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.keys(criteriaLabels) as Array<keyof typeof criteriaLabels>).map((criteria) => {
            const criteriaInfo = criteriaLabels[criteria];
            return (
              <StarRating
                key={criteria}
                value={ratings[criteria]}
                onChange={(value) => updateRating(criteria, value)}
                label={criteriaInfo.label}
                description={criteriaInfo.description}
              />
            );
          })}
        </div>

        {/* Commentaire optionnel */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Commentaire (optionnel)
          </label>
          <Textarea
            placeholder="Partagez votre expérience sur cette mission..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Résumé de la notation */}
        {ratings.overall > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Note moyenne:</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{ratings.overall}/5</span>
                <span className="text-muted-foreground">
                  ({ratings.overall >= 4 ? 'Excellent' : 
                    ratings.overall >= 3 ? 'Bon' : 
                    ratings.overall >= 2 ? 'Moyen' : 'À améliorer'})
                </span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || ratings.overall === 0}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre l\'évaluation'}
        </Button>
      </CardContent>
    </Card>
  );
}