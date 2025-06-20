'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  MessageSquare, 
  ExternalLink,
  Star,
  ArrowRight,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
    coverImage?: string | null;
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
  // Séparer les missions par statut
  const ongoingMissions = applications.filter(app => {
    const hasFeedback = app.roastRequest.feedbacks.length > 0;
    const feedbackStatus = app.roastRequest.feedbacks[0]?.status || 'not_started';
    return !hasFeedback || (feedbackStatus !== 'completed');
  });
  
  const completedMissions = applications.filter(app => {
    const hasFeedback = app.roastRequest.feedbacks.length > 0;
    const feedbackStatus = app.roastRequest.feedbacks[0]?.status || 'not_started';
    return hasFeedback && feedbackStatus === 'completed';
  });

  if (applications.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            Aucune mission acceptée
          </h3>
          <p className="text-gray-300 mb-6">
            Vos candidatures acceptées apparaîtront ici. 
            Consultez le marketplace pour postuler à de nouvelles missions !
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/marketplace">
              Voir le marketplace
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderMissionCard = (application: AcceptedApplication) => {
    const roast = application.roastRequest;
    const hasFeedback = roast.feedbacks.length > 0;
    const feedbackStatus = roast.feedbacks[0]?.status || 'not_started';
    const earnings = Math.round(roast.maxPrice / roast.feedbacksRequested);
    const isCompleted = hasFeedback && feedbackStatus === 'completed';
    
    return (
      <Card key={application.id} className="bg-white border hover:border-gray-300 transition-all duration-200 hover:shadow-lg overflow-hidden group relative">
        {/* Badge de gains amélioré */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg transform rotate-3 ${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}>
            {isCompleted ? `+${earnings}€` : `~${earnings}€`}
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-gray-500 font-medium">
              {isCompleted ? 'Gagné' : 'Potentiel'}
            </span>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="flex h-36">
            {/* App Cover Image */}
            <div className="w-32 h-36 flex-shrink-0 relative bg-gray-100">
              {roast.coverImage ? (
                <Image
                  src={roast.coverImage}
                  alt={roast.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-purple-500/30 flex items-center justify-center">
                  <ExternalLink className="h-7 w-7 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between pr-20">
              <div>
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-1">
                    {roast.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500">
                    {roast.creator.name}
                    {roast.creator.creatorProfile?.company && (
                      <span className="text-gray-400"> • {roast.creator.creatorProfile.company}</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                  {roast.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-yellow-600">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">{application.score}/100</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">1/{roast.feedbacksRequested}</span>
                  </div>
                  
                  <span className="text-gray-500 text-sm">
                    {roast.questions.length} question{roast.questions.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Link 
                    href={roast.appUrl} 
                    target="_blank" 
                    className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Tester l&apos;app</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Focus Areas Tags */}
          {roast.focusAreas.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {roast.focusAreas.slice(0, 3).map((area) => (
                  <Badge key={area} variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-1">
                    {area}
                  </Badge>
                ))}
                {roast.focusAreas.length > 3 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs px-2 py-1">
                    +{roast.focusAreas.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="px-4 pb-4">
            <Button 
              asChild 
              size="sm"
              className={`w-full ${
                isCompleted 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white font-medium`}
            >
              <Link href={`/roast/${roast.id}`}>
                {!hasFeedback ? (
                  <><ArrowRight className="w-4 h-4 mr-2" />Commencer le feedback</>
                ) : isCompleted ? (
                  <><MessageSquare className="w-4 h-4 mr-2" />Voir le feedback</>
                ) : (
                  <><MessageSquare className="w-4 h-4 mr-2" />Continuer le feedback</>
                )}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Missions en cours / à commencer */}
      {ongoingMissions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">
              Missions en cours ({ongoingMissions.length})
            </h2>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              À compléter
            </Badge>
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {ongoingMissions.map(renderMissionCard)}
          </div>
        </div>
      )}
      
      {/* Missions terminées */}
      {completedMissions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">
              Missions terminées ({completedMissions.length})
            </h2>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Complétées
            </Badge>
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {completedMissions.map(renderMissionCard)}
          </div>
        </div>
      )}
    </div>
  );
}