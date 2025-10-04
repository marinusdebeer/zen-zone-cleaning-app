# Final Schema Architecture Summary

## ✅ Architectural Decisions

### 1. **Unified Client Model** (Simplified!)

**Single `Client` table** with lifecycle status instead of separate Lead/Client tables:

```typescript
Client {
  clientStatus: "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
  leadSource?: string  // Only used when clientStatus = "LEAD"
  leadStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
}
```

**Benefits:**
- ✅ No complex lead-to-client conversion
- ✅ Single search/query for all contacts
- ✅ Simpler relationships
- ✅ Just update status field to convert

### 2. **Data Independence** (Core Principle!)

When converting Request → Estimate → Job → Invoice:
- **Data is COPIED**, not referenced
- Each entity has its OWN line items table
- Editing a Job doesn't affect the Estimate
- Only Client and Property are shared

### 3. **Line Items Architecture**

**Separate tables for each entity:**
- `request_line_items` - Services requested (no pricing)
- `estimate_line_items` - Quoted services (with pricing)
- `job_line_items` - Work to perform (copied from estimate)
- `invoice_line_items` - Billed services (copied from job)

### 4. **Full Pricing Support**

All entities that need pricing have:
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

## Data Flow

```
Customer Contact (new client record with clientStatus=LEAD)
    ↓
Request (clientId required, line items)
    ↓ convert (copy data + line items)
Estimate (clientId required, line items + pricing + deposit)
    ↓ convert (copy data + line items + pricing)
    ↓ (client status → ACTIVE)
Job (clientId required, line items + pricing + scheduling)
    ↓ convert (copy data + line items + pricing)
Invoice (clientId required, line items + pricing + payments)
```

## Schema Structure

### Core Tables
- `clients` - Unified contacts (leads + active clients)
- `properties` - Client properties/locations
- `requests` - Service inquiries
- `estimates` - Quotes/proposals
- `jobs` - Scheduled work
- `invoices` - Billing documents

### Line Item Tables (One per entity)
- `request_line_items`
- `estimate_line_items`
- `job_line_items`
- `invoice_line_items`

### Supporting Tables
- `visits` - Job occurrences
- `payments` - Invoice payments
- `expenses` - Job expenses

## Key Relationships

### Required Relationships
```
Request.clientId → Client (required)
Estimate.clientId → Client (required)
Job.clientId → Client (required)
Invoice.clientId → Client (required)
Property.clientId → Client (required)
```

### Optional Relationships
```
Request.propertyId → Property (optional)
Estimate.propertyId → Property (optional)
Job.propertyId → Property (optional)
Invoice.propertyId → Property (optional)
```

### Conversion Tracking (One-way references)
```
Request.convertedToEstimateId → Estimate
Request.convertedToJobId → Job
Estimate.convertedFromRequestId ← Request
Estimate.convertedToJobId → Job
Job.convertedFromRequestId ← Request
Job.convertedFromEstimateId ← Estimate
Invoice.jobId → Job
```

## Migration Steps

### 1. Backup Database
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 2. Apply Migration
```bash
npx prisma migrate deploy
```

### 3. Verify
```bash
npx prisma db pull --print
npx prisma studio
```

## Implementation Checklist

### Phase 1: Database ✅
- [x] Update Prisma schema
- [x] Generate Prisma client
- [x] Create migration SQL
- [x] Document architecture

### Phase 2: Core Components (Next)
- [ ] Line items component (add/edit/delete)
- [ ] Pricing calculator component
- [ ] Update estimate form with line items
- [ ] Update job form with pricing fields

### Phase 3: Server Actions (Next)
- [ ] Update createEstimate() for line items
- [ ] Update updateEstimate() for line items
- [ ] Create createRequest() with line items
- [ ] Update createJob() for pricing
- [ ] Update createInvoice() for line items

### Phase 4: Conversion Functions
- [ ] convertRequestToEstimate()
- [ ] convertRequestToJob()
- [ ] convertEstimateToJob()
- [ ] convertJobToInvoice()

### Phase 5: UI Pages
- [ ] Request list page
- [ ] Request form
- [ ] Request detail page
- [ ] Update job form for pricing
- [ ] Update invoice form for line items
- [ ] Lead management (filter clientStatus=LEAD)

## Example Usage

### Creating a Lead
```typescript
const client = await prisma.client.create({
  data: {
    orgId: orgId,
    name: "John's Office",
    emails: ["john@example.com"],
    phones: ["555-1234"],
    clientStatus: "LEAD",
    leadSource: "website",
    leadStatus: "NEW"
  }
})
```

### Converting Lead to Active Client
```typescript
await prisma.client.update({
  where: { id: clientId },
  data: {
    clientStatus: "ACTIVE",
    leadStatus: "CONVERTED"
  }
})
```

### Creating Estimate with Line Items
```typescript
const estimate = await prisma.estimate.create({
  data: {
    orgId: orgId,
    clientId: clientId,
    title: "Office Cleaning Quote",
    lineItems: {
      create: [
        { name: "Deep Clean", quantity: 1, unitPrice: 200, total: 200 },
        { name: "Window Cleaning", quantity: 10, unitPrice: 5, total: 50 }
      ]
    },
    subtotal: 250,
    taxRate: 10,
    taxAmount: 25,
    total: 275
  }
})
```

### Converting Estimate to Job
```typescript
// Copy estimate data to new job
const job = await prisma.job.create({
  data: {
    orgId: estimate.orgId,
    clientId: estimate.clientId,
    propertyId: estimate.propertyId,
    title: estimate.title,
    description: estimate.description,
    // Copy pricing
    subtotal: estimate.subtotal,
    taxRate: estimate.taxRate,
    taxAmount: estimate.taxAmount,
    total: estimate.total,
    // Copy line items
    lineItems: {
      create: estimate.lineItems.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        order: item.order
      }))
    },
    convertedFromEstimateId: estimate.id
  }
})

// Update estimate status
await prisma.estimate.update({
  where: { id: estimate.id },
  data: {
    status: "CONVERTED",
    convertedToJobId: job.id
  }
})
```

## Files Created

- `/prisma/schema.prisma` - Updated schema
- `/prisma/migrations/manual_add_request_and_line_items.sql` - Migration SQL
- `/docs/CLIENT_LIFECYCLE.md` - Client status management guide
- `/docs/DATA_FLOW_ARCHITECTURE.md` - Data flow analysis
- `/docs/FINAL_SCHEMA_ARCHITECTURE.md` - This file

## Benefits Summary

✅ **Simpler Client Management** - One table, one status field  
✅ **Data Independence** - Edit without affecting originals  
✅ **Full Pricing Support** - Line items, tax, discounts, deposits  
✅ **Clear Workflow** - Request → Estimate → Job → Invoice  
✅ **Scalable** - Easy to add features  
✅ **Maintainable** - Clear relationships  
✅ **Type-Safe** - Full Prisma support  

## Next Steps

1. **Apply migration** to development database
2. **Implement line items** components for Estimate
3. **Build Request module** (urgent priority per requirements)
4. **Update existing forms** with new pricing fields
5. **Implement conversion functions**

---

**Ready to proceed with implementation!** 🚀

