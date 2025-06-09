# Onboarding & Marketplace Design - RoastMyApp

## 1. Stratégie de Pricing Révisée

### Prix Ultra-Accessibles
- **Prix de base** : 5€ par feedback
- **Prix premium** : 10€ (roasters top-rated)
- **Pack volume** : 20€ pour 5 feedbacks (4€/feedback)

**Justification** : À 5€, c'est le prix d'un café. Psychologiquement, c'est une décision instantanée, pas une réflexion budgétaire.

### Modèle de Rémunération
```typescript
interface PricingModel {
  basePrice: 5; // €
  roasterShare: 3.50; // € (70%)
  platformFee: 1.50; // € (30%)
  
  premiumPrice: 10; // €
  premiumRoasterShare: 7; // € (70%)
  premiumPlatformFee: 3; // € (30%)
  
  volumeDiscount: {
    pack5: 20, // € total (4€/feedback)
    pack10: 35, // € total (3.50€/feedback)
  }
}
```

## 2. Onboarding Détaillé

### A. Onboarding Créateur

#### User Story 1 : "First Time Creator"
**Persona** : Julie, fondatrice d'une app de méditation

**Parcours** :
1. **Landing** → Click "Obtenir mon premier roast"
2. **Inscription simplifiée** :
   ```typescript
   interface QuickSignup {
     email: string;
     password: string;
     // Pas de formulaire long, on demande le reste après
   }
   ```

3. **Onboarding en 3 étapes** :
   
   **Étape 1/3 : "Ton app"**
   - URL de l'app (requis)
   - Type (Web, iOS, Android)
   - Stade (Idée, MVP, Lancée)
   - Screenshot automatique via Puppeteer
   
   **Étape 2/3 : "Ce que tu cherches"**
   - Sélection rapide par boutons :
     ```
     [First Impression] [UX/UI] [Business Model] 
     [Bugs] [Copywriting] [Market Fit]
     ```
   - Question ouverte : "Qu'est-ce qui te préoccupe le plus ?"
   
   **Étape 3/3 : "Choisis ton plan"**
   - **Quick Roast** : 1 feedback à 5€ "Essayer"
   - **Starter Pack** : 5 feedbacks à 20€ "Populaire ⭐"
   - **Deep Dive** : 10 feedbacks à 35€ "Meilleure valeur"

4. **Post-paiement** :
   - Message : "Super ! Tu vas recevoir ton premier feedback dans les 24h"
   - Email de confirmation avec tips pour maximiser la valeur

#### User Story 2 : "Returning Creator"
**Parcours optimisé** :
1. Dashboard avec "Nouveau Roast" en gros
2. Pré-remplissage des infos connues
3. Suggestions basées sur l'historique
4. One-click reorder

### B. Onboarding Roaster

#### User Story 3 : "Designer qui veut arrondir ses fins de mois"
**Persona** : Marc, UX Designer freelance

**Parcours** :
1. **Landing** → "Devenir Roaster - Gagne 3.50€ par feedback"

2. **Qualification rapide** (pour éviter les touristes) :
   ```typescript
   interface RoasterQuiz {
     question1: "Ton expertise principale ?";
     options: ["Dev", "Design", "Marketing", "Autre"];
     
     question2: "Combien d'apps as-tu déjà testées ?";
     options: ["0-5", "5-20", "20+"];
     
     question3: "Peux-tu donner un feedback constructif ?";
     miniTest: "Regarde cette page et dis-nous ce qui cloche";
   }
   ```

3. **Profil Roaster** :
   - **Basics** : Nom, photo, bio courte
   - **Expertise** : Tags sélectionnables
   - **Portfolio** : Liens vers projets (optionnel)
   - **Disponibilité** : "Combien de roasts par semaine ?"

4. **Test d'entrée** :
   - On leur donne une vraie app à roaster
   - Template guidé pour le premier feedback
   - Évaluation manuelle par l'équipe
   - Si OK → Badge "Verified Roaster"

5. **Premier match** :
   - Notification : "Ta première mission t'attend !"
   - Guide pas-à-pas pour le premier roast
   - Bonus : +2€ sur le premier roast réussi

### C. Scénarios d'Edge Cases

#### Scénario 1 : "Le créateur déçu"
- Feedback de mauvaise qualité reçu
- **Solution** : Bouton "Signaler" → Review manuel → Remboursement ou nouveau roast gratuit

