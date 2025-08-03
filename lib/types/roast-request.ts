// Types pour les Roast Requests

export type FocusArea = 'General' | 'UX' | 'Onboarding' | 'Pricing' | 'Business' | 'Technical' | 'Copy' | 'Mobile';
export type AppCategory = 'SaaS' | 'Mobile' | 'E-commerce' | 'Landing' | 'MVP' | 'Autre';
export type RoastStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';


export interface DomainQuestion {
  id: string;
  text: string;
  isDefault: boolean;
  order: number;
}

export interface SelectedDomain {
  id: FocusArea;
  questions: DomainQuestion[];
}

export interface RoastRequestForm {
  title: string;
  appUrl: string;
  description: string;
  targetAudience: string;
  category: AppCategory;
  selectedDomains: SelectedDomain[];
  totalPrice: number;
  additionalContext?: string;
}

export const FOCUS_AREAS: { id: FocusArea; label: string; icon: string; description: string; questions: string[] }[] = [
  { 
    id: 'General', 
    label: 'Impression générale', 
    icon: '🎯', 
    description: 'Retour global sur l\'expérience',
    questions: []
  },
  { 
    id: 'UX', 
    label: 'UX/UI Design', 
    icon: '🎨', 
    description: 'Interface, navigation, expérience utilisateur',
    questions: [
      'Comment améliorer la navigation principale ?',
      'Quels éléments d\'interface prêtent à confusion ?'
    ]
  },
  { 
    id: 'Onboarding', 
    label: 'Onboarding', 
    icon: '🚀', 
    description: 'Première expérience, signup flow',
    questions: [
      'Le processus d\'inscription est-il trop long ?',
      'Comment simplifier la première utilisation ?'
    ]
  },
  { 
    id: 'Pricing', 
    label: 'Pricing', 
    icon: '💰', 
    description: 'Structure tarifaire, value proposition',
    questions: [
      'La grille tarifaire est-elle claire et attractive ?',
      'La value proposition est-elle convaincante ?'
    ]
  },
  { 
    id: 'Business', 
    label: 'Business Model', 
    icon: '📊', 
    description: 'Modèle économique, stratégie',
    questions: [
      'Le modèle économique est-il viable ?',
      'Quelles opportunités de revenus manqués ?'
    ]
  },
  { 
    id: 'Technical', 
    label: 'Technical', 
    icon: '⚙️', 
    description: 'Performance, bugs, fonctionnalités',
    questions: [
      'Quels problèmes de performance avez-vous remarqués ?',
      'Quelles fonctionnalités manquent cruellement ?'
    ]
  },
  { 
    id: 'Copy', 
    label: 'Copywriting', 
    icon: '✍️', 
    description: 'Textes, messages, communication',
    questions: [
      'Les messages sont-ils clairs et engageants ?',
      'Comment améliorer le ton et le style ?'
    ]
  },
  { 
    id: 'Mobile', 
    label: 'Mobile Experience', 
    icon: '📱', 
    description: 'Responsive, app mobile',
    questions: [
      'L\'expérience mobile est-elle fluide ?',
      'Quels problèmes d\'affichage sur mobile ?'
    ]
  }
];

// Unified pricing configuration
export const PRICING = {
  BASE_PRICE: 4.00,
  QUESTION_PRICE: 0.50,
  URGENCY_PRICE: 0.50
};

export const APP_CATEGORIES: { id: AppCategory; label: string; icon: string; description: string }[] = [
  { id: 'SaaS', label: 'SaaS / Web App', icon: '☁️', description: 'Application web avec abonnement' },
  { id: 'Mobile', label: 'App Mobile', icon: '📱', description: 'iOS, Android ou PWA' },
  { id: 'E-commerce', label: 'E-commerce', icon: '🛒', description: 'Boutique en ligne, marketplace' },
  { id: 'Landing', label: 'Landing Page', icon: '🚀', description: 'Page de conversion, site vitrine' },
  { id: 'MVP', label: 'MVP / Prototype', icon: '🔬', description: 'Version beta, proof of concept' },
  { id: 'Autre', label: 'Autre', icon: '📦', description: 'Autre type de projet' }
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