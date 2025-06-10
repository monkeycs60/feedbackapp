// Types pour les Roast Requests

export type FocusArea = 'UX' | 'Onboarding' | 'Pricing' | 'Business' | 'Technical' | 'Copy' | 'Mobile';
export type AppCategory = 'SaaS' | 'Mobile' | 'E-commerce' | 'Landing' | 'MVP' | 'Autre';
export type RoastStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface RoastRequestForm {
  title: string;
  appUrl: string;
  description: string;
  targetAudience: string;
  category: AppCategory;
  focusAreas: FocusArea[];
  maxPrice: number;
  deadline?: Date;
  isUrgent: boolean;
  additionalContext?: string;
}

export const FOCUS_AREAS: { id: FocusArea; label: string; icon: string; description: string }[] = [
  { id: 'UX', label: 'UX/UI Design', icon: '🎨', description: 'Interface, navigation, expérience utilisateur' },
  { id: 'Onboarding', label: 'Onboarding', icon: '🚀', description: 'Première expérience, signup flow' },
  { id: 'Pricing', label: 'Pricing', icon: '💰', description: 'Structure tarifaire, value proposition' },
  { id: 'Business', label: 'Business Model', icon: '📊', description: 'Modèle économique, stratégie' },
  { id: 'Technical', label: 'Technical', icon: '⚙️', description: 'Performance, bugs, fonctionnalités' },
  { id: 'Copy', label: 'Copywriting', icon: '✍️', description: 'Textes, messages, communication' },
  { id: 'Mobile', label: 'Mobile Experience', icon: '📱', description: 'Responsive, app mobile' }
];

export const PRICE_RANGES = [
  { value: 25, label: '25€', description: 'Feedback rapide et ciblé' },
  { value: 40, label: '40€', description: 'Analyse approfondie' },
  { value: 60, label: '60€', description: 'Audit complet avec recommandations' }
];

export const APP_CATEGORIES: { id: AppCategory; label: string }[] = [
  { id: 'SaaS', label: 'SaaS' },
  { id: 'Mobile', label: 'App Mobile' },
  { id: 'E-commerce', label: 'E-commerce' },
  { id: 'Landing', label: 'Landing Page' },
  { id: 'MVP', label: 'MVP/Beta' },
  { id: 'Autre', label: 'Autre' }
];

// Type pour les roast requests avec relations
export interface RoastRequestWithDetails {
  id: string;
  title: string;
  appUrl: string;
  description: string;
  targetAudience: string;
  focusAreas: string[];
  maxPrice: number;
  deadline?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string | null;
    creatorProfile: {
      company: string | null;
    } | null;
  };
  feedbacks: Array<{
    id: string;
    status: string;
  }>;
  _count: {
    feedbacks: number;
  };
}