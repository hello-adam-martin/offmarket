# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Monorepo with separated frontend (Next.js), backend (Fastify), and shared packages. RESTful API architecture with client-side state management and database-driven matching system.

**Key Characteristics:**
- Reverse marketplace connecting property buyers and owners
- Decoupled services communicating via REST API
- Database-driven property matching based on criteria
- Authentication via JWT tokens and NextAuth
- Stripe integration for escrow and subscriptions
- Email templates stored in database with variable interpolation

## Layers

**Presentation Layer (Web Frontend):**
- Purpose: User-facing interface for buyers and owners to manage listings and searches
- Location: `apps/web/src/`
- Contains: Next.js App Router pages, React components, client-side state
- Depends on: API client (`lib/api.ts`), NextAuth, shared types (`@offmarket/types`), utilities
- Used by: Browser clients (buyers, owners, admin)

**API Layer (Backend):**
- Purpose: Core business logic, data persistence, and integration orchestration
- Location: `apps/api/src/`
- Contains: Fastify route handlers, service layer, job processors
- Depends on: Prisma client, external services (Stripe, Resend, Vercel Blob)
- Used by: Web frontend, webhooks, internal jobs

**Data Access Layer:**
- Purpose: Database abstraction and schema management
- Location: `packages/database/`
- Contains: Prisma schema, migrations, seed data
- Depends on: SQLite (development) or other database in production
- Used by: API routes and services

**Shared Layer:**
- Purpose: Cross-cutting types, utilities, and constants
- Location: `packages/types/` and `packages/utils/`
- Contains: TypeScript interfaces, validation schemas, helper functions
- Depends on: None (self-contained)
- Used by: Both frontend and backend

## Data Flow

**Buyer Creates Wanted Ad (Search):**

1. User fills form at `/buyer/create` (Next.js page)
2. Frontend validates with client-side logic
3. POST to `/api/wanted-ads` with `CreateWantedAdInput`
4. API route validates with Zod schema
5. Route handler creates `WantedAd`, `TargetLocation`, and `TargetAddress` records
6. Matching service (`services/matching.ts`) runs to find existing matching properties
7. PropertyMatch records created linking wanted ads to relevant properties
8. Response returns created ad with match count

**Owner Browses Property Demand:**

1. Owner navigates to `/explore/[region]` (region-based filtering)
2. Frontend fetches from `/api/matches?propertyId=xxx`
3. API queries PropertyMatch table with filters (location, budget, criteria)
4. Returns paginated list of matching wanted ads
5. Frontend renders demand cards with buyer's search criteria

**Owner Contacts Buyer (Inquiry):**

1. Owner views matched wanted ad details
2. Clicks "Connect" triggering escrow deposit via Stripe
3. Frontend POST to `/api/inquiries` with message
4. API creates Inquiry record and EscrowDeposit with PENDING status
5. Stripe webhook updates EscrowDeposit status to HELD
6. Email service sends notification to buyer using stored template
7. Buyer sees notification and can respond

**Postcard Direct Mail Flow:**

1. Buyer requests postcard at `/buyer/postcards`
2. POST to `/api/postcards` with target address and options
3. PostcardRequest created with PENDING status and unique `claimCode`
4. Admin reviews at `/admin/postcards` and approves/rejects
5. On approval, email sent to property owner with claim code
6. Owner clicks link at `/claim/[code]` to provide contact info
7. PostcardRequest updated with owner response and status CLAIMED

**State Management:**

- **Frontend:** React hooks (useState, useEffect) with session via NextAuth
- **Backend:** Database records with relational integrity
- **Email:** Templates stored in `EmailTemplate` table, rendered server-side with variable replacement
- **Subscriptions:** Stripe subscriptions linked via `Subscription` table, tier affects feature limits (FREE vs PRO)

## Key Abstractions

**WantedAd System:**
- Purpose: Represents buyer's property search/demand for properties
- Examples: `apps/api/src/routes/wanted-ads.ts`, `apps/api/src/services/matching.ts`
- Pattern: CRUD routes with automatic matching on create/update; supports area-based and address-specific targeting

