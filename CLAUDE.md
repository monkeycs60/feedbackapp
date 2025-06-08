# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application with authentication, using:
- **Next.js 15.3.3** with App Router and Turbopack
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **Better Auth** for authentication (with email/password and Google OAuth)
- **Prisma** with PostgreSQL for database
- **React Hook Form** with Zod for form handling
- **Playwright** for E2E testing
- **Shadcn UI** components

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbopack on http://localhost:3000
```

### Build & Production
```bash
npm run build        # Build production bundle
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint (Next.js core-web-vitals + TypeScript rules)
```

### Testing
```bash
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run Playwright tests with UI mode
```

### Database
```bash
npx prisma generate  # Generate Prisma client (outputs to app/generated/prisma)
npx prisma migrate dev   # Run database migrations in development
npx prisma migrate deploy # Deploy migrations to production
npx prisma studio    # Open Prisma Studio GUI
```

## Code Guidelines - ALWAYS FOLLOW THESE GUIDELINES WHEN WRITING CODE

- Always try to use this pattern when I ask you to write code:
   => Write documentation first: where does it takes place in the changelog history (what has been made before), what is required, what are the cases of the scenario, what are the expected results, what are the edge cases, etc. Consider a lot of attention to the edge cases.
   => Then, following the principles of TDD, write the tests first. They need to be comprehensive and cover all the cases of the scenario and follow the same pattern of documentation.
   => Then, write the code to pass the tests.
   => Then, refactor the code to make it more readable and maintainable.
   => Then, write the documentation again to reflect the changes.
   => Then, repeat the process until the code is complete.
   => Then, fill the CHANGELOG.md file at the root of the project with the changes and the reasons for the changes (keep it short and concise and add the date of the change (YYYY-MM-DD-HH:MM)). This changelog helps me to keep track of all changes that have been made to the project and to know what has been changed and why. You can use it as context for the next changes. You need to classify the different type of changes (new feature, bug fix, refactor, etc.) and add the date of the change (YYYY-MM-DD-HH:MM).

-  **Avoid `useEffect` at all costs** - only use when synchronizing with external systems:
   => **Data fetching**: Use tanstack query with `useQuery` hook
   => **User events**: Handle in event handlers, not Effects
   => **Derived state**: Calculate during render, not in Effects
   => **Expensive calculations**: Use `useMemo`, not Effects
   => **State reset on prop change**: Use `key` prop, not Effects
   => **Parent notifications**: Update both states in event handler
   => **External subscriptions**: Use `useSyncExternalStore`
   => **Valid uses**: Component mount analytics, DOM manipulation, cleanup.

- If a component is too long, try to split it into smaller components.
- If business logic is too complex, try to put it into a custom hook.
- Always keep page.tsx server component : do not use client logic for page.tsx: if you need to implement client side logic, put in into separate components and import it in page.tsx.


## Architecture

### Authentication
- **Better Auth** configured in `lib/auth.ts` with Prisma adapter
- Auth client in `lib/auth-client.ts` for frontend usage
- API routes handled at `app/api/auth/[...all]/route.ts`
- Supports email/password and Google OAuth
- Session-based authentication with database storage

### Database
- PostgreSQL with Prisma ORM
- Schema defines User, Session, Account, and Verification models
- Prisma client is generated to `app/generated/prisma/` (custom output location)
- Database singleton pattern in `lib/prisma.ts`

### Form Handling
- React Hook Form with Zod validation
- Schema definitions in `lib/schemas/`
- Server actions use `next-safe-action` (configured in `lib/actions/safe-action.ts`)

### Project Structure
- `app/` - Next.js App Router pages and API routes
- `components/ui/` - Shadcn UI components
- `lib/` - Core utilities, auth, database, and schemas
- `prisma/` - Database schema and migrations
- `tests/` - Playwright E2E tests

### Key Patterns
- Path aliases: `@/*` maps to project root
- Environment variables needed:
  - `DATABASE_URL` - PostgreSQL connection string
  - `SHADOW_DATABASE_URL` - Shadow database for migrations
  - `GOOGLE_CLIENT_ID` - Google OAuth client ID
  - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
  - `NEXT_PUBLIC_APP_URL` - Public app URL (defaults to http://localhost:3000)

### Testing Setup
- Playwright configured to run against local dev server
- Tests located in `tests/` directory
- Base URL set to http://localhost:3000
- Automatically starts dev server before tests