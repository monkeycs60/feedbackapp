'use client';

import { useState, useMemo } from 'react';
import { DashboardStats } from './dashboard-stats';
import { RoastRequestsList } from './roast-requests-list';
import { FeedbacksList } from './feedbacks-list';

interface CreatorDashboardContentProps {
  roastRequests: Array<{
    id: string;
    title: string;
    appUrl: string;
    description: string;
    status: string;
    maxPrice: number | null;
    pricePerRoaster: number;
    feedbacksRequested: number;
    category?: string | null;
    coverImage?: string | null;
    createdAt: Date;
    feedbacks: Array<{ 
      id: string; 
      status: string;
      roaster: {
        id: string;
        name: string | null;
        image?: string | null;
        roasterProfile: {
          bio: string | null;
          specialties: string[];
          rating: number;
        } | null;
      };
      // Legacy field for backward compatibility
      generalFeedback?: string | null;
      // New unified feedback fields
      globalRating?: number | null;
      firstImpression?: string | null;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      finalPrice: number | null;
      createdAt: Date;
      // Detailed ratings
      uxUiRating?: number | null;
      valueRating?: number | null;
      performanceRating?: number | null;
      experienceRating?: number | null;
      // Additional fields
      aiQualityScore?: number | null;
      creatorRating?: number | null;
      screenshots: string[];
      questionResponses: Array<{
        id: string;
        questionId: string;
        response: string;
        question?: {
          id: string;
          domain: string | null;
          text: string;
        };
      }>;
    }>;
    applications: Array<{ id: string; status: string }>;
    questions: Array<{
      id: string;
      domain: string | null;
      text: string;
      order: number;
    }>;
    targetAudiences: Array<{
      targetAudience: {
        id: string;
        name: string;
      };
    }>;
    _count: {
      feedbacks: number;
      applications: number;
    };
  }>;
}

export function CreatorDashboardContent({ roastRequests }: CreatorDashboardContentProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'feedbacks'>('all');

  const filteredContent = useMemo(() => {
    if (activeFilter === 'feedbacks') {
      // Extraire tous les feedbacks avec leurs roast requests enrichies
      const allFeedbacks = roastRequests.flatMap(roast => 
        roast.feedbacks.map(feedback => ({
          ...feedback,
          roastRequest: {
            id: roast.id,
            title: roast.title,
            appUrl: roast.appUrl,
            description: roast.description,
            category: roast.category,
            coverImage: roast.coverImage,
            pricePerRoaster: roast.pricePerRoaster,
            feedbacksRequested: roast.feedbacksRequested,
            targetAudiences: roast.targetAudiences,
            questions: roast.questions
          }
        }))
      );
      return { type: 'feedbacks' as const, data: allFeedbacks };
    }

    // Pour 'all', on retourne toutes les roast requests
    return { type: 'requests' as const, data: roastRequests };
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