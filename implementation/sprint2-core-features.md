# Sprint 2 - Core Features Implementation

## Vue d'ensemble

Maintenant que l'onboarding dual-role est complet et fonctionnel avec les tests E2E, le Sprint 2 se concentre sur l'implémentation des fonctionnalités core business de RoastMyApp : le système de Roast Requests et le début du marketplace.

**Objectif** : Permettre aux créateurs de poster leurs apps à roaster et aux roasters de découvrir des missions disponibles.

## État Actuel du Projet

### ✅ Complété dans Sprint 1
- **Auth système** : Better Auth avec email/password + Google OAuth
- **Onboarding complet** : Sélection de rôle, setup profil Creator/Roaster, welcome screen
- **Database** : Modèles User, CreatorProfile, RoasterProfile avec champs onboarding
- **Guards d'onboarding** : Redirection automatique pour utilisateurs incomplets
- **Tests E2E** : Couverture complète du flow d'onboarding
- **CI/CD** : GitHub Actions pour tests automatiques

### 🎯 À Implémenter dans Sprint 2
- **Roast Request System** : Création, édition, gestion des demandes
- **Marketplace basique** : Liste et filtrage des missions pour roasters
- **Dashboard Creator** : Gestion des demandes créées
- **Système d'upload** : Screenshots et assets des apps
- **Notifications email** : Base pour alerter sur les nouvelles demandes

---

## Tâche 1: Système de Roast Request (5h)

### Objectif
Permettre aux créateurs de poster leurs apps avec toutes les informations nécessaires pour un feedback de qualité.

### Modèles de données étendus

Nos modèles `RoastRequest` et `Feedback` existent déjà dans le schema.prisma, on va les utiliser directement.

### Livrables
1. **Page de création de roast request** (`/dashboard/new-roast`)
2. **Formulaire multi-étapes** avec validation
3. **Actions serveur** pour CRUD des roast requests
4. **Types TypeScript** spécialisés

### Implémentation

#### 1.1 Types et constantes

```typescript
// lib/types/roast-request.ts
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
```

#### 1.2 Actions serveur

```typescript
// lib/actions/roast-request.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FocusArea, AppCategory } from "@/lib/types/roast-request";

const roastRequestSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudience: z.string().min(10, "Décris ton audience cible").max(200),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1, "Sélectionne au moins un domaine").max(4, "Maximum 4 domaines"),
  maxPrice: z.number().min(25).max(100),
  deadline: z.date().optional(),
  isUrgent: z.boolean().default(false),
  additionalContext: z.string().max(500).optional()
});

export async function createRoastRequest(data: z.infer<typeof roastRequestSchema>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  // Vérifier que l'utilisateur a un profil créateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creatorProfile: true }
  });

  if (!user?.creatorProfile) {
    throw new Error("Profil créateur requis");
  }

  const validation = roastRequestSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("Données invalides: " + validation.error.issues.map(i => i.message).join(', '));
  }

  const validData = validation.data;

  try {
    const roastRequest = await prisma.roastRequest.create({
      data: {
        creatorId: session.user.id,
        title: validData.title,
        appUrl: validData.appUrl,
        description: validData.description,
        targetAudience: validData.targetAudience,
        focusAreas: validData.focusAreas,
        maxPrice: validData.maxPrice,
        deadline: validData.deadline,
        status: 'open'
      }
    });

    // Mettre à jour le compteur de projets postés
    await prisma.creatorProfile.update({
      where: { userId: session.user.id },
      data: { projectsPosted: { increment: 1 } }
    });

    revalidatePath('/dashboard');
    redirect(`/dashboard/roast/${roastRequest.id}`);
  } catch (error) {
    console.error('Erreur création roast request:', error);
    throw new Error('Erreur lors de la création de la demande');
  }
}

export async function getUserRoastRequests() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  return await prisma.roastRequest.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      feedbacks: {
        select: { id: true, status: true }
      },
      _count: {
        select: { feedbacks: true }
      }
    }
  });
}

export async function updateRoastRequestStatus(id: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  // Vérifier que l'utilisateur est propriétaire de la demande
  const roastRequest = await prisma.roastRequest.findFirst({
    where: { 
      id,
      creatorId: session.user.id 
    }
  });

  if (!roastRequest) {
    throw new Error("Demande non trouvée");
  }

  await prisma.roastRequest.update({
    where: { id },
    data: { status }
  });

  revalidatePath('/dashboard');
}
```

