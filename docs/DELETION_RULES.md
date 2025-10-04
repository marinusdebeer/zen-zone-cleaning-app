# Deletion & Archive Rules

## Overview

The system has carefully designed deletion behavior to protect data integrity while allowing flexibility. This document explains how deletions cascade and when confirmations are required.

---

## Job Deletion

### Behavior
- **Deletes ALL visits** (scheduled, in-progress, completed, and canceled)
- **Does NOT delete invoices** (invoices are protected)
- Visit line items are cascade deleted with visits

### Confirmation Required
✅ **Yes** - Warning shows total visit count before deletion

### Use Case
When a job is completely canceled or no longer needed, deleting it removes all associated visits from the schedule.

### Example
```typescript
// Delete job with 15 visits
await deleteJob(orgId, jobId);
// Result: Job + 15 visits deleted
// Invoices remain (unlinked from visits)
```

---

## Job Archive

### Behavior
- **Changes job status** to "Archived"
- **Deletes only incomplete visits** (Scheduled, InProgress)
- **Keeps completed visits** intact
- Useful for jobs that are "done" but not deleted

### Confirmation Required
✅ **Yes** - Warning shows incomplete visit count

### Use Case
When a job is finished but you want to keep the completed visits and their invoicing history.

### Example
```typescript
// Job has 10 scheduled, 5 completed visits
await archiveJob(orgId, jobId);
// Result: 
// - Job status → Archived
// - 10 scheduled visits deleted
// - 5 completed visits kept
```

---

## Visit Deletion

### Behavior - No Invoice
- Simply deletes the visit
- Line items cascade delete

### Behavior - With Invoice
- **User chooses** to also delete invoice
- If yes: Invoice deleted, visit deleted
- Invoice deletion unlinks all visits (SetNull cascade)

### Confirmation Required
✅ **Yes** - If invoiced, shows invoice info and warns both will be deleted

### Use Cases
1. **Not Invoiced:** Cancel a visit that's no longer needed
2. **Invoiced:** Undo an invoice by deleting it along with the visit

### Example
```typescript
// Visit is invoiced
await deleteVisit(visitId, deleteInvoice: true);
// Result: Both visit and invoice deleted

// Visit not invoiced
await deleteVisit(visitId, deleteInvoice: false);
// Result: Only visit deleted
```

---

## Invoice Deletion

### Behavior
- **Allowed even if visits link to it**
- Visits are unlinked (`invoiceId` set to `null`)
- Completed visits become "Ready to Invoice" again
- Line items and payments cascade delete with invoice

### Confirmation Required
✅ **Depends on status:**
- **DRAFT:** No confirmation
- **SENT, PAID, OVERDUE:** Strong confirmation required

### UI Behavior After Deletion
Completed visits show:
- ✅ Status: "Ready to Invoice" (yellow badge)
- ❌ No longer shows invoice link

### Use Case
Undo an invoice that was created incorrectly or needs to be redone.

### Example
```typescript
// Invoice has 3 visits linked
await deleteInvoice(invoiceId);
// Result:
// - Invoice deleted
// - 3 visits now have invoiceId = null
// - Visits show as "Ready to Invoice"
```

---

## Schema Relationships

```prisma
Visit {
  job       Job      @relation(onDelete: Cascade)  // ✅ Delete job → deletes visits
  invoice   Invoice? @relation(onDelete: SetNull)  // ✅ Delete invoice → unlinks visits
  lineItems VisitLineItem[] (onDelete: Cascade)    // ✅ Delete visit → deletes line items
}

Invoice {
  visits Visit[] // No cascade restriction - can be deleted
}

Job {
  visits Visit[] // Cascade - deleting job deletes visits
}
```

---

## Confirmation Messages

### Delete Job
```
⚠️ Delete Job?
This job has 15 visits (8 completed, 7 scheduled).
All visits will be permanently deleted.
Invoices will remain but will be unlinked.

[Cancel] [Delete Job & All Visits]
```

### Archive Job
```
⚠️ Archive Job?
This job has 7 incomplete visits that will be deleted.
5 completed visits will be kept.
The job will be marked as Archived.

[Cancel] [Archive Job]
```

### Delete Visit (No Invoice)
```
⚠️ Delete Visit?
Are you sure you want to delete this visit?
This action cannot be undone.

[Cancel] [Delete Visit]
```

### Delete Visit (With Invoice)
```
⚠️ Delete Visit & Invoice?
This visit is linked to Invoice #INV-123 ($450.00).
Deleting this visit will also delete the invoice.
This action cannot be undone.

⚠️ Both the visit and invoice will be permanently deleted

[Cancel] [Delete Both]
```

### Delete Invoice (DRAFT)
```
Delete Invoice?
[Delete] (no confirmation)
```

### Delete Invoice (PAID)
```
⚠️ Delete PAID Invoice?
This invoice has been PAID!
This will unlink 3 visits and delete all payment records.
Are you absolutely sure?

[Cancel] [Yes, Delete Invoice]
```

---

## Status Flow

### Visit Status After Invoice Deletion
```
Before: Completed + invoiceId=123 → Shows "Invoiced" (blue badge)
After:  Completed + invoiceId=null → Shows "Ready to Invoice" (yellow badge)
```

### Visit Status Display Logic
```typescript
if (visit.status === 'Completed' && visit.invoiceId) {
  // Blue badge: "Invoiced"
  // Show invoice link
} else if (visit.status === 'Completed' && !visit.invoiceId) {
  // Yellow badge: "Ready to Invoice"
  // Show "Create Invoice" action
} else {
  // Other status badges (Scheduled, In Progress, etc.)
}
```

---

## Protection Rules

| Entity | Can Delete? | Cascades To | Protected By |
|--------|-------------|-------------|--------------|
| **Job** | ✅ Yes (with warning) | All visits | Visit count warning |
| **Visit (no invoice)** | ✅ Yes | Line items | Basic confirmation |
| **Visit (invoiced)** | ✅ Yes (if delete invoice too) | Invoice + line items | Strong warning |
| **Invoice (DRAFT)** | ✅ Yes | Payments, line items | None |
| **Invoice (SENT/PAID)** | ✅ Yes (with warning) | Payments, line items | Strong confirmation |

---

## Best Practices

1. **Archive instead of delete** when possible for jobs
2. **Always review visit counts** before deleting jobs
3. **Check invoice status** before deleting visits
4. **Use DRAFT status** for invoices that might change
5. **Document why** you're deleting important entities

---

## Error Messages

```typescript
// Trying to delete non-existent entity
"Job not found"
"Visit not found"
"Invoice not found"

// Missing permissions
"Unauthorized: User not a member of this organization"

// Unexpected errors
"Failed to delete job: [error details]"
```

