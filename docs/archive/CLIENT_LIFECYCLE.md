# Client Lifecycle Architecture

## Overview

We use a **single unified `Client` table** instead of separate Lead and Client tables. This simplifies the data model and eliminates complex conversion logic.

## Client Status Lifecycle

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│                                                 │
│  clientStatus: LEAD → ACTIVE → INACTIVE        │
│                         ↓                       │
│                     ARCHIVED                    │
└─────────────────────────────────────────────────┘
```

## Client Model Fields

```typescript
Client {
  // Core fields (always used)
  id: string
  orgId: string
  name: string
  emails: json[]
  phones: json[]
  addresses: json[]
  
  // Lifecycle management
  clientStatus: "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
  
  // Lead-specific fields (only meaningful when clientStatus = "LEAD")
  leadSource: string?  // "website", "phone", "referral", "email"
  leadStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
  
  // General fields
  notes: string?
  custom: json
  
  // Relations
  properties: Property[]
  requests: Request[]
  estimates: Estimate[]
  jobs: Job[]
  invoices: Invoice[]
}
```

## Status Definitions

### `clientStatus` (Main Lifecycle)

| Status | Description | Typical Use |
|--------|-------------|-------------|
| **LEAD** | Potential customer, not yet converted | Initial contact, quote sent, negotiating |
| **ACTIVE** | Current customer with ongoing/recent work | Has jobs, receives services |
| **INACTIVE** | Past customer, no recent activity | Haven't worked with them recently |
| **ARCHIVED** | Historical record, no longer a customer | Moved away, out of business, etc. |

### `leadStatus` (Only for clientStatus = "LEAD")

| Status | Description | Next Action |
|--------|-------------|-------------|
| **NEW** | Just submitted request/inquiry | Need to contact |
| **CONTACTED** | We've reached out | Waiting for response |
| **QUALIFIED** | Interested and qualified | Send quote |
| **CONVERTED** | Accepted quote, became active client | Change clientStatus to ACTIVE |
| **LOST** | Not interested or chose competitor | Mark as lost |

## Workflow Examples

### Example 1: Website Inquiry → Active Client

```typescript
// 1. Customer submits request from website
createClient({
  name: "John's Office",
  email: "john@example.com",
  clientStatus: "LEAD",
  leadSource: "website",
  leadStatus: "NEW"
})

// 2. Sales contacts them
updateClient(id, {
  leadStatus: "CONTACTED",
  notes: "Called, interested in weekly cleaning"
})

// 3. Qualified, send estimate
updateClient(id, {
  leadStatus: "QUALIFIED"
})
createEstimate({ clientId: id, ... })

// 4. They accept! Convert to active client
updateClient(id, {
  clientStatus: "ACTIVE",
  leadStatus: "CONVERTED"
})
createJob({ clientId: id, ... })
```

### Example 2: Existing Client Inquiry

```typescript
// Client already in system with clientStatus = "ACTIVE"
// They submit a new request - no status change needed
createRequest({
  clientId: existingClientId,  // Already ACTIVE
  title: "Additional property cleaning"
})
```

### Example 3: Referral Lead

```typescript
// Referral from existing client
createClient({
  name: "Jane's Bakery",
  phone: "555-1234",
  clientStatus: "LEAD",
  leadSource: "referral",
  leadStatus: "NEW",
  notes: "Referred by John's Office"
})
```

## Query Patterns

### Get All Leads
```typescript
await prisma.client.findMany({
  where: { 
    orgId: orgId,
    clientStatus: "LEAD" 
  },
  orderBy: { createdAt: 'desc' }
})
```

### Get Active Clients
```typescript
await prisma.client.findMany({
  where: { 
    orgId: orgId,
    clientStatus: "ACTIVE" 
  },
  orderBy: { name: 'asc' }
})
```

### Get New Leads That Need Attention
```typescript
await prisma.client.findMany({
  where: { 
    orgId: orgId,
    clientStatus: "LEAD",
    leadStatus: "NEW"
  }
})
```

### Get All Clients (for dropdown selectors)
```typescript
await prisma.client.findMany({
  where: { 
    orgId: orgId,
    clientStatus: { in: ["LEAD", "ACTIVE"] }  // Exclude INACTIVE/ARCHIVED
  },
  orderBy: { name: 'asc' }
})
```

## UI Considerations

### Lead Management Page
- Filter by `clientStatus = "LEAD"`
- Show `leadStatus` as chips/badges
- Actions: Contact, Qualify, Convert to Client, Mark as Lost

### Client Management Page
- Filter by `clientStatus = "ACTIVE"`
- Show recent jobs, total revenue, etc.
- Actions: Create Job, Create Estimate, View History

### Unified Contact Selector
```typescript
// For Request/Estimate/Job forms
// Show all LEAD + ACTIVE clients
<ClientSelect
  clients={clients.filter(c => 
    c.clientStatus === 'LEAD' || c.clientStatus === 'ACTIVE'
  )}
/>
```

## Conversion Function

```typescript
async function convertLeadToActiveClient(clientId: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: {
      clientStatus: "ACTIVE",
      leadStatus: "CONVERTED"
    }
  })
  
  // Optionally trigger notifications, update dashboard, etc.
}
```

## Benefits of This Approach

✅ **Simpler Data Model** - One table instead of two  
✅ **No Complex Migrations** - No need to "convert" records between tables  
✅ **Unified Search** - Search all contacts in one place  
✅ **Flexible** - Easy to move between statuses  
✅ **Historical Tracking** - Keep leadStatus even after conversion  
✅ **Reporting** - Easy to report on conversion rates  

## Migration from Separate Lead/Client Tables

If you previously had separate tables:

```sql
-- Migrate leads into clients table
INSERT INTO clients (id, orgId, name, emails, phones, clientStatus, leadSource, leadStatus, ...)
SELECT id, orgId, name, emails, phones, 'LEAD', source, status, ...
FROM leads;

-- Update references
UPDATE estimates SET clientId = leadId WHERE leadId IS NOT NULL;
UPDATE requests SET clientId = leadId WHERE leadId IS NOT NULL;

-- Drop old tables
DROP TABLE leads;
```

## Related Documentation

- See `/docs/DATA_FLOW_ARCHITECTURE.md` for overall data flow
- See `/docs/SCHEMA_UPGRADE_SUMMARY.md` for technical details

