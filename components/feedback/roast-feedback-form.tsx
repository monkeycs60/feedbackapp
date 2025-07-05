"use client";

import { UnifiedFeedbackForm } from "@/components/feedback/unified-feedback-form";

interface RoastQuestion {
  id: string;
  domain: string;
  text: string;
  order: number;
}

interface RoastFeedbackFormProps {
  roastRequest: {
    id: string;
    title: string;
    maxPrice: number;
    pricePerRoaster?: number | null;
    questions: RoastQuestion[];
  };
  existingFeedback?: {
    id: string;
    generalFeedback?: string | null;
    globalRating?: number | null;
    firstImpression?: string | null;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    uxUiRating?: number | null;
    valueRating?: number | null;
    performanceRating?: number | null;
    experienceRating?: number | null;
    additionalComments?: string | null;
    screenshots: string[];
    finalPrice: number;
    status: string;
    createdAt: Date;
    questionResponses: Array<{
      id: string;
      questionId: string;
      response: string;
      createdAt: Date;
    }>;
  } | null;
}

export function RoastFeedbackForm({ roastRequest, existingFeedback }: RoastFeedbackFormProps) {
  return (
    <UnifiedFeedbackForm 
      roastRequest={roastRequest}
      existingFeedback={existingFeedback}
    />
  );
}