# Plan de Développement - RoastMyApp

## Vue d'ensemble du projet

RoastMyApp est une marketplace qui connecte des entrepreneurs/développeurs cherchant des feedbacks brutalement honnêtes sur leurs applications avec des testeurs qualifiés et rémunérés.

## Modèle économique retenu

### Quality-Based Pricing avec IA
- **IA** : Évalue la qualité du feedback et détermine le prix final (20-100% du max)
- **Roaster** : Toujours payé 3.50€ par feedback
- **Plateforme** : Absorbe la différence pour encourager le volume

### Tarification
- **Prix unitaire** : 5€
- **Pack 5 feedbacks** : 20€ (4€/feedback)
- **Pack 10 feedbacks** : 35€ (3.50€/feedback)

## Architecture technique

- **Frontend** : Next.js 15 (déjà en place) + Shadcn UI
- **Backend** : API Routes Next.js  
- **Base de données** : PostgreSQL avec Prisma (déjà configuré)
- **Auth** : Better Auth (déjà implémenté)
- **Paiements** : Stripe Connect
- **IA** : OpenAI API pour l'évaluation
- **Storage** : Supabase Storage

## Plan de développement par phases

### Phase 1 : Core MVP (Semaines 1-3)

#### Sprint 1 : Infrastructure de base
**Prompt optimal** :
```
"Implémente le système de profils utilisateurs avec dual-role (creator/roaster) en suivant le pattern existant de Better Auth. Crée les modèles Prisma pour User (extension du modèle existant), RoasterProfile et CreatorProfile. Ajoute les pages /profile/setup et /profile/edit avec les formulaires React Hook Form + Zod. Inclus les champs : specialties (UX, Dev, Business), languages, experience, portfolio pour les roasters."
```

#### Sprint 2 : Système de Roast Request
**Prompt optimal** :
```
"Crée le système complet de demande de roast. Modèle Prisma RoastRequest avec : appUrl, description, targetAudience, focusAreas[], maxPrice, deadline, status. Page /roast/new avec formulaire en 3 étapes : 1) Info app, 2) Ce que tu cherches (boutons de sélection rapide), 3) Choix du pack (1/5/10 roasts). Intègre Stripe pour le paiement avec la logique de prix dégressifs (5€/4€/3.50€)."
```

#### Sprint 3 : Marketplace et Matching
**Prompt optimal** :
```
"Implémente le système de matching bidirectionnel. Créé une page /marketplace pour les roasters avec filtres (expertise, deadline, prix) et une page /dashboard/creator avec les roasters suggérés. Ajoute l'algorithme de matching basé sur : expertise match (40%), disponibilité (20%), rating (20%), expérience (20%). Les roasters peuvent postuler, les creators peuvent sélectionner. Utilise des Server Actions pour les interactions."
```

### Phase 2 : Système de Feedback (Semaines 4-5)

#### Sprint 4 : Interface de soumission
**Prompt optimal** :
```
"Crée l'interface de soumission de feedback structurée. Page /roast/[id]/submit avec formulaire guidé : firstImpression (30s), navigation (2min), compréhension (1min), trust/action (1.5min). Ajoute un timer visible et une progression. Sauvegarde automatique toutes les 30s. Upload de screenshots via Supabase Storage. Template de questions pour guider le roaster."
```

#### Sprint 5 : Évaluation IA et Paiements
**Prompt optimal** :
```
"Intègre OpenAI pour évaluer la qualité des feedbacks. Crée une fonction evaluateFeedback() qui analyse : depth (25%), actionability (30%), clarity (15%), evidence (20%), uniqueness (10%). Le score détermine le prix final payé par le creator. Implémente Stripe Connect pour distribuer les paiements aux roasters (3.50€ fixe). Ajoute un système de contestation avec review manuel."
```

### Phase 3 : Features avancées (Semaines 6-8)

#### Sprint 6 : Gamification et Engagement
**Prompt optimal** :
```
"Ajoute la gamification complète. Système de badges pour roasters (Rookie/Verified/Expert/Master basé sur nombre de roasts), challenges hebdomadaires, leaderboard public. Pour les creators : badges Early Adopter, Quality Creator (reçoit 4.5+), Community Champion. Système de nudges pour la conversion dual-role après 1 semaine. Dashboard analytics avec métriques clés."
```

#### Sprint 7 : Optimisations UX
**Prompt optimal** :
```
"Optimise l'UX mobile-first. Refactor les composants pour être touch-friendly (boutons 48px minimum). Ajoute les notifications email avec Resend pour : nouveau match, feedback reçu, paiement confirmé. Mode sombre optionnel. PWA avec notifications push. Améliore les temps de chargement avec lazy loading et optimisation des images."
```

#### Sprint 8 : Testing et Launch Prep
**Prompt optimal** :
```
"Écris des tests E2E Playwright pour les flows critiques : inscription dual-role, création roast request, soumission feedback, paiement. Ajoute des tests unitaires pour l'algorithme de matching et l'évaluation IA. Configure le monitoring avec Sentry. Prépare les scripts de seed data pour la démo. Documentation API complète."
```

### Phase 4 : Lancement (Semaines 9-10)

#### Sprint 9 : Beta Testing
**Prompt optimal** :
```
"Prépare le lancement beta. Landing page de waitlist, système d'invitations avec codes. Onboarding email sequence (Welcome, How it works, First roast). Programme early adopter : 50 roasts gratuits, -50% pendant 1 mois. Tracking analytics avec Posthog. A/B tests sur les CTAs principaux."
```

#### Sprint 10 : Go-Live
**Prompt optimal** :
```
"Finalise pour le lancement public. Optimisation SEO (meta tags, sitemap, robots.txt). Integration réseaux sociaux pour partage. Page /testimonials avec success stories. Kit média pour Product Hunt. Système de referral avec rewards. Dashboard admin pour modération et metrics. Backup et disaster recovery plan."
```

## Points d'attention critiques

### Qualité des feedbacks
- Validation manuelle des premiers roasters
- Templates guidés pour structurer les retours
- Système de rating bidirectionnel

### Acquisition biface  
- Focus initial sur les roasters (supply)
- Puis attraction des creators via contenu
- Programme ambassadeur pour les deux côtés

### Scalabilité technique
- Queues pour les évaluations IA
- Cache Redis pour les matchings
- CDN pour les assets

### Conformité légale
- CGU/CGV adaptées marketplace
- RGPD compliant
- KYC progressif pour les paiements

## Métriques de succès

- **Mois 1** : 100 roasts complétés, 20 roasters actifs
- **Mois 3** : 500 roasts/mois, 50% dual-role users
- **Mois 6** : 2000 roasts/mois, NPS > 50

## Budget estimé

- Développement : 15k€ (3 mois)
- Marketing : 3k€ 
- Infrastructure : 500€/mois
- **Total MVP** : ~20k€

## Prochaine étape immédiate

Commencer par le **Sprint 1** avec le prompt fourni pour implémenter le système de profils dual-role.