# Sprint 1 - Onboarding Implementation

## Vue d'ensemble

Ce sprint implémente le système d'onboarding dual-role complet, suivant la stratégie "Start Simple, Expand Later" définie dans les PRD. L'objectif est de créer une expérience d'inscription fluide qui guide naturellement les utilisateurs vers l'adoption des deux rôles.

## Architecture des données

### Extensions des modèles Prisma existants

```prisma
// Ajouts au schema.prisma existant

model User {
  // ... champs existants de Better Auth
  
  // Champs RoastMyApp
  primaryRole       String?           @default("creator") // "creator" | "roaster" | "both"
  hasTriedBothRoles Boolean          @default(false)
  onboardingStep    Int              @default(0)
  daysSinceSignup   Int              @default(0)
  
  // Relations
  creatorProfile    CreatorProfile?
  roasterProfile    RoasterProfile?
  roastRequests     RoastRequest[]
  feedbacksGiven    Feedback[]
  
  @@map("user")
}

model CreatorProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  company        String?
  projectsPosted Int      @default(0)
  totalSpent     Float    @default(0)
  avgRating      Float    @default(0)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("creator_profile")
}

model RoasterProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  specialties      String[] // ["UX", "Dev", "Business", "Marketing"]
  languages        String[] @default(["Français"])
  experience       String   // "Débutant", "Intermédiaire", "Expert"
  portfolio        String?
  bio              String?
  
  // Métriques
  rating           Float    @default(0)
  completedRoasts  Int      @default(0)
  totalEarned      Float    @default(0)
  completionRate   Float    @default(100)
  avgResponseTime  Int      @default(24) // heures
  
  // Disponibilité
  maxActiveRoasts  Int      @default(3)
  currentActive    Int      @default(0)
  
  // Status
  level            String   @default("rookie") // "rookie", "verified", "expert", "master"
  verified         Boolean  @default(false)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@map("roaster_profile")
}
```

## Tâche 1: Infrastructure de base (2h)

### Objectif
Créer les fondations techniques pour l'onboarding dual-role.

### Livrables
1. **Migration Prisma** : Ajouter les nouveaux modèles
2. **Types TypeScript** : Définir les interfaces
3. **Middleware d'onboarding** : Redirection automatique selon l'état

### Implémentation

#### 1.1 Migration et schéma

```typescript
// prisma/migrations/add_dual_role_support.sql
-- Ajout des champs utilisateur
ALTER TABLE "user" ADD COLUMN "primaryRole" TEXT DEFAULT 'creator';
ALTER TABLE "user" ADD COLUMN "hasTriedBothRoles" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN "onboardingStep" INTEGER DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "daysSinceSignup" INTEGER DEFAULT 0;

-- Création des tables profil
CREATE TABLE "creator_profile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "company" TEXT,
  "projectsPosted" INTEGER DEFAULT 0,
  "totalSpent" REAL DEFAULT 0,
  "avgRating" REAL DEFAULT 0,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "roaster_profile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "specialties" TEXT, -- JSON array
  "languages" TEXT DEFAULT '["Français"]', -- JSON array
  "experience" TEXT DEFAULT 'Débutant',
  "portfolio" TEXT,
  "bio" TEXT,
  "rating" REAL DEFAULT 0,
  "completedRoasts" INTEGER DEFAULT 0,
  "totalEarned" REAL DEFAULT 0,
  "completionRate" REAL DEFAULT 100,
  "avgResponseTime" INTEGER DEFAULT 24,
  "maxActiveRoasts" INTEGER DEFAULT 3,
  "currentActive" INTEGER DEFAULT 0,
  "level" TEXT DEFAULT 'rookie',
  "verified" BOOLEAN DEFAULT false,
  "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
```

#### 1.2 Types TypeScript

```typescript
// lib/types/onboarding.ts
export type UserRole = 'creator' | 'roaster' | 'both';
export type RoasterLevel = 'rookie' | 'verified' | 'expert' | 'master';
export type OnboardingStep = 0 | 1 | 2 | 3 | 4; // 0: not started, 4: completed

export interface RoleSelectionChoice {
  role: UserRole;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  buttonText: string;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  selectedRole: UserRole | null;
  profileComplete: boolean;
  canProceed: boolean;
}
```

#### 1.3 Middleware d'onboarding

