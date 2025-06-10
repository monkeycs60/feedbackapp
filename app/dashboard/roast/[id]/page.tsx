import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Target, Users } from 'lucide-react';
import Link from 'next/link';

interface RoastDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RoastDetailPage({ params }: RoastDetailPageProps) {
  await requireOnboardingComplete();
  
  const roastRequest = await getRoastRequestById(params.id);
  
  if (!roastRequest) {
    notFound();
  }

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    open: 'Ouvert',
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
              <span>{roastRequest.feedbacks.length} feedback{roastRequest.feedbacks.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

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