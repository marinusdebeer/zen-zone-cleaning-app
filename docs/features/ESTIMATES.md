# Estimates

## Overview

Formal quotes sent to clients with detailed pricing.

## Purpose

Provide clients with a detailed quote before work begins.

## Estimate Data

```typescript
Estimate {
  clientId: string          // Required (LEAD or ACTIVE)
  propertyId?: string
  title: string
  description?: string
  
  // Pricing (calculated from line items)
  subtotal: Decimal
  taxRate: Decimal          // Percentage (e.g., 8.25)
  taxAmount: Decimal        // Calculated
  discountType?: "percentage" | "fixed"
  discountValue?: Decimal
  discountAmount: Decimal   // Calculated
  total: Decimal            // Subtotal + Tax - Discount
  
  // Deposit
  depositRequired: boolean
  depositType?: "percentage" | "fixed"
  depositValue?: Decimal
  depositAmount: Decimal    // Calculated
  
  status: string            // DRAFT, SENT, APPROVED, REJECTED, CONVERTED
  validUntil?: Date
  notes?: string
  
  // Relations
  lineItems: EstimateLineItem[]
}
```

## Line Items

Services with pricing:

```typescript
EstimateLineItem {
  name: string
  description?: string
  quantity: Decimal
  unitPrice: Decimal
  total: Decimal            // quantity × unitPrice
  order: number             // Display order
}
```

## Pricing Calculation

```
Subtotal = Σ(line item totals)
Tax Amount = Subtotal × (taxRate / 100)
Discount Amount = 
  if percentage: Subtotal × (discountValue / 100)
  if fixed: discountValue
Total = Subtotal + Tax - Discount
```

## Deposit Calculation

```
if depositType = "percentage": 
  depositAmount = Total × (depositValue / 100)
if depositType = "fixed": 
  depositAmount = depositValue
```

## Status Flow

```
DRAFT → SENT → APPROVED → CONVERTED
                   ↓
               REJECTED
```

## Converting to Job

When approved, convert to job:
- Copy: title, description, clientId, propertyId
- Copy: all line items
- Copy: pricing fields
- Set: estimate.status = "CONVERTED"
- Set: estimate.convertedToJobId

Data is independent - editing job won't affect estimate.

## Related

- [Requests](/docs/features/REQUESTS.md)
- [Jobs](/docs/features/JOBS.md)
- [Clients](/docs/features/CLIENTS.md)

