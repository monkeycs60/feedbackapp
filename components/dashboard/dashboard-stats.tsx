import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  roastRequests: Array<{
    id: string;
    status: string;
    maxPrice: number;
    feedbacks: Array<{ id: string; status: string }>;
  }>;
}

export function DashboardStats({ roastRequests }: DashboardStatsProps) {
  const stats = {
    totalRequests: roastRequests.length,
    activeRequests: roastRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    completedRequests: roastRequests.filter(r => r.status === 'completed').length,
    totalBudget: roastRequests.reduce((sum, r) => sum + r.maxPrice, 0),
    feedbacksReceived: roastRequests.reduce((sum, r) => sum + r.feedbacks.length, 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Demandes total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900" data-testid="stat-total-requests">{stats.totalRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">En cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600" data-testid="stat-active-requests">{stats.activeRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Terminées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600" data-testid="stat-completed-requests">{stats.completedRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Feedbacks reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600" data-testid="stat-feedbacks-received">{stats.feedbacksReceived}</div>
        </CardContent>
      </Card>
    </div>
  );
}