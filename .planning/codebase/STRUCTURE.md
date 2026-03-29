# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
offmarket-nz/                          # Root monorepo
├── apps/                              # Application workspaces
│   ├── api/                            # Fastify backend API
│   │   ├── src/
│   │   │   ├── index.ts                # Server bootstrap, plugin registration
│   │   │   ├── routes/                 # Route handlers grouped by domain
│   │   │   │   ├── auth.ts
│   │   │   │   ├── wanted-ads.ts
│   │   │   │   ├── properties.ts
│   │   │   │   ├── matches.ts
│   │   │   │   ├── inquiries.ts
│   │   │   │   ├── billing.ts
│   │   │   │   ├── uploads.ts
│   │   │   │   ├── webhooks.ts
│   │   │   │   └── ... (9 route modules)
│   │   │   ├── services/               # Business logic, external integrations
│   │   │   │   ├── email.ts            # Email template rendering via Resend
│   │   │   │   ├── matching.ts         # Property matching algorithm
│   │   │   │   ├── stripe.ts           # Stripe payments and subscriptions
│   │   │   │   └── upload.ts           # File handling
│   │   │   ├── jobs/                   # Background job processors
│   │   │   │   └── escrow-expiry.ts    # Auto-refund expired escrows
│   │   │   └── lib/                    # Utilities
│   │   │       └── nz-locations.ts     # NZ region/suburb mappings
│   │   ├── dist/                       # Built output (tsup ESM)
│   │   ├── uploads/                    # Local file storage (dev only)
│   │   ├── package.json                # Fastify, Stripe, Resend, Zod
│   │   └── tsconfig.json
│   │
│   └── web/                            # Next.js frontend app
│       ├── src/
│       │   ├── app/                    # Next.js App Router structure
│       │   │   ├── layout.tsx           # Root layout with Header, Footer, Providers
│       │   │   ├── page.tsx             # Home/landing page
│       │   │   ├── api/                 # NextAuth routes
│       │   │   │   └── auth/[...nextauth]/route.ts
│       │   │   ├── auth/                # Authentication pages
│       │   │   │   └── signin/page.tsx
│       │   │   ├── buyer/               # Buyer user flows
│       │   │   │   ├── create/page.tsx  # Create wanted ad
│       │   │   │   ├── my-ads/page.tsx  # View own wanted ads
│       │   │   │   └── postcards/       # Postcard management
│       │   │   ├── owner/               # Owner user flows
│       │   │   │   ├── register/page.tsx
│       │   │   │   ├── my-properties/   # View own properties
│       │   │   │   └── properties/      # Add/edit properties
│       │   │   ├── admin/               # Admin dashboard
│       │   │   │   ├── layout.tsx       # Admin layout/nav
│       │   │   │   ├── users/           # User management
│       │   │   │   ├── billing/         # Subscriptions, escrows
│       │   │   │   ├── postcards/       # Postcard review/approval
│       │   │   │   └── email-templates/ # Email template editor
│       │   │   ├── explore/             # Public property search
│       │   │   │   └── [region]/page.tsx
│       │   │   ├── property/            # Property detail page
│       │   │   │   └── [address]/page.tsx
│       │   │   ├── inquiries/           # Buyer inquiries/messages
│       │   │   ├── notifications/       # Notification center
│       │   │   ├── claim/               # Postcard claim flow
│       │   │   │   └── [code]/page.tsx
│       │   │   ├── dashboard/           # User dashboard (role-specific)
│       │   │   ├── saved-searches/      # Saved search management
│       │   │   ├── wanted/              # Browse wanted ads
│       │   │   ├── upgrade/             # Subscription upgrade page
│       │   │   ├── profile/             # User profile settings
│       │   │   ├── help/                # Help/FAQ page
│       │   │   ├── privacy/             # Privacy policy
│       │   │   ├── terms/               # Terms of service
│       │   │   └── globals.css          # Tailwind CSS with custom theme
│       │   ├── components/              # React components (reusable)
│       │   │   ├── header.tsx           # Site header/navigation
│       │   │   ├── footer.tsx           # Site footer
│       │   │   ├── providers.tsx        # Context/NextAuth setup
│       │   │   ├── browse/              # Browse page components
│       │   │   │   ├── BrowsePageClient.tsx     # Page shell
│       │   │   │   ├── PropertyCardGrid.tsx     # Grid display
│       │   │   │   ├── DemandCardGrid.tsx       # Demand cards
│       │   │   │   ├── FilterPanel.tsx          # Filter sidebar
│       │   │   │   ├── NZRegionMap.tsx          # Region map visual
│       │   │   │   ├── Pagination.tsx           # Pagination controls
│       │   │   │   ├── SaveSearchModal.tsx      # Save search dialog
│       │   │   │   └── EmptyState.tsx           # No results message
│       │   │   ├── UpgradeModal.tsx             # Subscription upsell
│       │   │   ├── PostcardRequestModal.tsx     # Postcard creation
│       │   │   ├── PropertyImageUpload.tsx      # Image upload component
│       │   │   ├── ContactBuyerModal.tsx        # Inquiry modal
│       │   │   └── demand-checker.tsx           # Live demand indicator
│       │   ├── lib/                    # Frontend utilities and API client
│       │   │   ├── api.ts               # Typed API fetch wrapper with Bearer token
│       │   │   ├── auth.ts              # NextAuth configuration
│       │   │   ├── constants.ts         # Property types, features, tiers
│       │   │   └── utils.ts             # Helpers (formatting, validation)
│       │   └── styles/                 # CSS modules (if any)
│       ├── .next/                      # Next.js build output (cached, not committed)
│       ├── public/                     # Static assets
│       ├── package.json                # Next.js, React, NextAuth, Stripe
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.ts          # Tailwind CSS configuration
│       └── postcss.config.js           # PostCSS plugins
│
├── packages/                           # Shared libraries
│   ├── database/                       # Prisma schema & migrations
│   │   ├── src/
│   │   │   └── index.ts                # Prisma client singleton export
│   │   ├── prisma/
│   │   │   ├── schema.prisma           # Complete schema: users, properties, matches, etc.
│   │   │   ├── seed.ts                 # Seed data for development
│   │   │   └── dev.db                  # SQLite dev database
│   │   ├── dist/                       # Compiled output (ESM with types)
│   │   └── package.json                # Prisma, tsup
│   │
│   ├── types/                          # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts                # ApiResponse, Auth, WantedAd, Property, etc.
│   │   ├── dist/                       # Compiled output (ESM with types)
│   │   └── package.json
│   │
│   └── utils/                          # Shared utility functions
│       ├── src/
│       │   └── index.ts                # Exported helpers
│       ├── dist/
│       └── package.json
│
├── .planning/                          # GStack planning documents
│   └── codebase/                       # Architecture analysis (this file)
│
├── node_modules/                       # Root dependencies (pnpm workspace)
├── .git/                               # Version control
├── .gitignore                          # Excluded files
├── .nvmrc                              # Node.js version (20+)
├── pnpm-workspace.yaml                 # Workspace declaration
├── pnpm-lock.yaml                      # Lockfile (large, not edited manually)
├── turbo.json                          # Monorepo build config
├── tsconfig.base.json                  # Base TypeScript config (extended by apps)
├── package.json                        # Root scripts (dev, build, lint, test)
├── README.md                           # Project overview
└── TODOS.md                            # Task tracking
```

## Directory Purposes

**`apps/api/src/routes/`:**
- Purpose: REST endpoint handlers grouped by domain (auth, properties, matches, etc.)
- Contains: Fastify route definitions with request validation and response formatting
- Key files: `wanted-ads.ts` (CRUD for buyer searches), `properties.ts` (owner property registration), `matches.ts` (demand browsing), `inquiries.ts` (messaging), `webhooks.ts` (Stripe/Resend callbacks)

**`apps/api/src/services/`:**
- Purpose: Business logic and external service integration
- Contains: Email rendering, property matching algorithm, Stripe payment handling, file uploads
- Key files: `email.ts` (template-based email), `matching.ts` (match scoring), `stripe.ts` (subscriptions/escrow), `upload.ts` (blob storage)

**`apps/web/src/app/`:**
- Purpose: Next.js App Router pages organized by user flow
- Contains: Route groups (buyer, owner, admin), dynamic routes ([id]), layouts, data fetching
- Pattern: One directory per main flow; `page.tsx` for page content, `layout.tsx` for shared structure

**`apps/web/src/components/`:**
- Purpose: Reusable React components
- Contains: UI components (modals, cards, grids), page-specific client components (marked with "use client")
- Organization: `browse/` subdirectory for browse-specific components

**`apps/web/src/lib/`:**
- Purpose: Frontend utilities and configuration
- Key files: `api.ts` (fetch wrapper with auth), `auth.ts` (NextAuth config), `constants.ts` (dropdowns, enums)

**`packages/database/prisma/schema.prisma`:**
- Purpose: Single source of truth for data model
- Contains: 20+ models covering users, properties, matches, inquiries, billing, postcards, admin
- Organization: Models grouped by domain (USER & AUTH, BUYER PROFILES & WANTED ADS, etc.)

**`packages/types/src/index.ts`:**
- Purpose: Shared TypeScript interfaces for API contracts
- Contains: ApiResponse<T> wrapper, input types (CreateWantedAdInput), entity types
- Used by: Both API (validation) and frontend (typing API calls)

## Key File Locations

**Entry Points:**
- `apps/api/src/index.ts` - API server bootstrap with Fastify setup
- `apps/web/src/app/page.tsx` - Home page (landing/marketing)
- `apps/web/src/app/layout.tsx` - Root layout wrapping all pages

**Authentication:**
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration and endpoints
- `apps/api/src/routes/auth.ts` - API auth endpoints (register, login, me, profile update)
- `apps/web/src/lib/auth.ts` - NextAuth provider configuration

**Core Business Logic:**
- `apps/api/src/services/matching.ts` - Property-to-wanted-ad matching algorithm
- `packages/database/prisma/schema.prisma` - Complete database schema
- `apps/api/src/services/email.ts` - Email template rendering

**API Routes (Domain-Driven):**
- `apps/api/src/routes/wanted-ads.ts` - Buyer search CRUD
- `apps/api/src/routes/properties.ts` - Owner property registration
- `apps/api/src/routes/matches.ts` - Demand browsing (owner perspective)
- `apps/api/src/routes/inquiries.ts` - Messaging between owner and buyer
- `apps/api/src/routes/billing.ts` - Stripe checkout, subscriptions
- `apps/api/src/routes/webhooks.ts` - External service callbacks
- `apps/api/src/routes/postcards.ts` - Direct mail requests

**Frontend Pages (User Flows):**
- `apps/web/src/app/buyer/create/page.tsx` - Create wanted ad form
- `apps/web/src/app/owner/register/page.tsx` - Owner registration
- `apps/web/src/app/owner/my-properties/page.tsx` - Owner property list
- `apps/web/src/app/explore/[region]/page.tsx` - Public property search
- `apps/web/src/app/admin/users/page.tsx` - Admin user management
- `apps/web/src/app/admin/postcards/page.tsx` - Postcard approval workflow
- `apps/web/src/app/claim/[code]/page.tsx` - Postcard claim entry point

**Configuration:**
- `tsconfig.base.json` - Base TypeScript settings (strict mode, path aliases)
- `turbo.json` - Monorepo build orchestration (build deps, caching)
- `pnpm-workspace.yaml` - Workspace package paths

**Database:**
- `packages/database/prisma/schema.prisma` - Schema definition
- `packages/database/prisma/seed.ts` - Development seed data
- `packages/database/src/index.ts` - Prisma client singleton

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- Components: PascalCase (e.g., `DemandCardGrid.tsx`, `UpgradeModal.tsx`)
- Utilities: camelCase (e.g., `api.ts`, `auth.ts`, `matching.ts`)
- Routes: kebab-case directory names (e.g., `wanted-ads.ts`, `email-templates/`)

**Directories:**
- Routes/pages: kebab-case or specific domain name
- Components: PascalCase for component directories (though components are in one folder)
- Services: Domain-based names with .ts extension
- Utilities: camelCase, grouped by function

**TypeScript:**
- Interfaces/Types: PascalCase (e.g., `ApiResponse<T>`, `CreateWantedAdInput`)
- Enums: PascalCase (e.g., `UserRole`, `SubscriptionTier`)
- Functions: camelCase (e.g., `sendEmail`, `createMatchesForProperty`)
- Constants: UPPER_SNAKE_CASE or PascalCase for component constants (e.g., `DEFAULT_FROM`, `PROPERTY_TYPES`)

## Where to Add New Code

**New API Endpoint:**
1. Create route file in `apps/api/src/routes/[domain].ts` (e.g., `reviews.ts`)
2. Define Zod schemas for request validation
3. Export async function `[domain]Routes(server: FastifyInstance)`
4. Register in `apps/api/src/index.ts` with `await server.register([domain]Routes, { prefix: "/api/[domain]" })`
5. If calling external service, extract logic to `apps/api/src/services/[service].ts`

**New Feature on Web:**
1. Create page: `apps/web/src/app/[path]/page.tsx`
2. If needs layout: `apps/web/src/app/[path]/layout.tsx`
3. Create components in `apps/web/src/components/` (use "use client" for interactivity)
4. Use `lib/api.ts` to call backend endpoints
5. Use NextAuth `useSession()` hook for auth state

**New Database Model:**
1. Add model to `packages/database/prisma/schema.prisma`
2. Run `pnpm db:generate` to update Prisma client
3. Update `packages/types/src/index.ts` with input/response types
4. Create API route in `apps/api/src/routes/` to expose model operations

**Shared Utility:**
1. If backend only: add to `apps/api/src/lib/` (e.g., `nz-locations.ts`)
2. If shared across packages: add to `packages/utils/src/index.ts`
3. If type definitions: add to `packages/types/src/index.ts`

## Special Directories

**`.planning/`:**
- Purpose: GStack planning documents and analysis
- Generated: Yes (created by `/gsd:map-codebase`)
- Committed: Yes (tracked in git for reference)

**`apps/api/uploads/`:**
- Purpose: Local file storage for development (dev only)
- Generated: Yes (created at runtime)
- Committed: No (.gitignore'd)

**`apps/web/.next/`:**
- Purpose: Next.js build cache and compiled output
- Generated: Yes (created by `next build`)
- Committed: No (.gitignore'd)

**`node_modules/` and workspace node_modules:**
- Purpose: Installed dependencies
- Generated: Yes (created by `pnpm install`)
- Committed: No (.gitignore'd)

**`pnpm-lock.yaml`:**
- Purpose: Exact dependency versions (deterministic installs)
- Generated: Yes (auto-generated by pnpm)
- Committed: Yes (should be checked in)

---

*Structure analysis: 2026-03-30*
