'use client';

import { useState, useMemo } from 'react';
import { DashboardStats } from './dashboard-stats';
import { RoastRequestsList } from './roast-requests-list';
import { FeedbacksList } from './feedbacks-list';

interface CreatorDashboardContentProps {
  roastRequests: Array<{
    id: string;
    title: string;
    status: string;
    maxPrice: number;
    createdAt: Date;
    feedbacks: Array<{ 
      id: string; 
      status: string;
      roaster: {
        id: string;
        name: string | null;
        roasterProfile: {
          bio: string | null;
          specialties: string[];
          rating: number;
        } | null;
      };
      firstImpression: string;
      strengthsFound: string[];
      weaknessesFound: string[];
      actionableSteps: string[];
      competitorComparison: string | null;
      finalPrice: number | null;
      createdAt: Date;
    }>;
    applications: Array<{ id: string; status: string }>;
  }>;
}

export function CreatorDashboardContent({ roastRequests }: CreatorDashboardContentProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'feedbacks'>('all');

  const filteredContent = useMemo(() => {
    if (activeFilter === 'feedbacks') {
      // Extraire tous les feedbacks avec leurs roast requests
      const allFeedbacks = roastRequests.flatMap(roast => 
        roast.feedbacks.map(feedback => ({
          ...feedback,
          roastRequest: {
            id: roast.id,
            title: roast.title
          }
        }))
      );
      return { type: 'feedbacks' as const, data: allFeedbacks };
    }

    // Filtrer les roast requests
    let filtered = roastRequests;
    if (activeFilter === 'active') {
      filtered = roastRequests.filter(r => r.status === 'open' || r.status === 'in_progress');
    } else if (activeFilter === 'completed') {
      filtered = roastRequests.filter(r => r.status === 'completed');
    }

    return { type: 'requests' as const, data: filtered };
  }, [roastRequests, activeFilter]);

  return (
    <>
      <DashboardStats 
        roastRequests={roastRequests} 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      <div className="mt-8">
        {filteredContent.type === 'feedbacks' ? (
          <FeedbacksList feedbacks={filteredContent.data} />
        ) : (
          <RoastRequestsList roastRequests={filteredContent.data} />
        )}
      </div>
    </>
  );
}