import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { hasAppliedForRoast } from '@/lib/actions/roast-application';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { RoastApplicationForm } from '@/components/feedback/roast-application-form';
import { RoastFeedbackForm } from '@/components/feedback/roast-feedback-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Target, Users, MessageSquare, ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RoastPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoastPage({ params }: RoastPageProps) {
  await requireOnboardingComplete();
  
  const { id } = await params;
  const roastRequest = await getRoastRequestById(id);
  const hasApplied = await hasAppliedForRoast(id);
  
  if (!roastRequest) {
    notFound();
  }

  // Vérifier si l'utilisateur actuel a une candidature acceptée
  const session = await auth.api.getSession({ headers: await headers() });
  const userApplication = await prisma.roastApplication.findUnique({
    where: {
      roastRequestId_roasterId: {
        roastRequestId: id,
        roasterId: session?.user?.id || ''
      }
    }
  });
  
  const isAcceptedRoaster = userApplication?.status === 'accepted' || userApplication?.status === 'auto_selected';

  // Si le roast n'est pas ouvert ET que l'utilisateur n'est pas un roaster accepté
  if (!['open', 'collecting_applications', 'in_progress'].includes(roastRequest.status) || 
      (roastRequest.status === 'in_progress' && !isAcceptedRoaster)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Cette demande n&apos;est plus disponible
              </h1>
              <p className="text-gray-600 mb-6">
                Cette demande de roast a été fermée ou est déjà en cours de traitement.
              </p>
              <Button asChild>
                <Link href="/marketplace">
                  Voir d&apos;autres demandes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/marketplace">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au marketplace
              </Link>
            </Button>
            <Badge className={
              roastRequest.status === 'open' ? "bg-green-100 text-green-800" :
              roastRequest.status === 'collecting_applications' ? "bg-orange-100 text-orange-800" :
              roastRequest.status === 'in_progress' && isAcceptedRoaster ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }>
              {roastRequest.status === 'open' ? 'Ouvert aux candidatures' :
               roastRequest.status === 'collecting_applications' ? 'Candidatures en cours' :
               roastRequest.status === 'in_progress' && isAcceptedRoaster ? 'Mission acceptée' :
               'Fermé'}
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
              <span>Par {roastRequest.creator.name || 'Créateur anonyme'}</span>
            </div>
            <div className="text-lg font-semibold text-green-600">
              Budget: {roastRequest.maxPrice}€ • {roastRequest.feedbacksRequested} feedback{roastRequest.feedbacksRequested > 1 ? 's' : ''} demandé{roastRequest.feedbacksRequested > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations du roast */}
          <div className="space-y-6">
            {/* Image de couverture */}
            {roastRequest.coverImage ? (
              <Card>
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
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">Aucune image de couverture</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description du projet</CardTitle>
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

            {/* URL de l'app */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Tester l&apos;application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={roastRequest.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ouvrir l&apos;application
                  <Globe className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-500 mt-1 break-all">
                  {roastRequest.appUrl}
                </p>
              </CardContent>
            </Card>

            {/* Domaines de feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Domaines à analyser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roastRequest.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-sm">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Questions spécifiques */}
            {roastRequest.questions && roastRequest.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Questions à traiter
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Points spécifiques à aborder dans votre feedback
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {roastRequest.focusAreas.map((domain) => {
                      const domainQuestions = roastRequest.questions
                        .filter(q => q.domain === domain)
                        .sort((a, b) => a.order - b.order);
                      
                      if (domainQuestions.length === 0) return null;
                      
                      return (
                        <div key={domain} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">{domain}</Badge>
                            <span className="text-sm text-gray-500">
                              {domainQuestions.length} question{domainQuestions.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {domainQuestions.map((question, index) => (
                              <div key={question.id} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                  {index + 1}
                                </span>
                                <p className="text-gray-800 text-sm">{question.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Formulaire de candidature ou de feedback */}
          <div className="lg:sticky lg:top-8">
            {isAcceptedRoaster && roastRequest.status === 'in_progress' ? (
              <RoastFeedbackForm roastRequest={roastRequest} />
            ) : (
              <RoastApplicationForm roastRequest={roastRequest} hasApplied={hasApplied} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}