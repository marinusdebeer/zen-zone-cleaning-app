# Visit Line Items System

## Overview

Visit line items create a flexible invoicing system where line items flow from jobs to visits to invoices, with each level maintaining independence for customization.

## Data Flow

```
Job Line Items (Template)
    ↓ (copied on creation)
Visit Line Items (Editable, Decoupled)
    ↓ (aggregated on invoice creation)
Invoice Line Items (From completed visits)
```

## How It Works

### 1. Job → Visits (Line Items Copy)

**When creating a job with line items:**
- Line items are **copied** to all generated visits
- Each visit gets its own copy of the line items
- Visits are now independent from the job

**When updating job line items:**
- Only **incomplete** visits (Scheduled, InProgress) are updated
- **Completed** visits are locked (their line items don't change)
- **Canceled** visits are not updated

```typescript
// Statuses that allow line item sync from job
const INCOMPLETE_STATUSES = ['Scheduled', 'InProgress'];

// Statuses that prevent line item sync (locked)
const LOCKED_STATUSES = ['Completed', 'Canceled'];
```

---

### 2. Visit Line Items (Independence)

**Decoupled from Job:**
- Visit line items are stored in `visit_line_items` table
- Can be modified without affecting job or other visits
- Additional line items can be added to specific visits
- Changes to visit line items **do not** affect job line items

**Use Cases:**
- Add extra services performed during a visit
- Adjust quantities based on actual work done
- Remove items not needed for specific visit
- Different pricing for different locations/situations

---

### 3. Visits → Invoice (Aggregation)

**When creating an invoice from a job:**
- System looks at **completed** visits only
- Aggregates line items from those visits
- Each visit can only be invoiced **once**
- Visits track which invoice they belong to

**Visit Tracking:**
```typescript
Visit {
  invoiceId: string | null  // null = not invoiced yet
  invoice: Invoice | null
}
```

**Filtering:**
```typescript
// Get invoiceable visits
const invoiceableVisits = await prisma.visit.findMany({
  where: {
    jobId: jobId,
    status: 'Completed',
    invoiceId: null,  // Not yet invoiced
  },
  include: {
    lineItems: true,
  },
});
```

---

## Schema

### Visit Model
```prisma
model Visit {
  id          String    @id
  jobId       String
  invoiceId   String?   // Which invoice this visit belongs to
  status      String    // Scheduled, InProgress, Completed, Canceled
  
  job         Job
  invoice     Invoice?
  lineItems   VisitLineItem[]
}
```

### VisitLineItem Model
```prisma
model VisitLineItem {
  id          String   @id
  visitId     String
  name        String
  description String?
  quantity    Decimal
  unitPrice   Decimal
  total       Decimal
  order       Int
  
  visit Visit
}
```

---

## UI/UX Flow

### Job Create/Edit
- **Line Items Section** (optional)
- When line items exist, they're copied to visits
- Shows pricing summary if from estimate

### Visit Detail Page
- **Line Items Section** shows visit-specific line items
- **Edit** button allows modifying visit line items
- **Add Item** button for additional services
- Shows **Invoice Status**:
  - ✅ Invoiced → shows invoice #123
  - 🔓 Not Invoiced (if completed)
  - ⏳ Not Completed Yet

### Invoice Creation
- Shows list of **completed, uninvoiced** visits
- Preview of line items from each visit
- Aggregates into invoice line items
- Marks visits as invoiced (`invoiceId` set)

---

## Benefits

1. **Flexibility:** Each visit can have custom line items
2. **Accuracy:** Invoice reflects actual work done (visit-level)
3. **Traceability:** Know which visits are on which invoice
4. **Prevent Double-Billing:** Visits can only be invoiced once
5. **Historical Accuracy:** Completed visits are locked

---

## Implementation Notes

**Line Item Sync Function:**
```typescript
async function syncLineItemsToVisits(jobId: string, lineItems: any[]) {
  const incompleteVisits = await prisma.visit.findMany({
    where: {
      jobId,
      status: { notIn: ['Completed', 'Canceled'] }
    }
  });
  
  for (const visit of incompleteVisits) {
    await prisma.visitLineItem.deleteMany({ where: { visitId: visit.id } });
    await prisma.visitLineItem.createMany({
      data: lineItems.map(item => ({ ...item, visitId: visit.id }))
    });
  }
}
```

**Invoice Creation:**
```typescript
// Get completed, uninvoiced visits
const visits = await prisma.visit.findMany({
  where: {
    jobId,
    status: 'Completed',
    invoiceId: null,
  },
  include: { lineItems: true },
});

// Aggregate line items
const invoiceLineItems = aggregateVisitLineItems(visits);

// Create invoice and link visits
const invoice = await prisma.invoice.create({
  data: {
    ...invoiceData,
    lineItems: { create: invoiceLineItems },
  },
});

// Mark visits as invoiced
await prisma.visit.updateMany({
  where: { id: { in: visitIds } },
  data: { invoiceId: invoice.id },
});
```

---

## Security

**Row Level Security (RLS):**
- All visit line items filtered by organization
- Users can only access their org's data
- Visits enforce `orgId` checks

**Validation:**
- Cannot invoice same visit twice
- Cannot modify completed visit line items from job update
- Must have completed visits to create invoice

