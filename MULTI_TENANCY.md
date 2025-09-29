# Multi-Tenancy Architecture

## Overview
This application uses **database-level multi-tenancy** supporting **multiple independent businesses** with complete data isolation.

## How It Works

### Database Layer (Multi-Tenant) ✅
- **Row Level Security (RLS)** ensures complete data isolation between businesses
- All data tables have an `orgId` field
- Queries are automatically filtered by organization
- Multiple organizations (businesses) exist in the same database
- Each business's data is completely isolated and secure

### UI Layer (Organization-Focused)
- Users see one organization at a time
- Organization auto-selected from user's session
- Supports users belonging to multiple organizations
- Clean interface focused on one business at a time
- *Future: Add org switcher for multi-org users*

## Current Setup

### Production Deployment (Multiple Businesses) 🏢🏢🏢
One deployment serves MULTIPLE independent businesses:
- **Database**: Multiple organizations stored with complete data isolation
- **UI**: Each user sees only their organization(s)
- **Auth**: Automatically selects organization (or defaults to first if multiple)
- **Security**: RLS prevents any cross-organization data access

### Data Isolation Architecture
```
┌─────────────────────────────────────────────────┐
│           PostgreSQL Database (Neon)             │
├─────────────────────────────────────────────────┤
│                                                  │
│  Organization: Zen Zone Cleaning                │
│      ├── Clients (RLS: orgId filter)            │
│      ├── Jobs (RLS: orgId filter)               │
│      ├── Invoices (RLS: orgId filter)           │
│      └── Users via Memberships                  │
│                                                  │
│  Organization: Acme Cleaning                    │
│      ├── Clients (RLS: orgId filter)            │
│      ├── Jobs (RLS: orgId filter)               │
│      ├── Invoices (RLS: orgId filter)           │
│      └── Users via Memberships                  │
│                                                  │
│  Organization: SparkleClean Co                  │
│      ├── Clients (RLS: orgId filter)            │
│      ├── Jobs (RLS: orgId filter)               │
│      ├── Invoices (RLS: orgId filter)           │
│      └── Users via Memberships                  │
│                                                  │
│  ⚡ RLS ensures ZERO cross-access between orgs  │
└─────────────────────────────────────────────────┘
```

## Use Cases Supported

### Multiple Businesses (Current Setup) ✅
- Multiple cleaning businesses in one database
- Each business has its own isolated data
- Users can belong to one or multiple organizations
- Team members see only their organization's data
- Same codebase serves all businesses

### User Scenarios

**Scenario 1: Single-Org User (Most Common)**
- User belongs to "Zen Zone Cleaning" only
- Logs in → auto-selected to Zen Zone
- Sees only Zen Zone's clients, jobs, invoices

**Scenario 2: Multi-Org User (Consultant/Contractor)**
- User belongs to both "Zen Zone" and "Acme Cleaning"
- Logs in → defaults to first organization
- Can switch between organizations (when UI is added)

**Scenario 3: Adding New Business**
- Add organization via seed file or admin panel
- Create owner user for that business
- Link user to organization via membership
- Completely isolated - no code changes needed!

## Key Files

- `prisma/schema.prisma` - Database schema with orgId on all tables
- `prisma/migrations/20240929000001_enable_rls/migration.sql` - RLS policies
- `src/server/tenancy.ts` - RLS context management
- `src/server/auth.ts` - Auto-selects organization for users
- `prisma/seed.ts` - Creates default organization

## Adding New Organizations

### Method 1: Via Seed File (Development/Initial Setup)
Edit `prisma/seed.ts` and uncomment/add new organization blocks:
```typescript
const newOrg = await prisma.organization.upsert({
  where: { slug: 'company-slug' },
  update: {},
  create: {
    name: 'Company Name',
    slug: 'company-slug',
    industry: 'cleaning',
    settings: { /* ... */ },
  },
});
```

Then run:
```bash
npm run seed
```

### Method 2: Via Admin Panel (Future)
- Build an admin interface to create organizations
- Form to add: name, slug, industry, settings
- Automatically create owner user and membership
- No database access needed

### Method 3: Direct Database (Production)
Use Neon SQL Editor to insert organizations:
```sql
INSERT INTO organizations (id, name, slug, industry, settings)
VALUES (gen_random_uuid(), 'New Company', 'new-company', 'cleaning', '{}');
```

## Benefits of This Architecture

✅ **Security**: RLS prevents data leaks between organizations - impossible to access other org's data
✅ **Scalability**: Add unlimited organizations without code changes
✅ **Simplicity**: UI remains clean and focused on one business at a time
✅ **Cost-effective**: One database, one deployment serves multiple businesses
✅ **Flexibility**: Users can work with multiple organizations
✅ **Maintainability**: Single codebase for all businesses
✅ **Performance**: Indexes on orgId ensure fast queries per organization

## Development vs Production

### Development
- Seed creates "Zen Zone Cleaning" organization
- Login: `owner@zenzonecleaning.com` / `password123`

### Production
- Same seed runs on first deployment
- Same organization structure
- Add more users via admin interface (when built)

## Important Notes

⚠️ **Database URL**: Each environment (dev/staging/prod) should have its own database
⚠️ **Seed Safety**: Uses `upsert` - safe to run multiple times
⚠️ **RLS Required**: Don't disable RLS or data isolation breaks
⚠️ **OrgId Required**: All new tables must include `orgId` field
