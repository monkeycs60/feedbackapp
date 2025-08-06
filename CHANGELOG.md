# Changelog

## 2025-01-15-14:30
### Bug Fix - Schema Alignment with Components
- **Fixed runtime errors**: Resolved "Cannot read properties of undefined (reading 'length')" errors in dashboard and marketplace
  - Updated `CreatorDashboardContent` interface to match actual `getUserRoastRequests` return type
  - Replaced deprecated `focusAreas` field with `questions` structure in all components
  - Fixed `maxPrice` null handling in pricing calculations
- **Component updates**:
  - `RoastRequestsList`: Updated to use question domains instead of focus areas
  - `MarketplaceContent`: Fixed schema mismatch and added domain extraction utility
  - `AvailableRoastsList`: Replaced focus areas logic with question domains display
  - `AcceptedApplicationsList`: Updated interface to match current schema
- **Utility functions**: Added `getUniqueDomainsFromQuestions` helper for domain extraction
- **Type safety**: Improved type alignment between database schema and frontend components

## 2025-08-03-15:30
### Major Simplification - Suppression des modes de feedback
- **Base de données nettoyée**: Suppression complète de l'enum `FeedbackMode` et colonne `feedbackMode`
  - Migration Prisma pour supprimer `FREE`, `TARGETED`, `STRUCTURED` modes
  - Plus de complexité liée aux différents types de feedback
  - Structure unifiée pour tous les roasts
- **Code simplifié drastiquement**: Suppression de milliers de lignes de code obsolète
  - Suppression complète de `feedback-mode-selection.tsx` (239 lignes)
  - Suppression complète de `feedback-structured-step.tsx` (390 lignes)
  - Refactorisation complète de `pricing-calculator.tsx` (simplification de 50%)
  - Nettoyage de `new-roast-wizard-v2.tsx` et `lib/actions/roast-request.ts`
- **Pricing unifié**: Un seul système de tarification transparent
  - 4€ de base pour le feedback structuré complet
  - 0,50€ par question personnalisée supplémentaire
  - Plus de confusion entre modes FREE/STRUCTURED
  - Configuration centralisée dans `PRICING` constant
- **UX simplifiée**: Plus de choix compliqué pour les utilisateurs
  - Suppression de l'étape de sélection de mode dans le wizard
  - Flow de création plus direct et intuitif
  - Un seul type de feedback : structuré et personnalisable
- **Architecture épurée**: Code plus maintenable et performant
  - Suppression de toute la logique conditionnelle liée aux modes
  - Types TypeScript simplifiés sans `FeedbackMode`
  - Fonctions utilitaires nettoyées et optimisées

## 2025-08-03-15:00
### Pricing Update - Nouvelle structure tarifaire
- **Configuration centrale mise à jour**: Changement des prix dans `FEEDBACK_MODES`
  - Prix de base : 3€ → 4€ pour tous les modes de feedback
  - Prix par question STRUCTURED : 0,25€ → 0,50€ par question supplémentaire
  - Mode FREE reste sans questions : 4€ fixe par feedback
- **Wizard de création adapté**: `new-roast-wizard-v2.tsx` mis à jour
  - Validation minimum : 3€ → 4€ par roaster
  - Prix par défaut : 5€ → 4€ (nouveau minimum)
  - Fonction `calculateSuggestedPrice` ajustée pour les nouveaux tarifs
- **Interface utilisateur cohérente**: Tous les textes hardcodés mis à jour
  - `feedback-mode-selection.tsx` : Affichage correct des nouveaux prix
  - `feedback-structured-step.tsx` : Messages de coût par question actualisés
  - Tous les calculateurs de prix automatiquement cohérents via configuration centrale
- **Simplicité tarifaire**: Structure plus claire sans questions gratuites
  - 4€ de base inclut le feedback structuré complet
  - Chaque question personnalisée coûte 0,50€ supplémentaire
  - Calculs transparents et prévisibles pour les utilisateurs

## 2025-07-06-00:40
### Perfect UX - First Impression Expansion Fix
- **Expansion indépendante**: Logique séparée pour l'expansion des premières impressions
  - État `expandedImpressions` distinct de l'expansion générale du feedback
  - Bouton "Voir plus..." / "Voir moins" fonctionne même quand le feedback n'est pas déplié
  - Gestion granulaire de l'affichage du texte de première impression
- **Interaction intuitive**: Contrôles distincts pour différents niveaux de détail
  - Chevron dans header pour expansion complète du feedback
  - "Voir plus/moins" dans première impression pour cette section uniquement
  - Pas d'interférence entre les deux systèmes d'expansion
- **State management optimisé**: Utilisation de Set pour gérer les impressions expandées
  - Performance améliorée avec des opérations Set optimisées
  - Gestion propre de l'ajout/suppression d'éléments expandés

## 2025-07-06-00:35
### UX Enhancement - Feedback Preview & Navigation
- **Preview améliorée**: Meilleure gestion de la première impression dans les détails
  - Limitation à 3 lignes avec bouton "Voir plus..." si le texte dépasse 150 caractères
  - Expansion automatique du feedback quand on clique sur "Voir plus"
  - Meilleure lisibilité et expérience utilisateur dans les cartes de feedback
- **Navigation intelligente**: Auto-scroll et ouverture automatique depuis la liste
  - Détection du hash URL `#feedback-{id}` pour navigation directe
  - Scroll automatique et expansion du feedback ciblé
  - UX fluide depuis "Feedbacks reçus" vers la page de détail
  - Fonction `scrollIntoView` avec animation smooth pour UX moderne
- **Robustesse**: Gestion des cas d'erreur et vérifications
  - Vérification de l'existence du feedback avant expansion
  - Délai pour s'assurer que le DOM est prêt avant scroll
  - ID uniques `feedback-{id}` ajoutés aux cartes pour navigation précise

## 2025-07-06-00:30
### Final Update - Dashboard Feedback Preview Unified
- **FeedbacksList mis à jour**: Dashboard principal maintenant cohérent avec nouveau modèle
  - Remplacement de `generalFeedback` par `firstImpression` dans preview
  - Affichage de la note globale avec étoiles pour aperçu visuel
  - Badge "📋 Structuré" ajouté pour cohérence avec nouvelle interface
  - Fallback vers `generalFeedback` pour compatibilité legacy
- **Interface types mise à jour**: `CreatorDashboardContent` et `FeedbacksList` adaptés
  - Support complet des nouveaux champs structurés (globalRating, firstImpression, etc.)
  - Récupération des domaines via la nouvelle relation `question`
  - Types TypeScript alignés sur le modèle unifié final
- **Preview améliorée**: Meilleure représentation du feedback dans la liste
  - Note globale visible immédiatement (étoiles + score)
  - Première impression comme texte d'aperçu au lieu du feedback général
  - Indicateurs visuels cohérents avec le reste de l'application

