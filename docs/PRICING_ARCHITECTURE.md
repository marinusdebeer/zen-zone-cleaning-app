# Pricing Architecture

## Overview

**Core Principle:** All costs are **calculated from line items at runtime**. No pricing values (subtotal, total, tax amount, etc.) are stored in the database.

This ensures:
- ✅ **Single source of truth** - Line items are the only place costs exist
- ✅ **No data inconsistencies** - Can't have mismatched totals
- ✅ **Easy refunds/adjustments** - Edit line items and totals recalculate automatically
- ✅ **Audit trail** - All pricing changes tracked through line item history

---

## Database Schema

### What IS Stored

**Estimates, Jobs, and Invoices:**
```prisma
model Estimate {
  // ✅ STORED: Tax rate (default 13%)
  taxRate Decimal @default(13)
  
  // ✅ STORED: Deposit settings (optional)
  depositRequired Boolean
  depositType     String?  // "percentage" or "fixed"
  depositValue    Decimal? // e.g., 25 for 25%
  
  // ✅ STORED: Line items (the source of all costs)
  lineItems EstimateLineItem[]
}

model Job {
  // ✅ STORED: Tax rate (default 13%)
  taxRate Decimal @default(13)
  
  // ✅ STORED: Line items
  lineItems JobLineItem[]
}

model Invoice {
  // ✅ STORED: Tax rate (default 13%)
  taxRate Decimal @default(13)
  
  // ✅ STORED: Line items
  lineItems InvoiceLineItem[]
}
```

### What is NOT Stored

**❌ REMOVED from database:**
- `subtotal` - Calculated from `sum(lineItems.total)`
- `taxAmount` - Calculated from `subtotal × (taxRate / 100)`
- `discountType` - Not stored anymore
- `discountValue` - Not stored anymore
- `discountAmount` - Calculated if needed
- `total` - Calculated from `subtotal + taxAmount - discountAmount`
- `amount` - Removed (duplicate of total)
- `depositAmount` - Calculated from deposit settings

---

## Runtime Calculation

### How Totals Are Calculated

**Step 1: Calculate Subtotal**
```typescript
import { calculateLineItemsTotal } from '@/lib/pricing-calculator';

const lineItems = [
  { quantity: 1, unitPrice: 300, total: 300 },
  { quantity: 2, unitPrice: 75, total: 150 },
];

const subtotal = calculateLineItemsTotal(lineItems);
// Result: $450
```

**Step 2: Calculate Tax**
```typescript
import { calculateTax } from '@/lib/pricing-calculator';

const taxRate = 13; // 13%
const taxAmount = calculateTax(subtotal, taxRate);
// Result: $58.50
```

**Step 3: Calculate Total**
```typescript
import { calculateGrandTotal } from '@/lib/pricing-calculator';

const total = calculateGrandTotal(subtotal, taxAmount, 0);
// Result: $508.50
```

**Complete Calculation:**
```typescript
import { calculateFullPricing } from '@/lib/pricing-calculator';

const pricing = calculateFullPricing({
  lineItems,
  taxRate: 13,
  discountType: 'fixed',
  discountValue: 20,
  depositRequired: true,
  depositType: 'percentage',
  depositValue: 25,
});

console.log(pricing);
// {
//   subtotal: 450,
//   taxRate: 13,
//   taxAmount: 55.90,  // Tax on $430 (after $20 discount)
//   discountAmount: 20,
//   total: 485.90,
//   depositAmount: 121.48,  // 25% of total
// }
```

---

## Data Flow

### Estimate → Job → Visit → Invoice

```
1. ESTIMATE
   Line Items: $300 + $150 = $450
   Tax Rate: 13%
   (No stored totals)
   
   ↓ Convert to Job
   
2. JOB  
   Line Items: $300 + $150 = $450 (copied)
   Tax Rate: 13% (inherited)
   (No stored totals)
   
   ↓ Create Visits
   
3. VISIT
   Line Items: $300 + $150 = $450 (copied)
   (Each visit has its own copy)
   
   ↓ Complete & Invoice
   
4. INVOICE
   Line Items: $300 + $150 = $450 (from visit)
   Tax Rate: 13% (inherited from job)
   (No stored totals)
   
   ↓ Display to user
   
5. CALCULATED PRICING
   Subtotal: $450 (sum of line items)
   Tax: $58.50 (calculated)
   Total: $508.50 (calculated)
```

---

## Tax Rate Inheritance

**Default: 13% (Ontario HST)**

**Flow:**
```
Estimate (13%) → Job (13%) → Invoice (13%)
```

**User can override at any stage:**
- Estimate: Set tax rate when creating
- Job: Inherits from estimate or set manually
- Invoice: Inherits from job or set manually

---

## Deposit Calculation

**Stored:**
- `depositRequired: true/false`
- `depositType: "percentage" | "fixed"`
- `depositValue: number` (e.g., 25 for 25%)

**Calculated:**
- `depositAmount` = calculated at runtime

