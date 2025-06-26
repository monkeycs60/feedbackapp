'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Trophy,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { RatingSystem, type RatingSystemRef } from '@/components/ui/rating-system';
import { submitFeedbackRatings, getFeedbackRatings } from '@/lib/actions/feedback-rating';

interface QuestionResponse {
  id: string;
  questionId: string;
  response: string;
  createdAt: Date;
}

interface RoastQuestion {
  id: string;
  domain: string;
  text: string;
  order: number;
  isDefault: boolean;
}

interface FeedbackDisplayV2Props {
  feedbacks: Array<{
    id: string;
    status: string;
    createdAt: Date;
    generalFeedback: string;
    screenshots: string[];
    finalPrice: number | null;
    aiQualityScore: number | null;
    creatorRating: number | null;
    roaster: {
      id: string;
      name: string | null;
      image: string | null;
      roasterProfile: {
        bio: string | null;
        specialties: string[];
        rating: number;
        level: string;
        completedRoasts: number;
      } | null;
    };
    roastRequest: {
      id: string;
      title: string;
      questions: RoastQuestion[];
    };
    questionResponses: QuestionResponse[];
  }>;
}

export function FeedbackDisplayV2({ feedbacks }: FeedbackDisplayV2Props) {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(
    feedbacks.length === 1 ? feedbacks[0].id : null
  );
  const [showRating, setShowRating] = useState<string | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [existingRatings, setExistingRatings] = useState<Record<string, any[]>>({});
  const ratingRef = useRef<RatingSystemRef>(null);

  // Charger les notes existantes pour chaque feedback
  useEffect(() => {
    const loadExistingRatings = async () => {
      const ratingsMap: Record<string, any[]> = {};
      for (const feedback of feedbacks) {
        const ratings = await getFeedbackRatings(feedback.id);
        ratingsMap[feedback.id] = ratings;
      }
      setExistingRatings(ratingsMap);
    };
    
    loadExistingRatings();
  }, [feedbacks]);

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun feedback reçu pour le moment
      </div>
    );
  }

  // Déterminer le mode de feedback (FREE ou STRUCTURED)
  const feedbackMode = feedbacks[0]?.roastRequest?.questions?.length > 0 ? 'STRUCTURED' : 'FREE';

  // Grouper les questions par domaine pour les feedbacks STRUCTURED
  const getQuestionsByDomain = (feedback: FeedbackDisplayV2Props['feedbacks'][0]) => {
    if (!feedback.roastRequest.questions || feedbackMode === 'FREE') return {};
    
    return feedback.roastRequest.questions.reduce((acc: Record<string, Array<RoastQuestion & { response: string | null }>>, question: RoastQuestion) => {
      if (!acc[question.domain]) {
        acc[question.domain] = [];
      }
      
      // Chercher la réponse correspondante
      const response = feedback.questionResponses?.find((qr: QuestionResponse) => qr.questionId === question.id);
      
      acc[question.domain].push({
        ...question,
        response: response?.response || null
      });
      
      return acc;
    }, {});
  };

  const handleRatingSubmit = async (feedbackId: string, ratings: any[]) => {
    try {
      setIsSubmittingRating(true);
      await submitFeedbackRatings({ feedbackId, ratings });
      
      // Recharger les notes pour ce feedback
      const updatedRatings = await getFeedbackRatings(feedbackId);
      setExistingRatings(prev => ({
        ...prev,
        [feedbackId]: updatedRatings
      }));
      
      setShowRating(null);
    } catch (error) {
      console.error('Erreur soumission rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="border rounded-lg overflow-hidden bg-white"
        >
          {/* En-tête du feedback */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedFeedback(
              expandedFeedback === feedback.id ? null : feedback.id
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={feedback.roaster.image || undefined} />
                  <AvatarFallback>
                    {feedback.roaster.name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {feedback.roaster.name || 'Roaster anonyme'}
                    </h4>
                    {feedback.roaster.roasterProfile && (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {feedback.roaster.roasterProfile.level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">
                            {feedback.roaster.roasterProfile.rating.toFixed(1)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(feedback.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                    {feedback.finalPrice && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {feedback.finalPrice}€
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`${feedbackMode === 'FREE' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} text-xs`}>
                  {feedbackMode === 'FREE' ? '🎯 Impression générale' : '📋 Feedback structuré'}
                </Badge>
                {expandedFeedback === feedback.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Aperçu seulement si le feedback n'est pas étendu */}
            {expandedFeedback !== feedback.id && (
              <div className="mt-3 text-sm text-gray-600">
                <p className="line-clamp-2">
                  {feedback.generalFeedback}
                </p>
              </div>
            )}
          </div>

          {/* Contenu détaillé */}
          {expandedFeedback === feedback.id && (
            <div className="border-t p-6 bg-gray-50 space-y-6">
              
              {/* Feedback général */}
              <div>
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {feedbackMode === 'FREE' ? 'Impression générale' : 'Feedback général'}
                </h5>
                <div className="whitespace-pre-wrap text-gray-700 bg-white rounded-lg p-4 border leading-relaxed">
                  {feedback.generalFeedback}
                </div>
              </div>

              {/* Questions par domaine (seulement pour STRUCTURED) */}
              {feedbackMode === 'STRUCTURED' && (
                <div className="space-y-6">
                  <h5 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Réponses par domaine
                  </h5>
                  {Object.entries(getQuestionsByDomain(feedback)).map(([domain, questions]) => (
                    <div key={domain} className="bg-white rounded-lg border p-4">
                      <h6 className="font-medium text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        {domain}
                      </h6>
                      <div className="space-y-4">
                        {questions.map((question, index: number) => (
                          <div key={question.id} className="border-l-2 border-purple-200 pl-4">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900 mb-2">{question.text}</h6>
                                {question.response ? (
                                  <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                    {question.response}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400 italic">
                                    Pas de réponse fournie
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Screenshots si disponibles */}
              {feedback.screenshots.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    Captures d'écran ({feedback.screenshots.length})
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedback.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 border">
                        <Image
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Système de notation */}
              {(() => {
                const ratings = existingRatings[feedback.id] || [];
                const hasRatings = ratings.length > 0;
                
                if (showRating === feedback.id) {
                  return (
                    <div className="pt-4 border-t">
                      <p className="text-sm mb-3">Feedback de {feedback.roaster.name || 'ce roaster'}</p>
                      <RatingSystem
                        ref={ratingRef}
                        mode={feedbackMode}
                        domains={feedbackMode === 'STRUCTURED' ? Object.keys(getQuestionsByDomain(feedback)) : undefined}
                        onRatingChange={() => {
                          // Optional: handle real-time changes
                        }}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm"
                          onClick={async () => {
                            const ratings = ratingRef.current?.getRatings();
                            if (ratings && ratings.length > 0) {
                              await handleRatingSubmit(feedback.id, ratings);
                            }
                          }}
                          disabled={isSubmittingRating}
                        >
                          {isSubmittingRating ? 'Soumission...' : 'Soumettre'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowRating(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                if (hasRatings) {
                  return (
                    <div className="pt-3 border-t">
                      <p className="text-sm mb-3 font-medium">Votre évaluation du feedback de {feedback.roaster.name || 'ce roaster'}</p>
                      {ratings.map((rating: any, index: number) => (
                        <div key={index} className="space-y-2 mb-3">
                          {feedbackMode === 'STRUCTURED' && rating.domain && (
                            <div className="text-sm font-medium text-gray-700">{rating.domain}</div>
                          )}
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= rating.overall
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {rating.overall}/5
                            </span>
                          </div>
                          {rating.comment && (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowRating(feedback.id)}
                        className="mt-2"
                      >
                        Modifier l'évaluation
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <div className="pt-3 border-t flex items-center justify-between">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setShowRating(feedback.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Noter le feedback de {feedback.roaster.name || 'ce roaster'}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      Télécharger PDF
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}