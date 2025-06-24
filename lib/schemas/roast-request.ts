import { z } from "zod";

// Legacy schema for backward compatibility
export const roastRequestSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudienceIds: z.array(z.string()).min(1, "Sélectionne au moins une audience cible").max(2, "Maximum 2 audiences cibles"),
  customTargetAudience: z.object({
    name: z.string()
  }).optional(),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1, "Sélectionne au moins un domaine"),
  maxPrice: z.number().min(2, "Le prix minimum est de 2€"),
  feedbacksRequested: z.number().min(1, "Au moins 1 feedback").max(20, "Maximum 20 feedbacks"),
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

// New schema for the new feedback mode system
export const newRoastRequestSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudienceIds: z.array(z.string()).min(1, "Sélectionne au moins une audience cible").max(2, "Maximum 2 audiences cibles"),
  customTargetAudience: z.object({
    name: z.string()
  }).optional(),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  feedbacksRequested: z.number().min(1, "Au moins 1 feedback").max(20, "Maximum 20 feedbacks"),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  additionalContext: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  
  // New feedback mode system
  feedbackMode: z.enum(['FREE', 'TARGETED', 'STRUCTURED'] as const),
  focusAreas: z.array(z.string()).optional(), // Optional, only for STRUCTURED mode
  questions: z.array(z.object({
    domain: z.string().optional(),
    text: z.string().min(5, "Question trop courte"),
    order: z.number()
  })).optional(),
}).refine((data) => {
  // Validation rules based on feedback mode
  if (data.feedbackMode === 'STRUCTURED' && (!data.focusAreas || data.focusAreas.length === 0)) {
    return false;
  }
  if (data.feedbackMode === 'FREE' && data.questions && data.questions.length > 0) {
    return false;
  }
  return true;
}, {
  message: "Configuration invalide pour le mode de feedback sélectionné"
});

export type RoastRequestFormData = z.infer<typeof roastRequestSchema>;
export type NewRoastRequestFormData = z.infer<typeof newRoastRequestSchema>;