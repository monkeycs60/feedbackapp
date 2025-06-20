import { getRealTimeRoasterStats } from '@/lib/actions/roaster-stats';
import { RoasterStatsClient } from './roaster-stats-client';

type AcceptedApplication = {
  id: string;
  status: string;
  roastRequest: {
    feedbacks: Array<{
      id: string;
      status: string;
    }>;
  };
};

interface RoasterStatsServerProps {
  acceptedApplications: AcceptedApplication[];
}

export async function RoasterStatsServer({ acceptedApplications }: RoasterStatsServerProps) {
  // Calculer les stats en temps réel côté serveur
  const stats = await getRealTimeRoasterStats();

  // Calculer les missions terminées dans cette session uniquement
  const sessionCompleted = acceptedApplications.filter((app) => {
    const feedback = app.roastRequest.feedbacks[0];
    return feedback && feedback.status === 'completed';
  }).length;

  return <RoasterStatsClient stats={stats} sessionCompleted={sessionCompleted} />;
}