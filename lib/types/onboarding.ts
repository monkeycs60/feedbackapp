// Types pour l'onboarding dual-role

export type UserRole = 'creator' | 'roaster' | 'both';
export type RoasterLevel = 'rookie' | 'verified' | 'expert' | 'master';
export type OnboardingStep = 0 | 1 | 2 | 3 | 4; // 0: not started, 4: completed
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Expert';

// Spécialités disponibles pour les roasters
export const ROASTER_SPECIALTIES = [
  'UX',
  'Dev', 
  'Business',
  'Marketing',
  'Copy',
  'Mobile',
  'Web3'
] as const;

export type RoasterSpecialty = typeof ROASTER_SPECIALTIES[number];

// Configuration des cartes de sélection de rôle
export interface RoleSelectionChoice {
  role: UserRole;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
  gradient: string;
}

// État de l'onboarding
export interface OnboardingState {
  currentStep: OnboardingStep;
  selectedRole: UserRole | null;
  profileComplete: boolean;
  canProceed: boolean;
}

// Configuration des spécialités avec métadonnées
export interface SpecialtyOption {
  id: RoasterSpecialty;
  label: string;
  icon: string;
  description?: string;
}

// Configuration des niveaux d'expérience
export interface ExperienceOption {
  value: ExperienceLevel;
  label: string;
  description: string;
}

// Données du formulaire roaster
export interface RoasterProfileFormData {
  specialty: RoasterSpecialty;
  languages: string[];
  experience: ExperienceLevel;
  bio?: string;
  portfolio?: string;
}

// Données du formulaire creator
export interface CreatorProfileFormData {
  company?: string;
}

// User complet avec profils
export interface UserWithProfiles {
  id: string;
  email: string;
  name: string | null;
  primaryRole: string | null;
  hasTriedBothRoles: boolean;
  onboardingStep: number;
  daysSinceSignup: number;
  creatorProfile?: {
    id: string;
    company: string | null;
    projectsPosted: number;
    totalSpent: number;
    avgRating: number;
  } | null;
  roasterProfile?: {
    id: string;
    specialties: string[];
    languages: string[];
    experience: string;
    portfolio: string | null;
    bio: string | null;
    rating: number;
    completedRoasts: number;
    totalEarned: number;
    level: string;
    verified: boolean;
  } | null;
}

// Configuration des niveaux de roaster
export interface RoasterLevelConfig {
  level: RoasterLevel;
  minRoasts: number;
  maxRoasts: number | null;
  badge: string;
  basePrice: number; // Prix en euros
}

// Nudges pour la découverte de l'autre rôle
export interface NudgeConfig {
  trigger: string;
  message: string;
  cta: string;
  conversionRate?: string;
  offer?: string;
}

// Métriques de succès de l'onboarding
export interface OnboardingMetrics {
  conversionRates: {
    singleToDual: number;
    roasterToCreator: number;
    creatorToRoaster: number;
  };
  engagementRates: {
    dualRoleMonthly: number;
    dualRoleLTV: number;
    dualRoleChurn: number;
  };
  qualityMetrics: {
    dualRoleFeedbacks: number;
    crossRoleRating: number;
  };
}

// Validation schemas (à utiliser avec Zod)
export interface ValidationSchemas {
  roleSelection: {
    role: UserRole;
  };
  roasterProfile: RoasterProfileFormData;
  creatorProfile: CreatorProfileFormData;
}