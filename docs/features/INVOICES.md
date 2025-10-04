# Invoices

## Overview

Billing documents for completed work.

## Purpose

Bill clients for services performed and track payments.

## Invoice Data

```typescript
Invoice {
  clientId: string          // Required
  jobId: string             // Required
  propertyId?: string
  invoiceNumber?: string    // Auto-generated
  visitIds: string[]        // Which visits are billed
  
  // Pricing
  subtotal: Decimal
  taxRate: Decimal
  taxAmount: Decimal
  discountType?: "percentage" | "fixed"
  discountValue?: Decimal
  discountAmount: Decimal
  total: Decimal
  
  status: string            // DRAFT, SENT, PAID, OVERDUE, CANCELED
  issuedAt?: Date           // When sent to client
  dueAt?: Date              // Payment due date
  paidAt?: Date             // When fully paid
  notes?: string
  
  // Relations
  lineItems: InvoiceLineItem[]
  payments: Payment[]
}
```

## Line Items

Billed services (copied from job):

```typescript
InvoiceLineItem {
  name: string
  description?: string
  quantity: Decimal
  unitPrice: Decimal
  total: Decimal
}
```

## Status Flow

```
DRAFT → SENT → PAID
          ↓
      OVERDUE
          ↓
      CANCELED
```

**DRAFT** - Being prepared  
**SENT** - Sent to client  
**PAID** - Fully paid  
**OVERDUE** - Past due date, not paid  
**CANCELED** - Voided  

## Payments

Track received payments:

```typescript
Payment {
  invoiceId: string
  amount: Decimal
  method: string            // "cash", "credit_card", "check", "etransfer"
  reference?: string        // Transaction ID, check number
  paidAt: Date
  notes?: string
}
```

Invoice is marked PAID when total payments ≥ invoice total.

## Creating from Job

```typescript
// Copy from job
{
  clientId: job.clientId,
  jobId: job.id,
  propertyId: job.propertyId,
  lineItems: [...job.lineItems],  // Copied
  subtotal: job.subtotal,
  taxRate: job.taxRate,
  total: job.total
}
```

Line items and pricing are copied for independence.

## Billing Scenarios

**Single Invoice:** Bill entire job at completion  
**Per Visit:** Create invoice after each visit  
**Progress Billing:** Create multiple invoices over time  

## Related

- [Jobs](/docs/features/JOBS.md)
- [Clients](/docs/features/CLIENTS.md)

