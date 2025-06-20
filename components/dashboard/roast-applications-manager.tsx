'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  User, 
  Award, 
  TrendingUp, 
  MessageCircle, 
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { manualSelectRoasters } from '@/lib/actions/roast-application';
import { useRouter } from 'next/navigation';

interface RoastApplication {
  id: string;
  motivation: string | null;
  status: string;
  score: number;
  createdAt: Date;
  roaster: {
    id: string;
    name: string | null;
    roasterProfile: {
      specialties: string[];
      experience: string;
      rating: number;
      completedRoasts: number;
      level: string;
      bio: string | null;
      completionRate: number;
    } | null;
  };
}

interface RoastApplicationsManagerProps {
  roastRequest: {
    id: string;
    title: string;
    feedbacksRequested: number;
    focusAreas: string[];
    status: string;
  };
  applications: RoastApplication[];
}

export function RoastApplicationsManager({ roastRequest, applications }: RoastApplicationsManagerProps) {
  const router = useRouter();
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const selectedApplicationsData = applications.filter(app => ['accepted', 'auto_selected'].includes(app.status));
  const canSelect = roastRequest.status === 'collecting_applications' || roastRequest.status === 'open';

  const handleApplicationToggle = (applicationId: string) => {
    if (selectedApplications.includes(applicationId)) {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    } else {
      if (selectedApplications.length < roastRequest.feedbacksRequested) {
        setSelectedApplications(prev => [...prev, applicationId]);
      }
    }
  };

  const handleSelectRoasters = async () => {
    if (selectedApplications.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await manualSelectRoasters(roastRequest.id, selectedApplications);
      router.refresh();
    } catch (error) {
      console.error('Erreur sélection:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la sélection');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      rookie: { color: 'bg-gray-100 text-gray-800', label: 'Rookie' },
      verified: { color: 'bg-blue-100 text-blue-800', label: 'Verified' },
      expert: { color: 'bg-purple-100 text-purple-800', label: 'Expert' },
      master: { color: 'bg-yellow-100 text-yellow-800', label: 'Master' }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.rookie;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'Expert': return 'text-green-600';
      case 'Intermédiaire': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (pendingApplications.length === 0 && selectedApplicationsData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune candidature pour le moment
          </h3>
          <p className="text-gray-600">
            Les roasters n'ont pas encore candidaté pour cette mission. 
            Les candidatures apparaîtront ici dès qu'elles seront soumises.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Candidatures déjà sélectionnées */}
      {selectedApplicationsData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Roasters sélectionnés ({selectedApplicationsData.length})
          </h2>
          
          <div className="grid gap-4">
            {selectedApplicationsData.map((application) => (
              <Card key={application.id} className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">
                          {application.roaster.name || 'Roaster anonyme'}
                        </h3>
                        {getLevelBadge(application.roaster.roasterProfile?.level || 'rookie')}
                        <Badge className="bg-green-100 text-green-800">
                          {application.status === 'auto_selected' ? 'Sélection auto' : 'Sélectionné'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{application.roaster.roasterProfile?.rating.toFixed(1) || '0.0'}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>{application.roaster.roasterProfile?.completedRoasts || 0} roasts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className={getExperienceColor(application.roaster.roasterProfile?.experience || 'Débutant')}>
                            {application.roaster.roasterProfile?.experience || 'Débutant'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{application.score}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Candidatures en attente */}
      {pendingApplications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Candidatures en attente ({pendingApplications.length})
            </h2>
            
            {canSelect && selectedApplications.length > 0 && (
              <Button 
                onClick={handleSelectRoasters}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Sélection...' : `Sélectionner ${selectedApplications.length} roaster${selectedApplications.length > 1 ? 's' : ''}`}
              </Button>
            )}
            
            {!canSelect && roastRequest.status === 'in_progress' && (
              <Badge variant="outline" className="text-sm">
                Sélection terminée - Roast en cours
              </Badge>
            )}
          </div>

          {canSelect && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous pouvez sélectionner jusqu'à {roastRequest.feedbacksRequested - selectedApplicationsData.length} roaster{roastRequest.feedbacksRequested - selectedApplicationsData.length > 1 ? 's' : ''} supplémentaire{roastRequest.feedbacksRequested - selectedApplicationsData.length > 1 ? 's' : ''}. 
                Si vous ne faites pas de sélection, les meilleurs scores seront automatiquement choisis dans 24h.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {pendingApplications
              .sort((a, b) => b.score - a.score)
              .map((application, index) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {canSelect && (
                      <Checkbox
                        checked={selectedApplications.includes(application.id)}
                        onCheckedChange={() => handleApplicationToggle(application.id)}
                        disabled={!selectedApplications.includes(application.id) && selectedApplications.length >= (roastRequest.feedbacksRequested - selectedApplicationsData.length)}
                        className="mt-1"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">
                            {application.roaster.name || 'Roaster anonyme'}
                          </h3>
                          {getLevelBadge(application.roaster.roasterProfile?.level || 'rookie')}
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            #{index + 1} • Score: {application.score}/100
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Stats du roaster */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{application.roaster.roasterProfile?.rating.toFixed(1) || '0.0'}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-500" />
                          <span>{application.roaster.roasterProfile?.completedRoasts || 0} roasts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className={getExperienceColor(application.roaster.roasterProfile?.experience || 'Débutant')}>
                            {application.roaster.roasterProfile?.experience || 'Débutant'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-500" />
                          <span>{application.roaster.roasterProfile?.completionRate || 100}% fiabilité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Candidat #{index + 1}</span>
                        </div>
                      </div>

                      {/* Spécialités */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Spécialités :</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.roaster.roasterProfile?.specialties.map((specialty) => {
                            const isMatching = roastRequest.focusAreas.includes(specialty);
                            return (
                              <Badge 
                                key={specialty} 
                                variant={isMatching ? "default" : "secondary"}
                                className={isMatching ? "bg-green-100 text-green-800" : ""}
                              >
                                {specialty}
                                {isMatching && " ✓"}
                              </Badge>
                            );
                          }) || <span className="text-gray-500 text-sm">Aucune spécialité renseignée</span>}
                        </div>
                      </div>

                      {/* Message de motivation */}
                      {application.motivation && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Message de motivation :</h4>
                          <p className="text-sm text-gray-700 italic">"{application.motivation}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}