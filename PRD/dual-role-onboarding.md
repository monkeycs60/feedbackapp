# Onboarding Dual-Role : Creator + Roaster

## 1. Stratégie Globale : "Start Simple, Expand Later"

### A. Philosophie

```typescript
interface DualRoleStrategy {
  principe: "Commencer par 1 rôle, découvrir l'autre naturellement",
  
  avantages: [
    "Évite la confusion initiale",
    "Onboarding plus simple", 
    "Engagement progressif",
    "Meilleure rétention"
  ],
  
  parcours: {
    phase1: "Maîtrise d'1 rôle (2-3 semaines)",
    phase2: "Découverte de l'autre rôle (nudges intelligents)",
    phase3: "Utilisateur full dual-role"
  }
}
```

## 2. Flow d'Onboarding Initial

### A. Étape 1 : Choix du Rôle Principal

```jsx
function RoleSelection() {
  return (
    <div className="role-selection">
      <h2>Comment veux-tu commencer ?</h2>
      
      <div className="role-cards">
        <div className="role-card creator">
          <div className="icon">🚀</div>
          <h3>J'ai une app à faire roaster</h3>
          <p>Obtiens des feedbacks brutalement honnêtes</p>
          <ul>
            <li>✓ Feedback en 24h</li>
            <li>✓ À partir de 5€</li>
            <li>✓ Roasters experts</li>
          </ul>
          <button className="btn-primary">
            Commencer comme Creator
          </button>
        </div>
        
        <div className="role-card roaster">
          <div className="icon">🔥</div>
          <h3>Je veux gagner de l'argent en donnant des feedbacks</h3>
          <p>Monétise ton expertise, aide la communauté</p>
          <ul>
            <li>✓ 3.50€ par feedback</li>
            <li>✓ Choisis tes missions</li>
            <li>✓ 15-20 min de travail</li>
          </ul>
          <button className="btn-primary">
            Commencer comme Roaster
          </button>
        </div>
      </div>
      
      <div className="later-option">
        <p>💡 Tu pourras facilement switcher plus tard</p>
      </div>
    </div>
  );
}
```

### B. Étape 2 : Onboarding Personnalisé par Rôle

```typescript
interface RoleSpecificOnboarding {
  creator: {
    steps: [
      "Ajoute ton app",
      "Décris tes besoins", 
      "Choisis ton premier pack",
      "Reçois tes feedbacks"
    ],
    duration: "5 minutes",
    goal: "Premier roast commandé"
  },
  
  roaster: {
    steps: [
      "Décris ton expertise",
      "Passe le test qualité",
      "Configure tes préférences",
      "Reçois ta première mission"
    ],
    duration: "15 minutes",
    goal: "Premier feedback livré"
  }
}
```

## 3. Découverte Progressive de l'Autre Rôle

### A. Nudges Intelligents pour Creator → Roaster

```typescript
interface CreatorToRoasterNudges {
  // Après 1er feedback reçu
  timing1: {
    trigger: "A reçu son premier feedback",
    message: "Tu vois la valeur d'un bon feedback ? D'autres creators cherchent ton expertise.",
    cta: "Découvre comment devenir roaster",
    conversion: "15% testent"
  },
  
  // Après feedback positif
  timing2: {
    trigger: "A noté 5⭐ un feedback",
    message: "Ce roaster a gagné 3.50€ en 20 min. Toi aussi tu pourrais !",
    cta: "Voir comment ça marche",
    conversion: "23% s'inscrivent"
  },
  
  // Pendant les temps morts
  timing3: {
    trigger: "Pas de nouvelle app postée depuis 2 semaines",
    message: "En attendant ton prochain projet, gagne un peu d'argent en aidant d'autres creators",
    cta: "Explorer les missions disponibles",
    conversion: "31% activent"
  }
}
```

### B. Nudges Intelligents pour Roaster → Creator

```typescript
interface RoasterToCreatorNudges {
  // Après plusieurs roasts
  timing1: {
    trigger: "A fait 5+ roasts",
    message: "Tu donnes de super conseils ! Tu as sûrement une app qui pourrait bénéficier de feedbacks ?",
    cta: "Poste ton app gratuitement",
    offer: "Premier roast offert",
    conversion: "42% testent"
  },
  
  // Quand il découvre une app cool
  timing2: {
    trigger: "A noté positivement une app qu'il a roastée",
    message: "Cette app t'inspire ? Lance la tienne et obtiens des feedbacks comme tu en donnes",
    cta: "Créer ma demande",
    conversion: "18% activent"
  },
  
  // Seasonal/événementiel
  timing3: {
    trigger: "Black Friday, nouvelles résolutions, etc.",
    message: "2024, l'année de ton side-project ? Commence par tester ton idée",
    cta: "Valider mon idée",
    conversion: "28% testent"
  }
}
```

## 4. Interface Adaptative

### A. Dashboard qui Évolue

```jsx
function AdaptiveDashboard({ user }) {
  const [activeRole, setActiveRole] = useState(user.primaryRole);
  
  return (
    <div className="dashboard">
      {/* Role Switcher - Apparaît après 1ère semaine */}
      {user.daysSinceSignup > 7 && (
        <div className="role-switcher">
          <button 
            className={activeRole === 'creator' ? 'active' : ''}
            onClick={() => setActiveRole('creator')}
          >
            Creator Mode 🚀
          </button>
          <button 
            className={activeRole === 'roaster' ? 'active' : ''}
            onClick={() => setActiveRole('roaster')}
          >
            Roaster Mode 🔥
          </button>
        </div>
      )}
      
      {/* Contenu adaptatif */}
      {activeRole === 'creator' ? (
        <CreatorDashboard user={user} />
      ) : (
        <RoasterDashboard user={user} />
      )}
      
      {/* CTA pour découvrir l'autre rôle */}
      {!user.hasTriedBothRoles && (
        <div className="discover-other-role">
          {activeRole === 'creator' ? (
            <DiscoverRoasterCTA />
          ) : (
            <DiscoverCreatorCTA />
          )}
        </div>
      )}
    </div>
  );
}
```

