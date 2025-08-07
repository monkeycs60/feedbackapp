import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  roastRequests: Array<{
    id: string;
    status: string;
    maxPrice: number | null;
    feedbacksRequested: number;
    feedbacks: Array<{ id: string; status: string }>;
  }>;
  activeFilter: 'all' | 'feedbacks';
  onFilterChange: (filter: 'all' | 'feedbacks') => void;
}

export function DashboardStats({ roastRequests, activeFilter, onFilterChange }: DashboardStatsProps) {
  const stats = {
    totalRequests: roastRequests.length,
    activeRequests: roastRequests.filter(r => {
      const hasAllFeedbacks = r.feedbacks.length >= r.feedbacksRequested;
      return (r.status === 'open' || r.status === 'in_progress') && !hasAllFeedbacks;
    }).length,
    completedRequests: roastRequests.filter(r => {
      const hasAllFeedbacks = r.feedbacks.length >= r.feedbacksRequested;
      return r.status === 'completed' || hasAllFeedbacks;
    }).length,
    totalBudget: roastRequests.reduce((sum, r) => sum + (r.maxPrice || 0), 0),
    feedbacksReceived: roastRequests.reduce((sum, r) => sum + r.feedbacks.length, 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg bg-backgroundlighter",
          activeFilter === 'all' && "ring-2 ring-blue-500 shadow-lg"
        )}
        onClick={() => onFilterChange('all')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Toutes mes demandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground" data-testid="stat-total-requests">
            {stats.totalRequests}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.activeRequests} en cours • {stats.completedRequests} terminées
          </div>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg bg-backgroundlighter",
          activeFilter === 'feedbacks' && "ring-2 ring-purple-500 shadow-lg"
        )}
        onClick={() => onFilterChange('feedbacks')}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Feedbacks reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-400" data-testid="stat-feedbacks-received">
            {stats.feedbacksReceived}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Sur {stats.totalRequests} projet{stats.totalRequests > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}