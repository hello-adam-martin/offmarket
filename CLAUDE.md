<!-- GSD:project-start source:PROJECT.md -->
## Project

**OffMarket NZ — Design Overhaul**

A reverse real estate marketplace for New Zealand where buyers post "wanted ads" and property owners see demand for their unlisted homes. The app is fully built — API, database, 45+ pages, auth, billing, matching engine, postcards, admin. This milestone is a pixel-perfect design overhaul to implement the DESIGN.md design system across every page and component.

**Core Value:** Every page and component visually matches DESIGN.md — typography, color, spacing, layout, dark mode — creating a cohesive, data-forward, industrial/utilitarian aesthetic that differentiates OffMarket from every other NZ property site.

### Constraints

- **Design authority:** DESIGN.md is the single source of truth for all visual decisions
- **No functionality changes:** Existing features must continue working identically after restyling
- **Tailwind CSS:** All styling via Tailwind utilities — no separate CSS files beyond globals.css for CSS variables and font imports
- **Responsive:** All pages must work across sm(640px), md(768px), lg(1024px), xl(1280px) breakpoints
- **Accessibility:** WCAG AA contrast ratios, keyboard navigation, ARIA landmarks, proper touch targets
- **Dark mode:** Must support both light and dark themes with proper surface color redesign per DESIGN.md
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.7.2 - Used across entire monorepo (web, API, packages)
- JavaScript/Node.js - Runtime for backend and build tools
- SQL - Embedded in Prisma ORM for database queries
## Runtime
- Node.js >= 20 (specified in `package.json` engines field)
- Browser environment for frontend (React 19)
- pnpm 9.14.4 - Workspace monorepo management
- Lockfile: pnpm-lock.yaml present
## Frameworks
- Next.js 15.1.0 - Frontend framework (`apps/web`)
- Fastify 5.1.0 - Backend API framework (`apps/api`)
- React 19.0.0 - UI component framework
- Prisma 6.1.0 - ORM and database schema management (`packages/database`)
- Tailwind CSS 3.4.16 - Utility-first CSS framework
- Headless UI 2.2.9 - Unstyled, accessible components
- NextAuth.js 5.0.0-beta.25 - Session and OAuth management for Next.js
- @fastify/jwt 9.0.1 - JWT token support for Fastify API
- Turbo 2.3.0 - Monorepo task orchestration and caching
- tsup 8.3.5 - TypeScript bundler for packages
- tsx 4.19.2 - TypeScript executor for Node.js scripts
- Vite/Vitest 2.1.8 - Testing framework for API
- @fastify/cors 10.0.1 - CORS support
- @fastify/helmet 12.0.1 - Security headers
- @fastify/rate-limit 10.2.0 - Rate limiting
- @fastify/multipart 9.3.0 - File upload handling
- @fastify/static 8.3.0 - Static file serving
## Key Dependencies
- stripe 20.0.0 - Payment processing and subscription management
- resend 6.6.0 - Email sending service
- zod 3.24.1 - Schema validation (used in API routes)
- @vercel/blob 2.0.0 - File storage for production uploads
- @prisma/client 6.1.0 - Database client
- pino-pretty - Formatted logging in development
- @stripe/react-stripe-js 5.4.1 - Stripe UI integration for React
- @stripe/stripe-js 8.5.3 - Stripe.js client library
- @types/node 22.10.2 - Node.js type definitions
- @types/react 19.0.1 - React type definitions
- @types/react-dom 19.0.1 - React DOM type definitions
- @types/google.maps 3.58.1 - Google Maps API types
- eslint 9.39.1 - Linting tool
- @typescript-eslint/eslint-plugin 8.49.0 - TypeScript linting rules
- @typescript-eslint/parser 8.49.0 - TypeScript parser for ESLint
- eslint-config-next 16.0.8 - Next.js ESLint configuration
- eslint-plugin-react 7.37.5 - React linting rules
- eslint-plugin-react-hooks 7.0.1 - React Hooks linting rules
- postcss 8.4.49 - CSS transformation
- autoprefixer 10.4.20 - Vendor prefix handling
## Configuration
- Configuration via environment variables (process.env)
- Turbo reads from `.env.*local` files (see turbo.json)
- Database connection via `DATABASE_URL` env var
- Critical services disabled gracefully if env vars not set:
- `DATABASE_URL` - Prisma database connection string
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
- `STRIPE_PRO_PRICE_ID` - Stripe monthly subscription price ID
- `STRIPE_PRO_YEARLY_PRICE_ID` - Stripe yearly subscription price ID
- `RESEND_API_KEY` - Resend email service API key
- `EMAIL_FROM` - Email sender address (defaults to `OffMarket NZ <noreply@offmarket.nz>`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_API_URL` - Frontend base URL for API calls
- `JWT_SECRET` - API JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins (defaults to `http://localhost:3000`)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging verbosity (defaults to info)
- `PORT` - API server port (defaults to 4000)
- `HOST` - API server host (defaults to 0.0.0.0)
- `LOCAL_UPLOAD_DIR` - Directory for local file uploads in development (defaults to `./uploads`)
- TypeScript base configuration: `tsconfig.base.json`
- Next.js configuration: `apps/web/next.config.ts`
- Turbo pipeline configuration: `turbo.json`
- No ESLint or Prettier config files found in root
## Database
- File-based database suitable for development
- Location: `prisma/dev.db` (see db reset script in `packages/database/package.json`)
- Schema: `packages/database/prisma/schema.prisma`
- Migrations: Managed via `prisma migrate` and `prisma db push`
- Seed: TypeScript seed script at `prisma/seed.ts`
## Platform Requirements
- Node.js >= 20
- pnpm 9.14.4
- SQLite support (built-in with Prisma)
- Node.js >= 20
- External database (SQLite file or compatible database)
- Vercel Blob for file storage
- Stripe account for payments
- Resend account for email
- Google OAuth credentials for authentication
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Components: PascalCase (e.g., `Header.tsx`, `FilterPanel.tsx`, `BrowsePageClient.tsx`)
- Utils/services: camelCase (e.g., `utils.ts`, `email.ts`, `matching.ts`)
- Routes: kebab-case with descriptive names (e.g., `wanted-ads.ts`, `saved-searches.ts`)
- Pages/page routes: Follow Next.js convention (e.g., `page.tsx`, `[address]/page.tsx`)
- Index files: `index.ts` used for barrel exports in component directories (`browse/index.ts`)
- camelCase for all function declarations
- Async functions prefixed with descriptive verbs: `findMatchingPropertiesForWantedAd()`, `sendEmail()`, `createInquiry()`
- Event handlers use `handle` prefix: `handlePropertyTypeToggle()`, `fetchUnreadCount()`
- Schema validators prefix with `create`, `update`, `send`: `createInquirySchema`, `loginSchema`
- API endpoints follow RESTful naming: `/api/auth/register`, `/api/properties/me`, `/api/inquiries/{id}/messages`
- camelCase for all variables and constants
- Boolean prefixes: `has`, `is`, `should`, `can` (e.g., `hasActiveFilters`, `isDirectAddressMatch`)
- Collections/arrays: plural names (e.g., `matchResults`, `properties`, `regionCounts`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_FROM`, `BEDROOM_OPTIONS`, `NZ_REGIONS`)
- Private/internal: prefix with underscore or use closure scope (e.g., `_ignorePattern`)
- Interface names: PascalCase with `I` prefix optional (patterns show both `ApiResponse`, `SendEmailOptions`, `MatchResult`)
- Enum-like types: `type` keyword with union of string literals (e.g., `type PropertyType = "HOUSE" | "APARTMENT"`)
- Type parameters in generics: Single uppercase letter (e.g., `<T>`, `<K>`)
- Input types suffix with `Input` (e.g., `CreateWantedAdInput`, `UpdatePropertyInput`)
- Response types suffix with `Summary` or no suffix depending on context (e.g., `WantedAdSummary`, `PropertyDemand`)
## Code Style
- No explicit formatter configured (prettier not in use)
- Implied style: 2-space indentation (visible in compiled code)
- Line length: No strict limit detected, but files kept under 100 lines where possible
- Import ordering: Not strictly enforced but follows pattern of framework imports → internal imports
- ESLint configured for TypeScript with plugins for React and React Hooks
- Configuration: `eslint.config.mjs` (flat config format)
- Base rules applied per-app (web and api have separate configs)
- @typescript-eslint/no-unused-vars: error (with argsIgnorePattern: "^_", varsIgnorePattern: "^_")
- @typescript-eslint/no-explicit-any: warn
- react-hooks/exhaustive-deps: warn
- react-hooks/rules-of-hooks: error
- react/jsx-key: error
- react/no-unescaped-entities: warn
- @typescript-eslint/no-unused-vars: error (with argsIgnorePattern: "^_", varsIgnorePattern: "^_")
- @typescript-eslint/no-explicit-any: warn
- no-console: warn (with allow: ["warn", "error"])
## Import Organization
- Web app uses `@/` (e.g., `@/components/header`, `@/lib/utils`, `@/lib/constants`)
- API uses relative paths with `.js` extensions for ESM (e.g., `./routes/auth.js`, `../services/email.js`)
- Monorepo workspace packages referenced as `@offmarket/database`, `@offmarket/types`, `@offmarket/utils`
## Error Handling
- Try-catch blocks used throughout for database and external service calls
- Validation errors use Zod's `safeParse()` method before accessing data
- HTTP responses follow consistent shape: `{ success: boolean, data?: T, error?: { code: string, message: string, details?: ... } }`
- Service methods return objects with `{ success: boolean, error?: string }` (see `sendEmail()`)
- Fastify reply status codes set explicitly: `reply.status(400)`, `reply.status(404)`, `reply.status(503)`
- React components handle promise rejections silently with empty catch blocks when non-critical (see `fetchUnreadCount()`)
## Logging
- Errors: `server.log.error(error)` (see `apps/api/src/routes/auth.ts`)
- Console for development: `console.log()`, `console.warn()` used for email service logs
- Log prefixes used: `[Email]` for email service operations (see `apps/api/src/services/email.ts`)
- Conditional logging based on `NODE_ENV` (development shows `query` logs, production shows errors only)
- Silent failures in client components (no console spam for network errors)
## Comments
- JSDoc comments for exported functions with @param, @returns tags
- Comments before complex business logic sections (e.g., location matching in `matching.ts`)
- Section headers with separator lines: `// ============================================================================`
- TODO/FIXME for known issues marked with descriptive text (see `apps/api/src/routes/postcards.ts`)
- Used for public API functions
- Example from `apps/web/src/lib/utils.ts`:
## Function Design
- Use object parameters for functions with 2+ arguments (see `sendEmail(options)`)
- Type function parameters explicitly with interfaces or type aliases
- Destructure parameters in function signatures when beneficial
- Async functions return typed Promises: `Promise<MatchResult[]>`, `Promise<{ success: boolean; error?: string }>`
- API handlers return serializable objects or use `reply.send()` for Fastify
- Utility functions return primitives or objects matching their purpose
## Module Design
- Named exports preferred for functions and types
- Default exports only for page components in Next.js
- Barrel files (`index.ts`) re-export components for cleaner imports (see `apps/web/src/components/browse/index.ts`)
- Used in component directories: `export { BrowsePageClient } from "./BrowsePageClient"`
- Located at: `apps/web/src/components/browse/index.ts`
- Enables: `import { BrowsePageClient } from "@/components/browse"`
- API routes: one file per resource (e.g., `wanted-ads.ts`, `properties.ts`)
- Services: utility modules (e.g., `email.ts`, `matching.ts`, `stripe.ts`)
- Web components: one component per file with supporting types
- Types: centralized in `packages/types/src/index.ts` with clear section headers
## TypeScript Configuration
- `strict: true` enables all strict checks
- `noUncheckedIndexedAccess: true` prevents unsafe array/object access
- `noImplicitOverride: true` requires explicit `override` keyword in class inheritance
- `forceConsistentCasingInFileNames: true` prevents case sensitivity bugs
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Reverse marketplace connecting property buyers and owners
- Decoupled services communicating via REST API
- Database-driven property matching based on criteria
- Authentication via JWT tokens and NextAuth
- Stripe integration for escrow and subscriptions
- Email templates stored in database with variable interpolation
## Layers
- Purpose: User-facing interface for buyers and owners to manage listings and searches
- Location: `apps/web/src/`
- Contains: Next.js App Router pages, React components, client-side state
- Depends on: API client (`lib/api.ts`), NextAuth, shared types (`@offmarket/types`), utilities
- Used by: Browser clients (buyers, owners, admin)
- Purpose: Core business logic, data persistence, and integration orchestration
- Location: `apps/api/src/`
- Contains: Fastify route handlers, service layer, job processors
- Depends on: Prisma client, external services (Stripe, Resend, Vercel Blob)
- Used by: Web frontend, webhooks, internal jobs
- Purpose: Database abstraction and schema management
- Location: `packages/database/`
- Contains: Prisma schema, migrations, seed data
- Depends on: SQLite (development) or other database in production
- Used by: API routes and services
- Purpose: Cross-cutting types, utilities, and constants
- Location: `packages/types/` and `packages/utils/`
- Contains: TypeScript interfaces, validation schemas, helper functions
- Depends on: None (self-contained)
- Used by: Both frontend and backend
## Data Flow
- **Frontend:** React hooks (useState, useEffect) with session via NextAuth
- **Backend:** Database records with relational integrity
- **Email:** Templates stored in `EmailTemplate` table, rendered server-side with variable replacement
- **Subscriptions:** Stripe subscriptions linked via `Subscription` table, tier affects feature limits (FREE vs PRO)
## Key Abstractions
- Purpose: Represents buyer's property search/demand for properties
- Examples: `apps/api/src/routes/wanted-ads.ts`, `apps/api/src/services/matching.ts`
- Pattern: CRUD routes with automatic matching on create/update; supports area-based and address-specific targeting
- Purpose: Find properties matching buyer criteria (location, price, specs)
- Examples: `apps/api/src/services/matching.ts`
- Pattern: Query builder that filters by location overlap, budget range, and property specs; scores matches 0-100
- Purpose: Two-way communication between owner and buyer with financial lock
- Examples: `apps/api/src/routes/inquiries.ts`, `apps/api/src/routes/billing.ts`
- Pattern: EscrowDeposit holds funds until deal completes or 30-day expiry; auto-refunds if no connection
- Purpose: Dynamic emails rendered from database templates
- Examples: `apps/api/src/services/email.ts`
- Pattern: Template stored with `{{variableName}}` placeholders; service replaces at send time via Resend
- Purpose: Handle login/registration and JWT-based API access
- Examples: `apps/api/src/routes/auth.ts`, `apps/web/src/lib/auth.ts`
- Pattern: Magic link (email-based) registration via NextAuth; API uses JWT in Bearer token; Frontend stores token from initial auth
## Entry Points
- Location: `apps/web/src/app/page.tsx` (home), `apps/web/src/app/layout.tsx` (root layout)
- Triggers: Browser navigation to domain
- Responsibilities: Render marketing pages, route to auth/buyer/owner flows, handle session state via NextAuth
- Location: `apps/api/src/index.ts`
- Triggers: Server startup; listens on configurable PORT (default 4000)
- Responsibilities: Initialize Fastify with plugins (auth, rate-limit, CORS), register 12+ route modules, start HTTP server
- Location: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Auth requests from frontend
- Responsibilities: Magic link sign-in, session management, user creation via API
- Location: `apps/api/src/routes/webhooks.ts`
- Triggers: External service callbacks (Stripe, Resend)
- Responsibilities: Verify signature, update database state (subscriptions, deposits), trigger side effects
## Error Handling
- **Validation:** 400 Bad Request with `VALIDATION_ERROR` code and field-level details (Zod)
- **Authentication:** 401 Unauthorized when JWT missing/invalid; 403 Forbidden for insufficient permissions
- **Not Found:** 404 with resource-specific error code (e.g., `PROPERTY_NOT_FOUND`)
- **Conflict:** 409 Conflict for duplicate resources (e.g., `PROPERTY_EXISTS`)
- **Server Error:** 500 with `INTERNAL_ERROR`; logged via Fastify logger
## Cross-Cutting Concerns
- Backend: Fastify logger (Pino) with configurable level; prettier formatting in dev, JSON in production
- Frontend: Console logs in dev; errors tracked to external service if configured
- Backend: Zod schemas in all routes for request body validation
- Frontend: React hook form validation on client side before submission
- Backend: JWT via `@fastify/jwt` plugin; `server.authenticate` decorator for protected routes
- Frontend: NextAuth sessions; token passed in API headers as `Authorization: Bearer <token>`
- Backend: `@fastify/rate-limit` plugin (100 requests per minute per IP)
- Backend: Configurable origin via `CORS_ORIGIN` env var; defaults to localhost:3000
- Backend: `@fastify/multipart` for form-data handling; 10MB file limit, max 10 files per request
- Storage: Local filesystem in dev (`LOCAL_UPLOAD_DIR`), Vercel Blob in production
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
