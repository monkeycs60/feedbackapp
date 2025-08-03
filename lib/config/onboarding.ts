import { 
  RoleSelectionChoice, 
  SpecialtyOption, 
  ExperienceOption, 
  RoasterLevelConfig,
  NudgeConfig
} from '@/lib/types/onboarding';

// Configuration des cartes de sélection de rôle
export const ROLE_SELECTION_CONFIG: Record<'creator' | 'roaster', RoleSelectionChoice> = {
  creator: {
    role: 'creator',
    icon: '🚀',
    title: "I have an app to get roasted",
    description: "Get brutally honest feedback",
    benefits: [
      "✓ Feedback in 24h",
      "✓ Starting from €5",
      "✓ Expert roasters"
    ],
    buttonText: "Start as Creator",
    gradient: "from-blue-500 to-purple-600"
  },
  roaster: {
    role: 'roaster',
    icon: '🔥',
    title: "I want to earn money giving feedback",
    description: "Monetize your expertise, help the community",
    benefits: [
      "✓ €3.50 per feedback",
      "✓ Choose your tasks",
      "✓ 15-20 min of work"
    ],
    buttonText: "Start as Roaster",
    gradient: "from-orange-500 to-red-600"
  }
};

// Configuration des spécialités roaster
export const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { id: 'UX', label: 'UX/UI Design', icon: '🎨' },
  { id: 'Dev', label: 'Development', icon: '💻' },
  { id: 'Business', label: 'Business Model', icon: '📊' },
  { id: 'Marketing', label: 'Marketing', icon: '📱' },
  { id: 'Copy', label: 'Copywriting', icon: '✍️' },
  { id: 'Mobile', label: 'Mobile', icon: '📱' },
  { id: 'Web3', label: 'Web3/Crypto', icon: '⛓️' }
];

// Configuration des niveaux d'expérience
export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { 
    value: 'Beginner', 
    label: 'Beginner', 
    description: "I'm discovering" 
  },
  { 
    value: 'Intermediate', 
    label: 'Intermediate', 
    description: '2-5 years of experience' 
  },
  { 
    value: 'Expert', 
    label: 'Expert', 
    description: '5+ years of experience' 
  }
];

// Configuration des niveaux de roaster
export const ROASTER_LEVELS: Record<string, RoasterLevelConfig> = {
  rookie: {
    level: 'rookie',
    minRoasts: 0,
    maxRoasts: 5,
    badge: '🌱',
    basePrice: 5
  },
  verified: {
    level: 'verified',
    minRoasts: 5,
    maxRoasts: 20,
    badge: '✓',
    basePrice: 5
  },
  expert: {
    level: 'expert',
    minRoasts: 20,
    maxRoasts: 50,
    badge: '⭐',
    basePrice: 7
  },
  master: {
    level: 'master',
    minRoasts: 50,
    maxRoasts: null,
    badge: '🏆',
    basePrice: 10
  }
};

// Configuration des nudges Creator → Roaster
export const CREATOR_TO_ROASTER_NUDGES: Record<string, NudgeConfig> = {
  afterFirstFeedback: {
    trigger: "Received their first feedback",
    message: "See the value of good feedback? Other creators are looking for your expertise.",
    cta: "Discover how to become a roaster",
    conversionRate: "15%"
  },
  afterPositiveRating: {
    trigger: "Rated a feedback 5⭐",
    message: "This roaster earned €3.50 in 20 min. You could too!",
    cta: "See how it works",
    conversionRate: "23%"
  },
  duringDowntime: {
    trigger: "No new app posted in 2 weeks",
    message: "While waiting for your next project, earn some money helping other creators",
    cta: "Explore available tasks",
    conversionRate: "31%"
  }
};

// Configuration des nudges Roaster → Creator
export const ROASTER_TO_CREATOR_NUDGES: Record<string, NudgeConfig> = {
  afterMultipleRoasts: {
    trigger: "Has done 5+ roasts",
    message: "You give great advice! You probably have an app that could benefit from feedback?",
    cta: "Post your app for free",
    offer: "First roast free",
    conversionRate: "42%"
  },
  afterPositiveApp: {
    trigger: "Positively rated an app they roasted",
    message: "This app inspires you? Launch yours and get feedback like you give",
    cta: "Create my request",
    conversionRate: "18%"
  },
  seasonal: {
    trigger: "Black Friday, new resolutions, etc.",
    message: "2024, the year of your side project? Start by testing your idea",
    cta: "Validate my idea",
    conversionRate: "28%"
  }
};

// URLs de redirection selon le rôle
export const ONBOARDING_REDIRECTS = {
  creator: '/dashboard',
  roaster: '/marketplace',
  both: '/dashboard'
};

// Messages d'onboarding personnalisés
export const ONBOARDING_MESSAGES = {
  creator: {
    welcome: "You're now ready to get brutal feedback",
    nextSteps: [
      "Post your first app to roast",
      "Choose your roasters (starting from €5)",
      "Receive feedback in 24h"
    ],
    futureRole: "Once you've received feedback, you can become a roaster and earn money!",
    ctaText: "Post my app"
  },
  roaster: {
    welcome: "You're now ready to monetize your expertise",
    nextSteps: [
      "Explore available tasks",
      "Apply to those that match you",
      "Earn your first €3.50!"
    ],
    futureRole: "Once you've given some feedback, you can post your own apps to roast!",
    ctaText: "See tasks"
  }
};

// Configuration des badges de gamification
export const ACHIEVEMENT_BADGES = {
  earlyAdopter: {
    id: 'early-adopter',
    name: 'Early Adopter',
    icon: '🚀',
    description: 'Among the first users'
  },
  qualityCreator: {
    id: 'quality-creator',
    name: 'Quality Creator',
    icon: '⭐',
    description: 'Receives 4.5+ average feedback rating'
  },
  expertRoaster: {
    id: 'expert-roaster',
    name: 'Expert Roaster',
    icon: '🔥',
    description: 'Gives 4.5+ average feedback rating'
  },
  communityChampion: {
    id: 'community-champion',
    name: 'Community Champion',
    icon: '🏆',
    description: 'Active on both sides of the platform'
  },
  feedbackLoop: {
    id: 'feedback-loop',
    name: 'Feedback Loop',
    icon: '🔄',
    description: 'Was a roaster for someone who roasted them'
  }
};

// Défis croisés entre rôles
export const CROSS_ROLE_CHALLENGES = {
  perfectLoop: {
    id: 'perfect-loop',
    name: 'Perfect Loop',
    description: 'Receive feedback, give feedback',
    reward: '+€1 bonus on both',
    completionRate: '12%'
  },
  qualityCircle: {
    id: 'quality-circle',
    name: 'Quality Circle',
    description: 'Give 5 five-star feedbacks, get 1 free feedback',
    reward: '1 free roast',
    completionRate: '8%'
  },
  communityBuilder: {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Help 10 creators, launch 1 app',
    reward: 'Special badge + matching priority',
    completionRate: '3%'
  }
};