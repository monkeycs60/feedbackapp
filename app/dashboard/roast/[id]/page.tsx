import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Target, Users, MessageSquare, ImageIcon, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RoastDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoastDetailPage({ params }: RoastDetailPageProps) {
  await requireOnboardingComplete();
  
  const { id } = await params;
  const roastRequest = await getRoastRequestById(id);
  
  if (!roastRequest) {
    notFound();
  }

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    collecting_applications: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    open: 'Ouvert',
    collecting_applications: 'Candidatures en cours',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">← Retour au dashboard</Link>
            </Button>
            <Badge className={statusColors[roastRequest.status as keyof typeof statusColors]}>
              {statusLabels[roastRequest.status as keyof typeof statusLabels]}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {roastRequest.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Créé le {new Date(roastRequest.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{roastRequest.feedbacks.length}/{roastRequest.feedbacksRequested} feedback{roastRequest.feedbacksRequested > 1 ? 's' : ''} demandé{roastRequest.feedbacksRequested > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Image de couverture */}
        {roastRequest.coverImage ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Aperçu de l&apos;application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={roastRequest.coverImage}
                  alt={roastRequest.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">Aucune image de couverture</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{roastRequest.description}</p>
              </CardContent>
            </Card>

            {/* Audience cible */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Audience cible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{roastRequest.targetAudience}</p>
              </CardContent>
            </Card>

            {/* Domaines de feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Domaines de feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roastRequest.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Questions par domaine */}
            {roastRequest.questions && roastRequest.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Questions spécifiques
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Questions personnalisées pour chaque domaine de feedback
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {roastRequest.focusAreas.map((domain, domainIndex) => {
                      const domainQuestions = roastRequest.questions
                        .filter(q => q.domain === domain)
                        .sort((a, b) => a.order - b.order);
                      
                      if (domainQuestions.length === 0) return null;
                      
                      // Couleurs pour différencier les domaines
                      const domainColors = {
                        UX: 'from-purple-500 to-purple-600',
                        Onboarding: 'from-blue-500 to-blue-600', 
                        Pricing: 'from-green-500 to-green-600',
                        Performance: 'from-orange-500 to-orange-600',
                        Marketing: 'from-pink-500 to-pink-600',
                        Development: 'from-indigo-500 to-indigo-600',
                        Business: 'from-teal-500 to-teal-600'
                      };
                      
                      const gradientClass = domainColors[domain as keyof typeof domainColors] || 'from-gray-500 to-gray-600';
                      
                      return (
                        <div key={domain} className="relative">
                          {/* Ligne de séparation colorée */}
                          <div className={`h-1 w-full bg-gradient-to-r ${gradientClass} rounded-full mb-4`}></div>
                          
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
                            {/* Header du domaine */}
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${gradientClass} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                  {domain.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{domain}</h3>
                                  <p className="text-sm text-gray-500">
                                    {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''} à traiter
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="bg-white/80 text-gray-700 border border-gray-300"
                              >
                                Domaine {domainIndex + 1}
                              </Badge>
                            </div>
                            
                            {/* Questions */}
                            <div className="space-y-4">
                              {domainQuestions.map((question, index) => (
                                <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-gray-800 leading-relaxed font-medium">
                                        {question.text}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        {!question.isDefault && (
                                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                            ✨ Question personnalisée
                                          </Badge>
                                        )}
                                        {question.isDefault && (
                                          <Badge variant="outline" className="text-xs text-gray-500">
                                            📋 Question standard
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedbacks reçus */}
            {roastRequest.feedbacks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Feedbacks reçus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roastRequest.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {feedback.roaster.name || 'Roaster anonyme'}
                          </span>
                          <Badge variant="outline">{feedback.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Feedback en cours de création...
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {roastRequest.maxPrice}€
                  </div>
                  <p className="text-sm text-gray-600">Budget maximum</p>
                </div>
              </CardContent>
            </Card>

            {/* URL de l'app */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  URL de l'app
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={roastRequest.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {roastRequest.appUrl}
                </a>
              </CardContent>
            </Card>

            {/* Candidatures */}
            {(roastRequest.applications?.length || 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Candidatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {roastRequest.applications?.length || 0}
                    </div>
                    <p className="text-sm text-gray-600">
                      candidature{(roastRequest.applications?.length || 0) > 1 ? 's' : ''} reçue{(roastRequest.applications?.length || 0) > 1 ? 's' : ''}
                    </p>
                    
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/roast/${roastRequest.id}/applications`}>
                        {roastRequest.status === 'in_progress' ? 'Voir les candidatures' : 'Gérer les candidatures'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roastRequest.status === 'open' && (
                  <>
                    <Button variant="outline" className="w-full">
                      Modifier
                    </Button>
                    <Button variant="outline" className="w-full">
                      Mettre en pause
                    </Button>
                  </>
                )}
                
                <Button variant="destructive" className="w-full">
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}