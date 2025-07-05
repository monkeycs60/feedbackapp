# Plan d'Implémentation : Simplification du Système de Feedback

**Date:** 2025-01-26  
**Status:** En cours

## Vue d'ensemble

Ce document détaille l'implémentation technique de la simplification du système de feedback vers un mode unique "CUSTOM" avec tarification libre.

## 1. Schéma de Migration Base de Données

### Modifications du Schema Prisma

```prisma
model RoastRequest {
  // Supprimer
  - feedbackMode     FeedbackMode
  - isUrgent         Boolean
  
  // Ajouter
  + pricePerRoaster  Float          @default(3.0)
  + useStructuredForm Boolean       @default(true)
  
  // Garder mais adapter
  questions         RoastQuestion[]
  focusAreas        String[]
  
  // Supprimer les champs legacy
  - basePriceMode    Float?
  - freeQuestions    Int?
  - questionPrice    Float?
}

model Feedback {
  // Garder tous les nouveaux champs structurés
  globalRating      Int?
  firstImpression   String?
  strengths         String[]
  weaknesses        String[]
  recommendations   String[]
  uxUiRating        Int?
  valueRating       Int?
  performanceRating Int?
  experienceRating  Int?
  additionalComments String?
  
  // Le prix final est maintenant simple
  finalPrice        Float
}

// Supprimer l'enum FeedbackMode
```

### Script de Migration

```sql
-- 1. Ajouter les nouveaux champs
ALTER TABLE "RoastRequest" 
ADD COLUMN "pricePerRoaster" DOUBLE PRECISION DEFAULT 3.0,
ADD COLUMN "useStructuredForm" BOOLEAN DEFAULT true;

-- 2. Migrer les prix existants
UPDATE "RoastRequest" 
SET "pricePerRoaster" = CASE
  WHEN "feedbackMode" = 'FREE' THEN 3.0
  WHEN "feedbackMode" = 'STRUCTURED' THEN 
    "basePriceMode" + (COALESCE("questions"::int, 0) * COALESCE("questionPrice", 0.25))
  ELSE 3.0
END;

-- 3. Supprimer l'urgence du calcul (déjà dans finalPrice des feedbacks)
UPDATE "Feedback" f
SET "finalPrice" = r."pricePerRoaster"
FROM "RoastRequest" r
WHERE f."roastRequestId" = r.id
AND r."isUrgent" = false;

-- 4. Nettoyer les colonnes après vérification
-- ALTER TABLE "RoastRequest" 
-- DROP COLUMN "feedbackMode",
-- DROP COLUMN "isUrgent",
-- DROP COLUMN "basePriceMode",
-- DROP COLUMN "freeQuestions",
-- DROP COLUMN "questionPrice";
```

## 2. Nouveau Wizard de Création (3 étapes au lieu de 4)

### Structure Simplifiée

```typescript
// new-roast-wizard.tsx
const WIZARD_STEPS = [
  {
    id: 'basics',
    title: 'Informations',
    description: 'Titre, description et audience'
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Questions et domaines (optionnel)'
  },
  {
    id: 'pricing',
    title: 'Tarification',
    description: 'Prix par roaster et récapitulatif'
  }
];
```

