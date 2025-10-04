# Payment System

## Overview

Payments are **snapshots** of invoice totals at the time of payment. This ensures payment records are immutable even if invoice line items change later.

---

## How It Works

### 1. **Payment Creation - Snapshots Invoice Total**

When recording a payment:

```typescript
// 1. Calculate invoice total from line items
const pricing = calculateFullPricing({
  lineItems: invoice.lineItems,
  taxRate: invoice.taxRate
});

// 2. Create payment with snapshot
await prisma.payment.create({
  data: {
    invoiceId: invoice.id,
    amount: amountPaid,
    invoiceTotal: pricing.total, // ← Snapshot at payment time
    method: 'credit_card',
    paidAt: new Date(),
  }
});

// 3. Mark invoice as PAID automatically
await prisma.invoice.update({
  where: { id: invoice.id },
  data: { status: 'PAID', paidAt: new Date() }
});
```

---

### 2. **Invoice Status Logic**

**Simple Rule: If payment exists → Invoice is PAID**

```typescript
// Invoice status determined by payment existence
if (invoice.payments.length > 0) {
  status = 'PAID';
} else {
  status = 'SENT' or 'DRAFT';
}
```

**No complex calculations needed!** The presence of a payment record means the invoice was paid.

---

### 3. **Payment Record Fields**

```prisma
model Payment {
  id           String
  number       Int      // Display number (PAY-0001)
  invoiceId    String
  amount       Decimal  // Amount paid
  invoiceTotal Decimal  // Snapshot of invoice total at payment time
  method       String   // cash, credit_card, etc.
  reference    String?  // Transaction ID, check number
  paidAt       DateTime
}
```

**Key Fields:**
- **`amount`** - How much was paid
- **`invoiceTotal`** - What the invoice total was at payment time (immutable snapshot)
- **`method`** - Payment method
- **`paidAt`** - When payment was received

---

### 4. **Why Snapshot the Total?**

**Problem without snapshot:**
```typescript
// Invoice created
Invoice { lineItems: [...], total: $500 }

// Payment made
Payment { amount: $500 }

// Later, invoice line items edited
Invoice { lineItems: [...], total: $600 }

// ❌ Now payment record doesn't match - was it full payment or partial?
```

**Solution with snapshot:**
```typescript
// Invoice created
Invoice { lineItems: [...] }  // Total calculated: $500

// Payment made
Payment { 
  amount: $500,
  invoiceTotal: $500  // ← Snapshot stored
}

// Later, invoice line items edited
Invoice { lineItems: [...] }  // Total calculated: $600

// ✅ Payment record shows it was full payment at the time ($500 of $500)
```

---

### 5. **Partial Payments** (Future Enhancement)

Currently: One payment = Invoice PAID  
Future: Support multiple payments per invoice

```typescript
// Allow multiple payments
Payment #1: $200 of $500
Payment #2: $300 of $500
Total Paid: $500 → Invoice PAID
```

---

### 6. **Deleting Payments**

**When a payment is deleted:**
1. Payment record removed
2. Invoice status reverts to 'SENT' if no payments remain
3. `paidAt` is cleared

```typescript
await deletePayment(paymentId);
// Result: Invoice status changes from PAID → SENT
```

---

## Business Rules

### ✅ DO

- **Create payment when client pays** - Automatically marks invoice as PAID
- **Snapshot invoice total** - Stores what was owed at payment time
- **One payment per invoice** (for now) - Simplest model

### ❌ DON'T

- **Don't edit payments** - Create new payment + delete old one instead
- **Don't delete payments casually** - Requires confirmation (affects invoice status)
- **Don't partial pay** (yet) - Either full payment or no payment

---

## Implementation

### Creating a Payment

```typescript
// From invoice detail page
await recordPayment({
  invoiceId: invoice.id,
  amount: 500,
  method: 'credit_card',
  reference: 'VISA-1234',
  notes: 'Paid in full',
});

// Result:
// - Payment #1 created with invoiceTotal snapshot
// - Invoice status → PAID
// - Invoice paidAt → current timestamp
```

### Checking Payment Status

```typescript
// Invoice is paid if it has any payment
const isPaid = invoice.payments.length > 0;

// Get payment details
const payment = invoice.payments[0];
console.log(`Paid $${payment.amount} on ${payment.paidAt}`);
console.log(`Invoice total was $${payment.invoiceTotal} at payment time`);
```

---

## Database Schema

```prisma
model Payment {
  id           String   @id @default(cuid())
  number       Int      @unique
  invoiceId    String
  amount       Decimal  // What was paid
  invoiceTotal Decimal  // What was owed (snapshot)
  method       String
  paidAt       DateTime
  
  invoice Invoice @relation(onDelete: Cascade)
}

model Invoice {
  payments Payment[] // Has payment = PAID status
  taxRate  Decimal   // Only rate stored, not total
  lineItems InvoiceLineItem[] // Source of truth for cost
}
```

---

## Migration Required

**To apply changes to database:**

```bash
npx prisma migrate dev --name add_payment_invoice_total_snapshot
```

This will add the `invoiceTotal` column to the payments table.

---

## Future Enhancements

1. **Partial Payments** - Allow multiple payments per invoice
2. **Payment History** - Track all payment attempts and refunds  
3. **Automatic Reminders** - Send payment reminder emails
4. **Payment Links** - Generate payment portal links for clients
5. **Refunds** - Track refunded payments separately

