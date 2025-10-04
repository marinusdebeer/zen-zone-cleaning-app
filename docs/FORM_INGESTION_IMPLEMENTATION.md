# Form Ingestion Implementation Guide

## Overview

This document tracks the implementation of the flexible form ingestion system with per-org auto-incrementing numbers.

---

## ✅ Completed Tasks

### 1. Prisma Schema Updates ✅

**Changed all `number` fields to per-org unique:**
- `@@unique([orgId, number])` instead of `@unique` on number field
- Updated models: Client, Request, Estimate, Job, Visit, Invoice, Payment

**Added new lookup tables:**
- `Industry` - For industry types (home-cleaning, office, airbnb)
- `ServiceType` - Service options per industry
- `HearAbout` - Marketing source tracking
- `AccessMethod` - Property access options per industry
- `Reason` - Service reasons per industry

**Added utility tables:**
- `Activity` - Audit log for requests
- `File` - File attachments for requests, jobs, invoices
- `OrgCounter` - Per-org auto-incrementing counters

**Enhanced Request model:**
- Added `industryId`, `serviceTypeId`, `hearAboutId` (foreign keys)
- Added `details` JSON field for full form snapshot
- Added `preferredAt` DateTime for preferred service time
- Added relations to new lookup tables
- Added indexes for filtering and reporting

### 2. Auto-Number Utility ✅

**Location:** `/Users/marinus/Desktop/Zen Zone Cleaning/zen-zone-cleaning-app/src/server/utils/auto-number.ts`

**Updated to use per-org counters:**
```typescript
// Old: getNextNumber('invoice')
// New: getNextNumber(orgId, 'invoice')

export async function getNextNumber(orgId: string, scope: EntityType): Promise<number>
export async function isNumberAvailable(orgId: string, entityType: EntityType, number: number, excludeId?: string): Promise<boolean>
export async function getValidatedNumber(orgId: string, entityType: EntityType, requestedNumber?: number, excludeId?: string): Promise<number>
```

Uses `OrgCounter` table with atomic transaction for thread-safe increments.

### 3. Seed Data ✅

**Location:** `/Users/marinus/Desktop/Zen Zone Cleaning/zen-zone-cleaning-app/prisma/seed.ts`

**Added lookup data:**
- 3 industries (home-cleaning, office, airbnb)
- 8 service types across industries
- 5 hear-about options
- 17 access methods (industry-specific)
- 8 reasons (industry-specific)

**Updated all upserts to use compound unique constraint:**
```typescript
// Old: where: { number: 1 }
// New: where: { orgId_number: { orgId: zenZoneOrg.id, number: 1 } }
```

### 4. Form Ingestion API ✅

**Location:** `/Users/marinus/Desktop/Zen Zone Cleaning/zen-zone-cleaning-app/app/api/requests/route.ts`

**Features:**
- POST `/api/requests` endpoint
- Protected by `x-zenzone-secret` header
- Flexible Zod schema with `.passthrough()`
- Resolves industry/serviceType/hearAbout slugs to IDs
- Creates Client (as LEAD) and Property
- Stores complete form snapshot in `details` JSON
- Allocates per-org sequential numbers
- Logs activity for audit trail

**Environment Variables Required:**
```bash
FORM_INGEST_SECRET="your-secret-key-here"
DEFAULT_ORG_ID="your-default-org-id" # Optional
```

---

## ⚠️ Remaining Tasks

### Task 1: Update Existing Server Actions

**Files that need updating** (search for `getNextNumber` calls):

Run this search to find all occurrences:
```bash
grep -r "getNextNumber" src/server/actions/
```

**Expected files:**
- `src/server/actions/clients.ts`
- `src/server/actions/requests.ts`
- `src/server/actions/estimates.ts`
- `src/server/actions/jobs.ts`
- `src/server/actions/invoices.ts`
- `src/server/actions/payments.ts`

**Required changes:**
```typescript
// OLD:
const number = await getNextNumber('client');

// NEW:
const number = await getNextNumber(orgId, 'client');
```

**Note:** The `orgId` should already be available in all server actions via `withOrgContext()` or as a parameter.

### Task 2: Create and Run Migration

**Step 1: Generate migration**
```bash
npx prisma migrate dev --name per_org_unique_numbers_and_form_ingestion
```

