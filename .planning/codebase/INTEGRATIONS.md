# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Payment Processing:**
- Stripe - Payment processing, subscriptions, and escrow management
  - SDK/Client: `stripe` v20.0.0
  - Auth: `STRIPE_SECRET_KEY` environment variable
  - Used in: `apps/api/src/services/stripe.ts`, `apps/web/src/components/PaymentModal.tsx`
  - Features: Subscriptions (Pro tier), payment intents for deposits, customer portal

**Email Service:**
- Resend - Email delivery service
  - SDK/Client: `resend` v6.6.0
  - Auth: `RESEND_API_KEY` environment variable
  - Used in: `apps/api/src/services/email.ts`
  - Features: Template-based email sending with variable substitution
  - Gracefully degrades to null if not configured

**Authentication & Identity:**
- Google OAuth - Third-party authentication provider
  - Provider: NextAuth.js Google provider
  - Auth: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
  - Used in: `apps/web/src/lib/auth.ts`
  - Features: OAuth 2.0 sign-in integration

**Maps & Location:**
- Google Maps API (types only)
  - SDK/Client: `@types/google.maps` v3.58.1
  - Used for: Type definitions only (actual integration likely in frontend components)

## Data Storage

**Databases:**
- SQLite (via Prisma)
  - Connection: `DATABASE_URL` environment variable
  - Client: `@prisma/client` v6.1.0
  - Schema location: `packages/database/prisma/schema.prisma`
  - Features: User profiles, properties, wanted ads, inquiries, billing data, email templates

**File Storage:**
- Production: Vercel Blob
  - SDK: `@vercel/blob` v2.0.0
  - Used in: `apps/api/src/services/upload.ts`
  - Purpose: Store property images and user uploads
  - Implementation: `put()` for uploads, `del()` for deletion
  - Access: Public file access with automatic URL generation

- Development: Local filesystem
  - Directory: `./uploads` (configurable via `LOCAL_UPLOAD_DIR`)
  - Implementation: Node.js `fs` module in `apps/api/src/services/upload.ts`
  - File limit: 10MB per file
  - Allowed types: JPEG, PNG, WebP, HEIC

**Caching:**
- In-memory: Billing settings cache with 60-second TTL
  - Location: `apps/api/src/services/stripe.ts`
  - Function: `getBillingSettings()` with cache invalidation

## Authentication & Identity

**Auth Provider:**
- Custom multi-provider (NextAuth.js)
  - Providers: Google OAuth + Email/Credentials
  - Implementation: `apps/web/src/lib/auth.ts`
  - Session: Database-backed sessions via NextAuth

**Auth Flow:**
1. User signs in via Google or Email
2. NextAuth.js validates with provider
3. JWT callback synchronizes user with API
4. API registration endpoint: `POST /api/auth/register`
5. Session includes user ID and API token
6. API validates requests via JWT middleware (`@fastify/jwt`)

**Credentials Provider:**
- Email-based authentication (development)
- Calls API endpoint: `POST /api/auth/register`
- Returns JWT token stored in session
- Used for both new registrations and existing user logins

## Monitoring & Observability

**Error Tracking:**
- None detected - errors logged to stdout/console

**Logs:**
- Pino logger in Fastify with pretty formatting in development
  - Config: `apps/api/src/index.ts`
  - Level: `process.env.LOG_LEVEL` (defaults to "info")
  - Pretty printing enabled in development only
  - Prefix convention: `[Service]`, e.g., `[Stripe]`, `[Email]`, `[Escrow]`

**Structured Logging:**
- Manual console logging throughout codebase
- Service-specific prefixes for filtering

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured - appears designed for Vercel (Next.js) + Node.js host
- Uses `NEXT_PUBLIC_` prefix for frontend env vars
- API runs on configurable port (default 4000)
- Frontend: Next.js production build with `next build` + `next start`
- API: Node.js with `node dist/index.js`

**Build Process:**
- Turbo orchestrates monorepo builds
- Tasks: `build`, `dev`, `lint`, `test`
- Build caching via Turbo for performance

## Environment Configuration

**Required env vars for Production:**
- `DATABASE_URL` - SQLite file path or database connection string
- `STRIPE_SECRET_KEY` - Stripe API secret for payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
- `STRIPE_PRO_PRICE_ID` - Stripe monthly subscription product price ID
- `STRIPE_PRO_YEARLY_PRICE_ID` - Stripe yearly subscription price ID (if enabled)
- `RESEND_API_KEY` - Resend email API key
- `EMAIL_FROM` - Email sender address
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_API_URL` - Backend API URL accessible from browser (e.g., https://api.example.com)
- `JWT_SECRET` - Secret for API JWT token signing (must be secure in production)
- `CORS_ORIGIN` - Comma-separated list of allowed CORS origins
- `NODE_ENV` - Set to "production" for production deployments

**Secrets location:**
- Environment variables only - no `.env` files in repository
- Use platform-provided secrets management (Vercel, Docker, K8s, etc.)

**Optional env vars:**
- `LOG_LEVEL` - Pino log level (defaults to "info")
- `PORT` - API server port (defaults to 4000)
- `HOST` - API server host (defaults to 0.0.0.0)
- `LOCAL_UPLOAD_DIR` - Development file upload directory (defaults to "./uploads")

## Webhooks & Callbacks

**Incoming Webhooks:**
- Stripe Event Webhooks
  - Endpoint: `POST /api/webhooks/stripe`
  - Events handled: `customer.subscription.*` events
  - Signature verification: `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`
  - Raw body required for verification (Fastify custom parser in `apps/api/src/index.ts`)
  - Used in: `apps/api/src/routes/webhooks.ts`

**Outgoing Webhooks/Callbacks:**
- None detected - application receives webhooks only

## Rate Limiting

**API Rate Limiting:**
- Fastify rate limit plugin: `@fastify/rate-limit` v10.2.0
- Configuration: 100 requests per minute per connection
- Applies globally to all API routes
- Config location: `apps/api/src/index.ts`

## Security Headers

**HTTP Security:**
- Fastify helmet plugin: `@fastify/helmet` v12.0.1
- Provides standard security headers (CSP, X-Frame-Options, etc.)
- Applied globally to all API responses

**CORS:**
- Fastify CORS plugin: `@fastify/cors` v10.0.1
- Origin controlled via `CORS_ORIGIN` env var
- Credentials enabled for authenticated requests
- Default in development: `http://localhost:3000`

---

*Integration audit: 2026-03-30*