### Étape 1 : Informations de Base
- Titre et description
- Sélection audience cible
- Date limite (remplace l'urgence)
- Nombre max de roasters

### Étape 2 : Configuration Feedback
```tsx
// Interface unifiée pour la configuration
<div className="space-y-6">
  {/* Toujours inclus */}
  <div className="p-4 bg-muted rounded-lg">
    <h3>Feedback structuré inclus</h3>
    <p>Chaque roaster fournira :</p>
    <ul>
      <li>• Note globale et première impression</li>
      <li>• Points forts et points faibles</li>
      <li>• Recommandations</li>
      <li>• Notes détaillées (UX, Valeur, Performance)</li>
    </ul>
  </div>
  
  {/* Questions personnalisées optionnelles */}
  <div>
    <h3>Questions personnalisées (optionnel)</h3>
    <DomainQuestionManager />
  </div>
</div>
```

### Étape 3 : Tarification Simple
```tsx
// Nouveau composant de tarification
<PricingStep>
  <div className="space-y-4">
    <Label>Prix par roaster</Label>
    <div className="flex items-center gap-4">
      <Slider
        min={3}
        max={50}
        step={0.5}
        value={[pricePerRoaster]}
        onValueChange={([value]) => setPricePerRoaster(value)}
      />
      <Input
        type="number"
        min="3"
        max="50"
        step="0.5"
        value={pricePerRoaster}
        onChange={(e) => setPricePerRoaster(Number(e.target.value))}
        className="w-24"
      />
      <span>€</span>
    </div>
    
    {/* Indicateurs de marché */}
    <MarketPriceIndicator
      questionCount={questions.length}
      averagePrice={marketStats.averagePrice}
      suggestedPrice={calculateSuggestedPrice()}
    />
    
    {/* Récapitulatif */}
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex justify-between">
        <span>Prix par roaster</span>
        <span>{pricePerRoaster}€</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Coût total max</span>
        <span>{pricePerRoaster * maxRoasters}€</span>
      </div>
    </div>
  </div>
</PricingStep>
```

## 3. Mise à Jour des Composants d'Affichage

### Marketplace
```tsx
// marketplace-content.tsx
// Supprimer les badges urgents et mode
// Afficher le prix de manière prominente
<RoastCard>
  <div className="flex justify-between items-start">
    <h3>{roast.title}</h3>
    <Badge variant="secondary" className="text-lg">
      {roast.pricePerRoaster}€
    </Badge>
  </div>
  
  {roast.questions.length > 0 && (
    <p className="text-sm text-muted-foreground">
      {roast.questions.length} questions personnalisées
    </p>
  )}
</RoastCard>
```

### Dashboard Créateur
```tsx
// roast-requests-list.tsx
// Simplifier l'affichage des roasts
<TableRow>
  <TableCell>{roast.title}</TableCell>
  <TableCell>{roast.pricePerRoaster}€ × {roast.maxRoasters}</TableCell>
  <TableCell>{roast.applications.length} candidatures</TableCell>
  <TableCell>{roast.feedbacks.length} feedbacks</TableCell>
</TableRow>
```

### Affichage Feedback
```tsx
// feedback-display-v2.tsx
// Structure unifiée pour tous les feedbacks
<FeedbackDisplay>
  {/* Section structurée toujours présente */}
  <StructuredFeedbackSection feedback={feedback} />
  
  {/* Questions personnalisées si présentes */}
  {feedback.questionResponses.length > 0 && (
    <CustomQuestionsSection responses={feedback.questionResponses} />
  )}
</FeedbackDisplay>
```

## 4. Nouveaux Composants Utilitaires

### Calculateur de Prix Suggéré
```typescript
// lib/utils/pricing.ts
export function calculateSuggestedPrice({
  questionCount,
  estimatedTime,
  requiredExpertise
}: PriceSuggestionParams): number {
  const basePrice = 3;
  const questionFactor = Math.min(questionCount * 0.5, 5);
  const timeFactor = estimatedTime > 30 ? 2 : 1;
  const expertiseFactor = requiredExpertise === 'expert' ? 1.5 : 1;
  
  return Math.round(
    (basePrice + questionFactor) * timeFactor * expertiseFactor
  );
}
```

### Indicateur de Prix du Marché
```tsx
// components/roast/market-price-indicator.tsx
export function MarketPriceIndicator({ 
  currentPrice, 
  marketAverage,
  percentile 
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Prix moyen du marché</span>
        <span>{marketAverage}€</span>
      </div>
      <Progress value={percentile} />
      <p className="text-xs text-muted-foreground">
        Votre prix est dans le top {100 - percentile}% des roasts
      </p>
    </div>
  );
}
```

## 5. Actions Serveur Simplifiées

### Création de Roast
```typescript
// lib/actions/roast-request.ts
export const createRoastRequest = authActionClient
  .schema(createRoastRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { 
      title, 
      description, 
      pricePerRoaster,
      questions,
      focusAreas,
      maxRoasters,
      deadline
    } = parsedInput;
    
    // Plus de calculs complexes !
    const roast = await prisma.roastRequest.create({
      data: {
        title,
        description,
        pricePerRoaster,
        maxRoasters,
        deadline,
        focusAreas,
        useStructuredForm: true,
        creatorId: ctx.user.id,
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
            domain: q.domain,
            order: index,
            isDefault: false
          }))
        }
      }
    });
    
    return roast;
  });
```

### Soumission de Feedback
```typescript
// lib/actions/feedback.ts
export const submitFeedback = authActionClient
  .schema(submitFeedbackSchema)
  .action(async ({ parsedInput, ctx }) => {
    const roast = await prisma.roastRequest.findUnique({
      where: { id: parsedInput.roastRequestId }
    });
    
    // Prix simple, pas de multiplicateur urgence
    const finalPrice = roast.pricePerRoaster;
    
    const feedback = await prisma.feedback.create({
      data: {
        ...parsedInput,
        finalPrice,
        roasterId: ctx.user.id
      }
    });
    
    return feedback;
  });
```

## 6. Timeline d'Implémentation

### Semaine 1 : Backend & Migration
- [ ] Créer la migration Prisma
- [ ] Tester la migration sur données de dev
- [ ] Adapter les actions serveur
- [ ] Créer les nouveaux utils de pricing

### Semaine 2 : Wizard & Création
- [ ] Refactorer le wizard (3 étapes)
- [ ] Créer le nouveau composant de pricing
- [ ] Intégrer les indicateurs de marché
- [ ] Tester le flow complet

### Semaine 3 : Affichage & Dashboard
- [ ] Mettre à jour marketplace
- [ ] Adapter les dashboards
- [ ] Unifier l'affichage des feedbacks
- [ ] Mettre à jour les filtres

### Semaine 4 : Nettoyage
- [ ] Supprimer le code legacy
- [ ] Mettre à jour les tests
- [ ] Documentation
- [ ] Déploiement progressif

## 7. Points d'Attention

1. **Rétrocompatibilité** : Les anciens feedbacks doivent toujours s'afficher correctement
2. **Migration douce** : Permettre aux roasts en cours de se terminer avec l'ancien système
3. **Communication** : Préparer des tooltips/guides pour expliquer les changements
4. **Monitoring** : Surveiller l'adoption et les prix moyens post-lancement