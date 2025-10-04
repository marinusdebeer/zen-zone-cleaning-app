# Schema Upgrade Summary - Data Independence Architecture

## ✅ Completed Changes

### 1. **Data Models - Full Independence**

All data models now follow the principle of **data independence**: when converting between models, data is **COPIED** not referenced. This ensures editing a Job doesn't affect the original Estimate.

#### **Request Model** (NEW)
```typescript
- Initial customer inquiry/service request
- Can be from Lead OR Client
- Has RequestLineItem for services requested
- Converts to → Estimate OR Job
- Fields: title, description, source, urgency, status, notes
```

#### **Estimate Model** (UPGRADED)
```typescript
- Added full pricing structure:
  - subtotal, taxRate, taxAmount
  - discountType, discountValue, discountAmount
  - total
  - depositRequired, depositType, depositValue, depositAmount
- Added EstimateLineItem table
- Added notes field
- Added convertedFromRequestId tracking
- Status values now uppercase: DRAFT, SENT, APPROVED, REJECTED, CONVERTED
```

#### **Job Model** (UPGRADED)
```typescript
- Added full pricing structure (same as Estimate):
  - subtotal, taxRate, taxAmount
  - discountType, discountValue, discountAmount
  - total
- Renamed LineItem → JobLineItem (with description, quantity, total fields)
- Added notes field
- Added convertedFromRequestId tracking
- clientId is now required (must have client)
```

#### **Invoice Model** (UPGRADED)
```typescript
- Added InvoiceLineItem table (own line items, not referenced)
- Added propertyId field
- Added discount fields:
  - taxRate, discountType, discountValue, discountAmount
- Added invoiceNumber, notes, custom fields
- Status values now uppercase: DRAFT, SENT, PAID, OVERDUE, CANCELED
```

### 2. **Line Items Architecture - Separate Tables**

Each model has its **own line items table**:
- `request_line_items` - Services requested (no pricing yet)
- `estimate_line_items` - Quoted services with pricing
- `job_line_items` - Actual services to perform (copied from estimate)
- `invoice_line_items` - Billed services (copied from job)

**When converting**, line items are **copied** to ensure data independence.

### 3. **Conversion Tracking**

One-way references track conversion lineage:
```
Request.convertedToEstimateId → Estimate
Request.convertedToJobId → Job
Estimate.convertedFromRequestId ← Request
Estimate.convertedToJobId → Job
Job.convertedFromRequestId ← Request
Job.convertedFromEstimateId ← Estimate
Invoice.jobId → Job (many-to-one)
```

### 4. **Shared Entities**

Only **Client** and **Property** are shared:
- All models reference the same Client and Property records
- Editing client/property details affects all related records
- This is intentional and desired

### 5. **Required Relationships**

- **Request**: Must have (leadId OR clientId)
- **Estimate**: Must have (leadId OR clientId)
- **Job**: Must have clientId (lead must be converted to client first)
- **Invoice**: Must have clientId (via job reference)
- **Property**: Optional but recommended for all

## 📋 Database Migration

### Step 1: Review the Migration SQL

File: `prisma/migrations/20251003000001_unified_client_and_line_items/migration.sql`

This migration:
1. Creates `requests` table
2. Creates `request_line_items` table
3. Creates `estimate_line_items` table
4. Renames `line_items` → `job_line_items`
5. Creates `invoice_line_items` table
6. Adds pricing fields to estimates
7. Adds pricing fields to jobs
8. Adds fields to invoices
9. Sets up all foreign key constraints
10. Creates performance indexes

### Step 2: Apply the Migration

**Production/Staging:**
```bash
# Backup your database first!
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Apply migration
npx prisma migrate deploy

# Mark as applied if done manually
npx prisma migrate resolve --applied 20251003000001_unified_client_and_line_items
```

**Development:**
```bash
npx prisma migrate dev
```

### Step 3: Verify

```bash
# Check the schema matches
npx prisma db pull --print

# Test a query
npx prisma studio
```

