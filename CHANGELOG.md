# Changelog

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