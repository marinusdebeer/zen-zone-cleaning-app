# Data Flow Architecture

## Business Flow

```
Request (customer inquiry) 
   ↓ convert
Estimate (quote/proposal)
   ↓ convert
Job (scheduled work)
   ↓ convert
Invoice (billing)
```

Each can be created **independently** OR **converted** from the previous step.

## Shared Fields Analysis

### 1. **Client Information** (WHO)
**Unified Client Model** - No separate Lead table!

- **Client** has `clientStatus`: LEAD, ACTIVE, INACTIVE, ARCHIVED
- **Request**: From any client (LEAD or ACTIVE)
- **Estimate**: For any client (LEAD or ACTIVE)
- **Job**: For any client (LEAD or ACTIVE, but typically ACTIVE)
- **Invoice**: For ACTIVE clients (via job reference)

**Decision**: 
- All models use `clientId` (required)
- Client record stays the same, only `clientStatus` changes from LEAD → ACTIVE
- No complex lead-to-client conversion - just update one field!
- Lead-specific fields (`leadSource`, `leadStatus`) exist on Client model

### 2. **Property Information** (WHERE)
- **Request**: Optional property/address
- **Estimate**: `propertyId` (optional)
- **Job**: `propertyId` (optional but recommended)
- **Invoice**: Gets property via job reference

**Decision**: All have optional `propertyId`

### 3. **Title & Description** (WHAT)
- **Request**: title + description of work needed
- **Estimate**: title + description (copied from request or entered new)
- **Job**: title + description (copied from estimate or entered new)
- **Invoice**: References job title/description

**Decision**: Request, Estimate, Job all have `title` + `description`

### 4. **Line Items** (DETAILS)
Currently inconsistent:
- **Estimate**: `EstimateLineItem` (my new addition)
- **Job**: `LineItem` (existing)
- **Invoice**: NO line items table (just totals)

**Problem**: When converting Estimate → Job, line items need to be copied/referenced

### 5. **Pricing Structure** (COST)
- **Request**: No pricing
- **Estimate**: Detailed pricing with line items, tax, discounts, deposits
- **Job**: Simple `estimatedCost` field
- **Invoice**: Detailed pricing (subtotal, taxAmount, total)

**Current Issue**: Job model is too simple for complex pricing

### 6. **Conversion Tracking** (LINEAGE)
- **Request**: `convertedToEstimateId` (1:1)
- **Estimate**: `convertedToJobId` (1:1)
- **Job**: `convertedFromEstimateId` (1:1)
- **Invoice**: `jobId` (many:1)

## Recommended Schema Design

### Option A: Unified Line Item Structure ✅ RECOMMENDED
Create a single flexible line item system that all models can use:

```prisma
model LineItem {
  id          String   @id @default(cuid())
  orgId       String
  
  // Flexible parent references (only ONE will be set)
  requestId   String?
  estimateId  String?
  jobId       String?
  invoiceId   String?
  
  name        String
  description String?
  quantity    Decimal  @db.Decimal(10, 2)
  unitPrice   Decimal  @db.Decimal(12, 2)
  total       Decimal  @db.Decimal(12, 2)
  order       Int      @default(0)
  
  // Optional fields for different contexts
  taxRate     Decimal? @db.Decimal(5, 2)  // For invoices
  
  // Relations
  org         Organization @relation(...)
  request     Request?     @relation(...)
  estimate    Estimate?    @relation(...)
  job         Job?         @relation(...)
  invoice     Invoice?     @relation(...)
}
```

**Benefits**:
- Single source of truth for line items
- Easy to copy when converting
- Consistent structure across all models

### Option B: Separate Line Item Tables (Current Partial Approach)
- `RequestLineItem`
- `EstimateLineItem`
- `JobLineItem`
- `InvoiceLineItem`

**Drawback**: More tables, harder to maintain consistency

## Pricing Fields Standardization

All models with pricing should have:
```typescript
{
  subtotal: Decimal
  taxRate: Decimal
  taxAmount: Decimal
  discountType: String?  // "percentage" | "fixed"
  discountValue: Decimal?
  discountAmount: Decimal
  total: Decimal
}
```

Applied to:
- ✅ Estimate (has all)
- ❌ Job (only has estimatedCost - needs upgrade)
- ✅ Invoice (has subtotal, taxAmount, total - missing discount)

## Request Model Design (NEW)

```prisma
model Request {
  id                  String    @id @default(cuid())
  orgId               String
  leadId              String?   // Initially a lead
  clientId            String?   // If submitted by existing client
  propertyId          String?
  title               String
  description         String?
  source              String?   // "website_form", "phone", "email", etc.
  urgency             String    @default("normal") // low, normal, high, urgent
  status              String    @default("NEW") // NEW, CONTACTED, QUOTED, CONVERTED, DECLINED
  
  // Conversion tracking
  convertedToEstimateId String? @unique
  convertedToJobId      String? @unique
  
  // Relations
  org               Organization @relation(...)
  lead              Lead?        @relation(...)
  client            Client?      @relation(...)
  property          Property?    @relation(...)
  lineItems         LineItem[]   // Services requested
  convertedEstimate Estimate?    @relation("RequestToEstimate")
  convertedJob      Job?         @relation("RequestToJob")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Conversion Logic

### Request → Estimate
```typescript
- Copy: title, description, leadId/clientId, propertyId
- Copy: all line items (with pricing added)
- Set: request.convertedToEstimateId = estimate.id
- Set: request.status = "QUOTED"
```

### Estimate → Job
```typescript
- Copy: title, description, clientId, propertyId
- Copy: all line items
- Copy: pricing (subtotal, tax, total) to estimatedCost
- Set: estimate.convertedToJobId = job.id
- Set: estimate.status = "CONVERTED"
- Set: job.convertedFromEstimateId = estimate.id
```

### Job → Invoice
```typescript
- Reference: job.id, job.clientId
- Calculate: subtotal/tax/total from completed visits or job line items
- Can create multiple invoices per job (progress billing)
```

## Implementation Plan

1. **Create Request model** with line items support
2. **Unify line items** - decide on Option A or B
3. **Upgrade Job pricing** - add full pricing fields like Estimate
4. **Add Invoice line items** - or keep referencing job
5. **Implement conversion functions** for each step
6. **Update UI** to support conversion workflows

