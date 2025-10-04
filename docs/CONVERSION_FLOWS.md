# Conversion Flows

How to convert between Request → Estimate → Job → Invoice.

## Overview

All conversion flows automatically pre-populate forms with data from the source entity.

```
Request → Estimate → Job → Invoice
   ↓         ↓        ↓        ↓
 Detail    Detail   Detail   Detail
```

**Note:** Request can only convert to Estimate (not directly to Job). This ensures proper pricing workflow.

## How Conversions Work

### 1. Request → Estimate

**From Request Detail Page:**
- Click "Edit" dropdown → "Convert to Estimate"
- Navigates to: `/estimates/new?requestId={id}`

**What Gets Copied:**
- ✅ Client
- ✅ Property
- ✅ Title
- ✅ Description

**What You Add:**
- Line items with pricing
- Tax rate
- Discounts
- Deposit requirements

---

### 2. Estimate → Job

**From Estimate Detail Page:**
- Click "Edit" dropdown → "Convert to Job"
- Navigates to: `/jobs/new?estimateId={id}`

**What Gets Copied:**
- ✅ Client
- ✅ Property
- ✅ Title
- ✅ Description
- ✅ Line items with pricing
- ✅ Tax rate
- ✅ Discount settings

**What You Add:**
- Scheduling (one-off or recurring)
- Team assignments

---

### 3. Job → Invoice

**From Job Detail Page:**
- Click "Edit" dropdown → "Create Invoice"
- Navigates to: `/invoices/new?jobId={id}`
- OR use invoice wizard job selector

**What Gets Copied:**
- ✅ Client (automatically)
- ✅ Line items from job
- ✅ Pricing (subtotal, tax, discount)
- ✅ Completed visits list

**What You Add:**
- Select which visits to bill
- Due date
- Payment terms
- Notes

---

## Technical Implementation

### URL Parameters

Forms check for URL parameters on load:

```typescript
// Estimate form
/estimates/new?requestId=abc123

// Job form
/jobs/new?requestId=abc123
/jobs/new?estimateId=abc123

// Invoice form
/invoices/new?jobId=abc123
```

### Server-Side Pre-Population

```typescript
// Page fetches source entity
const request = await prisma.request.findUnique({ where: { id: requestId } });

// Serialize and pass to form
const fromRequest = serialize({
  clientId: request.clientId,
  title: request.title,
  // ... other fields
});

return <EstimateForm fromRequest={fromRequest} />;
```

### Form Hook Integration

```typescript
// Hook receives source data
const [formData, setFormData] = useState({
  title: existingEntity?.title || fromRequest?.title || '',
  clientId: existingEntity?.clientId || fromRequest?.clientId || '',
  // ... other fields
});
```

---

## Data Independence

**Critical:** When converting, data is **COPIED** not referenced.

✅ Editing the Job doesn't update the Estimate  
✅ Editing the Estimate doesn't update the Request  
✅ Each entity maintains its own independent copy  

**Only shared:** Client and Property references (same records used across all entities)

---

## Example User Flow

1. **Customer submits request** via website
   - Creates Request with title "Pool cleaning needed"
   
2. **Staff reviews and quotes**
   - Click "Convert to Estimate"
   - Pre-filled: client, property, title, description
   - Add: pricing, line items, tax
   - Send to customer
   
3. **Customer approves estimate**
   - Click "Convert to Job"
   - Pre-filled: all estimate data + line items + pricing
   - Add: schedule (weekly recurring), team assignment
   - Save
   
4. **Work completed, ready to bill**
   - Click "Create Invoice"
   - Pre-filled: client, line items, pricing from job
   - Add: due date, select completed visits
   - Send to customer

All data flows smoothly, no re-entering information! ✅