**Example:**
```typescript
// 25% deposit on $508.50 total
depositAmount = 508.50 × 0.25 = $127.13
```

---

## UI Display

### Estimate Detail Page

**Display pricing breakdown:**
```tsx
import { calculateFullPricing } from '@/lib/pricing-calculator';

const pricing = calculateFullPricing({
  lineItems: estimate.lineItems,
  taxRate: estimate.taxRate,
  depositRequired: estimate.depositRequired,
  depositType: estimate.depositType,
  depositValue: estimate.depositValue,
});

// Display:
// Subtotal: $450.00
// Tax (13%): $58.50
// Total: $508.50
// Deposit Due: $127.13
```

### Invoice Detail Page

**Display total with payments:**
```tsx
const pricing = calculateFullPricing({
  lineItems: invoice.lineItems,
  taxRate: invoice.taxRate,
});

const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
const balance = pricing.total - totalPaid;

// Display:
// Total: $508.50
// Paid: $508.50
// Balance: $0.00
```

---

## Migration Required

**Migration Name:** `remove_stored_pricing_fields`

**Drops these columns:**

**From `estimates`:**
- ❌ `subtotal`
- ❌ `taxAmount`
- ❌ `discountType`
- ❌ `discountValue`
- ❌ `discountAmount`
- ❌ `total`
- ❌ `amount`
- ❌ `depositAmount`

**From `jobs`:**
- ❌ `subtotal`
- ❌ `taxAmount`
- ❌ `discountType`
- ❌ `discountValue`
- ❌ `discountAmount`
- ❌ `total`

**From `invoices`:**
- ❌ `subtotal`
- ❌ `taxAmount`
- ❌ `discountType`
- ❌ `discountValue`
- ❌ `discountAmount`
- ❌ `total`

**Keeps:**
- ✅ `taxRate` (default 13%)
- ✅ `depositRequired`, `depositType`, `depositValue` (estimates only)
- ✅ `lineItems` (the source of all costs)

---

## Benefits

### 1. **Data Integrity**
- No risk of subtotal ≠ sum(line items)
- All totals are always accurate
- Single source of truth

### 2. **Flexibility**
- Edit line items, totals update automatically
- Add/remove items without recalculating stored fields
- Easy to implement refunds

### 3. **Audit Trail**
- Line item changes show exactly what changed
- No "phantom" total updates
- Clear cost history

### 4. **Simplified Code**
- No need to update multiple fields when line items change
- No synchronization bugs
- Easier testing

### 5. **Storage Efficiency**
- Less data stored
- Fewer columns to index
- Smaller database

---

## Code Examples

### Creating an Estimate

**Before (with stored costs):**
```typescript
const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
const taxAmount = subtotal * 0.13;
const total = subtotal + taxAmount;

await prisma.estimate.create({
  data: {
    subtotal,    // ❌ Redundant
    taxRate: 13,
    taxAmount,   // ❌ Redundant
    total,       // ❌ Redundant
    lineItems: { create: lineItems },
  },
});
```

**After (calculated at runtime):**
```typescript
await prisma.estimate.create({
  data: {
    taxRate: 13,                         // ✅ Only this
    lineItems: { create: lineItems },   // ✅ And this
  },
});

// Later, when displaying:
const pricing = calculateFullPricing({
  lineItems: estimate.lineItems,
  taxRate: estimate.taxRate,
});
console.log(pricing.total); // $508.50
```

---

## Breaking Changes

### API Responses

**Estimate, Job, Invoice objects NO LONGER have:**
- `.subtotal`
- `.taxAmount`
- `.discountType`
- `.discountValue`
- `.discountAmount`
- `.total`
- `.amount`

**Instead, calculate on the client:**
```tsx
'use client';

import { calculateFullPricing } from '@/lib/pricing-calculator';

function EstimateDetail({ estimate }) {
  const pricing = calculateFullPricing({
    lineItems: estimate.lineItems,
    taxRate: estimate.taxRate,
  });
  
  return (
    <div>
      <p>Total: ${pricing.total.toFixed(2)}</p>
    </div>
  );
}
```

---

## Migration Steps

**1. Run the migration:**
```bash
npx prisma migrate dev --name remove_stored_pricing_fields
```

**2. Update all UI components to calculate pricing:**
- Estimate detail pages
- Job detail pages  
- Invoice detail pages
- List views showing totals
- Email templates

**3. Update server actions:**
- Remove pricing calculations from create/update actions
- Let Prisma defaults handle taxRate (13%)

**4. Test thoroughly:**
- Create new estimate
- Convert to job
- Create invoice from visit
- Verify all totals calculate correctly

---

## Future Enhancements

With this architecture, we can easily add:
- **Multi-currency support** - Convert at display time
- **Promotional codes** - Apply discounts dynamically
- **Volume discounts** - Calculate based on line item quantity
- **Time-based pricing** - Different rates for different time periods
- **Tax exemptions** - Override tax rate to 0% for specific clients

All without schema changes! 🎉

