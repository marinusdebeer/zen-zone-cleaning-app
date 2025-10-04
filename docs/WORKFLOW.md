# Business Workflow

How the Request → Estimate → Job → Invoice flow works.

## Overview

```
Request → Estimate → Job → Invoice
```

Each step is independent - data is copied when converting.

## Flow Stages

### 1. Request (Customer Inquiry)
- Initial contact from website, phone, or email
- Capture what customer needs
- No pricing yet
- Converts to Estimate (pricing required before job)

### 2. Estimate (Quote)
- Add pricing to request line items
- Include tax, discounts, deposit
- Send to client for approval
- Can convert to Job when approved

### 3. Job (Scheduled Work)
- Copy estimate data and pricing
- Add scheduling (one-off or recurring)
- Generate visits automatically
- Assign team members
- Can create Invoices

### 4. Invoice (Billing)
- Copy job line items and pricing
- Select which visits to bill
- Send to client
- Track payments

## Data Independence

**Key Principle:** Editing one entity doesn't affect another.

When converting:
- Data is **copied** (not referenced)
- Each has own line items table
- Only Client and Property are shared

**Example:**
```
Estimate: "Deep Clean - $200"
   ↓ convert
Job: "Deep Clean - $200" (copied)
   ↓ edit job
Job: "Deep Clean + Windows - $250"

Estimate still shows: $200 ✅
```

## Skipping Steps

You can create any entity independently:

- **Standalone Request** - Customer inquiry without quote
- **Standalone Estimate** - Quote without prior request
- **Standalone Job** - Schedule work without estimate
- **Standalone Invoice** - Bill for unscheduled work

## Conversion Tracking

One-way references track lineage:

```typescript
Request.convertedToEstimateId → Estimate
Estimate.convertedFromRequestId ← Request
Estimate.convertedToJobId → Job
Job.convertedFromEstimateId ← Estimate
```

This maintains audit trail without coupling data.

## Related

- [Requests](/docs/features/REQUESTS.md)
- [Estimates](/docs/features/ESTIMATES.md)
- [Jobs](/docs/features/JOBS.md)
- [Invoices](/docs/features/INVOICES.md)
- [Clients](/docs/features/CLIENTS.md)

