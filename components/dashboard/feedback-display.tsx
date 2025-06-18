'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
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

interface FeedbackDisplayProps {
  feedbacks: Array<{
    id: string;
    status: string;
    createdAt: Date;
    firstImpression: string;
    strengthsFound: string[];
    weaknessesFound: string[];
    actionableSteps: string[];
    competitorComparison: string | null;
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
  }>;
}

export function FeedbackDisplay({ feedbacks }: FeedbackDisplayProps) {
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
                    <p className="line-clamp-2">{feedback.firstImpression}</p>
                  </div>
                </div>

                {/* Contenu détaillé */}
                {expandedFeedback === feedback.id && (
                  <div className="border-t p-4 bg-gray-50">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="strengths">Points forts</TabsTrigger>
                        <TabsTrigger value="weaknesses">Points faibles</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="mt-4 space-y-4">
                        <div>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Première impression
                          </h5>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {feedback.firstImpression}
                          </p>
                        </div>
                        
                        {feedback.competitorComparison && (
                          <div>
                            <h5 className="font-medium mb-2">Comparaison concurrentielle</h5>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {feedback.competitorComparison}
                            </p>
                          </div>
                        )}
                        
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
                      
                      <TabsContent value="strengths" className="mt-4">
                        <div className="space-y-3">
                          <h5 className="font-medium flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            Points forts identifiés ({feedback.strengthsFound.length})
                          </h5>
                          <ul className="space-y-2">
                            {feedback.strengthsFound.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="weaknesses" className="mt-4">
                        <div className="space-y-3">
                          <h5 className="font-medium flex items-center gap-2 text-red-700">
                            <XCircle className="h-4 w-4" />
                            Points d&apos;amélioration ({feedback.weaknessesFound.length})
                          </h5>
                          <ul className="space-y-2">
                            {feedback.weaknessesFound.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="actions" className="mt-4">
                        <div className="space-y-3">
                          <h5 className="font-medium flex items-center gap-2 text-blue-700">
                            <Lightbulb className="h-4 w-4" />
                            Actions recommandées ({feedback.actionableSteps.length})
                          </h5>
                          <ul className="space-y-2">
                            {feedback.actionableSteps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span className="text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ul>
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