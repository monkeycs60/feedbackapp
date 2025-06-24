# Amélioration du Système de Création de Roast

## 🎯 Objectifs
- Rendre le pricing plus accessible (base 2€ + 0.25€/question)
- Simplifier la création tout en gardant la flexibilité
- Proposer plusieurs modes de création selon les besoins

---

## 💰 Nouveau Modèle de Prix

### Formule Proposée
```
Prix = (2€ base + 0.25€ × nombre_questions) × nombre_feedbacks
```

### Exemples
- **Feedback rapide** (0 question) : 2€ × 2 feedbacks = **4€**
- **Feedback ciblé** (3 questions) : (2€ + 0.75€) × 2 = **5.50€**
- **Feedback complet** (8 questions) : (2€ + 2€) × 3 = **12€**

---

## 🚀 Propositions d'Interface

### **Option 1 : Mode Progressif (Recommandée)**

#### Étape 1 : Type de Feedback
```
┌─────────────────────────────────────┐
│ Quel type de feedback cherchez-vous ? │
├─────────────────────────────────────┤
│ 🎯 Impression générale (0 question)  │
│    → Feedback libre, 2€/roaster     │
│                                     │
│ 🔍 Feedback ciblé (questions custom) │
│    → Vous créez vos questions       │
│                                     │
│ 📋 Feedback structuré (par domaines) │
│    → Questions organisées par thème │
└─────────────────────────────────────┘
```

#### Si "Impression générale"
→ Pas de questions, directement au résumé

#### Si "Feedback ciblé"
```
┌─────────────────────────────────────┐
│ Vos Questions de Feedback           │
├─────────────────────────────────────┤
│ [+] Ajouter une question (+0.25€)   │
│                                     │
│ 1. Comment améliorer l'onboarding ? │
│    [Modifier] [Supprimer]           │
│                                     │
│ 2. Le pricing est-il clair ?        │
│    [Modifier] [Supprimer]           │
│                                     │
│ Prix actuel : 2.50€ × 2 = 5€       │
└─────────────────────────────────────┘
```

#### Si "Feedback structuré"
```
┌─────────────────────────────────────┐
│ Domaines de Feedback                │
├─────────────────────────────────────┤
│ ☑️ UX/UI (0 questions)              │
│ ☑️ Onboarding (2 questions)         │
│ ☐ Pricing (0 questions)            │
│ ☐ Technique (0 questions)          │
│                                     │
│ Questions par domaine :             │
│ ┌─ UX/UI ─────────────────────────┐ │
│ │ [+] Ajouter question (+0.25€)   │ │
│ └─────────────────────────────────┘ │
│ ┌─ Onboarding ──────────────────── │ │
│ │ 1. Processus d'inscription ?     │ │
│ │ 2. Première utilisation ?        │ │
│ │ [+] Ajouter question (+0.25€)   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Prix : 2€ + 0.50€ = 2.50€ × 2 = 5€ │
└─────────────────────────────────────┘
```

---

### **Option 2 : Builder de Questions Intelligent**

```
┌─────────────────────────────────────┐
│ Créez votre feedback en 30 secondes │
├─────────────────────────────────────┤
│ 🔍 Que voulez-vous améliorer ?      │
│ ┌─────────────────────────────────┐ │
│ │ Ex: onboarding, navigation...   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💡 Questions suggérées :           │
│ [+] Comment simplifier l'inscription? │
│ [+] La navigation est-elle claire ?  │
│ [+] Faut-il un tutorial ?           │
│                                     │
│ ✏️ Ou créez la vôtre :              │
│ ┌─────────────────────────────────┐ │
│ │ Votre question...               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Prix : 2€ + (2 × 0.25€) = 2.50€    │
└─────────────────────────────────────┘
```

---

### **Option 3 : Templates Prêts à l'Emploi**

```
┌─────────────────────────────────────┐
│ Templates de Feedback               │
├─────────────────────────────────────┤
│ 🚀 First Impression (2€)           │
│    Feedback libre sans questions   │
│                                     │
│ 🎨 UX Quick Check (3€)             │
│    3 questions UX essentielles     │
│                                     │
│ 💰 Pricing Review (2.75€)          │
│    2 questions pricing + 1 custom  │
│                                     │
│ 📱 Mobile Audit (4€)               │
│    6 questions mobile experience   │
│                                     │
│ 🔧 Custom Build (2€ + 0.25€/Q)     │
│    Créez votre propre feedback     │
└─────────────────────────────────────┘
```