This will:
- Drop existing unique constraints on `number` fields
- Add compound unique constraints `[orgId, number]`
- Create new lookup tables
- Create utility tables (Activity, File, OrgCounter)
- Add new fields to Request model

**Step 2: Handle existing data**

The migration will automatically handle existing data because:
- Existing `number` values are preserved
- New compound unique constraint `@@unique([orgId, number])` allows same number across different orgs
- Since you only have one org currently, no conflicts will occur

**Step 3: Run seed**
```bash
npm run seed
```

This will populate lookup tables and create test data with new structure.

**Step 4: Generate Prisma client**
```bash
npx prisma generate
```

### Task 3: Add Environment Variables

Add to your `.env` file:
```bash
# Form Ingestion API
FORM_INGEST_SECRET="change-this-to-a-secure-random-string"
DEFAULT_ORG_ID="clxxx..." # Your default org ID from database

# Optional: For GIN index on JSON fields (if using PostgreSQL)
```

### Task 4: Create Database Indexes (Optional but Recommended)

After migration, run these SQL commands for performance:

```sql
-- Composite index for status + createdAt queries
CREATE INDEX requests_status_created_idx ON requests (status, "createdAt" DESC);

-- Individual indexes (already in schema via @@index)
-- These are created automatically by Prisma

-- Optional: GIN index for ad-hoc JSON queries
CREATE INDEX requests_details_gin ON requests USING GIN ((details) jsonb_path_ops);
```

---

## 🧪 Testing

### Test 1: Per-Org Number Isolation

```typescript
// Test that two orgs can have the same number
const org1Client = await createClient(org1Id, { name: 'Client 1' });
// org1Client.number === 1

const org2Client = await createClient(org2Id, { name: 'Client 1' });
// org2Client.number === 1 (no conflict!)
```

### Test 2: Form Ingestion API

**Test request:**
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "x-zenzone-secret: your-secret-key-here" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    },
    "address": {
      "line1": "123 Main St",
      "city": "Toronto",
      "province": "ON",
      "postal": "M1A 1A1"
    },
    "industry": {
      "slug": "home-cleaning",
      "label": "Home Cleaning"
    },
    "serviceType": {
      "slug": "deep",
      "label": "Deep Cleaning"
    },
    "marketing": {
      "hearAbout": {
        "slug": "gbp",
        "label": "Google Maps or GBP"
      }
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "requestId": "clxxx...",
  "requestNumber": 1,
  "clientId": "clxxx...",
  "clientNumber": 1
}
```

### Test 3: Verify Data Structure

```sql
-- Check OrgCounter
SELECT * FROM org_counters;
-- Should show rows for each entity type per org

-- Check Request with details
SELECT id, number, title, details, "industryId", "serviceTypeId" 
FROM requests 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Verify compound unique constraint
SELECT c.relname AS table_name, i.relname AS index_name
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class c ON c.oid = ix.indrelid
WHERE c.relname IN ('clients', 'requests', 'estimates', 'jobs', 'visits', 'invoices', 'payments')
  AND i.relname LIKE '%orgId_number%';
