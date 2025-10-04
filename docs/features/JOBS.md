# Jobs

## Overview

Scheduled work to be performed - one-off or recurring.

## Purpose

Represents actual work agreement with client, including scheduling and team assignments.

## Job Data

```typescript
Job {
  clientId: string          // Required
  propertyId?: string
  title?: string            // Optional - will display client name if not provided
  description?: string
  jobNumber?: string        // Auto-generated ID
  
  // Scheduling
  isRecurring: boolean
  recurringPattern?: "daily" | "weekly" | "biweekly" | "monthly"
  recurringDays?: number[]  // [0-6] for days of week
  startDate?: Date
  recurringEndDate?: Date
  
  // Pricing (same structure as Estimate)
  subtotal: Decimal
  taxRate: Decimal
  taxAmount: Decimal
  discountType?: "percentage" | "fixed"
  discountValue?: Decimal
  discountAmount: Decimal
  total: Decimal
  
  billingFrequency: string  // AT_COMPLETION, PER_VISIT, WEEKLY, MONTHLY
  priority: string          // low, normal, high, urgent
  status: string            // Draft, Active, Completed, Canceled
  notes?: string
  
  // Relations
  lineItems: JobLineItem[]
  visits: Visit[]
  invoices: Invoice[]
  expenses: Expense[]
}
```

## Job Types

**One-off Job:**
- Single visit
- Specific date/time
- Example: Spring cleaning, move-out clean

**Recurring Job:**
- Multiple visits generated automatically
- Pattern: daily, weekly, biweekly, monthly
- Example: Office cleaning every Monday/Wednesday

## Visits

Jobs generate visits (work occurrences):

**One-off:** Creates 1 visit  
**Recurring:** Creates all visits upfront based on pattern

```typescript
Visit {
  jobId: string
  scheduledAt: Date
  status: "Scheduled" | "In Progress" | "Completed" | "Canceled"
  assignees: string[]       // Team member IDs
  notes?: string
}
```

## Line Items

Work to be performed:

```typescript
JobLineItem {
  name: string
  description?: string
  quantity: Decimal
  unitPrice: Decimal
  total: Decimal
}
```

Copied from estimate when converting, or entered manually.

## Status Flow

```
Draft → Active → Completed
           ↓
       Canceled
```

## Billing Frequency

**AT_COMPLETION** - Invoice after all work done  
**PER_VISIT** - Invoice after each visit  
**WEEKLY** - Invoice weekly for all visits  
**MONTHLY** - Invoice monthly for all visits  

## Converting from Estimate

- Copy: title, description, clientId, propertyId
- Copy: line items, pricing
- Add: scheduling (startDate, recurring settings)
- Set: convertedFromEstimateId
- Generate: visits based on schedule

## Converting to Invoice

- Reference: jobId, clientId
- Copy: line items, pricing
- Select: which visits to bill
- Calculate: totals

## Related

- [Estimates](/docs/features/ESTIMATES.md)
- [Invoices](/docs/features/INVOICES.md)
- [Job Scheduling](/docs/features/JOB_SCHEDULING.md)
- [Calendar](/docs/features/CALENDAR.md)

