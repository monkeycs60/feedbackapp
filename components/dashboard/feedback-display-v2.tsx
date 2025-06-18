'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Trophy,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

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
  const [selectedTab, setSelectedTab] = useState('overview');

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedbacks reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Aucun feedback reçu pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedFeedbacks = feedbacks.filter(f => f.status === 'completed');
  const averageRating = completedFeedbacks.length > 0
    ? completedFeedbacks.reduce((sum, f) => sum + (f.creatorRating || 0), 0) / completedFeedbacks.length
    : 0;

  // Grouper les questions par domaine pour chaque feedback
  const getQuestionsByDomain = (feedback: any) => {
    if (!feedback.roastRequest.questions) return {};
    
    return feedback.roastRequest.questions.reduce((acc: any, question: RoastQuestion) => {
      if (!acc[question.domain]) {
        acc[question.domain] = [];
      }
      
      // Chercher la réponse correspondante
      const response = feedback.questionResponses.find((qr: QuestionResponse) => qr.questionId === question.id);
      
      acc[question.domain].push({
        ...question,
        response: response?.response || null
      });
      
      return acc;
    }, {});
  };

  // Tous les feedbacks utilisent maintenant le nouveau format
  const hasQuestionResponses = (feedback: any) => {
    return feedback.questionResponses && feedback.questionResponses.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Stats globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbacks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Complétés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedFeedbacks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Investissement total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {feedbacks.reduce((sum, f) => sum + (f.finalPrice || 0), 0)}€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Feedbacks détaillés</CardTitle>
          <CardDescription>
            Cliquez sur un feedback pour voir les détails complets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                id={`feedback-${feedback.id}`}
                className="border rounded-lg overflow-hidden"
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
                      <Avatar>
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
                          {feedback.roaster.roasterProfile && (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {feedback.roaster.roasterProfile.completedRoasts} roasts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={feedback.status === 'completed' ? 'default' : 'secondary'}>
                        {feedback.status === 'completed' ? 'Complété' : 
                         feedback.status === 'pending' ? 'En attente' : 'Contesté'}
                      </Badge>
                      {expandedFeedback === feedback.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Aperçu */}
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="line-clamp-2">
                      {feedback.generalFeedback}
                    </p>
                  </div>
                </div>

                {/* Contenu détaillé */}
                {expandedFeedback === feedback.id && (
                  <div className="border-t p-4 bg-gray-50">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                        <TabsTrigger value="questions">Réponses par domaine</TabsTrigger>
                        <TabsTrigger value="general">Feedback général</TabsTrigger>
                      </TabsList>
                        
                      <TabsContent value="overview" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Questions traitées</h5>
                            <p className="text-2xl font-bold text-blue-600">
                              {feedback.questionResponses.length}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Domaines couverts</h5>
                            <p className="text-2xl font-bold text-purple-600">
                              {Object.keys(getQuestionsByDomain(feedback)).length}
                            </p>
                          </div>
                        </div>
                        
                        {feedback.screenshots.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Captures d&apos;écran ({feedback.screenshots.length})
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {feedback.screenshots.map((screenshot, index) => (
                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
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
                      </TabsContent>
                      
                      <TabsContent value="questions" className="mt-4">
                        <div className="space-y-6">
                          {Object.entries(getQuestionsByDomain(feedback)).map(([domain, questions]: [string, any]) => (
                            <div key={domain}>
                              <h5 className="font-medium text-lg text-gray-900 mb-3 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                {domain}
                              </h5>
                              <div className="space-y-4">
                                {questions.map((question: any, index: number) => (
                                  <div key={question.id} className="bg-white rounded-lg p-4 border">
                                    <div className="flex items-start gap-3">
                                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
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
                      </TabsContent>
                      
                      <TabsContent value="general" className="mt-4">
                        <div>
                          <h5 className="font-medium mb-2">Feedback général et recommandations</h5>
                          <div className="whitespace-pre-wrap text-gray-700 bg-white rounded-lg p-4 border">
                            {feedback.generalFeedback}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {/* Actions sur le feedback */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feedback.creatorRating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">Votre note:</span>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.creatorRating! 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Button variant="outline" size="sm">
                            Noter ce feedback
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Télécharger PDF
                        </Button>
                        {feedback.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            Contester
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}