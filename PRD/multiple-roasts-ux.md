# UX pour Sélection Multiple de Roasts

## 1. Interface de Sélection

### A. Option Recommandée : Cards + Quantité

```typescript
interface RoastSelector {
  display: "Cards interactives avec compteur",
  
  cards: [
    {
      type: "single",
      price: 5,
      label: "1 Roast",
      subtitle: "Pour tester",
      selected: false
    },
    {
      type: "custom",
      price: "4€/roast",
      label: "2-4 Roasts",
      subtitle: "Le plus populaire ⭐",
      selector: {
        type: "number-input",
        min: 2,
        max: 4,
        default: 3,
        priceUpdate: "live"
      }
    },
    {
      type: "pack",
      price: 20,
      label: "Pack 5 Roasts",
      subtitle: "Économise 5€",
      savings: "-20%",
      selected: false
    }
  ]
}
```

### B. Implémentation UI

```jsx
// Composant React/Next.js
function RoastQuantitySelector() {
  const [quantity, setQuantity] = useState(3);
  const unitPrice = quantity >= 5 ? 4 : 5;
  const totalPrice = quantity * unitPrice;
  
  return (
    <div className="space-y-4">
      {/* Option 1: Quick Select Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setQuantity(1)}
          className={quantity === 1 ? 'selected' : ''}
        >
          1 roast
          <span className="price">5€</span>
        </button>
        
        <button 
          onClick={() => setQuantity(3)}
          className={quantity === 3 ? 'selected' : ''}
        >
          3 roasts
          <span className="price">15€</span>
          <span className="badge">Populaire</span>
        </button>
        
        <button 
          onClick={() => setQuantity(5)}
          className={quantity === 5 ? 'selected' : ''}
        >
          5 roasts
          <span className="price">20€</span>
          <span className="savings">-20%</span>
        </button>
      </div>
      
      {/* Option 2: Custom Quantity */}
      <div className="custom-quantity">
        <label>Ou choisis ton nombre :</label>
        <div className="quantity-controls">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            -
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            max="10"
          />
          <button onClick={() => setQuantity(Math.min(10, quantity + 1))}>
            +
          </button>
        </div>
      </div>
      
      {/* Live Price Update */}
      <div className="price-summary">
        <div className="calculation">
          {quantity} roast{quantity > 1 ? 's' : ''} × {unitPrice}€
        </div>
        <div className="total">
          Total: {totalPrice}€
          {quantity >= 5 && <span className="savings">Tu économises {quantity}€!</span>}
        </div>
      </div>
    </div>
  );
}
```

### C. Alternative : Slider (Moins Recommandé)

```typescript
interface SliderOption {
  pros: [
    "Visuel",
    "Moderne"
  ],
  cons: [
    "Moins précis sur mobile",
    "Pas idéal pour des valeurs discrètes",
    "Accessibilité moyenne"
  ],
  implementation: {
    type: "range",
    min: 1,
    max: 10,
    step: 1,
    markers: [1, 3, 5, 10],
    priceBreaks: {
      "1-4": "5€/roast",
      "5-10": "4€/roast"
    }
  }
}
```

## 2. Comportement et Incentives

### A. Nudges Psychologiques

```typescript
interface PsychologicalNudges {
  defaultSelection: 3, // Ancrage sur le choix optimal
  
  messaging: {
    single: "Pour essayer",
    triple: "93% des créateurs commencent ici 👈",
    pack5: "Meilleure valeur - Économise 20%"
  },
  
  dynamicPricing: {
    show: "Prix unitaire : 5€ → 4€ à partir de 5",
    highlight: "🎉 Tu débloques le tarif pack!"
  },
  
  socialProof: {
    below: "247 créateurs ont pris 3+ roasts cette semaine",
    testimonial: "'Avec 3 roasts, j'ai eu 3 perspectives différentes' - Sarah, Founder"
  }
}
```

### B. Mobile-First Design

```css
/* Touch-friendly targets */
.quantity-button {
  min-width: 48px;
  min-height: 48px;
  font-size: 18px;
}

/* Clear visual feedback */
.selected {
  border: 2px solid #FF6B35;
  background: #FFF5F0;
}

/* Thumb-reachable on mobile */
.quantity-controls {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
}
```

## 3. Logique Business

### A. Gestion des Crédits

```typescript
interface CreditSystem {
  purchase: {
    "3 roasts": {
      credits: 3,
      expiry: "3 mois",
      usage: "Flexible - peut les utiliser 1 par 1"
    }
  },
  
  dashboard: {
    display: "Tu as 2 roasts restants",
    reminder: "Expire dans 2 mois",
    quickAction: "Utiliser un roast"
  },
  
  flexibility: {
    pauseProject: true,
    changeApp: true,
    transferCredits: false
  }
}
```

### B. Conversion Optimisée

```typescript
interface ConversionOptimization {
  // Réduire la friction
  flow: {
    step1: "Choisis combien de roasts",
    step2: "Ajoute ton app",
    step3: "Paye",
    // PAS de compte requis avant paiement
  },
  
  // Rassurer
  guarantees: [
    "✓ Satisfait ou remboursé sur le 1er roast",
    "✓ Roasters vérifiés",
    "✓ Feedback sous 48h"
  ],
  
  // Créer l'urgence
  urgency: {
    message: "🔥 17 roasters disponibles maintenant",
    countdown: "Prix pack valable encore 24h"
  }
}
```

## 4. Recommandation Finale

**✅ Utilise les Cards avec Sélection Rapide (1, 3, 5) + Input Custom**

Pourquoi :
1. **Clarté** : Chaque option est visible
2. **Rapidité** : 1 clic pour les choix populaires  
3. **Flexibilité** : Input pour les besoins spécifiques
4. **Mobile-friendly** : Gros boutons tactiles
5. **Psychologie** : Ancrage sur 3 (option du milieu)

**❌ Évite le Slider**

Pourquoi pas :
1. Imprécis sur mobile
2. Pas clair pour les prix dégressifs
3. Moins d'espace pour le messaging
4. Accessibilité limitée

Le but : Rendre le choix de "3 roasts" évident et naturel, tout en laissant la flexibilité.