## 2025-07-06-00:25
### Database Relation Fix - QuestionResponse Schema Update
- **Erreur critique résolue**: "Cannot read properties of undefined (reading 'domain')"
  - **Cause**: Relation manquante entre `QuestionResponse` et `RoastQuestion` dans Prisma schema
  - **Solution**: Ajout de la relation `question` dans le modèle `QuestionResponse`
  - **Migration**: `20250705222452_add_question_response_relation` créée et appliquée
- **Amélioration des requêtes**: Mise à jour de tous les includes pour charger la relation `question`
  - `getRoastRequestById()` et `getUserRoastRequests()` dans roast-request.ts
  - Toutes les actions feedback dans feedback.ts
  - Queries maintenant cohérentes et complètes
- **Protection additionnelle**: Ajout de vérifications de sécurité dans `UnifiedFeedbackDisplay`
  - Check si `qr.question` existe avant d'accéder à ses propriétés
  - Logs d'avertissement pour débugger les éventuels problèmes futurs
  - Robustesse accrue du composant
- **Base de données synchronisée**: Schema et client Prisma mis à jour
  - Relations bidirectionnelles correctement définies
  - Types TypeScript générés automatiquement
  - Cohérence entre modèles de données

## 2025-07-06-00:15
### Complete Integration - Creator Dashboard Unified (Phase 5 Final)
- **UnifiedFeedbackDisplay intégré**: Dashboard créateur utilise maintenant le nouveau composant unifié
  - Remplacement de `FeedbackDisplayV2` par `UnifiedFeedbackDisplay`
  - Affichage moderne des feedbacks avec cartes expandables et sections organisées
  - Visualisation intuitive: overview compact + détails en 1 clic
  - Support complet des nouveaux champs structurés (notes détaillées, recommandations, etc.)
- **Interface unifiée terminée**: Tous les composants alignés sur le nouveau schéma
  - Page créateur `/dashboard/roast/[id]` maintenant parfaitement cohérente
  - Affichage des feedbacks adapté au modèle unifié (structuré + questions optionnelles)
  - Nettoyage des imports inutilisés pour code plus propre
- **Migration complète achevée**: Plus aucune référence aux anciens modes FREE/STRUCTURED
  - Système entièrement unifié de bout en bout
  - Code simplifié et maintenable
  - Expérience utilisateur cohérente sur toute l'application

## 2025-07-06-00:10
### Final Update - Roast Detail Pages Unified (Phase 5)
- **Page créateur mise à jour**: `/dashboard/roast/[id]` maintenant cohérente avec nouveau modèle
  - Suppression section "Questions par domaine" (logique ancienne)
  - Nouvelle section "Configuration du feedback" avec feedback structuré + questions optionnelles  
  - Interface claire: feedback de base toujours inclus + questions personnalisées si présentes
  - Suppression de la logique basée sur `focusAreas` et `domain`
- **Page roaster corrigée**: `/roast/[id]` maintenant fonctionnelle pour roasters acceptés
  - Suppression texte "Feedback libre" et logique `feedbackMode === 'STRUCTURED'` 
  - Nouvelle section "📋 Feedback structuré requis" avec description complète
  - **Bug critique résolu**: Roasters acceptés accèdent maintenant au formulaire de feedback
  - Condition élargie: feedback accessible dès acceptation (pas seulement `in_progress`)
  - Badge unifié "📋 Feedback structuré" dans header remplace badges conditionnels
- **Expérience utilisateur cohérente**: Toutes les pages alignées sur le nouveau modèle unifié
  - Terminologie consistante partout
  - Plus de confusion entre modes FREE/STRUCTURED  
  - Interface prévisible et compréhensible pour créateurs et roasters

## 2025-07-05-23:45
### Complete - Feedback System Simplification & Legacy Cleanup (Phase 4)
- **Erreur "use server" corrigée**: Migration du schema vers fichier séparé
  - `structuredFeedbackSchema` déplacé vers `/lib/schemas/feedback.ts`
  - Suppression des exports non-async du fichier actions
  - Séparation claire entre schémas de validation et actions serveur
- **Code legacy nettoyé**: Suppression complète des modes FREE/STRUCTURED
  - Suppression `feedbackMode` des schémas et actions  
  - `FeedbackDisplayV2` simplifié: tous les feedbacks traités comme structurés
  - Suppression de la logique conditionnelle basée sur les modes
  - Interface unifiée "📋 Feedback structuré" pour tous les feedbacks
- **Wizard de création simplifié**: Suppression du champ date inutile
  - Champ "Date limite" retiré de la première étape du wizard v2
  - Schema `deadline` supprimé (était optionnel et non utilisé)
  - Interface plus focalisée sur l'essentiel
- **Stabilité améliorée**: Résolution des erreurs runtime Next.js 15
  - "use server" files maintenant conformes (async functions only)
  - Imports et exports bien organisés entre schemas et actions
  - Code plus robuste et maintenable

## 2025-07-05-23:20
### Implementation Complete - Dashboard & Detail Pages Updated (Phase 3)
- **Pages de détail mises à jour**: Roast detail pages (créateur et roaster) utilisent maintenant `UnifiedPricingDisplay`
  - Page créateur (`/dashboard/roast/[id]`): Affichage unifié du prix par roaster avec total
  - Page roaster (`/roast/[id]`): Pricing compact dans header avec fallback legacy
  - Application form: Badge prix mis à jour "€/roaster" au lieu de "€ par feedback"
- **Composant UnifiedPricingDisplay**: Component de tarification moderne créé
  - Mode compact pour headers et affichages inline
  - Mode complet avec breakdown détaillé des coûts
  - Support questions personnalisées avec indicateur "incluses"
  - Fallback automatique vers calculs legacy pour compatibilité
- **Cohérence interface**: Tous les affichages utilisent maintenant le nouveau modèle de pricing
  - `pricePerRoaster` comme source de vérité avec fallback `maxPrice/feedbacksRequested`
  - Terminologie unifiée "/roaster" remplace "/feedback"
  - Badges et indicateurs adaptés au nouveau modèle de tarification libre
- **Nettoyage imports**: Suppression des imports inutilisés dans les pages modifiées
  - Lint warnings réduites pour les fichiers principaux
  - Code plus maintenable et lisible

## 2025-01-26-21:00
### Major Implementation - Feedback System Simplification (Phase 2)
- **Formulaire de feedback unifié créé**: `UnifiedFeedbackForm` remplace les anciens formulaires
  - Combine automatiquement feedback structuré + questions personnalisées optionnelles
  - Feedback structuré de base toujours inclus (notes, impressions, forces/faiblesses, recommandations)
  - Questions personnalisées affichées par domaines si présentes
  - Interface moderne avec étoiles, champs multi-valeurs, validation robuste
- **Bug wizard corrigé**: Validation automatique à l'étape 3 (tarification)
  - Ajout mécanisme de confirmation explicite pour éviter soumission accidentelle
  - L'utilisateur doit maintenant cliquer 2 fois pour confirmer la création
  - Validation prix 3-50€ ajoutée pour empêcher navigation invalide
