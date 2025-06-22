'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Users, MessageSquare, ChevronLeft, CheckCircle2, Circle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedbackDisplayV2 } from '@/components/dashboard/feedback-display-v2';
import { FOCUS_AREAS, APP_CATEGORIES } from '@/lib/types/roast-request';
import { ApplicationsModal } from '@/components/dashboard/applications-modal';
import { useSearchParams } from 'next/navigation';

interface RoastDetailPageClientProps {
  roastRequest: any; // Type this properly based on your data structure
}

export function RoastDetailPageClient({ roastRequest }: RoastDetailPageClientProps) {
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const searchParams = useSearchParams();

  // Check if we should open applications modal on page load
  useEffect(() => {
    if (searchParams.get('tab') === 'applications') {
      setIsApplicationsModalOpen(true);
    }
  }, [searchParams]);

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

  const feedbackProgress = {
    total: roastRequest.feedbacksRequested,
    completed: roastRequest.feedbacks.length,
    percentage: Math.round((roastRequest.feedbacks.length / roastRequest.feedbacksRequested) * 100)
  };

  // Check for unprocessed applications
  const pendingApplications = roastRequest.applications?.filter((app: any) => app.status === 'pending') || [];
  const hasUnprocessedApplications = pendingApplications.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with cover image */}
      <div className="relative mb-8">
        {/* Cover image */}
        {roastRequest.coverImage && (
          <div className="absolute inset-0 h-48 overflow-hidden rounded-xl">
            <Image
              src={roastRequest.coverImage}
              alt={roastRequest.title}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
        )}
        
        {/* Header content */}
        <div className={`relative ${roastRequest.coverImage ? 'pt-16 pb-4 px-4' : ''}`}>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-3">{roastRequest.title}</h1>
              
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
              <div className="text-sm text-muted-foreground">Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Progress - Prominent position */}
      <div className="mb-8 p-6 rounded-xl bg-card border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Progression des feedbacks
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {feedbackProgress.completed} sur {feedbackProgress.total} feedbacks reçus
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{feedbackProgress.percentage}%</div>
            <div className="text-sm text-muted-foreground">Complété</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${feedbackProgress.percentage}%` }}
          />
        </div>
        
        {/* Feedback icons */}
        <div className="flex gap-1 mt-4">
          {Array.from({ length: feedbackProgress.total }).map((_, i) => (
            <div key={i} className="flex-1">
              {i < feedbackProgress.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
              )}
            </div>
          ))}
        </div>
        
        {/* Applications button - Always show but with different text based on pending applications */}
        <div className="mt-4 pt-4 border-t">
          <Button 
            onClick={() => setIsApplicationsModalOpen(true)}
            variant={hasUnprocessedApplications ? "default" : "outline"}
            className="w-full"
          >
            {hasUnprocessedApplications ? (
              <>Gérer les {pendingApplications.length} candidature{pendingApplications.length > 1 ? 's' : ''} en attente</>
            ) : (
              <>Voir les candidatures{roastRequest.applications && roastRequest.applications.length > 0 ? ` (${roastRequest.applications.length})` : ''}</>
            )}
          </Button>
        </div>
      </div>

      {/* Feedbacks if any - Now more prominent */}
      {roastRequest.feedbacks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feedbacks reçus</h2>
          <FeedbackDisplayV2 feedbacks={roastRequest.feedbacks} />
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {roastRequest.description}
            </p>
          </div>

          {/* Category and Target Audiences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Type de projet</h2>
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
              <h2 className="text-lg font-semibold mb-3">Audiences cibles</h2>
              <div className="flex flex-wrap gap-2">
                {validAudiences.map((audience: any) => (
                  <Badge key={audience.id} variant="secondary">
                    {audience.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Domaines et questions */}
          {roastRequest.questions && roastRequest.questions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Types de feedback demandés
              </h2>
              
              <div className="space-y-6">
                {roastRequest.focusAreas.map((domain: string) => {
                  const domainQuestions = roastRequest.questions
                    .filter((q: any) => q.domain === domain)
                    .sort((a: any, b: any) => a.order - b.order);
                  
                  if (domainQuestions.length === 0) return null;
                  
                  const focusArea = FOCUS_AREAS.find(area => area.id === domain);
                  
                  return (
                    <div key={domain} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {focusArea && <span className="text-xl">{focusArea.icon}</span>}
                        <h3 className="font-medium">{focusArea?.label || domain}</h3>
                        <Badge variant="outline" className="ml-auto">
                          {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {domainQuestions.map((question: any, index: number) => (
                          <div key={question.id} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground">{index + 1}.</span>
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
        </div>

        {/* Sidebar - Simplified */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Quick stats */}
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-3">Résumé</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span>{roastRequest.category || 'Non spécifiée'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domaines</span>
                  <span>{roastRequest.focusAreas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span>{roastRequest.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temps restant</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {roastRequest.status === 'completed' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {roastRequest.status === 'open' && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Modifier
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Mettre en pause
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications Modal */}
      <ApplicationsModal
        isOpen={isApplicationsModalOpen}
        onClose={() => setIsApplicationsModalOpen(false)}
        roastRequest={roastRequest}
        applications={roastRequest.applications || []}
      />
    </div>
  );
}