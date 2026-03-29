# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Vitest
- Config: Not detected in repository (no explicit `vitest.config.ts`)
- Located in: `apps/api/package.json` lists `vitest` as devDependency

**Assertion Library:**
- Standard Vitest assertions (imported from `vitest`)

**Run Commands:**
```bash
pnpm test                 # Run all tests (workspace)
pnpm run test             # From root (turbo test)
npm run test              # In apps/api app
```

**Project Status:** No test files currently exist in the codebase

## Test File Organization

**Location:**
- Co-located with source code (pattern intended but not yet implemented)
- Expected locations: `*.test.ts`, `*.spec.ts` alongside `*.ts` files

**Naming:**
- Convention: `[filename].test.ts` or `[filename].spec.ts`
- Example (not yet existing): `matching.test.ts` alongside `src/services/matching.ts`

**Structure:**
```
apps/api/src/
├── services/
│   ├── matching.ts
│   ├── matching.test.ts      # Tests should live here
│   └── email.ts
├── routes/
│   ├── wanted-ads.ts
│   └── wanted-ads.test.ts    # Tests for route handlers
└── __tests__/               # Alternative: shared fixtures/mocks
    └── fixtures/
```

## Test Structure

**Suite Organization (Intended Pattern):**

Based on Vitest conventions and API design, test files should follow this pattern:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { functionUnderTest } from "../path/to/function";

describe("Feature Name", () => {
  describe("Specific Behavior", () => {
    it("should do X when given Y input", () => {
      const result = functionUnderTest(input);
      expect(result).toBe(expected);
    });

    it("should handle error case", () => {
      expect(() => functionUnderTest(badInput)).toThrow();
    });
  });
});
```

**Patterns Observed in Codebase Structure:**

Database layer uses Prisma directly with no mocking pattern established.
Routes accept typed requests and return JSON responses - need to mock FastifyInstance and request/reply.
Services use external clients (Resend, Stripe) - these should be mocked in tests.

## Mocking

**Framework:** Not yet configured (no mocking library explicitly required)

**Recommendations for Current Architecture:**

For Fastify route handlers:
```typescript
// Mock server instance
const mockServer = {
  jwt: { sign: vi.fn() },
  log: { error: vi.fn() },
} as unknown as FastifyInstance;

// Mock request/reply
const mockRequest = { body: { email: "test@example.com" } };
const mockReply = {
  status: vi.fn().mockReturnThis(),
  send: vi.fn(),
};
```

For database calls:
- Vitest can mock Prisma Client methods
- Pattern: `vi.mocked(db.user.findUnique).mockResolvedValue(mockUser)`

For external services:
- Mock `Resend` client for email tests
- Mock `Stripe` client for billing tests
- Use `vi.mock()` to mock entire modules

**What to Mock:**
- External API clients (Stripe, Resend)
- Database queries (Prisma ORM)
- Network requests (fetch calls)
- File system operations (if any)

**What NOT to Mock:**
- Pure utility functions (`formatNZD()`, `slugify()`, validators in `packages/utils`)
- Business logic within services (test integration)
- Type definitions and constants

## Fixtures and Factories

**Test Data:**

Current codebase has seed data in `packages/database/prisma/seed.ts` but no test fixtures.

Recommended pattern:
```typescript
// tests/fixtures/users.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "BUYER",
  ...overrides,
});