- **Formulaire principal simplifié**: `RoastFeedbackForm` devient un simple wrapper
  - Plus de logique complexe de modes FREE/STRUCTURED
  - Délégation complète au formulaire unifié
  - Interfaces TypeScript mises à jour pour nouveau modèle
- **Compatibilité maintenue**: Support des anciens feedbacks existants
  - Transformation automatique des données legacy vers nouveau format
  - Fallback vers champs par défaut si données manquantes
  - Pas de perte de données pendant la migration

## 2025-01-26-20:00
### Major Implementation - Feedback System Simplification (Phase 1)
- **Migration base de données réalisée**: Nouveau schéma avec `pricePerRoaster` et `useStructuredForm`
  - Ajout des nouveaux champs: `pricePerRoaster` (3-50€), `useStructuredForm`
  - Migration automatique des données existantes vers nouveau modèle
  - Conservation des champs legacy pour compatibilité ascendante
- **Nouveau wizard de création simplifié**:
  - **NewRoastWizardV2**: Wizard en 3 étapes au lieu de 4
  - Étape 1: Informations de base (titre, URL, description, audience, nombre roasters)
  - Étape 2: Configuration feedback optionnelle (questions personnalisées)
  - Étape 3: Tarification libre (3-50€ par roaster avec indicateurs de marché)
- **Actions serveur mises à jour**:
  - `createNewRoastRequest()` adapté pour nouveau modèle de pricing
  - Validation simplifiée: plus de calculs complexes par question
  - Suppression complète de l'option urgence
- **Schémas Zod simplifiés**:
  - `newRoastRequestSchema` avec pricing unifié
  - Validation 3-50€ par roaster
  - Questions optionnelles sans contraintes de domaines
- **Marketplace partiellement mise à jour**:
  - `available-roasts-list.tsx` adapté pour afficher `pricePerRoaster`
  - Fallback vers calculs legacy pour compatibilité
  - Badges mis à jour (suppression modes, ajout nombre questions)

## 2025-01-26-18:00
### Major Refactoring Plan - Feedback System Simplification
- **Plan de simplification majeur**: Fusion des modes FREE et STRUCTURED en un seul mode CUSTOM
- **Nouveau modèle de feedback unifié**:
  - Formulaire structuré de base toujours inclus (notes, forces/faiblesses, recommandations)
  - Questions personnalisées optionnelles (0 à illimité) organisées par domaines
  - Suppression du choix de mode qui créait de la confusion
- **Nouveau système de tarification libre**:
  - Le créateur fixe son prix par roaster (minimum 3€)
  - Suppression des calculs complexes par question
  - Auto-régulation par le marché selon la complexité et la valeur
  - Suppression complète de l'option urgence
- **Simplification du wizard de création**:
  - Réduction à 3 étapes au lieu de 4 actuelles
  - Étape 1: Informations de base + sélection audience
  - Étape 2: Configuration feedback (questions optionnelles)
  - Étape 3: Tarification simple avec indicateurs de marché
- **Impact technique majeur**:
  - Mise à jour de 40+ composants et pages
  - Migration de base de données pour nouveau modèle
  - Refactoring complet des formulaires et affichages
  - Nettoyage du code legacy (modes, urgence, anciens calculs)
- **Documents créés**:
  - PRD/feedback-simplification-strategy.md - Stratégie complète
  - PRD/implementation-plan.md - Plan d'implémentation détaillé

## 2025-06-25-11:55
### UX Enhancement - Simplified Feedback Display & Bug Fixes
- **Fixed application status bug**: Roasters who completed feedback were incorrectly shown as "en cours"
- **Root cause**: Status check was only looking for feedback existence, not completion status
- **Solution**: Now checks `f.status === 'completed'` for accurate status display
- **Simplified feedback interface**:
  - **Removed heavy tabs**: Eliminated complex tabbed interface for cleaner presentation
  - **Mode-aware display**: Automatically detects FREE vs STRUCTURED mode
  - **Streamlined layout**: Single expandable card per feedback with logical information flow
  - **Better visual hierarchy**: Feedback général first, then questions by domain for STRUCTURED mode
  - **Mode indicators**: Clear badges showing feedback type (🎯 Impression générale vs 📋 Feedback structuré)
- **Enhanced readability**: Better spacing, typography, and content organization
- **Responsive design**: Improved mobile experience with simplified interface
- **Impact**: Much cleaner and more intuitive feedback viewing experience for creators

## 2025-06-25-11:50
### Major UX Redesign - Creator Dashboard Roast Detail Page
- **Complete redesign of creator dashboard roast detail page** (/dashboard/roast/:id)
- **New single-column layout**: Replaced 3-column layout with clean, streamlined single-column design
- **Enhanced progress visualization**:
  - **Avatar-based progress bar**: Shows actual roaster avatars at their progress positions
  - **Color-coded status**: Green for completed, blue for in-progress, gray placeholders for empty slots
  - **Real-time indicators**: Checkmarks for completed, clock icons for in-progress feedbacks
- **Integrated applications management**:
  - **No more modal**: Applications now displayed directly in the main UI for better visibility
  - **Prominent pending applications**: Orange-highlighted cards for applications awaiting decision
  - **Always visible**: Applications section shows even when all seats are taken
  - **Action buttons**: Direct Accept/Reject buttons on each pending application
  - **Status tracking**: Clear separation between pending, accepted, and rejected applications
- **Improved information hierarchy**:
  - **Card-based sections**: Clean separation of progress, applications, feedbacks, and project info
  - **Enhanced readability**: Better spacing and visual organization
  - **Responsive design**: Optimized for all screen sizes with consistent spacing
- **Better roaster visibility**: Shows roaster profiles, ratings, bios, and motivations directly in applications
- **Impact**: Creators can now manage their roasts more efficiently with all information visible at once

## 2025-06-25-11:45
### Critical UX Fix - Prevent Accidental Form Submission
- **Fixed automatic roast creation** after mode selection that was bypassing user intent
- **Problem**: Users were accidentally creating roasts by clicking the same area where navigation buttons appeared
- **Root cause**: FeedbackModeSelection had its own "Continue" button that auto-advanced the wizard
- **Solutions implemented**:
  - **Removed auto-navigation** from mode selection step - now shows confirmation instead
  - **Added explicit confirmation step** - users must click "Create roast" then "Confirm and create roast"
  - **Enhanced navigation** - standardized navigation buttons across all steps
  - **Visual feedback** - clear indication when mode is selected with instruction to use bottom navigation
- **Impact**: Users now have full control over form submission, preventing accidental roast creation

## 2025-06-25-11:40
### UX Enhancement - Auto-Remove Domains Without Questions
- **Enhanced structured feedback form** to automatically remove domains when all questions are deleted
- **User Experience**: When user deletes all questions from a domain, the domain is automatically deselected
- **Implementation**: Modified `removeQuestion` function in FeedbackStructuredStep to check if domain becomes empty
- **Benefit**: Prevents orphaned domains without questions from being selected, ensuring form consistency