## 🚀 Next Steps

### 1. **Implement Line Items Components** (Priority: HIGH)
- `estimate-line-items.tsx` - Add/edit/delete line items
- `estimate-pricing-calculator.tsx` - Auto-calc subtotal, tax, discount, total
- Add to estimate form

### 2. **Implement Conversion Functions** (Priority: HIGH)
- `convertRequestToEstimate()` - Copy data + line items
- `convertRequestToJob()` - Copy data + line items  
- `convertEstimateToJob()` - Copy data + line items + pricing
- `convertJobToInvoice()` - Create invoice from job

### 3. **Update Server Actions** (Priority: HIGH)
- Update `createEstimate()` to handle line items
- Update `updateEstimate()` to handle line items
- Create `createRequest()` and `updateRequest()`
- Update `createJob()` to handle new pricing fields
- Update `createInvoice()` to handle line items

### 4. **Build Request Module** (Priority: MEDIUM)
- Request list page
- Request form (with line items)
- Request detail page
- Convert to Estimate/Job actions

### 5. **Update Existing Forms** (Priority: MEDIUM)
- Job form - add pricing fields
- Invoice form - add line items support

## 📊 Data Flow Examples

### Example 1: Request → Estimate → Job → Invoice

```typescript
// 1. Customer submits request
Request {
  leadId: "lead123",
  title: "Weekly Office Cleaning",
  lineItems: [
    { name: "Deep Clean", quantity: 1 }
  ]
}

// 2. Convert to Estimate (data copied)
Estimate {
  leadId: "lead123",  // copied
  title: "Weekly Office Cleaning",  // copied
  convertedFromRequestId: "req123",  // tracked
  lineItems: [
    { name: "Deep Clean", quantity: 1, unitPrice: 200, total: 200 }  // copied + priced
  ],
  subtotal: 200,
  taxAmount: 20,
  total: 220
}

// 3. Lead converts, then convert Estimate → Job
Job {
  clientId: "client456",  // lead converted to client
  title: "Weekly Office Cleaning",  // copied
  convertedFromEstimateId: "est123",  // tracked
  lineItems: [
    { name: "Deep Clean", quantity: 1, unitPrice: 200, total: 200 }  // copied
  ],
  subtotal: 200,
  taxAmount: 20,
  total: 220
}

// 4. Job completed, create Invoice
Invoice {
  jobId: "job789",  // referenced
  clientId: "client456",  // copied
  lineItems: [
    { name: "Deep Clean", quantity: 1, unitPrice: 200, total: 200 }  // copied
  ],
  subtotal: 200,
  taxAmount: 20,
  total: 220
}
```

**Key Point**: Each step has its OWN copy of the data. Editing the Job won't change the Estimate!

## 🔍 Schema Validation

✅ Prisma Client generated successfully
✅ All relations properly defined  
✅ Data independence architecture implemented
✅ Migration SQL ready to apply

## ⚠️ Important Notes

1. **Backward Compatibility**: Legacy `amount` and `estimatedCost` fields kept for compatibility
2. **Status Values**: Now uppercase (DRAFT vs Draft) - may need data migration
3. **Line Items**: Old `line_items` table renamed to `job_line_items`
4. **No Shadow Database**: Manual migration avoids shadow database issues
5. **Test First**: Apply to development/staging before production!

## 📚 Related Documentation

- See `/docs/DATA_FLOW_ARCHITECTURE.md` for detailed flow analysis
- See `/app/(dashboard)/estimates/_components/README.md` for component architecture
- See `/app/(dashboard)/jobs/_components/README.md` for jobs pattern

## 🎯 Success Criteria

- [ ] Migration applied successfully
- [ ] Can create Request with line items
- [ ] Can create Estimate with line items and pricing
- [ ] Can create Job with line items and pricing
- [ ] Can create Invoice with line items
- [ ] Conversion functions copy data correctly
- [ ] Editing Job doesn't affect Estimate
- [ ] Client/Property changes reflect everywhere

