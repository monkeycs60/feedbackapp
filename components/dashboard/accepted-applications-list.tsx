'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare, 
  ExternalLink,
  Star,
  Award,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

type AcceptedApplication = {
  id: string;
  status: string;
  score: number;
  selectedAt: Date | null;
  roastRequest: {
    id: string;
    title: string;
    appUrl: string;
    description: string;
    focusAreas: string[];
    maxPrice: number;
    feedbacksRequested: number;
    createdAt: Date;
    creator: {
      id: string;
      name: string | null;
      creatorProfile: {
        company: string | null;
      } | null;
    };
    questions: Array<{
      id: string;
      domain: string;
      text: string;
      order: number;
    }>;
    feedbacks: Array<{
      id: string;
      status: string;
      createdAt: Date;
    }>;
  };
};

interface AcceptedApplicationsListProps {
  applications: AcceptedApplication[];
}

export function AcceptedApplicationsList({ applications }: AcceptedApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune mission acceptée
          </h3>
          <p className="text-gray-600 mb-6">
            Vos candidatures acceptées apparaîtront ici. 
            Consultez le marketplace pour postuler à de nouvelles missions !
          </p>
          <Button asChild>
            <Link href="/marketplace">
              Voir le marketplace
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Mes missions acceptées ({applications.length})
        </h2>
        <div className="text-sm text-gray-600">
          Triées par date de sélection
        </div>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => {
          const roast = application.roastRequest;
          const hasFeedback = roast.feedbacks.length > 0;
          const feedbackStatus = roast.feedbacks[0]?.status || 'not_started';
          
          const getStatusBadge = () => {
            if (!hasFeedback) {
              return <Badge className="bg-orange-100 text-orange-800">À commencer</Badge>;
            }
            
            switch (feedbackStatus) {
              case 'pending':
                return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
              case 'completed':
                return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
              default:
                return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
            }
          };

          const getActionButton = () => {
            if (!hasFeedback) {
              return (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={`/roast/${roast.id}`}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Commencer le feedback
                  </Link>
                </Button>
              );
            }
            
            return (
              <Button asChild variant="outline">
                <Link href={`/roast/${roast.id}`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {feedbackStatus === 'completed' ? 'Voir le feedback' : 'Continuer le feedback'}
                </Link>
              </Button>
            );
          };

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{roast.title}</h3>
                      {getStatusBadge()}
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {application.status === 'auto_selected' ? 'Sélection auto' : 'Sélectionné'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{roast.creator.name}</span>
                        {roast.creator.creatorProfile?.company && (
                          <>
                            <span>•</span>
                            <span>{roast.creator.creatorProfile.company}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Sélectionné le {application.selectedAt ? new Date(application.selectedAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2 mb-4">
                      {roast.description}
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-green-600 mb-1">
                      ~{Math.round(roast.maxPrice / roast.feedbacksRequested)}€
                    </div>
                    <div className="text-sm text-gray-500">estimation</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Domaines à traiter */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Domaines à analyser :</h4>
                    <div className="flex flex-wrap gap-2">
                      {roast.focusAreas.map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Questions à traiter */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Questions spécifiques ({roast.questions.length}) :
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <div className="space-y-2">
                        {roast.questions.slice(0, 3).map((question, index) => (
                          <div key={question.id} className="text-sm text-gray-700">
                            <span className="font-medium">{question.domain}:</span> {question.text}
                          </div>
                        ))}
                        {roast.questions.length > 3 && (
                          <div className="text-sm text-gray-500 italic">
                            +{roast.questions.length - 3} autres questions...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistiques de performance */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Score: {application.score}/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span>1/{roast.feedbacksRequested} roaster{roast.feedbacksRequested > 1 ? 's' : ''}</span>
                      </div>
                      <Link 
                        href={roast.appUrl} 
                        target="_blank" 
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Tester l'app
                      </Link>
                    </div>

                    {getActionButton()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}