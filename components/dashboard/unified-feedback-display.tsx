'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  User,
  Target,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UnifiedFeedbackDisplayProps {
  feedbacks: Array<{
    id: string;
    status: string;
    createdAt: Date;
    // Unified structured feedback fields
    globalRating?: number | null;
    firstImpression?: string | null;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    uxUiRating?: number | null;
    valueRating?: number | null;
    performanceRating?: number | null;
    experienceRating?: number | null;
    additionalComments?: string | null;
    finalPrice: number | null;
    roaster: {
      id: string;
      name: string | null;
      avatar?: string | null;
      roasterProfile?: {
        id: string;
        rating?: number | null;
        completedFeedbacks: number;
      } | null;
    };
    // Question responses for custom questions
    questionResponses: Array<{
      id: string;
      questionId: string;
      response: string;
      question: {
        id: string;
        text: string;
        domain?: string | null;
      };
    }>;
  }>;
}

const StarRating = ({ rating, max = 5, size = "sm" }: { 
  rating?: number | null; 
  max?: number;
  size?: "sm" | "md";
}) => {
  if (!rating) return <span className="text-gray-400 text-sm">Non noté</span>;
  
  const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/{max}</span>
    </div>
  );
};

const FeedbackSection = ({ title, items, icon }: { 
  title: string; 
  items: string[];
  icon: React.ReactNode;
}) => {
  if (!items.length) return null;
  
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm flex items-center gap-2">
        {icon}
        {title}
      </h5>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function UnifiedFeedbackDisplay({ feedbacks }: UnifiedFeedbackDisplayProps) {
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Aucun feedback reçu pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => {
        const isExpanded = expandedFeedback === feedback.id;
        
        // Group question respoPnses by domain
        const questionsByDomain = feedback.questionResponses.reduce((acc, qr) => {
          // Safety check for question relation
          if (!qr.question) {
            console.warn('Question not found for response:', qr.id);
            return acc;
          }
          const domain = qr.question.domain || 'Général';
          if (!acc[domain]) {
            acc[domain] = [];
          }
          acc[domain].push(qr);
          return acc;
        }, {} as Record<string, typeof feedback.questionResponses>);

        return (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={feedback.roaster.avatar || undefined} />
                    <AvatarFallback>
                      {feedback.roaster.name?.split(' ').map(n => n[0]).join('') || 'R'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{feedback.roaster.name || 'Roaster anonyme'}</h4>
                      {feedback.roaster.roasterProfile?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {feedback.roaster.roasterProfile.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(feedback.createdAt, { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                      {feedback.finalPrice && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {feedback.finalPrice}€
                        </div>
                      )}
                      {feedback.roaster.roasterProfile?.completedFeedbacks && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {feedback.roaster.roasterProfile.completedFeedbacks} feedbacks
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    📋 Feedback structuré
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Global Rating & First Impression (always visible) */}
              <div className="space-y-3 mb-4">
                {feedback.globalRating && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Note globale:</span>
                    <StarRating rating={feedback.globalRating} size="md" />
                  </div>
                )}
                
                {feedback.firstImpression && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Première impression</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      {feedback.firstImpression}
                    </p>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="space-y-6">
                  {/* Structured Feedback Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeedbackSection
                      title="Points forts"
                      items={feedback.strengths}
                      icon={<ThumbsUp className="w-4 h-4 text-green-600" />}
                    />
                    
                    <FeedbackSection
                      title="Points faibles"
                      items={feedback.weaknesses}
                      icon={<ThumbsDown className="w-4 h-4 text-red-600" />}
                    />
                  </div>

                  <FeedbackSection
                    title="Recommandations"
                    items={feedback.recommendations}
                    icon={<Target className="w-4 h-4 text-blue-600" />}
                  />

                  {/* Detailed Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">UX/UI</p>
                      <StarRating rating={feedback.uxUiRating} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Valeur</p>
                      <StarRating rating={feedback.valueRating} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Performance</p>
                      <StarRating rating={feedback.performanceRating} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Expérience</p>
                      <StarRating rating={feedback.experienceRating} />
                    </div>
                  </div>

                  {/* Custom Questions by Domain */}
                  {Object.keys(questionsByDomain).length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        Questions personnalisées
                      </h5>
                      
                      {Object.entries(questionsByDomain).map(([domain, questions]) => (
                        <div key={domain} className="border rounded-lg p-4">
                          <h6 className="font-medium text-sm text-gray-700 mb-3 border-b pb-1">
                            {domain}
                          </h6>
                          <div className="space-y-3">
                            {questions.map((qr) => (
                              <div key={qr.id}>
                                <p className="text-sm font-medium text-gray-800 mb-1">
                                  {qr.question.text}
                                </p>
                                <p className="text-sm text-gray-700 bg-white rounded p-2 border">
                                  {qr.response}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional Comments */}
                  {feedback.additionalComments && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Commentaires additionnels</h5>
                      <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        {feedback.additionalComments}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}