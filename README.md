# OffMarket NZ

A reverse real estate marketplace for New Zealand. Instead of browsing listed homes, buyers create "wanted" ads for specific properties or neighborhoods, creating a waiting list of demand that owners can view to see how much interest exists for their unlisted property.

## Core Concept

- **"The Waiting List for Homes"**: Solves the problem of low inventory by allowing buyers to register interest in properties that aren't officially on the market yet.
- **Privacy First**: Owners can see that buyers exist and what their budgets are, without the property being publicly listed.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **API** | Fastify (TypeScript) - REST API, mobile-ready |
| **Web** | Next.js 15, React 19, Tailwind CSS |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (web) + JWT (API) |

## Project Structure

```
offmarket/
├── apps/
│   ├── api/                 # Fastify REST API server
│   │   └── src/
│   │       ├── index.ts     # Server entry point
│   │       └── routes/      # API route handlers
│   └── web/                 # Next.js web application
│       └── src/
│           ├── app/         # Next.js app router pages
│           ├── components/  # React components
│           └── lib/         # Utilities (auth, api client)
├── packages/
│   ├── database/            # Prisma schema & client
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utility functions
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root package.json
```

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment files
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Generate Prisma client & create database
pnpm db:generate
pnpm db:push

# 4. Seed database with test data
pnpm db:seed

# 5. Start development servers
pnpm dev
```

This starts:
- **API**: http://localhost:4000
- **Web**: http://localhost:3000

## Test Accounts

After seeding, you can sign in with these test accounts:

| Email | Name | Role |
|-------|------|------|
| sarah@example.com | Sarah Johnson | Buyer |
| mike@example.com | Mike Chen | Buyer |
| emma@example.com | Emma Wilson | Buyer |
| james@example.com | James Smith | Owner |
| lisa@example.com | Lisa Brown | Owner |

To sign in:
1. Go to http://localhost:3000/auth/signin
2. Enter any email above (e.g., `sarah@example.com`)
3. Click "Sign in with Email"

The seed data includes:
- 5 users (3 buyers, 2 owners)
- 5 wanted ads with various property criteria
- 4 properties in Auckland and Wellington
- 4 property matches
- 1 inquiry with messages

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)

No database server needed for development - SQLite runs as a local file.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run linting across all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database with test data |
| `pnpm db:reset` | Reset database and re-seed |
| `pnpm clean` | Clean all build artifacts and node_modules |

## Database Management

### Development (SQLite)

The development database is a single file at `packages/database/prisma/dev.db`.

```bash
# View/edit data in browser
pnpm db:studio

# Reset database and seed with test data
pnpm db:reset

# After schema changes
pnpm db:push      # Quick sync (dev only)
pnpm db:generate  # Regenerate client
```

### Production (PostgreSQL)

To switch to PostgreSQL:

1. Update `packages/database/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in your environment:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/offmarket"
   ```

3. Run migrations:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

## Features

### For Buyers
- Create "wanted" ads with property criteria
- Specify location (suburb, city, region, or specific address)
- Set budget range visible to property owners
- Choose property types (house, apartment, townhouse, etc.)
- List desired features (garage, pool, sea view, etc.)
- Receive notifications when owners express interest

### For Property Owners
- Register properties privately (not publicly listed)
- Check demand for your property/area instantly
- View anonymized buyer budgets and requirements
- See match scores showing compatibility
- Reach out to interested buyers on your terms

### Privacy Model
| What Buyers See | What Owners See |
|-----------------|-----------------|
| Area matches (suburb/city) | Demand count for their property |
| Property characteristics | Anonymized buyer budgets |
| No owner contact details | Match scores and criteria |
| Owner initiates contact | Buyer interest areas |

## API Endpoints

### Health
```
GET  /api/health          # Server health check
GET  /api/health/db       # Database connection check
```

### Authentication
```
POST /api/auth/register   # Register/login user
POST /api/auth/login      # Login existing user
GET  /api/auth/me         # Get current user (protected)
```

### Wanted Ads
```
GET    /api/wanted-ads          # List all wanted ads (public)
GET    /api/wanted-ads/:id      # Get wanted ad details
POST   /api/wanted-ads          # Create wanted ad (protected)
PATCH  /api/wanted-ads/:id      # Update wanted ad (protected)
DELETE /api/wanted-ads/:id      # Delete wanted ad (protected)
GET    /api/wanted-ads/me/ads   # Get my wanted ads (protected)
```

### Properties
```
POST   /api/properties              # Register property (protected)
GET    /api/properties/me           # Get my properties (protected)
GET    /api/properties/:id/demand   # View demand for property (protected)
GET    /api/properties/check-demand # Public demand check (limited info)
PATCH  /api/properties/:id          # Update property (protected)
DELETE /api/properties/:id          # Delete property (protected)
```

### Matches
```
POST /api/matches/property/:id/calculate  # Calculate matches (protected)
GET  /api/matches/wanted-ad/:id           # Get matches for wanted ad (protected)
```

### Inquiries
```
POST   /api/inquiries                # Start inquiry (protected)
GET    /api/inquiries/me             # Get my inquiries (protected)
GET    /api/inquiries/:id            # Get inquiry details (protected)
POST   /api/inquiries/:id/messages   # Send message (protected)
PATCH  /api/inquiries/:id/status     # Update inquiry status (protected)
```

## Environment Variables

### Database (`packages/database/.env`)
```bash
# SQLite (development)
DATABASE_URL="file:./dev.db"

# PostgreSQL (production)
# DATABASE_URL="postgresql://user:password@localhost:5432/offmarket"
```

### API (`apps/api/.env`)
```bash
# Database (relative path to SQLite file)
DATABASE_URL="file:../../../packages/database/prisma/dev.db"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Web (`apps/web/.env`)
```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Data Models

### Core Entities

```
User
├── BuyerProfile
│   └── WantedAd[]
│       ├── TargetLocation[] (suburbs, cities, regions)
│       ├── TargetAddress[] (specific addresses)
│       └── PropertyMatch[]
└── OwnerProfile
    └── Property[]
        ├── PropertyMatch[]
        └── Inquiry[]
            └── InquiryMessage[]
```

### Key Relationships
- **WantedAd ↔ Property**: Matched via `PropertyMatch` with compatibility score
- **Inquiry**: Communication channel between buyer and owner
- **Notification**: System alerts for new matches, inquiries, messages

## Development Tips

### Adding a new API route

1. Create route file in `apps/api/src/routes/`
2. Register in `apps/api/src/index.ts`
3. Add types to `packages/types/src/index.ts`

### Adding a new page

1. Create page in `apps/web/src/app/`
2. Use `auth()` from `@/lib/auth` for protected pages
3. Use `api` client from `@/lib/api` for data fetching

### Schema changes

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
3. Run `pnpm db:generate`

## Deployment

### Vercel (Web)
```bash
cd apps/web
vercel
```

### Railway/Render (API)
1. Set `DATABASE_URL` to PostgreSQL connection string
2. Set `JWT_SECRET` and other env vars
3. Build command: `pnpm build`
4. Start command: `pnpm start`

### Database
- **Supabase**: Free PostgreSQL hosting
- **Railway**: PostgreSQL with easy setup
- **Neon**: Serverless PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Private - All rights reserved