#### 1.3 Formulaire de création

```tsx
// app/dashboard/new-roast/page.tsx
import { requireOnboardingComplete } from '@/lib/auth-guards';
import { NewRoastForm } from '@/components/dashboard/new-roast-form';

export const metadata = {
  title: "Nouvelle demande de roast - RoastMyApp",
  description: "Poste ton app pour recevoir des feedbacks d'experts"
};

export default async function NewRoastPage() {
  await requireOnboardingComplete();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nouvelle demande de roast
          </h1>
          <p className="text-gray-600">
            Plus tu donnes de détails, meilleurs seront les feedbacks
          </p>
        </div>
        
        <NewRoastForm />
      </div>
    </div>
  );
}
```

```tsx
// components/dashboard/new-roast-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FOCUS_AREAS, PRICE_RANGES, type FocusArea } from '@/lib/types/roast-request';
import { createRoastRequest } from '@/lib/actions/roast-request';

const formSchema = z.object({
  title: z.string().min(10).max(100),
  appUrl: z.string().url(),
  description: z.string().min(50).max(1000),
  targetAudience: z.string().min(10).max(200),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1).max(4),
  maxPrice: z.number().min(25).max(100),
  isUrgent: z.boolean(),
  additionalContext: z.string().max(500).optional()
});

type FormData = z.infer<typeof formSchema>;

export function NewRoastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focusAreas: [],
      maxPrice: 40,
      isUrgent: false
    }
  });

  const selectedFocusAreas = form.watch('focusAreas') || [];
  const selectedPrice = form.watch('maxPrice');

  const toggleFocusArea = (areaId: string) => {
    const current = selectedFocusAreas;
    const updated = current.includes(areaId)
      ? current.filter(id => id !== areaId)
      : current.length < 4 ? [...current, areaId] : current;
    form.setValue('focusAreas', updated);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await createRoastRequest(data);
      // La redirection est gérée dans l'action
    } catch (error) {
      console.error('Erreur:', error);
      // TODO: Afficher erreur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Étape 1: Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            Présente ton app
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre de ta demande</label>
            <Input
              {...form.register('title')}
              placeholder="Ex: Feedback sur l'onboarding de mon SaaS de gestion"
              className="w-full"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL de ton app</label>
            <Input
              {...form.register('appUrl')}
              placeholder="https://monapp.com"
              type="url"
            />
            {form.formState.errors.appUrl && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.appUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <select {...form.register('category')} className="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">Sélectionne une catégorie</option>
              <option value="SaaS">SaaS</option>
              <option value="Mobile">App Mobile</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Landing">Landing Page</option>
              <option value="MVP">MVP/Beta</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Étape 2: Description détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            Contexte et objectifs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Description de ton app</label>
            <Textarea
              {...form.register('description')}
              placeholder="Décris ce que fait ton app, ses fonctionnalités principales, ce qui la rend unique..."
              rows={4}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {form.watch('description')?.length || 0}/1000
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audience cible</label>
            <Input
              {...form.register('targetAudience')}
              placeholder="Ex: PME françaises, freelances tech, entrepreneurs B2B..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Étape 3: Focus areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            Domaines de feedback
          </CardTitle>
          <p className="text-sm text-gray-600">Sélectionne 1 à 4 domaines (max 4)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleFocusArea(area.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFocusAreas.includes(area.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{area.icon}</span>
                  <div>
                    <div className="font-medium">{area.label}</div>
                    <div className="text-sm text-gray-600">{area.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {form.formState.errors.focusAreas && (
            <p className="text-red-500 text-sm mt-2">{form.formState.errors.focusAreas.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Étape 4: Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            Budget et priorité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Budget maximum</label>
            <div className="grid grid-cols-3 gap-3">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => form.setValue('maxPrice', range.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedPrice === range.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-lg">{range.label}</div>
                  <div className="text-sm text-gray-600">{range.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <label className="font-medium">Demande urgente</label>
              <p className="text-sm text-gray-600">Feedback sous 24h (+50% prix final)</p>
            </div>
            <Switch {...form.register('isUrgent')} />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" className="flex-1">
          Sauvegarder en brouillon
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Publication...' : 'Publier la demande'}
        </Button>
      </div>
    </form>
  );
}
```

