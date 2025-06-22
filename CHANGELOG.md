# Changelog

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
  - Maintained dark sidebar (`oklch(0.08 0 0)`) for professional contrast separation
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