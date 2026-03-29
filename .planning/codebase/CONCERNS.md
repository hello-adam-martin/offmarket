# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Email Notifications - Incomplete Implementation:**
- Issue: Multiple TODO comments marking missing email notification features in postcard workflows
- Files: `apps/api/src/routes/admin.ts` (lines 944, 1001-1002, 1047, 1138-1139), `apps/api/src/routes/postcards.ts` (lines 298, 790)
- Impact: Postcard approvals, rejections, delivery confirmations, and failures do not notify users. This creates a poor UX where buyers don't know their postcard status and owners don't receive important transaction confirmations.
- Fix approach: Implement sendEmail calls in each TODO location with appropriate template names (e.g., "postcard_approved", "postcard_rejected", "postcard_sent", "postcard_delivered", "postcard_failed"). Use existing email service pattern from `apps/api/src/services/email.ts`.

**Type Safety - Excessive Use of `as any`:**
- Issue: Widespread use of `as any` type assertions (50+ occurrences) circumventing TypeScript's safety guarantees
- Files: `apps/api/src/index.ts` (46 on line), `apps/api/src/routes/admin.ts` (121, 483, 807, 1149), `apps/api/src/routes/auth.ts` (118), `apps/api/src/routes/billing.ts` (77), `apps/api/src/routes/inquiries.ts` (210, 573), `apps/api/src/services/stripe.ts` (85), `apps/web/src/lib/auth.ts` (50, 79), `apps/web/src/app/wanted/[id]/page.tsx` (116)
- Impact: Loss of compile-time type checking makes refactoring risky and allows type errors to reach runtime. Particularly problematic in auth flows and API response handling where type safety matters most.
- Fix approach: Create proper TypeScript interfaces for Fastify request/response augmentation, API response types, and session objects. Remove all `as any` assertions by establishing correct types upstream.

**Unsafe JSON Parsing Without Error Handling:**
- Issue: 13+ instances of uncaught `JSON.parse()` calls on database fields that could contain invalid JSON
- Files: `apps/api/src/services/matching.ts` (lines 42, 45, 175, 332, 340, 342, 496, 505, 507), `apps/api/src/routes/wanted-ads.ts` (properties/features/propertyTypes parsing), `apps/api/src/routes/properties.ts`, `apps/api/src/routes/saved-searches.ts`, `apps/api/src/routes/matches.ts`
- Impact: If any stored JSON field becomes corrupted or malformed, the application crashes without graceful degradation. This can cascade through the matching system.
- Fix approach: Wrap all JSON.parse calls in try-catch blocks with fallback values (empty arrays/objects). Create utility function `safeJsonParse<T>(json: string | null, fallback: T): T` to enforce consistency.

**Raw Body Processing - Security Risk:**
- Issue: Raw request body is manually extracted and stored on request object for webhook signature verification
- Files: `apps/api/src/index.ts` (lines 46)
- Impact: Non-standard pattern that could lead to double-parsing, buffer corruption, or signature validation bypass if not maintained carefully.
- Fix approach: Use Fastify's native `onRequest` hook or dedicated webhook middleware that preserves raw body safely. Avoid manual buffer manipulation.

## Known Bugs

**Postcard Payment Refund Not Implemented:**
- Symptoms: When a postcard is rejected or fails, TODO comments indicate refund should be triggered but it's not implemented
- Files: `apps/api/src/routes/admin.ts` (lines 1001, 1138)
- Trigger: Admin rejects a postcard or marks it as failed after buyer paid for it
- Workaround: None - manual refund via Stripe dashboard required
- Impact: Users who paid for postcards that fail don't get refunded automatically, creating compliance and trust issues.