```typescript
// middleware.ts (extension du middleware existant)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        creatorProfile: true,
        roasterProfile: true
      }
    });

    // Redirection onboarding si nécessaire
    if (user && user.onboardingStep < 4) {
      const pathname = request.nextUrl.pathname;
      
      // Ne pas rediriger si déjà sur une page d'onboarding
      if (!pathname.startsWith('/onboarding') && 
          !pathname.startsWith('/api') && 
          pathname !== '/') {
        return NextResponse.redirect(new URL(`/onboarding/step-${user.onboardingStep}`, request.url));
      }
    }
  }

  return NextResponse.next();
}
```

## Tâche 2: Page de sélection de rôle (3h)

### Objectif
Créer l'interface de choix initial entre Creator et Roaster.

### Livrables
1. **Page `/onboarding/role-selection`**
2. **Composant RoleCard**
3. **Logique de sélection et navigation**

### Implémentation

#### 2.1 Page de sélection

```tsx
// app/onboarding/role-selection/page.tsx
import { auth } from "@/lib/auth";
import { RoleSelectionForm } from "@/components/onboarding/role-selection-form";
import { redirect } from "next/navigation";

export default async function RoleSelectionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue sur RoastMyApp
          </h1>
          <p className="text-xl text-gray-300">
            Comment veux-tu commencer ?
          </p>
        </div>
        
        <RoleSelectionForm />
        
        <div className="text-center mt-8">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            💡 Tu pourras facilement switcher plus tard
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 2.2 Composant RoleCard

```tsx
// components/onboarding/role-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoleCardProps {
  role: 'creator' | 'roaster';
  isSelected: boolean;
  onSelect: (role: 'creator' | 'roaster') => void;
}

