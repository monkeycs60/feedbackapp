import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Euro, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';

interface RoastRequestsListProps {
  roastRequests: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    maxPrice: number;
    feedbacksRequested: number;
    createdAt: Date;
    focusAreas: string[];
    feedbacks: Array<{ id: string; status: string }>;
    applications?: Array<{ id: string; status: string }>;
    _count: {
      feedbacks: number;
      applications?: number;
    };
  }>;
}

export function RoastRequestsList({ roastRequests }: RoastRequestsListProps) {
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

  if (roastRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune demande de roast
            </h3>
            <p className="text-gray-600 mb-6">
              Commence par poster ta première app pour recevoir des feedbacks
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/new-roast">
                Créer ma première demande
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Tes demandes de roast
        </h2>
        <p className="text-sm text-gray-600">
          {roastRequests.length} demande{roastRequests.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {roastRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                      {statusLabels[request.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{request.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-green-600">
                    {request.maxPrice}€
                  </div>
                  <div className="text-sm text-gray-500">budget max</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Focus areas */}
                <div className="flex flex-wrap gap-2">
                  {request.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>

                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{request._count.feedbacks}/{request.feedbacksRequested} feedback{request.feedbacksRequested > 1 ? 's' : ''} demandé{request.feedbacksRequested > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Créée il y a {Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jour{Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex gap-2">
                    {(request.status === 'collecting_applications' || request.status === 'open') && request._count.applications && request._count.applications > 0 && (
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/roast/${request.id}/applications`}>
                          <Users className="w-4 h-4 mr-1" />
                          Candidatures ({request._count.applications})
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/roast/${request.id}`}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Voir détails
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}