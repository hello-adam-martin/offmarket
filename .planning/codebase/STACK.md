# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- TypeScript 5.7.2 - Used across entire monorepo (web, API, packages)
- JavaScript/Node.js - Runtime for backend and build tools

**Secondary:**
- SQL - Embedded in Prisma ORM for database queries

## Runtime

**Environment:**
- Node.js >= 20 (specified in `package.json` engines field)
- Browser environment for frontend (React 19)

**Package Manager:**
- pnpm 9.14.4 - Workspace monorepo management
- Lockfile: pnpm-lock.yaml present

## Frameworks

**Core:**
- Next.js 15.1.0 - Frontend framework (`apps/web`)
- Fastify 5.1.0 - Backend API framework (`apps/api`)
- React 19.0.0 - UI component framework
- Prisma 6.1.0 - ORM and database schema management (`packages/database`)

**Frontend UI:**
- Tailwind CSS 3.4.16 - Utility-first CSS framework
- Headless UI 2.2.9 - Unstyled, accessible components

**Authentication:**
- NextAuth.js 5.0.0-beta.25 - Session and OAuth management for Next.js
- @fastify/jwt 9.0.1 - JWT token support for Fastify API

**Build & Dev Tools:**
- Turbo 2.3.0 - Monorepo task orchestration and caching
- tsup 8.3.5 - TypeScript bundler for packages
- tsx 4.19.2 - TypeScript executor for Node.js scripts
- Vite/Vitest 2.1.8 - Testing framework for API

**Plugins & Middleware:**
- @fastify/cors 10.0.1 - CORS support
- @fastify/helmet 12.0.1 - Security headers
- @fastify/rate-limit 10.2.0 - Rate limiting
- @fastify/multipart 9.3.0 - File upload handling
- @fastify/static 8.3.0 - Static file serving

## Key Dependencies

**Critical:**
- stripe 20.0.0 - Payment processing and subscription management
- resend 6.6.0 - Email sending service
- zod 3.24.1 - Schema validation (used in API routes)

**Infrastructure:**
- @vercel/blob 2.0.0 - File storage for production uploads
- @prisma/client 6.1.0 - Database client
- pino-pretty - Formatted logging in development

**Frontend Utilities:**
- @stripe/react-stripe-js 5.4.1 - Stripe UI integration for React
- @stripe/stripe-js 8.5.3 - Stripe.js client library

**Type Safety:**
- @types/node 22.10.2 - Node.js type definitions
- @types/react 19.0.1 - React type definitions
- @types/react-dom 19.0.1 - React DOM type definitions
- @types/google.maps 3.58.1 - Google Maps API types

**Linting & Code Quality:**
- eslint 9.39.1 - Linting tool
- @typescript-eslint/eslint-plugin 8.49.0 - TypeScript linting rules
- @typescript-eslint/parser 8.49.0 - TypeScript parser for ESLint
- eslint-config-next 16.0.8 - Next.js ESLint configuration
- eslint-plugin-react 7.37.5 - React linting rules
- eslint-plugin-react-hooks 7.0.1 - React Hooks linting rules

**PostCSS Processing:**
- postcss 8.4.49 - CSS transformation
- autoprefixer 10.4.20 - Vendor prefix handling

## Configuration

**Environment:**
- Configuration via environment variables (process.env)
- Turbo reads from `.env.*local` files (see turbo.json)
- Database connection via `DATABASE_URL` env var
- Critical services disabled gracefully if env vars not set:
  - Stripe: Falls back to `null` if `STRIPE_SECRET_KEY` not configured
  - Resend: Falls back to `null` if `RESEND_API_KEY` not configured

**Key Environment Variables:**
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

**Build:**
- TypeScript base configuration: `tsconfig.base.json`
- Next.js configuration: `apps/web/next.config.ts`
- Turbo pipeline configuration: `turbo.json`
- No ESLint or Prettier config files found in root

## Database

**Type:** SQLite (via Prisma)
- File-based database suitable for development
- Location: `prisma/dev.db` (see db reset script in `packages/database/package.json`)

**ORM:** Prisma 6.1.0
- Schema: `packages/database/prisma/schema.prisma`
- Migrations: Managed via `prisma migrate` and `prisma db push`
- Seed: TypeScript seed script at `prisma/seed.ts`

## Platform Requirements

**Development:**
- Node.js >= 20
- pnpm 9.14.4
- SQLite support (built-in with Prisma)

**Production:**
- Node.js >= 20
- External database (SQLite file or compatible database)
- Vercel Blob for file storage
- Stripe account for payments
- Resend account for email
- Google OAuth credentials for authentication

---

*Stack analysis: 2026-03-30*