**PropertyMatch Algorithm:**
- Purpose: Find properties matching buyer criteria (location, price, specs)
- Examples: `apps/api/src/services/matching.ts`
- Pattern: Query builder that filters by location overlap, budget range, and property specs; scores matches 0-100

**Inquiry & Escrow:**
- Purpose: Two-way communication between owner and buyer with financial lock
- Examples: `apps/api/src/routes/inquiries.ts`, `apps/api/src/routes/billing.ts`
- Pattern: EscrowDeposit holds funds until deal completes or 30-day expiry; auto-refunds if no connection

**Email Template System:**
- Purpose: Dynamic emails rendered from database templates
- Examples: `apps/api/src/services/email.ts`
- Pattern: Template stored with `{{variableName}}` placeholders; service replaces at send time via Resend

**User Authentication:**
- Purpose: Handle login/registration and JWT-based API access
- Examples: `apps/api/src/routes/auth.ts`, `apps/web/src/lib/auth.ts`
- Pattern: Magic link (email-based) registration via NextAuth; API uses JWT in Bearer token; Frontend stores token from initial auth

## Entry Points

**Web Frontend:**
- Location: `apps/web/src/app/page.tsx` (home), `apps/web/src/app/layout.tsx` (root layout)
- Triggers: Browser navigation to domain
- Responsibilities: Render marketing pages, route to auth/buyer/owner flows, handle session state via NextAuth

**API Server:**
- Location: `apps/api/src/index.ts`
- Triggers: Server startup; listens on configurable PORT (default 4000)
- Responsibilities: Initialize Fastify with plugins (auth, rate-limit, CORS), register 12+ route modules, start HTTP server

**NextAuth Integration:**
- Location: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Auth requests from frontend
- Responsibilities: Magic link sign-in, session management, user creation via API

**Webhook Handler:**
- Location: `apps/api/src/routes/webhooks.ts`
- Triggers: External service callbacks (Stripe, Resend)
- Responsibilities: Verify signature, update database state (subscriptions, deposits), trigger side effects

## Error Handling

**Strategy:** Consistent ApiResponse format with error codes and details; HTTP status codes indicate error type.

**Patterns:**

- **Validation:** 400 Bad Request with `VALIDATION_ERROR` code and field-level details (Zod)
- **Authentication:** 401 Unauthorized when JWT missing/invalid; 403 Forbidden for insufficient permissions
- **Not Found:** 404 with resource-specific error code (e.g., `PROPERTY_NOT_FOUND`)
- **Conflict:** 409 Conflict for duplicate resources (e.g., `PROPERTY_EXISTS`)
- **Server Error:** 500 with `INTERNAL_ERROR`; logged via Fastify logger

Frontend error handling in components catches API errors and displays user-friendly messages or shows UpgradeModal for tier-related blocks.

## Cross-Cutting Concerns

**Logging:**
- Backend: Fastify logger (Pino) with configurable level; prettier formatting in dev, JSON in production
- Frontend: Console logs in dev; errors tracked to external service if configured

**Validation:**
- Backend: Zod schemas in all routes for request body validation
- Frontend: React hook form validation on client side before submission

**Authentication:**
- Backend: JWT via `@fastify/jwt` plugin; `server.authenticate` decorator for protected routes
- Frontend: NextAuth sessions; token passed in API headers as `Authorization: Bearer <token>`

**Rate Limiting:**
- Backend: `@fastify/rate-limit` plugin (100 requests per minute per IP)

**CORS:**
- Backend: Configurable origin via `CORS_ORIGIN` env var; defaults to localhost:3000

**File Uploads:**
- Backend: `@fastify/multipart` for form-data handling; 10MB file limit, max 10 files per request
- Storage: Local filesystem in dev (`LOCAL_UPLOAD_DIR`), Vercel Blob in production

---

*Architecture analysis: 2026-03-30*
