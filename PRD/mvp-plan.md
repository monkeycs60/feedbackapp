# Plan MVP - RoastMyApp

## Vision du Produit

**RoastMyApp** est une marketplace qui connecte les entrepreneurs/développeurs cherchant des feedbacks brutalement honnêtes avec des testeurs qualifiés et rémunérés. 

**Proposition de valeur unique** : "La vérité brutale sur ton app. Payée à la qualité réelle du feedback."

## Décisions Techniques et Business

### 1. Modèle de Pricing Retenu : Quality-Based Pricing

**Justification** : Après analyse des différentes options (prix fixe, commission dégressive, enchères), le modèle basé sur la qualité évaluée par IA est le plus innovant et aligné avec les intérêts de tous :

- **Pour les créateurs** : Ils paient uniquement pour la valeur reçue (20-100% du prix max fixé)
- **Pour les roasters** : Motivation à fournir des feedbacks de qualité pour maximiser leurs gains
- **Pour la plateforme** : Différenciation claire et modèle scalable

**Implémentation** :
- Prix max fixé par le créateur : 20€ à 50€ (pour le MVP)
- L'IA évalue la qualité du feedback sur 5 critères
- Paiement final = Prix max × Score qualité (%)
- Commission plateforme : 20% fixe

### 2. Architecture Technique

**Stack retenu** :
- **Frontend** : Next.js 15 (déjà en place) + Shadcn UI
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL avec Prisma (déjà configuré)
- **Auth** : Better Auth (déjà implémenté)
- **Paiements** : Stripe Connect
- **IA** : OpenAI API pour l'évaluation des feedbacks
- **File storage** : Supabase Storage (pour screenshots/vidéos)

### 3. Fonctionnalités MVP

#### Phase 1 : Core Features (Semaines 1-3)

**1. Système de profils**
```typescript
interface UserProfile {
  // Commun
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'roaster' | 'both';
  
  // Profil Roaster
  roasterProfile?: {
    specialties: string[]; // ['UX', 'Business', 'Technical']
    languages: string[];
    experience: string;
    portfolio?: string;
    rating: number;
    completedRoasts: number;
  };
  
  // Profil Creator
  creatorProfile?: {
    company?: string;
    projectsPosted: number;
  };
}
```

**2. Système de Roast Request**
```typescript
interface RoastRequest {
  id: string;
  creatorId: string;
  title: string;
  appUrl: string;
  description: string;
  targetAudience: string;
  focusAreas: string[]; // ['UX', 'Onboarding', 'Pricing']
  maxPrice: number; // 20-50€
  deadline: Date;
  status: 'open' | 'in_progress' | 'completed';
}
```

**3. Système de Feedback**
```typescript
interface Feedback {
  id: string;
  roastRequestId: string;
  roasterId: string;
  
  // Contenu structuré
  firstImpression: string;
  strengthsFound: string[];
  weaknessesFound: string[];
  actionableSteps: string[];
  competitorComparison?: string;
  screenshots?: string[];
  
  // Évaluation
  aiQualityScore?: number; // 0-100
  creatorRating?: number; // 1-5
  finalPrice?: number;
}
```

**4. Système d'évaluation IA**
```typescript
interface AIEvaluation {
  evaluateFeedback(feedback: Feedback): Promise<{
    score: number; // 0-100
    breakdown: {
      depth: number;
      actionability: number;
      clarity: number;
      evidence: number;
      uniqueness: number;
    };
    explanation: string;
  }>;
}
```

#### Phase 2 : Features Avancées (Semaines 4-6)

- Dashboard analytics pour créateurs et roasters
- Système de matching intelligent
- Notifications par email
- Export PDF des feedbacks
- Mode "Team Roast" (3 experts)

### 4. User Journey MVP

#### Journey Créateur
1. **Inscription** → Choix du rôle (Creator)
2. **Poster un roast** → Formulaire avec URL, description, focus areas
3. **Fixer le budget** → Prix max entre 20€ et 50€
4. **Recevoir des candidatures** → Les roasters postulent
5. **Sélectionner des roasters** → Max 3 pour commencer
6. **Recevoir les feedbacks** → Sous 48h
7. **Payer selon la qualité** → Évaluation IA transparente

#### Journey Roaster
1. **Inscription** → Profil avec spécialités
2. **Parcourir les demandes** → Filtrer par expertise
3. **Postuler** → Courte motivation
4. **Être sélectionné** → Notification
5. **Analyser l'app** → Template structuré
6. **Soumettre le feedback** → Max 48h
7. **Être payé** → Selon score qualité

### 5. Stratégie de Lancement

#### Semaine 1 : "Founders Week"
- 50 roasts gratuits pour créer du contenu
- Recrutement de 20 roasters initiaux
- Focus sur la communauté IndieHackers

#### Semaine 2-4 : "Early Bird"
- Prix réduit : -50% sur tous les roasts
- Objectif : 100 roasts complétés
- Collecte de témoignages

#### Mois 2 : "Scale"
- Lancement sur Product Hunt
- Partenariats avec incubateurs
- Introduction du "Team Roast"

### 6. Métriques de Succès

- **Taux de complétion** : >90% des roasts commencés
- **Score qualité moyen** : >70%
- **NPS créateurs** : >50
- **Revenu mensuel** : 5000€ (mois 3)
- **Roasters actifs** : 100+

### 7. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|---------|------------|
| Qualité des feedbacks faible | Élevé | Validation manuelle au début + formation roasters |
| Pas assez de roasters | Élevé | Recrutement actif + programme ambassadeur |
| Évaluation IA biaisée | Moyen | A/B test avec validation humaine |
| Fraude/Spam | Moyen | KYC progressif + système de réputation |

### 8. Budget et Resources

- **Développement** : 3 mois × 1 dev = ~15k€
- **Marketing initial** : 3k€ (ads, influenceurs)
- **Coûts IA** : ~500€/mois (OpenAI)
- **Stripe fees** : 2.9% + 0.25€ par transaction
- **Total MVP** : ~20k€

### 9. Roadmap Technique Détaillée

#### Sprint 1 (Semaine 1-2)
- [ ] Setup Stripe Connect
- [ ] Modèles de données (User, RoastRequest, Feedback)
- [ ] Pages profil (Creator/Roaster)
- [ ] Système d'upload fichiers

#### Sprint 2 (Semaine 3-4)
- [ ] Formulaire création roast request
- [ ] Liste des demandes avec filtres
- [ ] Système de candidature
- [ ] Notifications email de base

#### Sprint 3 (Semaine 5-6)
- [ ] Interface de soumission feedback
- [ ] Intégration OpenAI pour évaluation
- [ ] Système de paiement Stripe
- [ ] Dashboard basique

### 10. Décisions Clés Prises

1. **Prix unique non** → Prix basé sur la qualité (plus juste et innovant)
2. **Enchères non** → Trop complexe pour un MVP
3. **Commission fixe 20%** → Simple et transparent
4. **Focus B2C** → Pas de packages entreprise au début
5. **Template structuré** → Guide les roasters pour la qualité
6. **Évaluation IA immédiate** → Pas d'attente pour le paiement

## Prochaines Étapes

1. Valider le plan avec des interviews utilisateurs
2. Créer les maquettes détaillées
3. Développer le MVP en suivant les sprints
4. Recruter les 20 premiers roasters
5. Lancer en beta fermée

Ce plan permet de tester rapidement l'hypothèse centrale : **les entrepreneurs sont-ils prêts à payer pour des feedbacks brutalement honnêtes, évalués par IA ?**