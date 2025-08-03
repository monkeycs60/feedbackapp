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
    label: 'General impression', 
    icon: '🎯', 
    description: 'Overall feedback on the experience',
    questions: []
  },
  { 
    id: 'UX', 
    label: 'UX/UI Design', 
    icon: '🎨', 
    description: 'Interface, navigation, user experience',
    questions: [
      'How to improve the main navigation?',
      'Which interface elements are confusing?'
    ]
  },
  { 
    id: 'Onboarding', 
    label: 'Onboarding', 
    icon: '🚀', 
    description: 'First experience, signup flow',
    questions: [
      'Is the registration process too long?',
      'How to simplify first use?'
    ]
  },
  { 
    id: 'Pricing', 
    label: 'Pricing', 
    icon: '💰', 
    description: 'Pricing structure, value proposition',
    questions: [
      'Is the pricing grid clear and attractive?',
      'Is the value proposition convincing?'
    ]
  },
  { 
    id: 'Business', 
    label: 'Business Model', 
    icon: '📊', 
    description: 'Business model, strategy',
    questions: [
      'Is the business model viable?',
      'What missed revenue opportunities?'
    ]
  },
  { 
    id: 'Technical', 
    label: 'Technical', 
    icon: '⚙️', 
    description: 'Performance, bugs, features',
    questions: [
      'What performance issues did you notice?',
      'What features are sorely missing?'
    ]
  },
  { 
    id: 'Copy', 
    label: 'Copywriting', 
    icon: '✍️', 
    description: 'Texts, messages, communication',
    questions: [
      'Are the messages clear and engaging?',
      'How to improve tone and style?'
    ]
  },
  { 
    id: 'Mobile', 
    label: 'Mobile Experience', 
    icon: '📱', 
    description: 'Responsive, mobile app',
    questions: [
      'Is the mobile experience smooth?',
      'What display issues on mobile?'
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
  { id: 'SaaS', label: 'SaaS / Web App', icon: '☁️', description: 'Web application with subscription' },
  { id: 'Mobile', label: 'App Mobile', icon: '📱', description: 'iOS, Android ou PWA' },
  { id: 'E-commerce', label: 'E-commerce', icon: '🛒', description: 'Online store, marketplace' },
  { id: 'Landing', label: 'Landing Page', icon: '🚀', description: 'Conversion page, showcase site' },
  { id: 'MVP', label: 'MVP / Prototype', icon: '🔬', description: 'Version beta, proof of concept' },
  { id: 'Autre', label: 'Other', icon: '📦', description: 'Other type of project' }
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