---

## 🛠️ Implémentation Technique

### Nouveau Schéma de Domaines
```typescript
// Domaines existants + nouveau
const FEEDBACK_DOMAINS = [
  { id: 'general', name: 'Impression générale', icon: '🎯', isGeneral: true },
  { id: 'ux', name: 'UX/UI', icon: '🎨' },
  { id: 'onboarding', name: 'Onboarding', icon: '🚀' },
  { id: 'pricing', name: 'Pricing', icon: '💰' },
  { id: 'business', name: 'Business Model', icon: '📊' },
  { id: 'technical', name: 'Technique', icon: '⚙️' },
  { id: 'copywriting', name: 'Copywriting', icon: '✍️' },
  { id: 'mobile', name: 'Mobile', icon: '📱' }
]
```

### Nouveau Calcul de Prix
```typescript
function calculatePrice(questions: Question[], feedbackCount: number) {
  const BASE_PRICE = 2;
  const QUESTION_PRICE = 0.25;
  
  const questionCost = questions.length * QUESTION_PRICE;
  const totalPerFeedback = BASE_PRICE + questionCost;
  
  return totalPerFeedback * feedbackCount;
}
```

### Modes de Création
```typescript
type FeedbackMode = 
  | 'general'     // Pas de questions
  | 'targeted'    // Questions libres
  | 'structured'  // Questions par domaines
  | 'template'    // Templates prédéfinis
```

---

## 🎨 Avantages des Propositions

### Option 1 (Progressif) ✅ **Recommandée**
- **Simple** : 3 choix clairs selon le besoin
- **Flexible** : Permet tous les cas d'usage
- **Évolutif** : Facile d'ajouter des modes
- **Pricing transparent** : Prix visible en temps réel

### Option 2 (Builder Intelligent)
- **Rapide** : IA suggère des questions
- **Intuitif** : Langage naturel
- **Moderne** : Expérience nouvelle génération

### Option 3 (Templates)
- **Ultra-rapide** : 1 clic = configuration complète
- **Prévisible** : Prix fixe affiché
- **Éducatif** : Montre les bonnes pratiques

---

## 🔄 Migration du Système Existant

### Base de données
```sql
-- Nouveau champ pour le mode
ALTER TABLE RoastRequest ADD COLUMN feedback_mode VARCHAR(20) DEFAULT 'structured';

-- Nouveau pricing
ALTER TABLE RoastRequest ADD COLUMN base_price DECIMAL(10,2) DEFAULT 2.00;
ALTER TABLE RoastRequest ADD COLUMN question_price DECIMAL(10,2) DEFAULT 0.25;
```

### Rétrocompatibilité
- Les roasts existants gardent l'ancien système
- Nouveau calcul de prix pour les nouveaux roasts
- Interface adaptée selon le mode choisi

---

## 🚀 Roadmap de Déploiement

### Phase 1 : Core (2 semaines)
- [ ] Nouveau modèle de pricing
- [ ] Mode "Impression générale"
- [ ] Interface progressive (Option 1)

### Phase 2 : Enhancement (1 semaine)
- [ ] Templates prédéfinis
- [ ] Suggestions de questions IA
- [ ] Analytics de prix

### Phase 3 : Advanced (2 semaines)
- [ ] Builder intelligent
- [ ] Questions collaboratives
- [ ] Optimisation mobile

---

## 💡 Idées Bonus

### Gamification
- **Quick Setup** : Badge pour création en < 60s
- **Question Master** : Badge pour 10+ questions créées
- **Template Creator** : Partage de templates personnalisés

### Fonctionnalités Avancées
- **Question Bank** : Bibliothèque de questions par industrie
- **Smart Pricing** : Réductions pour volume
- **Collaborative Building** : Équipe crée ensemble
- **Question Analytics** : Quelles questions donnent les meilleurs insights

### Intégrations
- **Import Figma** : Génère questions UX automatiquement
- **Analytics Tools** : Importe métriques pour questions ciblées
- **Slack/Discord** : Partage rapide pour feedback team

---

Cette approche rend le système beaucoup plus accessible financièrement tout en gardant la flexibilité. L'option 1 (Mode Progressif) me semble la plus équilibrée pour commencer ! 🚀