---

## Tâche 2: Dashboard Creator amélioré (3h)

### Objectif
Créer un dashboard fonctionnel pour que les créateurs gèrent leurs demandes de roast.

### Livrables
1. **Liste des roast requests** avec statuts
2. **Stats basiques** (demandes, feedbacks reçus, budget dépensé)
3. **Actions rapides** (modifier, dupliquer, annuler)

### Implémentation

```tsx
// app/dashboard/page.tsx
import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getUserRoastRequests } from '@/lib/actions/roast-request';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { RoastRequestsList } from '@/components/dashboard/roast-requests-list';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';

export const metadata = {
  title: "Dashboard - RoastMyApp",
  description: "Gérez vos demandes de roast et vos feedbacks"
};

export default async function DashboardPage() {
  const user = await requireOnboardingComplete();
  const roastRequests = await getUserRoastRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Salut {user.name} ! 👋
          </h1>
          <p className="text-gray-600">
            Voici tes demandes de roast et leur progression
          </p>
        </div>

        <DashboardStats roastRequests={roastRequests} />
        
        <div className="mt-8">
          <RoastRequestsList roastRequests={roastRequests} />
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/dashboard/dashboard-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatsProps {
  roastRequests: Array<{
    id: string;
    status: string;
    maxPrice: number;
    feedbacks: Array<{ id: string; status: string }>;
  }>;
}

export function DashboardStats({ roastRequests }: DashboardStatsProps) {
  const stats = {
    totalRequests: roastRequests.length,
    activeRequests: roastRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length,
    completedRequests: roastRequests.filter(r => r.status === 'completed').length,
    totalBudget: roastRequests.reduce((sum, r) => sum + r.maxPrice, 0),
    feedbacksReceived: roastRequests.reduce((sum, r) => sum + r.feedbacks.length, 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Demandes total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">En cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.activeRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Terminées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completedRequests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Feedbacks reçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.feedbacksReceived}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Tâche 3: Marketplace Roaster (4h)

### Objectif
Créer la page marketplace où les roasters découvrent et filtrent les missions disponibles.

### Livrables
1. **Liste des roast requests ouvertes**
2. **Filtres par spécialité, budget, urgence**
3. **Système de candidature basique**
4. **Vue détaillée d'une mission**

### Implémentation

```tsx
// app/marketplace/page.tsx
import { requireOnboardingComplete } from '@/lib/auth-guards';
import { getAvailableRoastRequests } from '@/lib/actions/roast-request';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { RoastRequestCard } from '@/components/marketplace/roast-request-card';

export const metadata = {
  title: "Marketplace - RoastMyApp",
  description: "Trouvez des missions de roast et gagnez de l'argent"
};

