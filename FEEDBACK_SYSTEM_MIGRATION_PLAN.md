# Plan d'Action - Migration Système de Feedback

## 🎯 Nouveau Modèle de Pricing

### Formule Mise à Jour
```
📋 Feedback Libre: 2€ par roaster (0 question)
🎯 Feedback Ciblé: 2€ + (questions-2) × 0.25€ (2 questions offertes)
🏗️ Feedback Structuré: 2€ + (questions-2) × 0.20€ (2 questions offertes)
```

### Exemples
- **Libre** : 2€ × 2 roasters = **4€**
- **Ciblé** (3 questions) : (2€ + 0.25€) × 2 = **4.50€**
- **Structuré** (5 questions) : (2€ + 0.60€) × 2 = **5.20€**

---

## 🔍 Analyse d'Impact - 50+ Fichiers Identifiés

### **1. 🎨 COMPOSANTS UI - Interface Utilisateur (15 fichiers)**

#### Formulaires de Création
- **`components/roast/new-roast-form.tsx`** ⚠️ **CRITIQUE**
  - Refactoring complet nécessaire
  - Nouveau wizard en 3 modes
  - Logique de pricing intégrée

- **`components/roast/focus-areas-step.tsx`** ⚠️ **CRITIQUE**  
  - Devient optionnel selon le mode
  - Nouveau comportement pour mode "Structuré"

- **`components/roast/questions-step.tsx`** ⚠️ **CRITIQUE**
  - Split en 3 composants selon le mode
  - Pricing temps réel par mode

#### Affichage des Roasts
- **`components/roast/roast-card.tsx`** ⚠️ **HAUTE**
  - Badge du mode de feedback
  - Prix affiché selon nouvelle formule

- **`components/dashboard/roast-details.tsx`** ⚠️ **HAUTE**
  - Affichage questions par mode
  - Groupement conditionnel par domaine

- **`components/roast/roast-summary.tsx`** ⚠️ **HAUTE**
  - Résumé adapté au mode choisi
  - Prix calculé selon nouveau modèle

#### Feedback et Réponses
- **`components/feedback/roast-feedback-form.tsx`** ⚠️ **CRITIQUE**
  - Affichage conditionnel :
    - Mode Libre : Textarea libre
    - Mode Ciblé : Questions en liste
    - Mode Structuré : Questions groupées par domaine

- **`components/feedback/question-response.tsx`** ⚠️ **MOYENNE**
  - Gestion du contexte domaine optionnel

### **2. 💰 LOGIQUE PRICING - Calculs Financiers (8 files)**

#### Actions Principales
- **`lib/actions/roast-request.ts`** ⚠️ **CRITIQUE**
  - `calculateRoastPrice()` : Nouvelle formule
  - `createRoastRequest()` : Validation mode + questions
  - Stockage du mode dans la DB

- **`lib/utils/pricing.ts`** ⚠️ **CRITIQUE** (à créer)
  - Centraliser toute la logique pricing
  - Fonctions par mode
  - Validation des limites

#### Composants Pricing
- **`components/pricing/price-calculator.tsx`** ⚠️ **HAUTE**
  - Widget temps réel
  - Affichage par mode avec détails

- **`components/pricing/price-display.tsx`** ⚠️ **HAUTE**
  - Format uniforme pour l'affichage
  - Tooltip explicatif

### **3. 🗄️ BASE DE DONNÉES - Schéma & Migrations (5 fichiers)**

#### Schema Principal
- **`prisma/schema.prisma`** ⚠️ **CRITIQUE**
  ```sql
  -- Nouveaux champs RoastRequest
  feedbackMode    FeedbackMode @default(STRUCTURED)
  basePriceMode   Decimal      @default(2.00)
  freeQuestions   Int          @default(2)
  questionPrice   Decimal      @default(0.20)
  ```

#### Types
- **`lib/types/roast-request.ts`** ⚠️ **CRITIQUE**
  ```typescript
  type FeedbackMode = 'FREE' | 'TARGETED' | 'STRUCTURED'
  
  interface RoastRequest {
    feedbackMode: FeedbackMode
    basePriceMode: number
    freeQuestions: number  
    questionPrice: number
  }
  ```

#### Migrations
- **`prisma/migrations/`** ⚠️ **CRITIQUE**
  - Migration pour nouveaux champs
  - Migration des données existantes

### **4. 📊 PAGES & ROUTES - Navigation (12 fichiers)**

#### Pages de Création
- **`app/new-roast/page.tsx`** ⚠️ **HAUTE**
  - Interface mode sélection
  - Stepper adaptatif

- **`app/dashboard/roast/[id]/page.tsx`** ⚠️ **HAUTE**
  - Affichage détails selon mode
  - Statistiques questions

#### API Routes  
- **`app/api/roast/create/route.ts`** ⚠️ **CRITIQUE**
  - Validation nouveau modèle
  - Calcul pricing serveur

- **`app/api/roast/pricing/route.ts`** ⚠️ **CRITIQUE** (à créer)
  - Endpoint calcul prix temps réel
  - Validation limites

### **5. ⚙️ LOGIQUE MÉTIER - Validations (8 fichiers)**

#### Schemas de Validation
- **`lib/schemas/roast-request.ts`** ⚠️ **CRITIQUE**
  ```typescript
  const roastRequestSchema = z.object({
    feedbackMode: z.enum(['FREE', 'TARGETED', 'STRUCTURED']),
    questions: z.array().min(0).max(20), // selon mode
    focusAreas: z.array().optional(), // seulement si STRUCTURED
  })
  ```

