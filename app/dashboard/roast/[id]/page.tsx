import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, Users, MessageSquare, ChevronLeft, CheckCircle2, Circle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedbackDisplayV2 } from '@/components/dashboard/feedback-display-v2';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FOCUS_AREAS, APP_CATEGORIES } from '@/lib/types/roast-request';
import { RoastDetailPageClient } from './page-client';

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

  // Get target audiences from the many-to-many relation
  const validAudiences = roastRequest.targetAudiences?.map(ta => ta.targetAudience) || [];

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

  return (
    <DashboardLayout>
      <RoastDetailPageClient roastRequest={roastRequest} />
    </DashboardLayout>
  );
}