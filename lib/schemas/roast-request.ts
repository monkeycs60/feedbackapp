import { z } from "zod";

// Legacy schema for backward compatibility
export const roastRequestSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  appUrl: z.string().url("Invalid URL"),
  description: z.string().min(50, "Description must be at least 50 characters").max(1000),
  targetAudienceNames: z.array(z.string()).min(1, "Select at least one target audience").max(2, "Maximum 2 target audiences"),
  customTargetAudience: z.object({
    name: z.string()
  }).optional(),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']).optional(),
  focusAreas: z.array(z.string()).min(1, "Select at least one domain"),
  maxPrice: z.number().min(2, "Minimum price is €2"),
  feedbacksRequested: z.number().min(1, "At least 1 feedback").max(20, "Maximum 20 feedbacks"),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  additionalContext: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  selectedDomains: z.array(z.object({
    id: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      text: z.string(),
      isDefault: z.boolean(),
      order: z.number()
    }))
  })).optional()
});

// Simplified schema for the unified feedback system
export const newRoastRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  appUrl: z.string().url("Invalid URL"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  targetAudienceNames: z.array(z.string()).min(1, "Select at least one target audience").max(2, "Maximum 2 target audiences"),
  customTargetAudience: z.object({
    name: z.string()
  }).optional(),
  category: z.string(),
  feedbacksRequested: z.number().min(1, "Au moins 1 feedback").max(10, "Maximum 10 feedbacks"),
  deadline: z.date().optional(),
  coverImage: z.string().optional(),
  
  // New unified pricing model
  pricePerRoaster: z.number().min(3, "Minimum price €3").max(50, "Maximum price €50"),
  
  // Optional custom questions
  questions: z.array(z.object({
    domain: z.string().optional(),
    text: z.string().min(5, "Question too short"),
    order: z.number()
  })).optional(),
});

export type RoastRequestFormData = z.infer<typeof roastRequestSchema>;
export type NewRoastRequestFormData = z.infer<typeof newRoastRequestSchema>;