## 2025-06-25-11:35
### Bug Fix - Missing FOCUS_AREAS Import
- **Fixed "FOCUS_AREAS is not defined" error** in new-roast-wizard.tsx
- **Root cause**: FOCUS_AREAS constant was being used in domain validation logic but wasn't imported
- **Solution**: Added FOCUS_AREAS to the import statement from '@/lib/types/roast-request'
- **Impact**: New roast wizard now works correctly without runtime errors

## 2025-06-25-11:30
### Major UX Redesign - Complete Roast Page Refactor & Form Security
- **Completely redesigned /roast/:id page**:
  - **New 3-column layout**: Main content (2 cols) + sidebar application form (1 col)
  - **Enhanced roaster status display**: Very prominent card showing real-time status with visual indicators
  - **Simplified information hierarchy**: Single card with all mission details instead of scattered sections
  - **Improved pricing display**: Bold total with discrete breakdown details
  - **Better mode distinction**: Clear visual difference between FREE and STRUCTURED modes
- **Fixed data compatibility issues**:
  - **Updated audience display**: Now uses new `targetAudiences` relation instead of legacy `targetAudience`
  - **Enhanced feedback mode support**: Proper handling of FREE vs STRUCTURED modes
  - **Improved domain display**: Shows icons and question counts for each domain
  - **Better question organization**: Only shows domains with questions, prevents empty sections
- **Enhanced roaster status visibility**:
  - **Color-coded status cards**: Green for completed, blue for in-progress, orange for pending
  - **Real-time progress tracking**: Shows X/Y roasters selected with completion badges
  - **Prominent placement**: First card in main column for maximum visibility
  - **Enhanced status messages**: Clear icons and descriptive text for each state
- **Added form security and validation**:
  - **Domain validation**: Prevents selection of domains without questions (like 'General')
  - **Frontend protection**: Modified `toggleDomain` to only allow domains with questions
  - **Wizard validation**: Enhanced step validation to check domain validity
  - **Schema validation**: Improved Zod validation with better error messages
  - **User guidance**: Added info alerts and question counts for each domain
- **Visual improvements**:
  - **Badge system**: Shows feedback mode, completion status, and question counts
  - **Better spacing**: Cleaner layout with consistent card spacing
  - **Pricing transparency**: Shows base price and per-question pricing details
  - **Category display**: Added app category with icons in header

## 2025-06-25-11:15
### Bug Fix - Roaster Application Error for FREE Mode
- **Fixed application error for impression générale (FREE mode)**: Resolved 500 Internal Server Error when roasters apply to FREE mode roasts
- **Root cause**: `calculateRoasterScore` function was dividing by zero when `roastRequest.focusAreas` was empty for FREE mode roasts
- **Solution**: Added safety check for empty focus areas and provide a default score of 15 points for FREE mode roasts
- **Changes made**:
  - Modified `calculateRoasterScore` function in roast-application.ts to handle empty focus areas
  - Added conditional logic to give average specialty score (15/30) when no specific focus areas are defined
- **Impact**: Roasters can now successfully apply to impression générale roasts without server errors

## 2025-06-25-11:00
### Bug Fix - Marketplace Page Runtime Error
- **Fixed runtime error**: "Cannot read properties of undefined (reading 'icon')" in available-roasts-list.tsx
- **Root cause**: Database enum `FeedbackMode` has 3 values (FREE, TARGETED, STRUCTURED) but TypeScript types only had 2 (FREE, STRUCTURED)
- **Solution**: Added safety check to prevent accessing undefined FEEDBACK_MODES entries
- **Changes made**:
  - Modified available-roasts-list.tsx line 195 to check if FEEDBACK_MODES[roast.feedbackMode] exists before rendering
  - This prevents the error for roasts with feedbackMode='TARGETED' which don't have a corresponding TypeScript definition
- **Impact**: Marketplace page now loads correctly without crashing for roasts with legacy TARGETED feedback mode

## 2025-06-24-21:45
### Major UX Redesign - Simplified 2-Mode Feedback System
- **Streamlined feedback modes to 2 options**:
  - **FREE mode**: Fixed 3€ pricing for general impression feedback
  - **STRUCTURED mode**: 3€ base + 0.25€ per question with domain-organized questions
  - **Removed TARGETED mode**: Eliminated for better user experience and simpler pricing
- **Implemented drag & drop question reordering**:
  - **Framer Motion integration**: Added drag & drop for custom questions in STRUCTURED mode
  - **Visual feedback**: Hover states and cursor changes for better UX
  - **Maintained question order**: Proper reordering with preserved numbering
- **Redesigned wizard flow**:
  - **Step 1**: Basic info + audience selection (moved from step 4)
  - **Step 2**: Feedback mode selection (FREE vs STRUCTURED)
  - **Step 3**: Questions customization (only for STRUCTURED)
  - **Step 4**: Summary with detailed pricing breakdown
- **Enhanced pricing transparency**:
  - **Urgency pricing included**: +0.50€ per roaster fully integrated in all calculations
  - **Real-time pricing updates**: Dynamic pricing display throughout wizard
  - **Detailed breakdown**: Shows base, questions, urgency costs separately
- **Improved user experience**:
  - **Audience selection moved to step 1**: Better logical flow
  - **Removed date field**: Simplified final step to focus on summary
  - **Enhanced visual hierarchy**: Better step organization and validation

## 2025-06-24-21:15
### Bug Fixes - Upload Component and Infinite Loop Resolution
- **Fixed image upload functionality**:
  - **Replaced broken UploadDropzone**: Switched to existing working ImageUpload component
  - **Better UX**: Progress indicators, image optimization, and proper error handling
  - **Drag & drop support**: Works with file selection and drag-drop interface
- **RESOLVED infinite loop in STRUCTURED mode**:
  - **Root cause**: Radix UI Checkbox component was triggering continuous re-renders
  - **Solution**: Replaced Checkbox with custom styled div that mimics checkbox appearance
  - **Result**: Domain selection now works perfectly without React update loops
  - **Visual consistency**: Custom checkbox matches design with blue background and white checkmark when selected
- **Code cleanup**: Removed unused imports and problematic Checkbox dependency

## 2025-06-24-21:00
### UX Enhancement - Improved Wizard Interface and Pricing Clarity
- **Enhanced BasicInfoStep user experience**:
  - **Category selection**: Replaced dropdown with visual card-based selection with icons and descriptions
  - **Removed unnecessary field**: Eliminated "contexte supplémentaire" field to simplify form
  - **Interactive slider**: Implemented styled range slider for roaster count selection with visual feedback
  - **Cover image upload**: Added UploadThing integration with image preview and removal functionality
  - **Enhanced urgency option**: Added clear benefits (+0.50€ per roaster, algorithm boost, immediate publication)
- **Improved feedback mode selection clarity**:
  - **Pricing explanation header**: Added clear breakdown of base price (2€) + free questions (2) + additional costs
  - **Enhanced pricing cards**: Better display of included vs additional questions with visual indicators
  - **Cost optimization tips**: Added guidance on maximizing value with included questions