export default async function MarketplacePage() {
  const user = await requireOnboardingComplete();
  const roastRequests = await getAvailableRoastRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Missions disponibles
          </h1>
          <p className="text-gray-600">
            {roastRequests.length} mission{roastRequests.length > 1 ? 's' : ''} disponible{roastRequests.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <MarketplaceFilters />
          </div>

          {/* Liste des missions */}
          <div className="lg:col-span-3">
            {roastRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune mission disponible
                </h3>
                <p className="text-gray-600">
                  Reviens bientôt, de nouvelles missions arrivent régulièrement !
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {roastRequests.map((request) => (
                  <RoastRequestCard key={request.id} request={request} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/marketplace/roast-request-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Euro, Target, Calendar } from 'lucide-react';
import Link from 'next/link';

interface RoastRequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    focusAreas: string[];
    maxPrice: number;
    deadline?: Date;
    targetAudience: string;
    createdAt: Date;
    creator: {
      name: string;
      creatorProfile: {
        company?: string;
      };
    };
  };
}

export function RoastRequestCard({ request }: RoastRequestCardProps) {
  const timeAgo = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60));
  const isUrgent = request.deadline && new Date(request.deadline) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{request.title}</h3>
              {isUrgent && <Badge variant="destructive">Urgent</Badge>}
            </div>
            <p className="text-gray-600 line-clamp-2">{request.description}</p>
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-green-600">
              {request.maxPrice}€
            </div>
            <div className="text-sm text-gray-500">max</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Focus areas */}
          <div className="flex flex-wrap gap-2">
            {request.focusAreas.map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{request.targetAudience}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Il y a {timeAgo}h</span>
            </div>
          </div>

          {/* Creator info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm">
              <span className="text-gray-600">Par </span>
              <span className="font-medium">{request.creator.name}</span>
              {request.creator.creatorProfile?.company && (
                <span className="text-gray-600"> • {request.creator.creatorProfile.company}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/marketplace/roast/${request.id}`}>
                  Voir détails
                </Link>
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Postuler
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Tâche 4: Système d'upload basique (2h)

### Objectif
Permettre aux créateurs d'ajouter des screenshots pour illustrer leurs demandes.

### Livrables
1. **Composant d'upload** multi-fichiers
2. **Stockage temporaire** (localStorage pour MVP)
3. **Prévisualisation** des images

### Implémentation

```tsx
// components/ui/file-upload.tsx
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Upload, Image } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: FileUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);

    // Créer les previews
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
  }, [files, onFilesChange, maxFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes
    },
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      {files.length < maxFiles && (
        <Card 
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            {isDragActive ? 'Dépose tes fichiers ici' : 'Glisse tes screenshots ici'}
          </p>
          <p className="text-sm text-gray-500">
            ou <span className="text-blue-600">clique pour sélectionner</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WebP • Max {maxFiles} fichiers
          </p>
        </Card>
      )}

      {/* Prévisualisations */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {previews[index] ? (
                  <img 
                    src={previews[index]} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Tâche 5: Notifications email basiques (2h)

### Objectif
Système de base pour notifier les nouvelles demandes et candidatures.

### Livrables
1. **Service email** avec templates
2. **Notification nouvelle demande** pour roasters
3. **Notification candidature** pour créateurs

### Implémentation

```typescript
// lib/services/email.ts
import { prisma } from '@/lib/prisma';

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendNewRoastRequestNotification(roastRequestId: string) {
    const roastRequest = await prisma.roastRequest.findUnique({
      where: { id: roastRequestId },
      include: {
        creator: {
          select: { name: true }
        }
      }
    });

    if (!roastRequest) return;

    // Récupérer tous les roasters qui matchent les spécialités
    const matchingRoasters = await prisma.user.findMany({
      where: {
        primaryRole: { in: ['roaster', 'both'] },
        roasterProfile: {
          specialties: {
            hasSome: roastRequest.focusAreas
          }
        }
      },
      select: { email: true, name: true }
    });

    // Envoyer l'email à chaque roaster
    for (const roaster of matchingRoasters) {
      const email: EmailTemplate = {
        to: roaster.email,
        subject: `Nouvelle mission: ${roastRequest.title}`,
        html: this.generateNewMissionEmail({
          roasterName: roaster.name || 'Roaster',
          missionTitle: roastRequest.title,
          budget: roastRequest.maxPrice,
          focusAreas: roastRequest.focusAreas,
          creatorName: roastRequest.creator.name || 'Créateur',
          missionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/roast/${roastRequest.id}`
        })
      };

      // Pour le MVP, on log l'email (en production: service email réel)
      console.log('Email à envoyer:', email);
    }
  }

  private static generateNewMissionEmail(data: {
    roasterName: string;
    missionTitle: string;
    budget: number;
    focusAreas: string[];
    creatorName: string;
    missionUrl: string;
  }) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nouvelle mission disponible ! 🎯</h2>
        
        <p>Salut ${data.roasterName},</p>
        
        <p>Une nouvelle mission correspond à tes spécialités :</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${data.missionTitle}</h3>
          <p><strong>Budget:</strong> ${data.budget}€</p>
          <p><strong>Domaines:</strong> ${data.focusAreas.join(', ')}</p>
          <p><strong>Par:</strong> ${data.creatorName}</p>
        </div>
        
        <a href="${data.missionUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Voir la mission
        </a>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Tu peux te désabonner de ces notifications dans tes paramètres.
        </p>
      </div>
    `;
  }
}
```

