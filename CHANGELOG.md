# Changelog

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