- **Fixed roast-feedback-form indentation issue**: Corrected malformed JSX structure in completed feedback display
- **Visual improvements**: Better gradients, color coding, and typography throughout the wizard interface

## 2025-06-24-20:45
### Feature Implementation - Complete BasicInfoStep for New Roast Wizard
- **Implemented full BasicInfoStep component** in new-roast-wizard.tsx:
  - **Complete form fields**: title, URL, description, category selection, roaster count, urgency toggle
  - **Real-time validation**: character counts, URL validation, required field indicators
  - **Enhanced UX**: helpful placeholder text, context explanations, visual feedback
  - **Category selection**: dropdown with icons and descriptions for all app types
  - **Roaster count**: smart selection with recommendations (1-10 roasters)
  - **Urgency option**: checkbox to prioritize roast publication
- **Implemented SettingsStep component**:
  - **Target audience selection**: multi-select interface (max 2 audiences) with visual feedback
  - **Custom audience**: optional text input for specific targeting
  - **Deadline setting**: optional date picker for completion timeline
  - **Configuration summary**: shows selected mode, question count, and roaster count
  - **Final confirmation**: clear indication of publication behavior (immediate vs 24h collection)
- **Enhanced wizard navigation**: step validation, progress indicators, and proper form state management
- **Backward compatibility**: maintains integration with existing target audience and question systems

## 2025-06-24-20:30
### Feature Enhancement - Adaptive Feedback Form for New Feedback Modes
- **Updated feedback form component to handle different feedback modes**:
  - **FREE mode**: Shows alert explaining free exploration, no questions section, larger textarea for comprehensive feedback (min 100 chars)
  - **TARGETED mode**: Questions displayed in simple list format with Q1, Q2... badges
  - **STRUCTURED mode**: Traditional domain-grouped questions with color-coded headers
- **Enhanced form validation**: Adaptive validation schema based on feedback mode (FREE requires only generalFeedback, others require questionResponses)
- **Improved UI elements**:
  - Mode-specific labels and descriptions for feedback section
  - Badge display shows feedback mode in form header
  - Summary section adapts to show relevant information per mode
  - Dynamic pricing explanation (new vs legacy pricing models)
  - Submit button logic handles FREE mode (no questions to complete)
- **Backward compatibility**: Legacy roasts (without feedbackMode) default to STRUCTURED behavior
- **Enhanced user guidance**: Different placeholder text and instructions based on selected mode

## 2025-06-22-18:45
### Bug Fix - Fixed Spots Calculation Logic
- **Fixed spots counting to use accepted applications instead of completed feedbacks**
- **Problem**: Spots were calculated based on completed feedbacks, but should be based on accepted roasters
- **Changes made**:
  - Marketplace cards now count accepted/auto_selected applications
  - Roast detail page shows X/Y based on accepted applications
  - Application form calculates remaining spots correctly
  - Fixed "Cette demande n'accepte plus de candidatures" error when spots were still available
- **Fixed application server action**:
  - Now accepts both 'open' and 'collecting_applications' statuses
  - Added check for remaining spots based on accepted applications
- **Result**: Accurate spot counting throughout the application

## 2025-06-22-18:15
### Bug Fix - Fixed Roaster Application Access Error
- **Fixed issue where roasters couldn't apply to open roast requests**
- **Problem**: Roasters were incorrectly shown "Cette demande n'est plus disponible" page even when spots were available
- **Root cause**: Logic error in `/app/roast/[id]/page.tsx` that blocked access for 'open' and 'collecting_applications' statuses
- **Solution**: Changed condition to only show unavailable page for 'cancelled', 'completed', or 'in_progress' (when not accepted roaster)
- **Result**: Roasters can now properly access and apply to open roast requests

## 2025-06-22-18:30
### UI Enhancement - Improved Roast Spots Visibility
- **Enhanced marketplace cards to show remaining spots clearly**:
  - Changed from "X places" to "X/Y places" format showing current/total
  - Added red styling when no spots remain (0/Y places)
  - Now calculates based on completed feedbacks instead of applications