#### Scénario 2 : "Le roaster fantôme"
- Accepte une mission mais ne livre pas
- **Solution** : Rappel à 24h, suspension à 48h, réassignation automatique

#### Scénario 3 : "L'app impossible à tester"
- Lien mort, app crashe, login requis non fourni
- **Solution** : Roaster peut "Signaler un problème" → Creator notifié → 24h pour fix ou annulation

## 3. Fonctionnement de la Marketplace

### A. Système de Matching

```typescript
interface MarketplaceFlow {
  // 1. Creator poste une demande
  createRequest: {
    app: AppDetails;
    budget: "5€" | "20€" | "35€";
    urgency: "24h" | "48h" | "1 week";
    preferences?: {
      roasterType?: string[];
      language?: string;
    };
  };
  
  // 2. Matching automatique
  autoMatch: {
    algorithm: "Trouve 3-5 roasters compatibles";
    notification: "Push notification aux roasters";
    firstComeFirstServe: true;
  };
  
  // 3. Ou Browse & Apply
  browseMode: {
    roasters: "Voient les demandes ouvertes";
    filter: "Par expertise, deadline, prix";
    apply: "1-click application";
  };
}
```

### B. Système de Réputation

```typescript
interface ReputationSystem {
  roasterLevels: {
    rookie: { roasts: 0-5, badge: "🌱" };
    verified: { roasts: 5-20, badge: "✓" };
    expert: { roasts: 20-50, badge: "⭐" };
    master: { roasts: 50+, badge: "🏆" };
  };
  
  qualityMetrics: {
    avgRating: number; // Sur 5
    completionRate: number; // %
    responseTime: number; // Heures
    specialties: string[]; // Tags validés
  };
  
  pricing: {
    rookie: 5; // € fixe
    verified: 5; // € fixe
    expert: 7; // € peut charger plus
    master: 10; // € premium
  };
}
```

### C. Flow de Transaction

1. **Réservation** :
   - Creator choisit un pack
   - Paiement immédiat (Stripe)
   - Fonds en escrow

2. **Attribution** :
   - Auto-match ou sélection manuelle
   - Roasters ont 2h pour accepter
   - Timer de 48h commence

3. **Livraison** :
   - Roaster soumet via formulaire structuré
   - Notification au creator
   - Review period de 24h

4. **Paiement** :
   - Si pas de contestation → Paiement auto
   - Si contestation → Médiation (rare)
   - Roaster peut retirer à partir de 20€

### D. Gamification & Engagement

```typescript
interface GamificationElements {
  // Pour Creators
  creatorPerks: {
    firstTimer: "Badge Early Adopter";
    regular: "5 roasts = -10% sur le prochain";
    evangelist: "Parraine = 1 roast gratuit";
  };
  
  // Pour Roasters  
  roasterChallenges: {
    daily: "3 roasts aujourd'hui = Bonus 2€";
    weekly: "Maintiens 4.5+ cette semaine = Badge";
    monthly: "Top roaster du mois = 50€ bonus";
  };
  
  // Community
  publicElements: {
    leaderboard: "Top 10 roasters visibles";
    successStories: "Before/After publics";
    roastOfWeek: "Le plus brutal/utile";
  };
}
```

## 4. Exemples Concrets de Parcours

### Exemple 1 : "Sarah lance son app de fitness"
1. S'inscrit en 2 min
2. Ajoute son app : "FitBuddy - Track workouts"
3. Choisit le pack 5 feedbacks à 20€
4. Reçoit 3 feedbacks en 24h, 2 en 48h
5. Note chaque feedback
6. Revient 2 semaines après avec sa v2

### Exemple 2 : "Thomas, dev React, devient roaster"
1. Voit une pub "Gagne 100€/semaine en donnant ton avis"
2. S'inscrit, passe le test
3. Configure ses dispos : "3 roasts/semaine max"
4. Reçoit sa première notif en 2h
5. Livre un feedback détaillé avec screenshots
6. Gagne ses premiers 3.50€
7. Monte en level après 10 roasts

## 5. KPIs de la Marketplace

- **Temps moyen de match** : < 2h
- **Taux de complétion** : > 95%
- **Feedback en 24h** : > 80%
- **Note moyenne** : > 4.2/5
- **Roasters actifs/semaine** : > 50
- **Repeat rate creators** : > 40%

Cette approche low-price/high-volume permet de créer rapidement une masse critique et de réduire les frictions à l'adoption.