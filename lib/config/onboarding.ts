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
    title: "J'ai une app à faire roaster",
    description: "Obtiens des feedbacks brutalement honnêtes",
    benefits: [
      "✓ Feedback en 24h",
      "✓ À partir de 5€",
      "✓ Roasters experts"
    ],
    buttonText: "Commencer comme Creator",
    gradient: "from-blue-500 to-purple-600"
  },
  roaster: {
    role: 'roaster',
    icon: '🔥',
    title: "Je veux gagner de l'argent en donnant des feedbacks",
    description: "Monétise ton expertise, aide la communauté",
    benefits: [
      "✓ 3.50€ par feedback",
      "✓ Choisis tes missions",
      "✓ 15-20 min de travail"
    ],
    buttonText: "Commencer comme Roaster",
    gradient: "from-orange-500 to-red-600"
  }
};

// Configuration des spécialités roaster
export const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { id: 'UX', label: 'UX/UI Design', icon: '🎨' },
  { id: 'Dev', label: 'Développement', icon: '💻' },
  { id: 'Business', label: 'Business Model', icon: '📊' },
  { id: 'Marketing', label: 'Marketing', icon: '📱' },
  { id: 'Copy', label: 'Copywriting', icon: '✍️' },
  { id: 'Mobile', label: 'Mobile', icon: '📱' },
  { id: 'Web3', label: 'Web3/Crypto', icon: '⛓️' }
];

// Configuration des niveaux d'expérience
export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { 
    value: 'Débutant', 
    label: 'Débutant', 
    description: 'Je découvre' 
  },
  { 
    value: 'Intermédiaire', 
    label: 'Intermédiaire', 
    description: '2-5 ans d\'expérience' 
  },
  { 
    value: 'Expert', 
    label: 'Expert', 
    description: '5+ ans d\'expérience' 
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
    trigger: "A reçu son premier feedback",
    message: "Tu vois la valeur d'un bon feedback ? D'autres creators cherchent ton expertise.",
    cta: "Découvre comment devenir roaster",
    conversionRate: "15%"
  },
  afterPositiveRating: {
    trigger: "A noté 5⭐ un feedback",
    message: "Ce roaster a gagné 3.50€ en 20 min. Toi aussi tu pourrais !",
    cta: "Voir comment ça marche",
    conversionRate: "23%"
  },
  duringDowntime: {
    trigger: "Pas de nouvelle app postée depuis 2 semaines",
    message: "En attendant ton prochain projet, gagne un peu d'argent en aidant d'autres creators",
    cta: "Explorer les missions disponibles",
    conversionRate: "31%"
  }
};

// Configuration des nudges Roaster → Creator
export const ROASTER_TO_CREATOR_NUDGES: Record<string, NudgeConfig> = {
  afterMultipleRoasts: {
    trigger: "A fait 5+ roasts",
    message: "Tu donnes de super conseils ! Tu as sûrement une app qui pourrait bénéficier de feedbacks ?",
    cta: "Poste ton app gratuitement",
    offer: "Premier roast offert",
    conversionRate: "42%"
  },
  afterPositiveApp: {
    trigger: "A noté positivement une app qu'il a roastée",
    message: "Cette app t'inspire ? Lance la tienne et obtiens des feedbacks comme tu en donnes",
    cta: "Créer ma demande",
    conversionRate: "18%"
  },
  seasonal: {
    trigger: "Black Friday, nouvelles résolutions, etc.",
    message: "2024, l'année de ton side-project ? Commence par tester ton idée",
    cta: "Valider mon idée",
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
    welcome: "Tu es maintenant prêt à obtenir des feedbacks brutaux",
    nextSteps: [
      "Poste ta première app à roaster",
      "Choisis tes roasters (à partir de 5€)",
      "Reçois des feedbacks en 24h"
    ],
    futureRole: "Une fois que tu auras reçu des feedbacks, tu pourras devenir roaster et gagner de l'argent !",
    ctaText: "Poster mon app"
  },
  roaster: {
    welcome: "Tu es maintenant prêt à monétiser ton expertise",
    nextSteps: [
      "Explore les missions disponibles",
      "Postule à celles qui te correspondent",
      "Gagne tes premiers 3.50€ !"
    ],
    futureRole: "Une fois que tu auras donné quelques feedbacks, tu pourras poster tes propres apps à roaster !",
    ctaText: "Voir les missions"
  }
};

// Configuration des badges de gamification
export const ACHIEVEMENT_BADGES = {
  earlyAdopter: {
    id: 'early-adopter',
    name: 'Early Adopter',
    icon: '🚀',
    description: 'Parmi les premiers utilisateurs'
  },
  qualityCreator: {
    id: 'quality-creator',
    name: 'Quality Creator',
    icon: '⭐',
    description: 'Reçoit des feedbacks 4.5+ en moyenne'
  },
  expertRoaster: {
    id: 'expert-roaster',
    name: 'Expert Roaster',
    icon: '🔥',
    description: 'Donne des feedbacks 4.5+ en moyenne'
  },
  communityChampion: {
    id: 'community-champion',
    name: 'Community Champion',
    icon: '🏆',
    description: 'Actif des deux côtés de la plateforme'
  },
  feedbackLoop: {
    id: 'feedback-loop',
    name: 'Feedback Loop',
    icon: '🔄',
    description: 'A été roaster de quelqu\'un qui l\'a roasté'
  }
};

// Défis croisés entre rôles
export const CROSS_ROLE_CHALLENGES = {
  perfectLoop: {
    id: 'perfect-loop',
    name: 'Perfect Loop',
    description: 'Reçois un feedback, donne un feedback',
    reward: '+1€ bonus sur les 2',
    completionRate: '12%'
  },
  qualityCircle: {
    id: 'quality-circle',
    name: 'Quality Circle',
    description: 'Donne 5 feedbacks 5⭐, reçois 1 feedback gratuit',
    reward: '1 roast gratuit',
    completionRate: '8%'
  },
  communityBuilder: {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Aide 10 creators, lance 1 app',
    reward: 'Badge spécial + priorité matching',
    completionRate: '3%'
  }
};