- **Added roaster status display on roast detail page**:
  - Shows avatars with status indicators for all roasters
  - Green check for completed feedbacks
  - Blue clock for in-progress (accepted roasters who haven't submitted)
  - Orange alert for pending applications
  - Shows first 5 pending applications with count of additional ones
- **Updated application form to highlight available spots**:
  - Shows "X places restantes sur Y" in green when spots available
  - Shows "Toutes les places ont été attribuées" in red when full
  - Disables submit button when no spots remain
  - Updated badge to show X/Y format with appropriate styling

## 2025-06-21-10:00
### New Feature - Marketplace Filtering System for Roasters
- **Added comprehensive filtering system for the marketplace page**:
  - Filter by application status (not applied, in progress, completed)
  - Filter by domains (focus areas)
  - Filter by target audience
  - Filter by question types
  - Filter by price range with interactive slider
- **Created new server action `getFilteredRoastRequests`** in roast-request.ts
  - Filters roasts based on user's application/feedback status
  - Supports multiple filter criteria with AND logic
- **Created MarketplaceFilters component** with sheet UI for mobile-friendly filtering
  - Shows active filter count badge
  - Allows clearing all filters at once
- **Created MarketplaceContent wrapper component** for client-side filtering logic
  - Extracts available filter options from roast data
  - Handles loading states during filter application
- **Updated card buttons based on application status**:
  - "Postuler" (Apply) for new roasts
  - "Continuer" (Continue) for in-progress roasts
  - "Consulter" (View) for completed roasts
  - Different button colors for each state (orange, blue, outline)

## 2025-06-21-10:15
### UI Enhancement - Replaced Sheet Filters with Inline Dropdown Filters
- **Replaced sheet-based filters with inline dropdown filters** at the top of marketplace page
- **Created MarketplaceFilterBar component** with dropdown menus:
  - Status filter as a select dropdown
  - Domain, audience, and question type filters as checkbox dropdowns
  - Price range filter in a dropdown with slider
  - All filters are displayed inline for better visibility
- **Added active filter badges** below the filter bar
  - Each active filter shows as a removable badge
  - Clear all filters button when filters are active
- **Added Select component** from Radix UI for status dropdown

## 2025-06-21-10:30
### Filter System Updates - Price Range and Date Filter
- **Updated price range** to fixed 1€-20€ instead of dynamic range
- **Removed question types filter** from the marketplace
- **Added publication date filter** with the following options:
  - "Aujourd'hui" (Today)
  - "Hier" (Yesterday) 
  - "Cette semaine" (Last week)
  - "Ce mois-ci" (Last month)
- **Updated server action** to handle date-based filtering logic
- **Simplified filter interface** for better user experience

## 2025-06-21-11:00
### Major Feature - Target Audience Management System
- **Created TargetAudience database model** with predefined and custom audiences
  - Added relationship to RoastRequest (targetAudienceId instead of free text)
  - Added relationship to User for tracking custom audience creators
- **Implemented predefined target audience list** with 40+ SaaS target types:
  - Professionals (Développeurs, Designers, Marketeurs, etc.)
  - Companies (Startups, PME, Grandes entreprises, etc.)
  - Industries (Santé, Éducation, Finance, etc.)
  - Team types and sizes
- **Created target-audiences server actions**:
  - `initializeTargetAudiences()` - Seeds database with default audiences
  - `getTargetAudiences()` - Retrieves all audiences
  - `createTargetAudience()` - Creates custom audiences
- **Updated roast request creation form**:
  - Replaced free text input with select dropdown
  - Added ability to create custom target audiences
  - Form validation for custom audience names
- **Updated marketplace filtering system**:
  - Target audience filter now uses the predefined list
  - Filters by relationship instead of text matching
- **Updated all related types and queries** to handle the new audience relationship

## 2025-06-21-11:30
### Enhancement - Multiple Target Audiences & Improved UX
- **Multiple target audiences support (1-2 max)**:
  - Updated database schema with `RoastRequestAudience` many-to-many table
  - Roast requests can now target 1-2 different audiences
  - Updated all queries and filtering logic for multiple audiences
- **Improved duplicate prevention**:
  - Case-insensitive duplicate checking for custom audiences
  - Better error handling when audience already exists
- **Enhanced audience selection UX**:
  - Replaced dropdown with checkbox interface for multi-selection
  - "Add new audience" option always appears first
  - Alphabetical sorting of all audiences (except "add new")
  - Real-time counter showing selected audiences (X/2)
  - Disabled state when max limit reached
- **Automatic sorting and state management**:
  - New audiences automatically inserted in alphabetical order
  - Seamless replacement of "custom" placeholder with actual audience ID
- **Updated marketplace filtering** to work with multiple target audiences per roast

## 2025-06-20-14:30
### Performance Enhancement - React Query Integration for User Profiles
- **Implemented React Query for API Caching**: Eliminated flickering during navigation
  - Created `QueryProvider` component with TanStack Query configuration
  - Set cache stale time to 1 minute and garbage collection time to 5 minutes
  - Disabled refetch on window focus for better user experience
- **Created Custom Hook `useUserProfiles`**: Centralized user profile data fetching
  - Replaced multiple `useEffect` calls with a single React Query hook
  - Hook handles session-based caching with user ID as part of query key
  - Returns typed `UserProfilesData` interface for type safety
- **Updated Components to Use React Query**:
  - `DashboardLayout`: Now uses `useUserProfiles` hook instead of `useEffect` with fetch
  - `Sidebar`: Replaced `useState` and `useEffect` pattern with React Query data
  - Added `useInvalidateUserProfiles` hook for manual cache invalidation after role switch
- **Result**: Navigation between marketplace, dashboard, and profile is now instant without API calls or flickering

## 2025-06-19-00:25
### UX Enhancement - Smooth Role Switching Without Hard Reload
- **Implemented Smooth Role Switching**: Replaced hard page reload with clean router refresh
  - Removed `window.location.replace('/dashboard')` in favor of `router.refresh()`
  - Leveraged existing `revalidatePath('/dashboard')` in `switchUserRole` action for server-side cache invalidation
  - Role switching now provides seamless user experience without browser history disruption
- **Fixed Sidebar State Management**: Resolved issue where role indicator didn't update after switching
  - Added `fetchUserData()` helper with `useCallback` for proper memoization
  - Role switch now refetches user data to update sidebar UI immediately
  - Sidebar now correctly shows "Mode Créateur" vs "Mode Roaster" after each switch
  - Fixed subsequent role switches not working by ensuring proper state updates
- **Enhanced React Performance**: Added proper React keys to navigation items
  - Navigation items now use `key={nav-${currentRole}-${item.href}-${index}}` to prevent unnecessary re-renders
  - Common items use `key={common-${item.href}-${index}}` for optimal performance
  - Role-based keys ensure proper component updates when switching between creator/roaster modes
- **Improved Architecture**: Clean separation between server-side revalidation and client-side UI updates
  - Server action handles database update and path revalidation
  - Client-side router refresh ensures UI consistency without full page reload
  - Professional user experience maintained throughout role transitions

## 2025-06-19-00:20
### TypeScript & Session Management Fixes - Role Switching Finally Working
- **Fixed TypeScript Errors in Sidebar**: Resolved `primaryRole` property access issues
  - Better Auth session doesn't include custom user fields by default
  - Implemented custom `useEffect` hook to fetch complete user data via `/api/user/profiles`
  - Enhanced API endpoint to return user info including `primaryRole` and profile flags
  - Sidebar now correctly accesses `userData.primaryRole` instead of `session.user.primaryRole`
- **Robust User Data Fetching**: Intelligent fallback system for user information
  - Primary: Fetch from API for complete user data including role and profiles
  - Fallback: Use component props if API fails
  - Ensures role switching button appears when user has both profiles
- **Session Management Completely Fixed**: Role switching now works reliably
  - Database updates verified (user Michel has both creator and roaster profiles)
  - API returns correct user data with current role
  - `window.location.replace('/dashboard')` forces complete reload with fresh session
  - UI updates immediately and consistently after role switch

## 2025-06-19-00:10
### Critical Fixes - Contrast & Navigation Issues Resolved
- **Major Contrast Improvements**: Completely resolved readability issues reported by user
  - Updated main content background to `oklch(0.85 0 0)` - very light gray for excellent readability
  - Cards now use `oklch(0.92 0 0)` - near-white background with subtle gray tint
  - Text colors inverted to very dark (`oklch(0.15 0 0)`) for maximum contrast
  - Maintained dark sidebar (`oklch(0.08 0 0)`) for professional visual separation
  - Interface now provides comfortable reading without eye strain
- **Fixed Role Switching Completely**: Resolved persistent role switching bugs
  - Verified user Michel has both creator and roaster profiles in database
  - Replaced `window.location.href` with `window.location.replace('/dashboard')` to force complete page reload
  - This approach clears browser cache and ensures fresh session data is loaded
  - Role indicator and navigation now update correctly and immediately after switching
- **Enhanced Post-Login Experience**: Improved user flow after authentication
  - Modified home page (`/`) to automatically redirect authenticated users to `/dashboard`
  - Eliminated "Hello World" placeholder that was confusing users post-login
  - Seamless navigation flow from login → dashboard
- **Robust Session Management**: Ensured consistent user state across application
  - Better handling of server-side session updates with client-side cache invalidation
  - Removed debug logs for cleaner production code
  - Professional user experience with reliable role switching

## 2025-06-18-23:55
### Final UX Polish - Contrast & Role Switching Fixes
- **Significant Contrast Improvements**: Enhanced readability across all dashboard pages
  - Lightened main content background from `oklch(0.15 0 0)` to `oklch(0.25 0 0)` for much better readability
  - Cards and components now use `oklch(0.30 0 0)` for optimal contrast without eye strain
  - Maintained dark sidebar (`oklch(0.08 0 0)` for professional contrast separation
  - Text and UI elements now have proper contrast ratios for comfortable viewing
- **Fixed Role Switching Functionality**: Resolved session update issues after role changes
  - Replaced `router.refresh()` with `window.location.reload()` for immediate UI updates
  - Role indicator and navigation now update correctly after switching between creator/roaster modes
  - Eliminated confusion where old role was displayed after switching
- **Universal Role Switch Access**: Made role switching available on all authenticated pages
  - Created `/api/user/profiles` endpoint to fetch user profile information
  - Enhanced `DashboardLayout` to automatically retrieve user profiles when not provided as props
  - Role switch button now appears consistently in sidebar across all pages (`/marketplace`, `/profile`, etc.)
  - Intelligent prop handling: uses server-side props when available, falls back to API fetch when needed
- **Improved User Experience Flow**: Streamlined navigation and role management
  - Consistent role switching experience regardless of current page
  - Better feedback during role transition with loading states
  - Professional appearance maintained across all authenticated routes

## 2025-06-18-23:45
### Navigation & UX Refinements - Post-Launch Fixes
- **Fixed Color Contrast Issues**: Improved readability and visual comfort on dashboard pages
  - Adjusted background colors to prevent eye strain from overly dark themes
  - Enhanced contrast between sidebar (dark) and main content (medium dark) areas
  - Updated CSS variables for better color balance in dark mode
- **Corrected Navigation Routes**: Fixed all sidebar links to point to existing pages
  - Updated creator navigation to use correct `/dashboard/new-roast` route
  - Fixed roaster navigation to use `/marketplace` instead of `/dashboard/marketplace`
  - Cleaned up profile link to use `/profile` instead of `/dashboard/profile`
- **Improved Sidebar UX**: Integrated user greeting and role switching into sidebar header
  - Moved "Salut [name]!" greeting from dashboard body to sidebar top
  - Integrated RoleSwitch button directly in sidebar with dark theme styling
  - Removed redundant UI elements from dashboard main content
  - Enhanced sidebar header with user info, role indicator, and seamless role switching
- **Applied Layout Consistency**: Extended DashboardLayout to all authenticated pages
  - Updated `/marketplace` page with proper dark theme and sidebar navigation
  - Modernized `/profile` page with card-based layout and dark theme
  - Consistent spacing and typography across all dashboard pages
- **Enhanced Professional Appearance**: Polished the overall user interface
  - Better visual hierarchy with proper content organization
  - Improved button styling and hover states for dark theme
  - Professional color palette with orange accents throughout

## 2025-06-18-23:30
### Major UX Enhancement - Navigation & Dark Theme
- **Complete Navigation Redesign**: Implemented professional sidebar navigation for SaaS-like experience
  - Created dynamic sidebar with role-based navigation (creator vs roaster modes)
  - Sidebar includes role indicator, organized menu sections, and contextual navigation
  - Navigation items adapt based on user's primary role with proper icons and descriptions
- **Streamlined Navbar**: Reduced navbar to essential profile and authentication functions only
  - Removed dashboard link from navbar (now in sidebar)
  - Clean, minimal navbar focused on user profile and auth actions
- **Global Dark Theme Implementation**: Applied consistent dark theme across all authenticated pages
  - Enhanced CSS variables for proper dark mode support
  - All dashboard pages now use dark gray backgrounds with proper contrast
  - Consistent color scheme matching onboarding and navbar
- **New Dashboard Layout System**: Created reusable `DashboardLayout` component
  - Automatic authentication checks and redirects
  - Consistent spacing and styling across all dashboard pages
  - Responsive design with proper sidebar and content areas
- **Enhanced User Experience**: Improved navigation flow and visual consistency
  - Role-based navigation prevents confusion between creator and roaster functions
  - Professional appearance suitable for SaaS applications
  - Better organization of features and improved discoverability

## 2025-06-18-23:20
### Critical Bugfix - Dashboard Domain Counting
- **Fixed Dashboard "Domaines couverts: 0" Issue**: Resolved data transformation problem in creator dashboard
  - Fixed `CreatorDashboardContent` component to preserve `roastRequest.questions` when flattening feedback data
  - Dashboard FeedbacksList now correctly shows domain counts instead of always showing 0
  - Data flow now properly maintains question information from database to component

## 2025-06-18-23:15
### Critical Bugfix
- **Fixed Missing Questions Relation**: Resolved "feedback.roastRequest.questions is undefined" error
  - Added `roastRequest.questions` relation to feedback queries in `getUserRoastRequests()` and `getRoastRequestById()`
  - Components can now properly access question data for domain calculations and response matching
  - Fixed domain counting in both `FeedbacksList` and `FeedbackDisplayV2` components

## 2025-01-18-21:45
### Bugfixes & Query Improvements
- **Fixed Dashboard Display Issues**: Resolved "Questions traitées: 0" and "Domaines couverts: N/A" issues
  - Updated `getUserRoastRequests()` and `getRoastRequestById()` to include `questionResponses`
  - Fixed undefined `questionResponses.length` errors with proper null checks
  - **Fixed "Domaines couverts: N/A"**: Now correctly calculates domains from actual question responses instead of all available questions
- **Form Validation Fixes**: Corrected TypeScript errors in feedback form
  - Fixed dynamic field registration for question responses
  - Improved form handling with proper `setValue` usage
- **Type Safety Improvements**: Replaced `any` types with proper TypeScript interfaces
  - Better type definitions for question response mapping
  - Cleaner component interfaces

## 2025-01-18-21:30
### Complete Feedback System Cleanup
- **Legacy Field Removal**: Completely removed unused legacy feedback fields from database schema
  - Removed `firstImpression`, `strengthsFound`, `weaknessesFound`, `actionableSteps`, `competitorComparison`
  - Clean schema now only contains `generalFeedback` and `questionResponses` relation
- **Simplified Codebase**: Removed all legacy compatibility code and simplified components
- **Enhanced Roast Form Display**: Implemented proper display of actual question responses in `/roast/[id]`
  - Shows specific response for each question asked
  - Displays general feedback section separately
  - Clean, organized presentation by domain

### Backend Improvements
- **Streamlined `createFeedback()`**: Now only handles the correct question-response format
- **Updated Queries**: All feedback functions now return clean, consistent data structure
- **Proper Question Response Retrieval**: `getFeedbackByRoastRequest` includes question responses

### Frontend Enhancements
- **Precise Response Display**: Roast feedback forms now show exact responses to each question
- **Better UX**: Clear separation between domain questions and general feedback
- **Simplified Components**: Removed legacy format handling, cleaner code

This cleanup ensures the feedback system perfectly matches the form structure with no legacy baggage.

## 2025-01-18-21:00
### Major Refactor
- **Feedback Structure Overhaul**: Completely refactored feedback system to match the actual form structure
  - **New Data Model**: Added `QuestionResponse` model to store individual responses to roast questions
  - **Schema Migration**: Migrated existing feedbacks while preserving data integrity
  - **Database Changes**: Added `generalFeedback` field and `questionResponses` relation, made legacy fields optional

### Backend Changes
- **Updated `createFeedback()`**: Now supports both new question-based format and legacy format for compatibility
- **Enhanced Queries**: Updated all feedback retrieval functions to include question responses and roast questions
- **Data Migration**: Automatic conversion of legacy feedback format to new structure during database migration

### Frontend Updates
- **New `FeedbackDisplayV2` Component**: Complete rewrite of feedback display with:
  - Question-by-domain organization with actual responses
  - Tabbed interface separating overview, questions, and general feedback
  - Backward compatibility with legacy feedback format
- **Updated Form Processing**: Feedback forms now correctly save responses to individual questions
- **Enhanced Dashboard**: Feedback lists now show appropriate data based on format (questions count vs legacy categories)

### Technical
- **Backward Compatibility**: Maintained full compatibility with existing feedbacks while enabling new structure
- **Graceful Migration**: Existing data converted to new format during migration
- **Type Safety**: Updated TypeScript interfaces to handle both formats

This refactor ensures feedbacks now properly reflect the actual form structure with responses to specific questions per domain, while maintaining all existing functionality.

## 2025-01-18-16:00
### New Feature
- **Enhanced Feedback Display for Creators**: Comprehensive feedback viewing system for creators
  - **Dashboard Feedback Filtering**: Added clickable stat cards that act as filter buttons (All, Active, Completed, Feedbacks)
  - **Feedback List View**: New component showing feedback summaries across all roasts
  - **Detailed Feedback Display**: Rich feedback presentation with expandable cards, tabbed content, and statistics
  - **Backend Support**: New server actions for retrieving and filtering creator feedbacks

### Enhancement
- **UI/UX Improvements**: 
  - Feedback cards with roaster info (avatar, rating, level, completed roasts)
  - Tabbed interface for organized content (Overview, Strengths, Weaknesses, Actions)
  - Visual indicators with icons and colors for better readability
  - Statistics summary showing total feedbacks, completion rate, average rating, and investment
  - Responsive screenshot grid display

### Technical
- Added `getCreatorFeedbacks()`, `getCreatorFeedbackStats()`, and `getFullFeedbackDetails()` functions
- Created `CreatorDashboardContent`, `FeedbacksList`, and `FeedbackDisplay` components
- Updated data queries to include full feedback and roaster profile information

## 2025-01-17-23:55
### New Feature
- **Upload d'image de couverture pour les roasts** : Intégration d'uploadthing pour permettre aux créateurs d'ajouter une image de couverture lors de la création d'une demande de roast
- **Support des questions personnalisées par domaine** : Les questions sont maintenant stockées dans la base de données via le modèle RoastQuestion, permettant une personnalisation complète par domaine

### Enhancement
- **Mise à jour du formulaire de création de roast** : Ajout du champ d'upload d'image avec preview et gestion des erreurs
- **Migration de la base de données** : Ajout du champ coverImage dans le modèle RoastRequest

## 2025-01-11-13:02
- **Fixed**: Resolved flickering issue during onboarding flow transitions
- **Feature**: Added loading.tsx file for onboarding routes to provide consistent loading UI
- **Enhancement**: Implemented React's useTransition hook in all onboarding forms for smoother navigation
- **UI**: Unified loading button text to "Chargement..." across all onboarding components
- **Performance**: Improved user experience by preventing loading state flicker between onboarding steps

## 2025-01-10-13:45
- **Fixed**: Added Dashboard link to navbar for authenticated users
- **Fixed**: Verified RoleSwitch component displays correctly on dashboard page for dual-role users
- **Feature**: Added accessible UI to allow users to add their second role/profile
- **UI**: Created `AddSecondRolePrompt` component that appears in dashboard for single-role users
- **Enhancement**: Modified role selection form to show informative message when adding second role
- **UX**: Added clear call-to-action with benefits for each role to encourage dual-role adoption
- **Improvement**: Auto-select missing role when adding second profile
- **UX**: Disable and gray out already owned role with informative message
- **Enhancement**: Preserve primary role when adding second profile

## 2025-06-10-21:30
- **Feature**: Implemented dual-role dashboard system with role-based content display
- **Enhancement**: Dashboard now shows different content based on user's primary role (creator vs roaster)
- **Security**: Added role validation to prevent roasters from creating roast requests
- **UI**: Created `AvailableRoastsList` component for roasters to view apps available for roasting
- **UI**: Added `RoleSwitch` component allowing users with both profiles to switch between roles
- **Actions**: Enhanced roast request creation to enforce role permissions
- **Actions**: Added `switchUserRole` function for seamless role switching
- **Actions**: Improved `getAvailableRoastRequests` to show roasts to roaster users
- **Tests**: Created comprehensive dual-role E2E test suite (`tests/e2e/dual-roles.spec.ts`)
- **Tests**: Added tests for role switching, permissions, and priority indicators
- **Database**: Enhanced user role management with dual-profile support

## 2025-06-10-17:50
- **Feature**: Implemented complete Roast Request system (Sprint 2 - Task 1)
- **Types**: Added comprehensive types and constants for roast requests (`lib/types/roast-request.ts`)
- **Actions**: Created CRUD server actions with Zod validation (`lib/actions/roast-request.ts`)
- **UI**: Built multi-step new roast request form with focus areas and pricing (`components/dashboard/new-roast-form.tsx`)
- **Pages**: Added dashboard overview with stats and request management (`app/dashboard/page.tsx`, `/new-roast`, `/roast/[id]`)
- **Components**: Created dashboard stats, request list, and header components
- **Tests**: Implemented comprehensive E2E test suite covering form validation, accessibility, mobile, and edge cases
- **Fix**: Corrected Next.js redirect handling in server actions to prevent error throwing
- **Enhancement**: Added data-testid attributes to dashboard stats for reliable test selectors

## 2025-01-10-15:30
- **Feature**: Implemented server-side onboarding completion guard function (`lib/auth-guards.ts`)
- **Feature**: Added automatic redirection to appropriate onboarding step for incomplete users
- **Integration**: Applied onboarding guards to all protected pages (/, /dashboard, /profile, /marketplace)
- **Tests**: Updated E2E tests to handle onboarding redirects with improved timeouts and race condition handling
- **Tests**: Enhanced auth helpers with better wait strategies and network idle checks
- **CI/CD**: Added GitHub Actions workflow for automated Playwright test execution on push/PR
- **Config**: Improved Playwright configuration with better timeouts and reduced workers for stability

## 2025-01-08-18:30
- Fixed authentication error handling in login form to properly display error messages instead of page refresh
- Changed navbar "Sign up" button from button to link element to fix duplicate button issue in tests
- Updated error messages to match test expectations ("Invalid credentials" for login errors)
- Fixed Playwright test selectors to handle strict mode violations