# Database Architecture

## Overview

PostgreSQL database with multi-tenant row-level security. Single unified Client model with lifecycle status tracking.

## Data Independence

**Core Principle:** When converting between models, data is **copied** not referenced.

```
Request → Estimate → Job → Invoice
(copy)    (copy)      (copy)
```

Each entity maintains its own independent data. Editing a Job doesn't affect the original Estimate.

## Multi-Tenancy

**Row Level Security (RLS)** ensures organizations only see their own data.

```typescript
// Set tenant context before queries
await setTenantContext(orgId);
await prisma.job.findMany(); // Automatically filtered by orgId
```

All tenant tables have:
- `orgId` field
- RLS policy: `WHERE orgId = current_setting('app.org_id')`

## Core Models

### Client (Unified Model)
Single table for leads and active clients:
```typescript
{
  clientStatus: "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
  leadSource?: "website" | "phone" | "referral"
  leadStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
}
```

**Lifecycle:** LEAD → ACTIVE → INACTIVE → ARCHIVED

### Request → Estimate → Job → Invoice Flow

**Request:** Initial customer inquiry
- Required: clientId
- Has: RequestLineItem[] (services requested, no pricing)

**Estimate:** Quote/proposal
- Required: clientId
- Has: EstimateLineItem[] (services with pricing)
- Pricing: subtotal, tax, discount, deposit, total

**Job:** Scheduled work
- Required: clientId  
- Has: JobLineItem[] (work to perform)
- Pricing: subtotal, tax, discount, total
- Scheduling: recurring patterns, visits

**Invoice:** Billing
- Required: clientId, jobId
- Has: InvoiceLineItem[] (billed services)
- Pricing: subtotal, tax, discount, total
- Payments: Payment[]

## Line Items Architecture

**Separate tables** for data independence:
- `request_line_items` - Services requested
- `estimate_line_items` - Quoted services  
- `job_line_items` - Work to perform
- `invoice_line_items` - Billed services

When converting, line items are **copied** to new entity.

## Shared Entities

**Only Client and Property are shared** across all models:
- Client: Central contact record
- Property: Physical location

These are intentionally shared so updates reflect everywhere.

## Pricing Structure

Standard pricing fields:
```typescript
{
  subtotal: Decimal
  taxRate: Decimal
  taxAmount: Decimal
  discountType: "percentage" | "fixed"
  discountValue: Decimal
  discountAmount: Decimal
  total: Decimal
}
```

Applied to: Estimate, Job, Invoice

## Key Relationships

```
Organization (1) → (many) Client
Client (1) → (many) Property
Client (1) → (many) Request, Estimate, Job, Invoice
Property (1) → (many) Request, Estimate, Job, Invoice
Job (1) → (many) Visit
Job (1) → (many) Invoice
```

## RLS Tables

All multi-tenant tables have RLS enabled:
- organizations
- clients
- properties
- requests, estimates, jobs, invoices
- visits, payments, expenses
- Line item tables

## Migrations

### Check Status
```bash
npx prisma migrate status
```

### Local Development
```bash
# Apply pending migrations
npm run prisma:migrate

# Setup database (migrate + seed)
npm run db:setup
```

### Production
```bash
# Always backup first
pg_dump $DATABASE_URL > backup.sql

# Apply migrations
npm run prisma:migrate:deploy
```

### Rules

✅ Backup before production deploys  
✅ Test on staging first  
✅ Migrations are append-only (never edit applied migrations)  
❌ Never `migrate dev` in production  
❌ Never `migrate reset` in production  

## Related

- [Multi-Tenancy Details](/docs/architecture/MULTI_TENANCY.md)
- [Authentication](/docs/architecture/AUTHENTICATION.md)
- [Client Management](/docs/features/CLIENT_MANAGEMENT.md)

