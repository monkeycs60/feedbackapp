import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { getRoastApplications } from '@/lib/actions/roast-application';
import { notFound } from 'next/navigation';
import { RoastApplicationsManager } from '@/components/dashboard/roast-applications-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Clock, Star } from 'lucide-react';
import Link from 'next/link';

interface ApplicationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  await requireOnboardingComplete();
  
  const { id } = await params;
  const roastRequest = await getRoastRequestById(id);
  const applications = await getRoastApplications(id);
  
  if (!roastRequest) {
    notFound();
  }

  const statusColors = {
    open: 'bg-green-100 text-green-800',
    collecting_applications: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    open: 'Ouvert',
    collecting_applications: 'Collecte de candidatures',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé'
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const selectedApplications = applications.filter(app => ['accepted', 'auto_selected'].includes(app.status));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au dashboard
              </Link>
            </Button>
            <Badge className={statusColors[roastRequest.status as keyof typeof statusColors]}>
              {statusLabels[roastRequest.status as keyof typeof statusLabels]}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidatures pour "{roastRequest.title}"
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{applications.length} candidature{applications.length > 1 ? 's' : ''} reçue{applications.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{roastRequest.feedbacksRequested} place{roastRequest.feedbacksRequested > 1 ? 's' : ''} à pourvoir</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Sélection automatique dans 24h</span>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center">Candidatures en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{pendingApplications.length}</div>
                <p className="text-sm text-gray-600">À examiner</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center">Sélectionnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{selectedApplications.length}</div>
                <p className="text-sm text-gray-600">Sur {roastRequest.feedbacksRequested} places</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-center">Places restantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {Math.max(0, roastRequest.feedbacksRequested - selectedApplications.length)}
                </div>
                <p className="text-sm text-gray-600">Disponibles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestionnaire de candidatures */}
        <RoastApplicationsManager 
          roastRequest={roastRequest}
          applications={applications}
        />
      </div>
    </div>
  );
}