#### Actions Validation
- **`lib/actions/validation.ts`** ⚠️ **HAUTE** (à créer)
  - Validation par mode
  - Limites questions par mode
  - Prix maximum autorisé

### **6. 📈 ANALYTICS & STATS - Tableaux de Bord (7 fichiers)**

#### Dashboard Stats
- **`components/dashboard/earnings-stats.tsx`** ⚠️ **HAUTE**
  - Calcul revenus nouveau pricing
  - Répartition par mode

- **`components/dashboard/roast-analytics.tsx`** ⚠️ **MOYENNE**
  - Métriques par mode
  - Questions les plus utilisées

#### Admin Analytics
- **`app/admin/analytics/page.tsx`** ⚠️ **MOYENNE**
  - Stats utilisation par mode
  - Revenue impact

### **7. 🔍 FILTRES & RECHERCHE - Navigation (5 fichiers)**

#### Marketplace
- **`components/marketplace/filters.tsx`** ⚠️ **HAUTE**
  - Filtre par mode feedback
  - Range de prix adapté

- **`components/marketplace/search.tsx`** ⚠️ **MOYENNE**
  - Recherche dans questions
  - Filtre par nombre de questions

---

## 🚀 Plan d'Implémentation - 4 Phases

### **PHASE 1 : FONDATIONS (Semaine 1-2)**
**Objectif** : Backend + Types + Base pricing

#### Tâches Critiques
1. **Database Schema**
   - [ ] Ajouter champs `feedbackMode`, `basePriceMode`, etc.
   - [ ] Migration données existantes → `STRUCTURED`
   - [ ] Tests intégrité données

2. **Types & Validation** 
   - [ ] Créer `FeedbackMode` enum
   - [ ] Mettre à jour interfaces
   - [ ] Nouveau schéma validation Zod

3. **Pricing Logic**
   - [ ] Créer `lib/utils/pricing.ts`
   - [ ] Fonctions calcul par mode
   - [ ] Tests unitaires complets

4. **API Foundation**
   - [ ] Mettre à jour `createRoastRequest()`
   - [ ] Nouveau endpoint pricing
   - [ ] Validation serveur

### **PHASE 2 : INTERFACE CRÉATION (Semaine 3)**
**Objectif** : Nouveau workflow de création

#### Tâches UI/UX
1. **Nouveau Wizard**
   - [ ] Mode selection step
   - [ ] Refactor `NewRoastForm`
   - [ ] Pricing widget temps réel

2. **Composants par Mode**
   - [ ] `FeedbackFreeStep` (confirmation)
   - [ ] `FeedbackTargetedStep` (questions libres)
   - [ ] `FeedbackStructuredStep` (domaines + questions)

3. **Price Calculator**
   - [ ] Widget responsive
   - [ ] Animation transitions
   - [ ] Tooltips explicatifs

### **PHASE 3 : AFFICHAGE & FEEDBACK (Semaine 4)**
**Objectif** : Adaptation affichage existing + form feedback

#### Adaptation Existant
1. **Roast Display**
   - [ ] Badge mode sur cards
   - [ ] Détails adaptés par mode
   - [ ] Prix affiché correctement

2. **Feedback Form**
   - [ ] Mode FREE : Textarea libre
   - [ ] Mode TARGETED : Liste questions
   - [ ] Mode STRUCTURED : Groupé domaines

3. **Dashboard Updates**
   - [ ] Stats par mode
   - [ ] Earnings nouveau calcul
   - [ ] Analytics adaptation

### **PHASE 4 : OPTIMISATION (Semaine 5)**
**Objectif** : Peaufinage + Performance

#### Finalisation
1. **Marketplace**
   - [ ] Filtres par mode
   - [ ] Search questions
   - [ ] Price range update

2. **Mobile Optimization**
   - [ ] Interface tactile
   - [ ] Performance wizard
   - [ ] Tests devices

3. **Testing & Polish**
   - [ ] Tests E2E complets
   - [ ] Performance audit
   - [ ] Bug fixes

---

## ⚠️ Risques & Mitigations

### **Risques Techniques**
1. **Migration Données** 
   - Risque : Perte données existantes
   - Mitigation : Backup + rollback plan

2. **Pricing Inconsistencies**
   - Risque : Calculs incorrects
   - Mitigation : Tests exhaustifs + validation croisée

3. **Performance**
   - Risque : Lenteur calculs temps réel
   - Mitigation : Cache + optimisation queries

### **Risques Business**
1. **User Confusion**
   - Risque : Users perdus nouveau système
   - Mitigation : Documentation + onboarding

2. **Revenue Impact**
   - Risque : Baisse revenus court terme
   - Mitigation : A/B test + monitoring

---

## 📋 Checklist de Validation

### **Backend Ready**
- [ ] Schema DB migré sans erreur
- [ ] Toutes les fonctions pricing testées
- [ ] API endpoints validés
- [ ] Performance acceptable

### **Frontend Ready**  
- [ ] Wizard creation fluide
- [ ] Pricing temps réel accurate
- [ ] Affichage roasts correct
- [ ] Mobile responsive

### **Business Ready**
- [ ] Pricing vérifié comptable
- [ ] Documentation utilisateur
- [ ] Support team formé
- [ ] Rollback plan prêt

---

Ce plan couvre tous les aspects impactés. Le plus critique est la **Phase 1** car elle pose les fondations de tout le système. Une fois celle-ci solide, le reste devrait se dérouler sans accroc ! 🚀

Tu veux qu'on commence par quelle phase ?