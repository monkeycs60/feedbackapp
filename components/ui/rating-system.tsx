'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface DomainRating {
  domain: string;
  overall: number;
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

  const updateRating = (domainIndex: number, value: number) => {
    const newRatings = [...ratings];
    newRatings[domainIndex] = {
      ...newRatings[domainIndex],
      overall: value
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

  return (
    <div className={`space-y-4 ${className}`}>
      {ratings.map((domainRating, index) => (
        <div key={domainRating.domain} className="space-y-3">
          {mode === 'STRUCTURED' && (
            <div className="text-sm font-medium">{domainRating.domain}</div>
          )}
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateRating(index, star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= domainRating.overall
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
            {domainRating.overall > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {domainRating.overall}/5
              </span>
            )}
          </div>

          <Textarea
            placeholder="Commentaire..."
            value={domainRating.comment || ''}
            onChange={(e) => updateComment(index, e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>
      ))}
    </div>
  );
});

RatingSystem.displayName = 'RatingSystem';