```

---

## 📊 Database Changes Summary

### New Tables
- `industries` (3 rows seeded)
- `service_types` (8 rows seeded)
- `hear_about` (5 rows seeded)
- `access_methods` (17 rows seeded)
- `reasons` (8 rows seeded)
- `activities` (audit log)
- `files` (attachments)
- `org_counters` (auto-increment)

### Modified Tables
All these now have `@@unique([orgId, number])` instead of `@unique` on number:
- `clients`
- `requests` (+ new fields: industryId, serviceTypeId, hearAboutId, details, preferredAt)
- `estimates`
- `jobs`
- `visits`
- `invoices`
- `payments`

### Modified Relations
- `Organization` → `Activity[]`, `File[]`, `OrgCounter[]`
- `Request` → `Industry?`, `ServiceType?`, `HearAbout?`, `Activity[]`, `File[]`
- `Job` → `File[]`
- `Invoice` → `File[]`

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Backup database
- [ ] Test migration on staging/local first
- [ ] Update all `getNextNumber()` calls to pass `orgId`
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Run seed to populate lookup tables
- [ ] Set environment variables: `FORM_INGEST_SECRET`, `DEFAULT_ORG_ID`
- [ ] Test form ingestion endpoint
- [ ] Verify per-org number uniqueness works
- [ ] Check that existing data still works
- [ ] Run linter and fix any errors
- [ ] Run `npm run build` to check for TypeScript errors
- [ ] Test creating entities in each org (if multiple)

---

## 📝 API Usage Examples

### Creating a Request from Website Form

**POST** `/api/requests`

**Headers:**
```
Content-Type: application/json
x-zenzone-secret: your-secret-key-here
```

**Body:**
```json
{
  "contact": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah@example.com",
    "phone": "555-9876",
    "company": "Johnson Residence"
  },
  "address": {
    "line1": "456 Oak Avenue",
    "line2": "Unit 2",
    "city": "Barrie",
    "province": "ON",
    "postal": "L4N 5B3"
  },
  "industry": {
    "slug": "home-cleaning",
    "label": "Home Cleaning"
  },
  "serviceType": {
    "slug": "recurring",
    "label": "Recurring Cleaning"
  },
  "marketing": {
    "hearAbout": {
      "slug": "referral",
      "label": "Referral"
    },
    "referralName": "Mike Chen"
  },
  "scheduleAndAccess": {
    "preferred": "2025-10-15T10:00:00",
    "accessMethod": {
      "slug": "home-lockbox",
      "label": "Lockbox or keypad code"
    }
  },
  "property": {
    "type": "house",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1800
  },
  "addons": {
    "interiorWindows": true,
    "insideFridge": false,
    "insideOven": true
  },
  "description": "Need regular bi-weekly cleaning, prefer mornings"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "requestId": "clxxx...",
  "requestNumber": 5,
  "clientId": "clxxx...",
  "clientNumber": 23
}
```

---

## 🔧 Troubleshooting

### Migration Fails with Unique Constraint Violation

**Issue:** Existing numbers conflict when adding compound unique constraint.

**Solution:** This shouldn't happen since all existing records already have unique numbers per table. If it does:
```sql
-- Find duplicates (shouldn't be any)
SELECT "orgId", number, COUNT(*) 
FROM clients 
GROUP BY "orgId", number 
HAVING COUNT(*) > 1;

-- If duplicates exist, reassign numbers
-- (This script depends on your specific data)
```

### `getNextNumber` Not Found

**Issue:** TypeScript error after updating import.

**Solution:** Ensure import includes orgId parameter:
```typescript
import { getNextNumber } from '@/server/utils/auto-number';

// In your function:
const number = await getNextNumber(orgId, 'client');
```

### Form Ingestion Returns 400

**Check:**
1. Industry slug exists in database: `SELECT * FROM industries WHERE slug = 'home-cleaning';`
2. ServiceType slug exists: `SELECT * FROM service_types WHERE slug = 'deep';`
3. Request body matches schema (check console for Zod errors)

### Numbers Not Incrementing

**Check OrgCounter table:**
```sql
SELECT * FROM org_counters WHERE "orgId" = 'your-org-id';
```

If missing, manually initialize:
```sql
INSERT INTO org_counters ("id", "orgId", scope, value)
VALUES (gen_random_uuid(), 'your-org-id', 'client', 0);
```

---

## 📚 Related Documentation

- [Multi-Tenancy Architecture](/docs/architecture/MULTI_TENANCY.md)
- [Database Schema](/docs/architecture/DATABASE.md)
- [Best Practices](/docs/BEST_PRACTICES.md)
- [Request Feature](/docs/features/REQUESTS.md)

---

## ✨ What's Next

After completing the remaining tasks, you'll have:

✅ Per-org unique auto-incrementing numbers  
✅ Flexible form ingestion that can evolve without schema changes  
✅ Normalized industry/service type/marketing data for reporting  
✅ Full form snapshot preserved in JSON for future reference  
✅ Audit trail with Activity log  
✅ File attachment support  
✅ Clean, maintainable codebase following best practices  

**Future Enhancements:**
- Request → Estimate conversion UI
- Request detail page showing full form data
- Filtering/reporting by industry, serviceType, hearAbout
- File upload endpoint for request attachments
- Email notifications on new requests
- Admin UI for managing lookup tables

---

**Last Updated:** October 3, 2025  
**Status:** Schema & Seed Complete, Migration & Code Updates Pending

