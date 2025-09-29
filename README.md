# Zen Zone Cleaning - Multi-Tenant SaaS Starter

A production-ready Next.js multi-tenant SaaS application for service businesses, starting with cleaning companies.

## Features

- **Multi-tenant architecture** with Row Level Security (RLS)
- **Config-driven UI** and workflows via JSON settings
- **Secure authentication** with Auth.js
- **Type-safe APIs** with Prisma and Zod
- **Responsive design** with Tailwind CSS
- **Theme customization** per organization

## Tech Stack

- **Frontend:** Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend:** PostgreSQL with Prisma ORM, Row Level Security
- **Authentication:** Auth.js with credentials provider
- **Validation:** Zod schemas
- **Database:** PostgreSQL (Neon recommended)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd zen-zone-cleaning-app
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/zenzone?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Database setup:**
   ```bash
   npm run db:setup
   ```
   This will:
   - Generate Prisma client
   - Push schema to database
   - Apply RLS migrations
   - Seed with demo data

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Visit the application:**
   - Go to http://localhost:3000/t/zenzone/dashboard
   - Login with: `owner@zenzonecleaning.com` / `password123`

## Project Structure

```
/app                          # Next.js App Router pages
  /(app)/t/[slug]/           # Tenant-specific routes
    /dashboard/              # Organization dashboard
    /clients/                # Client management
    /jobs/                   # Job management & wizard
    /invoices/               # Invoice management
  /api/auth/                 # Auth.js API routes
  /auth/                     # Auth pages (signin, error)

/src
  /server/                   # Server-side code
    /actions/                # Server actions
    /validators/             # Zod schemas
    auth.ts                  # Auth.js configuration
    db.ts                    # Prisma client
    tenancy.ts              # Multi-tenant helpers
  /ui/                       # UI components
    /components/             # React components
    registry.tsx             # Field component registry
  /lib/                      # Utility functions

/prisma
  schema.prisma              # Database schema
  seed.ts                   # Database seeding
  /migrations/              # Database migrations
```

## Database Schema

### Core Models

- **Organization:** Multi-tenant root with settings JSON
- **User:** Authentication and profile data
- **Membership:** User-organization relationships with roles
- **Client:** Customer information with flexible contact data
- **Property:** Client properties and locations
- **Job:** Service jobs with configurable workflows
- **LineItem:** Invoice line items
- **Invoice:** Billing and payment tracking

### Multi-Tenancy

- **Row Level Security (RLS)** on all tenant data
- **Automatic filtering** by organization ID
- **Secure by default** - no cross-tenant data access

## Configuration

Organizations can be customized via the `settings` JSON field:

```json
{
  "ui_prefs": {
    "theme": {
      "primary": "#2E3D2F",
      "accent": "#78A265", 
      "surface": "#FAFFFA",
      "cta": "#6B5B95"
    }
  },
  "workflows": {
    "jobLifecycle": {
      "states": ["Draft", "Scheduled", "InProgress", "Completed"],
      "transitions": { "Draft": ["Scheduled"], ... },
      "createWizard": {
        "steps": [
          { "name": "Client", "fields": ["clientId"] },
          { "name": "Details", "fields": ["title", "scheduledAt"] }
        ]
      }
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run seed` - Seed database with demo data
- `npm run db:setup` - Complete database setup

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Database (Neon)

1. Create a Neon database
2. Update `DATABASE_URL` in your environment
3. Run `npm run db:setup` in Vercel's build settings

## Customization

### Adding New Fields

1. Update the Prisma schema
2. Add field to the component registry (`src/ui/registry.tsx`)
3. Update organization settings to include the field
4. Apply database migration

### Theme Customization

Update the organization's `settings.ui_prefs.theme` to customize colors. CSS variables are automatically applied.

### Workflow Configuration

Modify `settings.workflows.jobLifecycle` to customize:
- Available states
- State transitions  
- Job creation wizard steps
- Required fields

## Security

- **Row Level Security** prevents cross-tenant access
- **Server Actions** validate all inputs with Zod
- **Authentication** required for all tenant routes
- **SQL injection protection** via Prisma
- **XSS prevention** via React's built-in escaping

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open a GitHub issue or contact the development team.