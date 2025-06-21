import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedbacksListProps {
  feedbacks: Array<{
    id: string;
    status: string;
    roaster: {
      id: string;
      name: string | null;
      roasterProfile: {
        bio: string | null;
        specialties: string[];
        rating: number;
      } | null;
    };
    generalFeedback: string;
    finalPrice: number | null;
    createdAt: Date;
    roastRequest: {
      id: string;
      title: string;
      questions?: Array<{
        id: string;
        domain: string;
        text: string;
        order: number;
        isDefault: boolean;
      }>;
    };
    questionResponses?: Array<{
      id: string;
      questionId: string;
      response: string;
      createdAt: Date;
    }>;
  }>;
}

export function FeedbacksList({ feedbacks }: FeedbacksListProps) {
  if (feedbacks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-center mb-4">
            Aucun feedback reçu pour le moment
          </p>
          <p className="text-sm text-gray-400 text-center">
            Les feedbacks de vos roasters apparaîtront ici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedbacks reçus</h2>
      
      {feedbacks.map((feedback) => (
        <Card key={feedback.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-backgroundlighter">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {feedback.roaster.name || 'Roaster anonyme'}
                  {feedback.roaster.roasterProfile && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {feedback.roaster.roasterProfile.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  <Link 
                    href={`/dashboard/roast/${feedback.roastRequest.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {feedback.roastRequest.title}
                  </Link>
                  <span className="text-gray-400 ml-2">•</span>
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(feedback.createdAt), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={feedback.status === 'completed' ? 'default' : 'secondary'}>
                  {feedback.status === 'completed' ? 'Complété' : 
                   feedback.status === 'pending' ? 'En attente' : 'Contesté'}
                </Badge>
                {feedback.finalPrice && (
                  <span className="font-semibold text-green-600">
                    {feedback.finalPrice}€
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback général</h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {feedback.generalFeedback}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-1">
                    Questions traitées
                  </h4>
                  <p className="text-lg font-semibold text-blue-600">
                    {feedback.questionResponses?.length || 0}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-700 mb-1">
                    Domaines couverts
                  </h4>
                  <p className="text-lg font-semibold text-purple-600">
                    {feedback.questionResponses && feedback.questionResponses.length > 0 && feedback.roastRequest.questions ? 
                      [...new Set(
                        feedback.questionResponses
                          .map(qr => feedback.roastRequest.questions?.find(q => q.id === qr.questionId)?.domain)
                          .filter(Boolean)
                      )].length : 0
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/roast/${feedback.roastRequest.id}#feedback-${feedback.id}`}>
                  Voir le feedback complet
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}