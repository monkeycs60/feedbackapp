import { z } from "zod";

// Base structured feedback schema (for form validation)
export const structuredFeedbackSchema = z.object({
  // Core structured feedback fields
  globalRating: z.number().min(1).max(5),
  firstImpression: z.string().min(10, "Impression must be at least 10 characters"),
  
  // Multi-value structured fields
  strengths: z.array(z.string().min(1)).min(1, "At least one strength required"),
  weaknesses: z.array(z.string().min(1)).min(1, "At least one weakness required"), 
  recommendations: z.array(z.string().min(1)).min(1, "At least one recommendation required"),
  
  // Optional rating fields
  uxUiRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  performanceRating: z.number().min(1).max(5).optional(),
  experienceRating: z.number().min(1).max(5).optional(),
  
  // Optional fields
  additionalComments: z.string().optional(),
  generalFeedback: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
  
  // Question responses
  questionResponses: z.array(z.object({
    questionId: z.string(),
    response: z.string().min(1, "A response is required")
  })).default([])
});

export type StructuredFeedbackData = z.infer<typeof structuredFeedbackSchema>;

// Extended schema for server actions (includes roastRequestId and finalPrice)
export const feedbackSubmissionSchema = structuredFeedbackSchema.extend({
  roastRequestId: z.string(),
  finalPrice: z.number().min(1, "Minimum price €1"),
});

export type FeedbackSubmissionData = z.infer<typeof feedbackSubmissionSchema>;