**Console Logging in Production:**
- Symptoms: Extensive use of `console.log()`, `console.error()`, `console.warn()` for logging
- Files: `apps/api/src/index.ts`, `apps/api/src/services/matching.ts` (3 occurrences), `apps/api/src/services/email.ts` (6 occurrences), `apps/api/src/routes/postcards.ts`, `apps/api/src/routes/billing.ts`, `apps/api/src/routes/webhooks.ts`, `apps/api/src/jobs/escrow-expiry.ts`
- Impact: No structured logging, no log aggregation possible, difficult to trace errors in production, logs pollute stdout/stderr
- Fix approach: Replace console methods with a proper logger (e.g., pino, winston, or Fastify's built-in logger). Use `server.log` where available.

## Security Considerations

**Unvalidated JSON in Database Fields:**
- Risk: Features, propertyTypes stored as JSON strings without schema validation. Admin can inject arbitrary JSON via API.
- Files: `apps/api/src/routes/admin.ts` (billing settings storage), `packages/database/prisma/schema.prisma` (propertyTypes, features, boundaryGeoJson columns)
- Current mitigation: Basic Zod validation on API input, but admin settings bypass strict validation
- Recommendations: Use Zod schemas to validate JSON structure before parsing. Store features/property types as normalized enums instead of JSON strings where possible. Implement JSON schema validation for admin-editable settings.

**API Token Exposure in Session:**
- Risk: API tokens stored in NextAuth session and passed in Authorization headers. Token visible in client-side memory if XSS occurs.
- Files: `apps/web/src/lib/auth.ts` (lines 50, 79), `apps/web/src/app/wanted/[id]/page.tsx` (line 116)
- Current mitigation: Tokens are marked as secret in session config, but still accessible to client code
- Recommendations: Never expose API tokens to frontend. Use httpOnly cookies for auth instead, letting server handle API calls. If frontend must call API, use session-based auth with backend-managed tokens.

**No Rate Limiting on Public Endpoints:**
- Risk: Public endpoints for wanted ads, matches, and search have no rate limits. DDoS vector or API scraping possible.
- Files: `apps/api/src/routes/wanted-ads.ts` (public GET endpoints), `apps/api/src/routes/matches.ts`, `apps/api/src/routes/saved-searches.ts`
- Current mitigation: None detected
- Recommendations: Implement rate limiting middleware (e.g., `@fastify/rate-limit`) on public endpoints. Set per-IP limits and per-user limits for authenticated endpoints.

**Stripe Webhook Signature Not Validated:**
- Risk: Webhook endpoint signature validation critical for payment security. If `raw_body` extraction fails, signature check bypasses.
- Files: `apps/api/src/routes/webhooks.ts`
- Current mitigation: Raw body stored for verification, but dependency on manual buffer handling
- Recommendations: Use official Stripe Fastify middleware if available, or validate raw body extraction is never skipped. Add integration tests that verify signature validation rejects invalid payloads.

**Admin Role Checked Per-Request:**
- Risk: Admin middleware queries database for every admin endpoint call. No caching of role checks. If user role changes mid-request, inconsistent behavior possible.
- Files: `apps/api/src/routes/admin.ts` (lines 8-22, requireAdmin middleware)
- Current mitigation: Role check executes before each route handler
- Recommendations: Cache admin role in session/JWT payload with expiration. Validate against session role rather than querying DB each time.

## Performance Bottlenecks

**Full Property Load in Matching Algorithm:**
- Problem: Matching service loads ALL properties into memory, then filters in JavaScript
- Files: `apps/api/src/services/matching.ts` (line 33: `db.property.findMany()` without where clause)
- Cause: SQLite doesn't support complex location matching, so entire table loaded. As property count grows, this becomes O(n) per wanted ad creation.
- Improvement path: Pre-index properties by region/suburb. Use pagination or batching. Consider separate read model optimized for matching queries. Set warning threshold at 10k+ properties.

**Matching Algorithm Linear in Properties Count:**
- Problem: For every wanted ad created, all properties are iterated (line 48: `for (const property of properties)`). Matching creates O(n) database calls.
- Files: `apps/api/src/services/matching.ts` (lines 48-204, 335-450)
- Cause: No batch processing, no indexing on match conditions
- Improvement path: Pre-filter properties before loop using database queries. Implement async batch processing for large match operations. Add query indexes on commonly matched fields.

**Billing Settings Cached With Hardcoded 1-Minute TTL:**
- Problem: Global cache for billing settings (stripe.ts line 63: CACHE_TTL_MS = 60000) means admin setting changes have up to 60s delay to propagate
- Files: `apps/api/src/services/stripe.ts` (lines 60-95)
- Cause: Simple time-based cache with no invalidation
- Improvement path: Implement cache invalidation on admin endpoint that updates settings (currently missing). Use event-based invalidation or call `clearBillingSettingsCache()` after updates.

**Large Page Components Without Code Splitting:**
- Problem: Single-file components >800 lines with all UI rendered synchronously
- Files: `apps/web/src/app/wanted/[id]/page.tsx` (889 lines), `apps/web/src/app/buyer/create/page.tsx` (766 lines), `apps/web/src/app/admin/billing/settings/page.tsx` (823 lines)
- Cause: All features (display, editing, postcard UI) in one component
- Improvement path: Split into smaller components. Use React.lazy() for non-critical sections. Move admin settings to separate app route.

## Fragile Areas

**Wanted Ad Creation - Race Condition Risk:**
- Files: `apps/api/src/routes/wanted-ads.ts` (lines 854-895)
- Why fragile: Limit check (count query) followed by create is not atomic. Between count and create, another request could create an ad, violating limit.
- Safe modification: Use database transaction or unique constraint + retry logic. Or implement queue-based ad creation with semaphore.
- Test coverage: No test for concurrent wanted ad creation near limit

**Escrow Payment Confirmation Without Idempotency:**
- Files: `apps/api/src/routes/billing.ts` (lines 461-600)
- Why fragile: Confirming escrow payment creates deposit record after Stripe confirmation. If DB write fails but payment succeeded, resubmitting creates duplicate deposits.
- Safe modification: Use Stripe payment intent ID as unique key. Query for existing deposit before create. Make endpoint idempotent.
- Test coverage: No test for duplicate confirm calls

**Admin Postcard Actions Without Transaction Boundary:**
- Files: `apps/api/src/routes/admin.ts` (lines 930-1050)
- Why fragile: Updating postcard status, then triggering refund/notification are separate operations. If notification fails, postcard is marked as sent but buyer never notified.
- Safe modification: Wrap status update and email send in transaction. Store notification state. Add retry queue for failed notifications.
- Test coverage: No tests for notification failures

**User Subscription State Inconsistency:**
- Files: `apps/api/src/services/stripe.ts`, `apps/api/src/routes/billing.ts`
- Why fragile: User subscription fetched from Stripe on-demand, but local database may be out of sync. Race condition if Stripe state changes during request.
- Safe modification: Sync subscription state periodically via webhook. Cache with short TTL and document assumptions.
- Test coverage: Gaps in webhook tests for subscription updates

## Scaling Limits

**SQLite Database Constraint:**
- Current capacity: SQLite suitable for <1M rows across all tables. After ~100k properties or 500k matched pairs, query performance degrades.
- Limit: Concurrent writes bottleneck appears around 10 simultaneous requests due to locking.
- Scaling path: Migrate to PostgreSQL before production launch. Update Prisma schema provider. Set up read replicas for analytics queries.

**In-Memory Settings Cache Doesn't Scale:**
- Current capacity: Works fine for <100 settings. Cache key space is global, not per-region or per-tenant.
- Limit: No cache warming or distributed cache support.
- Scaling path: Move to Redis cache. Implement cache tags for selective invalidation. Add monitoring for cache hit rates.

**Webhook Queue Not Implemented:**
- Current capacity: Email sends, notifications, and external API calls execute synchronously in HTTP request. Slow operations timeout.
- Limit: If email service is slow, user waits 5-10s for response. Stripe webhooks may fail if processing takes >5s.
- Scaling path: Implement job queue (Bull, BullMQ, or similar) for notifications. Move emails to async queue. Add retry logic with exponential backoff.

## Dependencies at Risk

**Resend Email Service Optional:**
- Risk: Email sending gracefully degrades to console log if RESEND_API_KEY not set. Could silently lose notifications in production if key invalid.
- Impact: Users don't receive confirmation emails, password resets, or inquiry responses.
- Migration plan: Make email mandatory in production. Use environment validation at startup to fail fast if Resend not configured. Implement email queuing as fallback.

**Stripe SDK - Manual Error Handling:**
- Risk: Stripe SDK errors are caught broadly, then logged. No retry logic for transient errors.
- Impact: Network hiccup during payment processing fails permanently instead of retrying.
- Migration plan: Implement Stripe error handling library. Add exponential backoff for retryable errors (e.g., network timeouts). Test failure scenarios.

**Next.js useEffect Data Fetching (Frontend):**
- Risk: Frontend pages fetch data in useEffect without cancel token. Stale data from previous navigation can overwrite new data.
- Impact: User navigates between wanted ads quickly, data gets mixed up.
- Migration plan: Use React.useCallback with dependency arrays. Implement AbortController to cancel in-flight requests on unmount.

## Missing Critical Features

**Audit Logging:**
- Problem: No audit trail for admin actions, payment operations, or user data changes
- Blocks: Cannot investigate suspicious account behavior, disputes, or compliance violations
- Impact: High - required for financial compliance, especially with escrow handling

**Email Template Management UI:**
- Problem: Email templates are database records but can only be edited via admin SQL endpoint. No form UI.
- Blocks: Non-technical admins cannot update email copy without developer help
- Impact: Medium - slows down customer communication updates

**Webhook Retry Logic:**
- Problem: Failed Stripe webhooks are dropped. No queue or retry mechanism.
- Blocks: Subscription state can permanently diverge from Stripe if webhook delivery fails
- Impact: High - data integrity risk for billing

**Request Logging/Tracing:**
- Problem: No correlation IDs for request tracing. Hard to debug multi-step failures.
- Blocks: Production debugging and performance analysis
- Impact: High - operational visibility critical at scale

## Test Coverage Gaps

**Concurrent Request Handling:**
- What's not tested: Wanted ad creation with simultaneous requests hitting limit. Escrow creation race conditions.
- Files: `apps/api/src/routes/wanted-ads.ts`, `apps/api/src/routes/billing.ts`
- Risk: Limits can be exceeded, duplicate escrows created, or race conditions cause data corruption
- Priority: High

**Email Notification Failures:**
- What's not tested: Behavior when email service is down. Notification retries. Email template not found.
- Files: `apps/api/src/services/email.ts`, route handlers calling sendEmail
- Risk: Failures silently logged, users never notified. No visibility into failed emails.
- Priority: High

**Stripe Webhook Signature Validation:**
- What's not tested: Invalid signatures rejected. Tampered payloads detected. Raw body corruption scenarios.
- Files: `apps/api/src/routes/webhooks.ts`
- Risk: Malicious webhook payloads could create fraudulent payments or refunds
- Priority: Critical

**Financial Operations:**
- What's not tested: Escrow deposit creation, release, refund flows. Edge cases like payment intent timeout. Fees calculated correctly.
- Files: `apps/api/src/services/stripe.ts`, `apps/api/src/routes/billing.ts`
- Risk: Money flow errors, incorrect fee calculations, or phantom charges
- Priority: Critical

**Matching Algorithm:**
- What's not tested: Large dataset performance. Edge cases with missing/null fields. Duplicate matches. Score accuracy.
- Files: `apps/api/src/services/matching.ts`
- Risk: Inaccurate matches create poor UX, performance degradation with scale
- Priority: High

**Frontend Auth Flow:**
- What's not tested: Token refresh on expiry. Session invalidation on logout. API token in localStorage security.
- Files: `apps/web/src/lib/auth.ts`
- Risk: Users stay logged in after password change, or lose session unexpectedly
- Priority: High

---

*Concerns audit: 2026-03-30*
