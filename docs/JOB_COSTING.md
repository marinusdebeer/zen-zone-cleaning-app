# Job Costing System

## Overview

Job costs are **calculated from line items only**. There is no separate `estimatedCost` field - the job's total cost comes purely from the sum of its line items.

---

## How It Works

### 1. **Line Items Define the Cost**

```typescript
// Job pricing is calculated from line items
Job {
  subtotal: 150.00    // Sum of all line items
  taxRate: 8.5        // Tax percentage
  taxAmount: 12.75    // Calculated: subtotal × (taxRate / 100)
  total: 162.75       // Final: subtotal + taxAmount - discounts
}
```

### 2. **Line Items Source**

**A. From Estimate Conversion:**
- When converting an estimate to a job, all line items are copied
- Pricing breakdown transfers automatically
- Each visit gets copies of these line items

**B. Manual Entry:**
- Users can add line items directly to a job
- Each line item has: name, description, quantity, unit price, total
- Subtotal is automatically calculated

### 3. **Billing Frequency**

Jobs only store **when** to bill, not **how much**:
- `AT_COMPLETION` - Invoice after all visits complete
- `PER_VISIT` - Invoice after each visit
- `WEEKLY` - Invoice weekly
- `MONTHLY` - Invoice monthly

The **amount** billed comes from the line items, not a separate field.

---

## Visit Line Items

When a job is created:
1. All job line items are **copied** to each visit
2. Each visit has its own independent line items
3. Visits can add/edit line items without affecting the job
4. Invoice pulls from **visit line items** (not job line items)

### Flow Diagram

```
Estimate Line Items
    ↓ (conversion)
Job Line Items
    ↓ (copied to each visit)
Visit 1 Line Items, Visit 2 Line Items, Visit 3 Line Items...
    ↓ (aggregated on invoicing)
Invoice Line Items
```

---

## Recurring Job Visit Generation

### Patterns Supported

**1. Daily**
- Generates a visit every day
- Runs from start date to end date (max 5 years)

**2. Weekly**
- Generates visits on specific days of the week
- `recurringDays`: `[0, 2, 4]` = Sunday, Tuesday, Thursday
- If no days specified, uses start date's day of week

**3. Biweekly**
- Generates visits every other week
- Uses week counter from start date
- Only creates visits on even weeks (0, 2, 4, 6...)
- Respects `recurringDays` array

**4. Monthly**
- Generates visits on the same day of month as start date
- If day doesn't exist (e.g., Jan 31 → Feb), uses last day of month

### Generation Logic

```typescript
// Example: Biweekly job starting Jan 1, 2025 on Mondays
{
  startDate: "2025-01-01",          // Week 0
  recurringPattern: "biweekly",
  recurringDays: [1],               // Monday
  recurringEndDate: "2025-03-31"
}

// Generates visits:
// Week 0: Jan 6 (Monday)
// Week 2: Jan 20 (Monday)
// Week 4: Feb 3 (Monday)
// Week 6: Feb 17 (Monday)
// Week 8: Mar 3 (Monday)
// Week 10: Mar 17 (Monday)
// Week 12: Mar 31 (Monday)
```

### Safeguards

- **Maximum 5 years** from start date
- **Maximum 1,825 visits** (prevents infinite loops)
- All visits created upfront (no dynamic generation)

---

## Database Schema

```prisma
model Job {
  // NO estimatedCost field!
  
  // Pricing calculated from line items
  subtotal       Decimal
  taxRate        Decimal
  taxAmount      Decimal
  discountType   String?
  discountValue  Decimal?
  discountAmount Decimal
  total          Decimal
  
  // When to bill
  billingFrequency String // AT_COMPLETION, PER_VISIT, WEEKLY, MONTHLY
  
  // Line items (copied to visits)
  lineItems JobLineItem[]
}

model Visit {
  // Each visit has its own line items
  lineItems VisitLineItem[]
}

model Invoice {
  // Invoice aggregates from visit line items
  lineItems InvoiceLineItem[]
}
```

---

## Migration Applied

**Migration:** `remove_job_estimated_cost`

**Changes:**
- ✅ Removed `estimatedCost` column from `jobs` table
- ✅ Updated all forms to remove cost input
- ✅ Updated billing section to show "Total cost calculated from line items"
- ✅ Fixed visit generator for biweekly and monthly patterns

---

## UI Changes

### Before
- Job form had "Estimated Cost" input field
- Users manually entered job cost
- Cost was separate from line items

### After
- Job form only shows "Billing Frequency"
- Note: "Total cost is calculated from line items"
- Cost automatically calculated from line item totals
- Line items section always visible when present

---

## Benefits

✅ **Single Source of Truth:** Cost comes from one place (line items)
✅ **Accuracy:** No mismatch between estimated cost and line item totals
✅ **Flexibility:** Each visit can adjust line items independently
✅ **Transparency:** Clients see itemized breakdown
✅ **Consistency:** Same pattern as estimates and invoices

