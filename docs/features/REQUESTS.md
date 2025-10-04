# Requests

## Overview

Customer service requests - the initial inquiry before quoting or scheduling work.

## Purpose

Capture what the customer needs before pricing or scheduling.

## Request Data

```typescript
Request {
  clientId: string          // Required
  propertyId?: string       // Optional location
  title: string             // What they need
  description?: string      // Details
  source?: string           // "website", "phone", "email", "referral"
  urgency: string           // "low", "normal", "high", "urgent"
  status: string            // "NEW", "CONTACTED", "QUOTED", "CONVERTED", "DECLINED"
  notes?: string            // Internal notes
}
```

## Request Status

**NEW** - Just received, need to contact  
**CONTACTED** - Reached out to customer  
**QUOTED** - Sent estimate  
**CONVERTED** - Became estimate or job  
**DECLINED** - Customer declined or not qualified  

## Urgency Levels

**Low** - No rush, schedule when convenient  
**Normal** - Standard service request  
**High** - Customer wants service soon  
**Urgent** - Emergency or time-sensitive  

## Workflow

1. **Customer submits request** (website, phone, email)
2. **Staff reviews** and updates status
3. **Contact customer** to gather details
4. **Convert to:**
   - **Estimate** - Add pricing and send quote
   - **Job** - Schedule directly if no quote needed

## Converting Requests

### To Estimate
```typescript
// Navigate to: /estimates/new?requestId={id}
// Pre-populates: client, property, title, description
// Add: pricing, line items, tax
```

### To Job
```typescript
// Navigate to: /jobs/new?requestId={id}
// Pre-populates: client, property, title, description
// Add: scheduling, team assignments
```

**Note:** Request data is copied (not referenced) - editing estimate/job doesn't affect original request.

## Best Practices

✅ Track all customer inquiries as requests  
✅ Update status as you progress  
✅ Use urgency to prioritize follow-ups  
✅ Add internal notes for context  
✅ Convert to estimate for pricing discussion  
✅ Convert directly to job for existing clients
