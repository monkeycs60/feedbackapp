import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getRoastRequestById } from '@/lib/actions/roast-request';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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


  return (
    <DashboardLayout>
      <RoastDetailPageClient roastRequest={roastRequest} />
    </DashboardLayout>
  );
}