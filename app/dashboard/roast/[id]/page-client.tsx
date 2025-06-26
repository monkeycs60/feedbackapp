'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Globe, 
  Users, 
  MessageSquare, 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Clock,
  Star,
  AlertCircle,
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedbackDisplayV2 } from '@/components/dashboard/feedback-display-v2';
import { FOCUS_AREAS, APP_CATEGORIES } from '@/lib/types/roast-request';
import { useSearchParams } from 'next/navigation';

interface RoastDetailPageClientProps {
  roastRequest: any; // Type this properly based on your data structure
}

export function RoastDetailPageClient({ roastRequest }: RoastDetailPageClientProps) {
  const searchParams = useSearchParams();

  const validAudiences = roastRequest.targetAudiences?.map((ta: any) => ta.targetAudience) || [];

  const statusColors = {
    open: 'bg-green-100 text-green-800 border-green-200',
    collecting_applications: 'bg-orange-100 text-orange-800 border-orange-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    open: 'Ouvert',
    collecting_applications: 'Candidatures en cours',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé'
  };

  // Organize applications and feedbacks for progress display
  const applications = roastRequest.applications || [];
  const feedbacks = roastRequest.feedbacks || [];
  
  const pendingApplications = applications.filter((app: any) => app.status === 'pending');
  const acceptedApplications = applications.filter((app: any) => 
    app.status === 'accepted' || app.status === 'auto_selected'
  );
  const rejectedApplications = applications.filter((app: any) => app.status === 'rejected');
  
  // Create progress slots for visualization
  const progressSlots = Array.from({ length: roastRequest.feedbacksRequested }, (_, index) => {
    const feedback = feedbacks[index];
    const acceptedApp = acceptedApplications[index];
    
    return {
      index,
      feedback,
      acceptedApp,
      isCompleted: !!feedback,
      isInProgress: !!acceptedApp && !feedback,
      isEmpty: !acceptedApp && !feedback
    };
  });

  const feedbackProgress = {
    total: roastRequest.feedbacksRequested,
    completed: feedbacks.length,
    inProgress: acceptedApplications.length - feedbacks.length,
    remaining: roastRequest.feedbacksRequested - acceptedApplications.length,
    percentage: Math.round((feedbacks.length / roastRequest.feedbacksRequested) * 100)
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header compact */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
        </Button>
        
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{roastRequest.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Badge className={`border ${statusColors[roastRequest.status as keyof typeof statusColors]}`}>
                {statusLabels[roastRequest.status as keyof typeof statusLabels]}
              </Badge>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(roastRequest.createdAt).toLocaleDateString('fr-FR')}
              </div>
              
              <a 
                href={roastRequest.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Globe className="w-4 h-4" />
                Voir l'app
              </a>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{roastRequest.maxPrice}€</div>
            <div className="text-sm text-muted-foreground">Budget total</div>
          </div>
        </div>
        
        {roastRequest.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border mb-6">
            <Image
              src={roastRequest.coverImage}
              alt={roastRequest.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Progress Section avec avatars */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Users className="w-6 h-6 text-blue-600" />
            État des roasters ({feedbackProgress.completed}/{feedbackProgress.total})
            <Badge variant="secondary" className="ml-2">
              {feedbackProgress.percentage}% terminé
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            {feedbackProgress.completed} feedback{feedbackProgress.completed > 1 ? 's' : ''} reçu{feedbackProgress.completed > 1 ? 's' : ''}, 
            {feedbackProgress.inProgress > 0 && ` ${feedbackProgress.inProgress} en cours,`}
            {feedbackProgress.remaining > 0 && ` ${feedbackProgress.remaining} place${feedbackProgress.remaining > 1 ? 's' : ''} restante${feedbackProgress.remaining > 1 ? 's' : ''}`}
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress bar avec avatars */}
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${feedbackProgress.percentage}%` }}
              />
            </div>
            
            {/* Avatars des roasters sur les positions */}
            <div className="flex justify-between items-center">
              {progressSlots.map((slot) => (
                <div key={slot.index} className="flex flex-col items-center gap-2">
                  {slot.isCompleted && slot.feedback ? (
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-green-500">
                        <AvatarImage src={slot.feedback.roaster?.avatar} />
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {getInitials(slot.feedback.roaster?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <CheckCircle2 className="absolute -bottom-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                    </div>
                  ) : slot.isInProgress && slot.acceptedApp ? (
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-blue-500">
                        <AvatarImage src={slot.acceptedApp.roaster?.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getInitials(slot.acceptedApp.roaster?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <Clock className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="text-xs text-center">
                    {slot.isCompleted ? (
                      <span className="text-green-600 font-medium">✓ Terminé</span>
                    ) : slot.isInProgress ? (
                      <span className="text-blue-600 font-medium">⏳ En cours</span>
                    ) : (
                      <span className="text-gray-500">En attente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidatures Section - Toujours visible et mise en avant */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Candidatures 
              {pendingApplications.length > 0 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {pendingApplications.length} en attente
                </Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground">
              {applications.length} candidature{applications.length > 1 ? 's' : ''} reçue{applications.length > 1 ? 's' : ''} 
              ({acceptedApplications.length} acceptée{acceptedApplications.length > 1 ? 's' : ''}, 
              {rejectedApplications.length} rejetée{rejectedApplications.length > 1 ? 's' : ''}, 
              {pendingApplications.length} en attente)
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Candidatures en attente - priorité */}
              {pendingApplications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    En attente de votre décision ({pendingApplications.length})
                  </h4>
                  {pendingApplications.map((app: any) => (
                    <div key={app.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={app.roaster?.avatar} />
                            <AvatarFallback>
                              {getInitials(app.roaster?.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{app.roaster?.name || 'Roaster anonyme'}</h5>
                              {app.roaster?.roasterProfile?.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-muted-foreground">
                                    {app.roaster.roasterProfile.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {app.roaster?.roasterProfile?.bio || 'Aucune bio disponible'}
                            </p>
                            
                            {app.motivation && (
                              <div className="bg-white border rounded p-2 text-sm">
                                <strong>Motivation:</strong> {app.motivation}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Accepter
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Candidatures acceptées */}
              {acceptedApplications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Roasters en mission ({acceptedApplications.length})
                  </h4>
                  {acceptedApplications.map((app: any) => (
                    <div key={app.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={app.roaster?.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(app.roaster?.name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{app.roaster?.name || 'Roaster anonyme'}</span>
                            {feedbacks.find((f: any) => f.roasterId === app.roasterId && f.status === 'completed') ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">✓ Feedback livré</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">⏳ En cours</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedbacks reçus */}
      {feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Feedbacks reçus ({feedbacks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackDisplayV2 feedbacks={feedbacks} />
          </CardContent>
        </Card>
      )}

      {/* Informations du projet */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Description
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {roastRequest.description}
            </p>
          </div>

          {/* URL de l'app */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Tester l'application
            </h3>
            <a
              href={roastRequest.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Ouvrir l'application
              <Globe className="w-4 h-4" />
            </a>
            <p className="text-sm text-muted-foreground mt-1 break-all">
              {roastRequest.appUrl}
            </p>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <h3 className="font-semibold mb-3">Type de projet</h3>
              {roastRequest.category && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const categoryInfo = APP_CATEGORIES.find(cat => cat.id === roastRequest.category);
                    return categoryInfo ? (
                      <>
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <div>
                          <span className="font-medium">{categoryInfo.label}</span>
                          <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
                        </div>
                      </>
                    ) : (
                      <span>{roastRequest.category}</span>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Target Audiences */}
            <div>
              <h3 className="font-semibold mb-3">Audiences cibles</h3>
              <div className="flex flex-wrap gap-2">
                {validAudiences.map((audience: any) => (
                  <Badge key={audience.id} variant="secondary">
                    {audience.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Questions par domaine */}
          {roastRequest.questions && roastRequest.questions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Questions par domaine
              </h3>
              
              <div className="space-y-4">
                {roastRequest.focusAreas.map((domain: string) => {
                  const domainQuestions = roastRequest.questions
                    .filter((q: any) => q.domain === domain)
                    .sort((a: any, b: any) => a.order - b.order);
                  
                  if (domainQuestions.length === 0) return null;
                  
                  const focusArea = FOCUS_AREAS.find(area => area.id === domain);
                  
                  return (
                    <div key={domain} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        {focusArea && <span className="text-xl">{focusArea.icon}</span>}
                        <h4 className="font-medium">{focusArea?.label || domain}</h4>
                        <Badge variant="outline" className="ml-auto">
                          {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {domainQuestions.map((question: any, index: number) => (
                          <div key={question.id} className="flex items-start gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                            <p className="flex-1">{question.text}</p>
                            {!question.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Personnalisée
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}