const roleConfig = {
  creator: {
    icon: "🚀",
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
    icon: "🔥",
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

export function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  const config = roleConfig[role];
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      isSelected ? 'ring-2 ring-orange-500 shadow-xl' : 'hover:shadow-lg'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />
      
      <CardContent className="p-8 relative">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{config.icon}</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {config.title}
          </h3>
          <p className="text-gray-300">
            {config.description}
          </p>
        </div>
        
        <ul className="space-y-2 mb-6">
          {config.benefits.map((benefit, index) => (
            <li key={index} className="text-gray-200">
              {benefit}
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={() => onSelect(role)}
          className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90`}
          size="lg"
        >
          {config.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2.3 Formulaire de sélection

```tsx
// components/onboarding/role-selection-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleCard } from "./role-card";
import { selectPrimaryRole } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<'creator' | 'roaster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      await selectPrimaryRole(selectedRole);
      router.push('/onboarding/profile-setup');
    } catch (error) {
      console.error('Erreur sélection rôle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <RoleCard 
          role="creator"
          isSelected={selectedRole === 'creator'}
          onSelect={setSelectedRole}
        />
        <RoleCard 
          role="roaster" 
          isSelected={selectedRole === 'roaster'}
          onSelect={setSelectedRole}
        />
      </div>
      
      {selectedRole && (
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Création du profil..." : "Continuer"}
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Tâche 3: Actions serveur d'onboarding (2h)

### Objectif
Créer les Server Actions pour gérer la progression de l'onboarding.

### Livrables
1. **Actions de sélection de rôle**
2. **Actions de setup profil**
3. **Validation et sécurité**

### Implémentation

#### 3.1 Actions de base

```typescript
// lib/actions/onboarding.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const roleSelectionSchema = z.object({
  role: z.enum(['creator', 'roaster'])
});

export async function selectPrimaryRole(role: 'creator' | 'roaster') {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const validation = roleSelectionSchema.safeParse({ role });
  if (!validation.success) throw new Error("Rôle invalide");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      primaryRole: role,
      onboardingStep: 1
    }
  });

  // Créer le profil correspondant
  if (role === 'creator') {
    await prisma.creatorProfile.create({
      data: { userId: session.user.id }
    });
  } else {
    await prisma.roasterProfile.create({
      data: { userId: session.user.id }
    });
  }

  revalidatePath('/onboarding');
}

const roasterProfileSchema = z.object({
  specialties: z.array(z.string()).min(1, "Sélectionne au moins une spécialité"),
  languages: z.array(z.string()).min(1),
  experience: z.enum(['Débutant', 'Intermédiaire', 'Expert']),
  bio: z.string().max(500).optional(),
  portfolio: z.string().url().optional().or(z.literal(''))
});

export async function setupRoasterProfile(data: z.infer<typeof roasterProfileSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const validation = roasterProfileSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("Données invalides: " + validation.error.message);
  }

  await prisma.roasterProfile.update({
    where: { userId: session.user.id },
    data: {
      specialties: validation.data.specialties,
      languages: validation.data.languages,
      experience: validation.data.experience,
      bio: validation.data.bio || null,
      portfolio: validation.data.portfolio || null
    }
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingStep: 2 }
  });

  revalidatePath('/onboarding');
}

const creatorProfileSchema = z.object({
  company: z.string().max(100).optional()
});

export async function setupCreatorProfile(data: z.infer<typeof creatorProfileSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  const validation = creatorProfileSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("Données invalides");
  }

  await prisma.creatorProfile.update({
    where: { userId: session.user.id },
    data: {
      company: validation.data.company || null
    }
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingStep: 2 }
  });

  revalidatePath('/onboarding');
}

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user) throw new Error("Non authentifié");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      onboardingStep: 4,
      daysSinceSignup: 0 // Reset pour le calcul des nudges
    }
  });

  revalidatePath('/');
}
```

## Tâche 4: Setup profil Roaster (4h)

### Objectif
Créer le formulaire de configuration du profil roaster avec validation.

### Livrables
1. **Page de setup roaster**
2. **Formulaire multi-étapes**
3. **Validation en temps réel**

### Implémentation

#### 4.1 Page de setup

```tsx
// app/onboarding/profile-setup/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoasterProfileForm } from "@/components/onboarding/roaster-profile-form";
import { CreatorProfileForm } from "@/components/onboarding/creator-profile-form";
import { redirect } from "next/navigation";

export default async function ProfileSetupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roasterProfile: true,
      creatorProfile: true
    }
  });

  if (!user || user.onboardingStep < 1) {
    redirect("/onboarding/role-selection");
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Finalise ton profil
          </h1>
          <p className="text-gray-300">
            {user.primaryRole === 'roaster' 
              ? "Quelques infos pour matcher avec les bonnes missions"
              : "Quelques infos pour personnaliser ton expérience"
            }
          </p>
        </div>

        {user.primaryRole === 'roaster' ? (
          <RoasterProfileForm />
        ) : (
          <CreatorProfileForm />
        )}
      </div>
    </div>
  );
}
```

#### 4.2 Formulaire roaster

```tsx
// components/onboarding/roaster-profile-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { setupRoasterProfile } from "@/lib/actions/onboarding";

const roasterProfileSchema = z.object({
  specialties: z.array(z.string()).min(1, "Sélectionne au moins une spécialité"),
  languages: z.array(z.string()).min(1),
  experience: z.enum(['Débutant', 'Intermédiaire', 'Expert']),
  bio: z.string().max(500).optional(),
  portfolio: z.string().url().optional().or(z.literal(''))
});

type RoasterProfileForm = z.infer<typeof roasterProfileSchema>;

const specialtyOptions = [
  { id: 'UX', label: 'UX/UI Design', icon: '🎨' },
  { id: 'Dev', label: 'Développement', icon: '💻' },
  { id: 'Business', label: 'Business Model', icon: '📊' },
  { id: 'Marketing', label: 'Marketing', icon: '📱' },
  { id: 'Copy', label: 'Copywriting', icon: '✍️' },
  { id: 'Mobile', label: 'Mobile', icon: '📱' },
  { id: 'Web3', label: 'Web3/Crypto', icon: '⛓️' }
];

const experienceOptions = [
  { value: 'Débutant', label: 'Débutant', description: 'Je découvre' },
  { value: 'Intermédiaire', label: 'Intermédiaire', description: '2-5 ans d\'expérience' },
  { value: 'Expert', label: 'Expert', description: '5+ ans d\'expérience' }
];

export function RoasterProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RoasterProfileForm>({
    resolver: zodResolver(roasterProfileSchema),
    defaultValues: {
      specialties: [],
      languages: ['Français'],
      experience: 'Intermédiaire'
    }
  });

  const selectedSpecialties = watch('specialties') || [];
  const selectedExperience = watch('experience');

  const toggleSpecialty = (specialtyId: string) => {
    const current = selectedSpecialties;
    const updated = current.includes(specialtyId)
      ? current.filter(id => id !== specialtyId)
      : [...current, specialtyId];
    setValue('specialties', updated);
  };

  const onSubmit = async (data: RoasterProfileForm) => {
    setIsLoading(true);
    try {
      await setupRoasterProfile(data);
      router.push('/onboarding/welcome');
    } catch (error) {
      console.error('Erreur setup profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Spécialités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Tes spécialités</CardTitle>
          <p className="text-gray-400">Dans quoi tu excelles ? (sélection multiple)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specialtyOptions.map((specialty) => (
              <button
                key={specialty.id}
                type="button"
                onClick={() => toggleSpecialty(specialty.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedSpecialties.includes(specialty.id)
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-gray-600 hover:border-gray-500 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{specialty.icon}</span>
                  <span className="text-sm font-medium">{specialty.label}</span>
                </div>
              </button>
            ))}
          </div>
          {errors.specialties && (
            <p className="text-red-400 text-sm mt-2">{errors.specialties.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Expérience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Ton niveau d'expérience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {experienceOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedExperience === option.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('experience')}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bio optionnelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Bio (optionnel)</CardTitle>
          <p className="text-gray-400">Parle-nous de toi en quelques mots</p>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('bio')}
            placeholder="Ex: UX Designer avec 5 ans d'expérience dans les SaaS B2B..."
            className="bg-gray-800 border-gray-600 text-white"
            rows={4}
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {watch('bio')?.length || 0}/500
          </div>
        </CardContent>
      </Card>

      {/* Portfolio optionnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Portfolio/LinkedIn (optionnel)</CardTitle>
          <p className="text-gray-400">Pour rassurer les créateurs</p>
        </CardHeader>
        <CardContent>
          <Input
            {...register('portfolio')}
            placeholder="https://linkedin.com/in/tonprofil ou https://tonportfolio.com"
            className="bg-gray-800 border-gray-600 text-white"
          />
          {errors.portfolio && (
            <p className="text-red-400 text-sm mt-1">{errors.portfolio.message}</p>
          )}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
      >
        {isLoading ? "Création du profil..." : "Finaliser mon profil"}
      </Button>
    </form>
  );
}
```

## Tâche 5: Setup profil Creator (2h)

### Objectif
Version simplifiée du setup pour les créateurs.

### Implémentation

```tsx
// components/onboarding/creator-profile-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setupCreatorProfile } from "@/lib/actions/onboarding";

interface CreatorProfileForm {
  company?: string;
}

export function CreatorProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm<CreatorProfileForm>();

  const onSubmit = async (data: CreatorProfileForm) => {
    setIsLoading(true);
    try {
      await setupCreatorProfile(data);
      router.push('/onboarding/welcome');
    } catch (error) {
      console.error('Erreur setup profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Ton entreprise/projet</CardTitle>
          <p className="text-gray-400">Optionnel - juste pour personnaliser ton expérience</p>
        </CardHeader>
        <CardContent>
          <Input
            {...register('company')}
            placeholder="Ex: MonStartup, Freelance, Projet perso..."
            className="bg-gray-800 border-gray-600 text-white"
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
      >
        {isLoading ? "Finalisation..." : "C'est parti !"}
      </Button>
    </form>
  );
}
```

## Tâche 6: Page de bienvenue (2h)

### Objectif
Écran final d'onboarding avec next steps et découverte progressive.

### Implémentation

```tsx
// app/onboarding/welcome/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { redirect } from "next/navigation";

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roasterProfile: true,
      creatorProfile: true
    }
  });

  if (!user || user.onboardingStep < 2) {
    redirect("/onboarding/profile-setup");
  }

  return <WelcomeScreen user={user} />;
}
```

```tsx
// components/onboarding/welcome-screen.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeOnboarding } from "@/lib/actions/onboarding";

interface WelcomeScreenProps {
  user: {
    primaryRole: string;
    roasterProfile?: any;
    creatorProfile?: any;
  };
}

export function WelcomeScreen({ user }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding();
      router.push(user.primaryRole === 'creator' ? '/dashboard' : '/marketplace');
    } catch (error) {
      console.error('Erreur finalisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRoaster = user.primaryRole === 'roaster';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">{isRoaster ? '🔥' : '🚀'}</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue dans RoastMyApp !
          </h1>
          <p className="text-xl text-gray-300">
            {isRoaster 
              ? "Tu es maintenant prêt à monétiser ton expertise"
              : "Tu es maintenant prêt à obtenir des feedbacks brutaux"
            }
          </p>
        </div>

        {/* Next steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Tes prochaines étapes :
            </h3>
            {isRoaster ? (
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">1</Badge>
                  <span className="text-gray-300">Explore les missions disponibles</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">2</Badge>
                  <span className="text-gray-300">Postule à celles qui te correspondent</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">3</Badge>
                  <span className="text-gray-300">Gagne tes premiers 3.50€ !</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">1</Badge>
                  <span className="text-gray-300">Poste ta première app à roaster</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">2</Badge>
                  <span className="text-gray-300">Choisis tes roasters (à partir de 5€)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">3</Badge>
                  <span className="text-gray-300">Reçois des feedbacks en 24h</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview autre rôle */}
        <Card className="mb-8 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="font-semibold text-white">Bientôt disponible pour toi</h3>
            </div>
            <p className="text-gray-300 text-sm">
              {isRoaster 
                ? "Une fois que tu auras donné quelques feedbacks, tu pourras poster tes propres apps à roaster !"
                : "Une fois que tu auras reçu des feedbacks, tu pourras devenir roaster et gagner de l'argent !"
              }
            </p>
          </CardContent>
        </Card>

        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 px-8"
        >
          {isLoading ? "Finalisation..." : (isRoaster ? "Voir les missions" : "Poster mon app")}
        </Button>
      </div>
    </div>
  );
}
```

## Tests et validation

### Tests unitaires essentiels

```typescript
// __tests__/onboarding.test.ts
import { describe, it, expect, vi } from 'vitest';
import { selectPrimaryRole, setupRoasterProfile } from '@/lib/actions/onboarding';

describe('Onboarding Actions', () => {
  it('should create roaster profile when selecting roaster role', async () => {
    // Mock auth session
    vi.mocked(auth).mockResolvedValue({ user: { id: 'test-user' } });
    
    await selectPrimaryRole('roaster');
    
    // Verify profile creation
    expect(prisma.roasterProfile.create).toHaveBeenCalledWith({
      data: { userId: 'test-user' }
    });
  });

  it('should validate roaster profile data', async () => {
    const invalidData = {
      specialties: [], // Empty array should fail
      languages: ['Français'],
      experience: 'Expert' as const
    };

    await expect(setupRoasterProfile(invalidData)).rejects.toThrow();
  });
});
```

### Tests E2E critiques

```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete roaster onboarding', async ({ page }) => {
    // Setup: Login first
    await page.goto('/login');
    // ... login flow
    
    // Test: Role selection
    await page.goto('/onboarding/role-selection');
    await page.click('[data-testid="roaster-card"]');
    await page.click('button:has-text("Continuer")');
    
    // Test: Profile setup
    await expect(page).toHaveURL('/onboarding/profile-setup');
    await page.click('[data-testid="specialty-UX"]');
    await page.click('[data-testid="specialty-Dev"]');
    await page.selectOption('[data-testid="experience"]', 'Expert');
    await page.fill('[data-testid="bio"]', 'Test bio');
    await page.click('button:has-text("Finaliser mon profil")');
    
    // Test: Welcome screen
    await expect(page).toHaveURL('/onboarding/welcome');
    await page.click('button:has-text("Voir les missions")');
    
    // Verify: Redirected to marketplace
    await expect(page).toHaveURL('/marketplace');
  });
});
```

## Définition of Done

✅ **Données** : Modèles Prisma créés et migrés  
✅ **Navigation** : Middleware de redirection fonctionnel  
✅ **Interface** : Pages d'onboarding responsive et accessibles  
✅ **Actions** : Server actions avec validation Zod  
✅ **Tests** : Couverture unitaire et E2E des flows critiques  
✅ **Performance** : Temps de chargement < 2s  
✅ **SEO** : Meta tags appropriés  
✅ **Sécurité** : Validation côté serveur systématique  

## Temps estimé total : 15h

Ce sprint pose les fondations complètes du système d'onboarding dual-role, en suivant la stratégie progressive définie dans les PRD et en respectant les guidelines techniques du projet.