### B. Profil Unifié

```typescript
interface UnifiedProfile {
  // Info commune
  basic: {
    name: string,
    email: string,
    avatar: string,
    memberSince: Date
  },
  
  // Stats créateur
  creatorStats?: {
    appsPosted: number,
    feedbacksReceived: number,
    avgRating: number,
    totalSpent: number
  },
  
  // Stats roaster  
  roasterStats?: {
    feedbacksGiven: number,
    avgRating: number,
    specialties: string[],
    totalEarned: number,
    completionRate: number
  },
  
  // Badges unifiés
  badges: {
    "Early Adopter": boolean,
    "Quality Creator": boolean, // Reçoit des feedbacks 4.5+
    "Expert Roaster": boolean,  // Donne des feedbacks 4.5+
    "Community Champion": boolean, // Actif des 2 côtés
    "Feedback Loop": boolean // A été roaster de quelqu'un qui l'a roasté
  }
}
```

## 5. Mécaniques de Gamification Cross-Role

### A. Challenges Croisés

```typescript
interface CrossRoleChallenges {
  "Perfect Loop": {
    description: "Reçois un feedback, donne un feedback",
    reward: "+1€ bonus sur les 2",
    completion: "12% des users"
  },
  
  "Quality Circle": {
    description: "Donne 5 feedbacks 5⭐, reçois 1 feedback gratuit",
    reward: "1 roast gratuit",
    completion: "8% des users"
  },
  
  "Community Builder": {
    description: "Aide 10 creators, lance 1 app",
    reward: "Badge spécial + priorité matching",
    completion: "3% des users"
  }
}
```

### B. Économie Croisée

```typescript
interface CrossRoleEconomy {
  // Gagner des crédits en roastant
  earnCredits: {
    mechanism: "1 feedback donné = 1 crédit",
    usage: "2 crédits = 1 roast gratuit",
    psychology: "Je peux roaster grâce à mes contributions"
  },
  
  // Bonus fidélité
  loyaltyBonus: {
    dualRole30Days: "+10% sur tous les gains",
    dualRole90Days: "+20% sur tous les gains",
    communityLegend: "Accès early aux nouvelles features"
  }
}
```

## 6. Onboarding UX Patterns

### A. Progressive Disclosure

```jsx
function ProgressiveOnboarding({ currentStep, totalSteps }) {
  return (
    <div className="onboarding-flow">
      {/* Progress bar */}
      <div className="progress">
        <div 
          className="progress-fill" 
          style={{width: `${(currentStep/totalSteps) * 100}%`}}
        />
      </div>
      
      {/* Étape actuelle */}
      <div className="current-step">
        {renderCurrentStep()}
      </div>
      
      {/* Preview du futur (après étape 2) */}
      {currentStep >= 2 && (
        <div className="future-preview">
          <h4>Bientôt disponible pour toi :</h4>
          <div className="preview-cards">
            {user.primaryRole === 'creator' ? (
              <div className="preview-card">
                <span className="icon">💰</span>
                <span>Gagne de l'argent en donnant des feedbacks</span>
              </div>
            ) : (
              <div className="preview-card">
                <span className="icon">🚀</span>
                <span>Fais roaster tes propres projets</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### B. Micro-Commitments

```typescript
interface MicroCommitments {
  step1: "Je veux essayer RoastMyApp",
  step2: "Je commence par [creator/roaster]",
  step3: "Je complète mon profil",
  step4: "Je fais ma première action",
  step5: "Je découvre l'autre rôle", // Optionnel
  
  psychology: "Chaque étape engage plus l'utilisateur"
}
```

## 7. Messaging et Communication

### A. Copy qui Normalise le Dual-Role

**Messages intégrés** :
- "La plupart de nos users finissent par faire les 2"
- "Tu comprends mieux les feedbacks quand tu en donnes"
- "Les meilleurs creators sont souvent d'excellents roasters"

### B. Success Stories

```typescript
interface DualRoleTestimonials {
  marc: {
    quote: "Donner des feedbacks m'a rendu meilleur creator. Je vois maintenant les erreurs que je faisais.",
    profile: "Dev → Creator puis Roaster",
    metrics: "23 roasts donnés, 2 apps lancées"
  },
  
  julie: {
    quote: "J'ai financé le développement de mon app grâce aux roasts. 200€ gagnés en 2 mois.",
    profile: "Designer → Roaster puis Creator",
    metrics: "67 roasts donnés, 1 app à 15k€ MRR"
  }
}
```

## 8. Métriques de Succès

```typescript
interface DualRoleMetrics {
  conversion: {
    singleToDual: "35% en 3 mois", // Objectif
    roasterToCreator: "42%", // Plus facile
    creatorToRoaster: "28%" // Plus dur
  },
  
  engagement: {
    dualRoleMonthly: "2.3x plus actifs",
    dualRoleLTV: "4.1x plus élevé",
    dualRoleChurn: "67% moins de churn"
  },
  
  quality: {
    dualRoleFeedbacks: "4.6⭐ vs 4.2⭐ single-role",
    crossRoleRating: "Roasters qui sont creators = 4.7⭐"
  }
}
```

Cette approche "start simple, expand naturally" maximise l'adoption des deux rôles sans overwhelming l'utilisateur au début.