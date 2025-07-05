import { z } from "zod";

// Base structured feedback schema (for form validation)
export const structuredFeedbackSchema = z.object({
  // Core structured feedback fields
  globalRating: z.number().min(1).max(5),
  firstImpression: z.string().min(10, "L'impression doit faire au moins 10 caractères"),
  
  // Multi-value structured fields
  strengths: z.array(z.string().min(1)).min(1, "Au moins un point fort requis"),
  weaknesses: z.array(z.string().min(1)).min(1, "Au moins un point faible requis"), 
  recommendations: z.array(z.string().min(1)).min(1, "Au moins une recommandation requise"),
  
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
    response: z.string().min(1, "Une réponse est requise")
  })).default([])
});

export type StructuredFeedbackData = z.infer<typeof structuredFeedbackSchema>;

// Extended schema for server actions (includes roastRequestId and finalPrice)
export const feedbackSubmissionSchema = structuredFeedbackSchema.extend({
  roastRequestId: z.string(),
  finalPrice: z.number().min(1, "Prix minimum de 1€"),
});

export type FeedbackSubmissionData = z.infer<typeof feedbackSubmissionSchema>;