---

## Tests et Validation

### Tests E2E critiques à ajouter

```typescript
// tests/e2e/roast-request.spec.ts
import { test, expect } from '@playwright/test';
import { signUpUser, completeOnboarding, cleanupTestUser } from '../helpers/auth-helper';

test.describe('Roast Request Flow', () => {
  test('should create a new roast request as creator', async ({ page }) => {
    const user = await createTestUser();
    await signUpUser(page, user);
    await completeOnboarding(page, 'creator');
    
    // Aller au dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Créer une nouvelle demande
    await page.click('text=Nouvelle demande');
    await expect(page).toHaveURL('/dashboard/new-roast');
    
    // Remplir le formulaire
    await page.fill('[name="title"]', 'Test de mon SaaS');
    await page.fill('[name="appUrl"]', 'https://monapp.com');
    await page.fill('[name="description"]', 'Je cherche des feedbacks sur l\'UX de mon application SaaS. Elle permet de gérer des projets et je veux m\'assurer que l\'onboarding est clair.');
    await page.fill('[name="targetAudience"]', 'PME françaises');
    await page.selectOption('[name="category"]', 'SaaS');
    
    // Sélectionner focus areas
    await page.click('[data-testid="focus-area-UX"]');
    await page.click('[data-testid="focus-area-Onboarding"]');
    
    // Sélectionner budget
    await page.click('[data-testid="price-40"]');
    
    // Soumettre
    await page.click('button:has-text("Publier la demande")');
    
    // Vérifier redirection
    await expect(page).toHaveURL(/\/dashboard\/roast\/.+/);
    
    await cleanupTestUser(user.email);
  });
  
  test('should show roast requests in marketplace for roasters', async ({ page }) => {
    const roasterUser = await createTestUser();
    await signUpUser(page, roasterUser);
    await completeOnboarding(page, 'roaster');
    
    // Aller au marketplace
    await expect(page).toHaveURL('/marketplace');
    
    // Vérifier que les missions s'affichent
    await expect(page.locator('[data-testid="roast-request-card"]')).toBeVisible();
    
    await cleanupTestUser(roasterUser.email);
  });
});
```

---

## Définition of Done

✅ **Fonctionnel** : 
- Créateurs peuvent poster des roast requests
- Roasters voient les missions disponibles
- Dashboard fonctionnel avec stats basiques

✅ **Technique** :
- Actions serveur avec validation Zod
- Types TypeScript complets
- Gestion d'erreurs appropriée

✅ **UX** :
- Formulaire multi-étapes intuitif
- Filtres marketplace fonctionnels
- Upload de fichiers drag & drop

✅ **Tests** :
- Tests E2E des flows principaux
- Couverture des actions serveur

✅ **Performance** :
- Optimistic updates sur les actions
- Chargement < 2s des pages

## Temps estimé total : 16h

Ce sprint 2 transforme RoastMyApp d'un simple onboarding à une plateforme fonctionnelle où créateurs et roasters peuvent interagir via les roast requests. C'est la base nécessaire avant d'implémenter le système de candidature/sélection et les feedbacks (Sprint 3).