export const createMockWantedAd = (overrides?: Partial<WantedAd>): WantedAd => ({
  id: "ad-1",
  title: "Looking for a house",
  budget: 500000,
  ...overrides,
});
```

**Location:**
- Recommended: `apps/api/__tests__/fixtures/` for API tests
- Recommended: `apps/web/__tests__/fixtures/` for web tests
- Alternative: Shared at `packages/testing/fixtures/`

## Coverage

**Requirements:** No coverage targets enforced

**View Coverage:**
```bash
vitest run --coverage    # Not yet configured
```

**Recommendation:** Set up coverage reporting with c8 or @vitest/coverage

## Test Types

**Unit Tests:**
- Scope: Individual functions in isolation
- Approach: Mock all dependencies
- Examples to write:
  - Utils functions in `packages/utils/src/index.ts` (high ROI - pure functions)
  - Validation functions: `isValidNZPostcode()`, `isValidEmail()`, `isValidNZPhone()`
  - Formatting functions: `formatNZD()`, `formatAddress()`, `formatRelativeTime()`

**Integration Tests:**
- Scope: Route handlers with mocked database and services
- Approach: Mock external services (Stripe, Resend) but test actual route logic
- Examples to write:
  - Auth routes: `/api/auth/register`, `/api/auth/login`
  - Inquiry creation with matching logic
  - Property matching calculations

**E2E Tests:**
- Framework: Not yet configured (would use Playwright or Cypress)
- Status: Not implemented
- Recommendation: Consider for critical user flows (registration, property inquiry)

## Common Patterns

**Async Testing:**

Example pattern for async functions:
```typescript
it("should fetch and return user data", async () => {
  const mockUser = createMockUser();
  vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

  const result = await getUserById("user-1");

  expect(result).toEqual(mockUser);
  expect(db.user.findUnique).toHaveBeenCalledWith({
    where: { id: "user-1" },
  });
});
```

**Error Testing:**

Example for error handling:
```typescript
it("should handle database errors gracefully", async () => {
  vi.mocked(db.user.findUnique).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await registerUser(mockRequest, mockReply);

  expect(mockReply.status).toHaveBeenCalledWith(500);
  expect(response.error.code).toBe("SERVER_ERROR");
});
```

## Testing Priorities

**High Priority** (Write First):
1. `packages/utils/src/index.ts` - Pure utility functions with no dependencies
   - `formatNZD()`, `formatDate()`, `formatAddress()`
   - Validators: `isValidNZPostcode()`, `isValidEmail()`, `isValidNZPhone()`
   - Format functions: `formatRelativeTime()`, `formatPropertySize()`

2. `apps/api/src/services/matching.ts` - Core business logic
   - `findMatchingPropertiesForWantedAd()` - complex matching algorithm
   - Match score calculations

3. `apps/api/src/routes/auth.ts` - Authentication critical path
   - Register endpoint
   - Login endpoint
   - Token generation

**Medium Priority**:
1. Email service: `apps/api/src/services/email.ts`
   - Template variable substitution logic
   - Error handling for Resend failures

2. Inquiry routes: `apps/api/src/routes/inquiries.ts`
   - Inquiry creation and message handling

**Lower Priority** (After Core):
1. Admin routes (complex but less critical)
2. UI component tests (more manual QA-friendly)
3. Postcard routes (business feature, not core)

## Current Test File Locations

Currently no test files exist. When implementing:

**API Test Files:**
```
apps/api/src/
├── services/
│   ├── matching.test.ts
│   ├── email.test.ts
│   └── stripe.test.ts
├── routes/
│   ├── auth.test.ts
│   ├── inquiries.test.ts
│   ├── wanted-ads.test.ts
│   └── properties.test.ts
└── lib/
    └── nz-locations.test.ts
```

**Web Test Files:**
```
apps/web/src/
├── lib/
│   ├── utils.test.ts
│   ├── api.test.ts
│   └── auth.test.ts
└── components/
    ├── Header.test.tsx
    ├── FilterPanel.test.tsx
    └── browse/
        └── BrowsePageClient.test.tsx
```

## Configuration Gaps

**Not Yet Configured:**
- Test database (SQLite test instance or in-memory database)
- Test environment variables (.env.test)
- Mock service setup (vi.mock patterns)
- Code coverage thresholds
- Pre-commit test hooks
- CI/CD test execution

**Next Steps for Full Test Setup:**
1. Create `vitest.config.ts` files in `apps/api` and `apps/web`
2. Set up test database seeding
3. Create `vi.setup.ts` for global mocks
4. Add coverage configuration and thresholds
5. Document test database vs. production database separation

---

*Testing analysis: 2026-03-30*
