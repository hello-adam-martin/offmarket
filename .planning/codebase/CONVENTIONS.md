# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Header.tsx`, `FilterPanel.tsx`, `BrowsePageClient.tsx`)
- Utils/services: camelCase (e.g., `utils.ts`, `email.ts`, `matching.ts`)
- Routes: kebab-case with descriptive names (e.g., `wanted-ads.ts`, `saved-searches.ts`)
- Pages/page routes: Follow Next.js convention (e.g., `page.tsx`, `[address]/page.tsx`)
- Index files: `index.ts` used for barrel exports in component directories (`browse/index.ts`)

**Functions:**
- camelCase for all function declarations
- Async functions prefixed with descriptive verbs: `findMatchingPropertiesForWantedAd()`, `sendEmail()`, `createInquiry()`
- Event handlers use `handle` prefix: `handlePropertyTypeToggle()`, `fetchUnreadCount()`
- Schema validators prefix with `create`, `update`, `send`: `createInquirySchema`, `loginSchema`
- API endpoints follow RESTful naming: `/api/auth/register`, `/api/properties/me`, `/api/inquiries/{id}/messages`

**Variables:**
- camelCase for all variables and constants
- Boolean prefixes: `has`, `is`, `should`, `can` (e.g., `hasActiveFilters`, `isDirectAddressMatch`)
- Collections/arrays: plural names (e.g., `matchResults`, `properties`, `regionCounts`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_FROM`, `BEDROOM_OPTIONS`, `NZ_REGIONS`)
- Private/internal: prefix with underscore or use closure scope (e.g., `_ignorePattern`)

**Types:**
- Interface names: PascalCase with `I` prefix optional (patterns show both `ApiResponse`, `SendEmailOptions`, `MatchResult`)
- Enum-like types: `type` keyword with union of string literals (e.g., `type PropertyType = "HOUSE" | "APARTMENT"`)
- Type parameters in generics: Single uppercase letter (e.g., `<T>`, `<K>`)
- Input types suffix with `Input` (e.g., `CreateWantedAdInput`, `UpdatePropertyInput`)
- Response types suffix with `Summary` or no suffix depending on context (e.g., `WantedAdSummary`, `PropertyDemand`)

## Code Style

**Formatting:**
- No explicit formatter configured (prettier not in use)
- Implied style: 2-space indentation (visible in compiled code)
- Line length: No strict limit detected, but files kept under 100 lines where possible
- Import ordering: Not strictly enforced but follows pattern of framework imports → internal imports

**Linting:**
- ESLint configured for TypeScript with plugins for React and React Hooks
- Configuration: `eslint.config.mjs` (flat config format)
- Base rules applied per-app (web and api have separate configs)

**Web App Linting Rules** (`apps/web/eslint.config.mjs`):
```
- @typescript-eslint/no-unused-vars: error (with argsIgnorePattern: "^_", varsIgnorePattern: "^_")
- @typescript-eslint/no-explicit-any: warn
- react-hooks/exhaustive-deps: warn
- react-hooks/rules-of-hooks: error
- react/jsx-key: error
- react/no-unescaped-entities: warn
```

**API Linting Rules** (`apps/api/eslint.config.mjs`):
```
- @typescript-eslint/no-unused-vars: error (with argsIgnorePattern: "^_", varsIgnorePattern: "^_")
- @typescript-eslint/no-explicit-any: warn
- no-console: warn (with allow: ["warn", "error"])
```

## Import Organization

**Order:**
1. Framework/library imports (React, Next.js, Fastify, etc.)
2. External dependencies (z, db, stripe, etc.)
3. Type imports (type { FastifyInstance }, type { ApiResponse })
4. Relative imports with path aliases (`@/` for web, `../` for api)
5. Named exports, default exports, wildcard imports

**Path Aliases:**
- Web app uses `@/` (e.g., `@/components/header`, `@/lib/utils`, `@/lib/constants`)
- API uses relative paths with `.js` extensions for ESM (e.g., `./routes/auth.js`, `../services/email.js`)
- Monorepo workspace packages referenced as `@offmarket/database`, `@offmarket/types`, `@offmarket/utils`

## Error Handling

**Pattern:**
- Try-catch blocks used throughout for database and external service calls
- Validation errors use Zod's `safeParse()` method before accessing data
- HTTP responses follow consistent shape: `{ success: boolean, data?: T, error?: { code: string, message: string, details?: ... } }`
- Service methods return objects with `{ success: boolean, error?: string }` (see `sendEmail()`)
- Fastify reply status codes set explicitly: `reply.status(400)`, `reply.status(404)`, `reply.status(503)`
- React components handle promise rejections silently with empty catch blocks when non-critical (see `fetchUnreadCount()`)

**Example Error Response** (from `apps/api/src/routes/auth.ts`):
```typescript
if (!body.success) {
  return reply.status(400).send({
    success: false,
    error: { code: "VALIDATION_ERROR", message: body.error.message },
  });
}
```

## Logging

**Framework:** Fastify's built-in logger via `server.log`

**Patterns:**
- Errors: `server.log.error(error)` (see `apps/api/src/routes/auth.ts`)
- Console for development: `console.log()`, `console.warn()` used for email service logs
- Log prefixes used: `[Email]` for email service operations (see `apps/api/src/services/email.ts`)
- Conditional logging based on `NODE_ENV` (development shows `query` logs, production shows errors only)
- Silent failures in client components (no console spam for network errors)

## Comments

**When to Comment:**
- JSDoc comments for exported functions with @param, @returns tags
- Comments before complex business logic sections (e.g., location matching in `matching.ts`)
- Section headers with separator lines: `// ============================================================================`
- TODO/FIXME for known issues marked with descriptive text (see `apps/api/src/routes/postcards.ts`)

**JSDoc/TSDoc:**
- Used for public API functions
- Example from `apps/web/src/lib/utils.ts`:
```typescript
/**
 * Safely parse JSON arrays that may come as strings from SQLite.
 * SQLite doesn't support array types, so we store them as JSON strings.
 */
export function parseJsonArray(value: unknown): string[] {
```

## Function Design

**Size:** Aim for single responsibility; largest route handlers ~200 lines but split by concern

**Parameters:**
- Use object parameters for functions with 2+ arguments (see `sendEmail(options)`)
- Type function parameters explicitly with interfaces or type aliases
- Destructure parameters in function signatures when beneficial

**Return Values:**
- Async functions return typed Promises: `Promise<MatchResult[]>`, `Promise<{ success: boolean; error?: string }>`
- API handlers return serializable objects or use `reply.send()` for Fastify
- Utility functions return primitives or objects matching their purpose

**Example Function Pattern** (from `apps/api/src/services/matching.ts`):
```typescript
export async function findMatchingPropertiesForWantedAd(
  wantedAdId: string
): Promise<MatchResult[]> {
  // Implementation...
  return matchResults;
}
```

## Module Design

**Exports:**
- Named exports preferred for functions and types
- Default exports only for page components in Next.js
- Barrel files (`index.ts`) re-export components for cleaner imports (see `apps/web/src/components/browse/index.ts`)

**Barrel Files:**
- Used in component directories: `export { BrowsePageClient } from "./BrowsePageClient"`
- Located at: `apps/web/src/components/browse/index.ts`
- Enables: `import { BrowsePageClient } from "@/components/browse"`

**Module Organization:**
- API routes: one file per resource (e.g., `wanted-ads.ts`, `properties.ts`)
- Services: utility modules (e.g., `email.ts`, `matching.ts`, `stripe.ts`)
- Web components: one component per file with supporting types
- Types: centralized in `packages/types/src/index.ts` with clear section headers

## TypeScript Configuration

**Base Config** (`tsconfig.base.json`):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

**Strictness:**
- `strict: true` enables all strict checks
- `noUncheckedIndexedAccess: true` prevents unsafe array/object access
- `noImplicitOverride: true` requires explicit `override` keyword in class inheritance
- `forceConsistentCasingInFileNames: true` prevents case sensitivity bugs

---

*Convention analysis: 2026-03-30*
