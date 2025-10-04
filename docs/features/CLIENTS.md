# Clients

## Overview

Unified client system where leads and active clients use the same model with lifecycle status.

## Client Status

```
LEAD → ACTIVE → INACTIVE → ARCHIVED
```

**LEAD** - Potential customer, initial contact  
**ACTIVE** - Current customer, ongoing work  
**INACTIVE** - Past customer, no recent activity  
**ARCHIVED** - Historical record only  

## Lead Tracking

When `clientStatus = "LEAD"`, use `leadStatus` for pipeline tracking:

**NEW** - Just submitted inquiry  
**CONTACTED** - Reached out, waiting for response  
**QUALIFIED** - Interested and qualified  
**CONVERTED** - Became active client  
**LOST** - Not interested or chose competitor  

## Converting Lead to Client

```typescript
await prisma.client.update({
  where: { id: clientId },
  data: {
    clientStatus: "ACTIVE",
    leadStatus: "CONVERTED"
  }
})
```

## Client Data

```typescript
Client {
  name: string
  emails: string[]
  phones: string[]
  addresses: string[]
  clientStatus: "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
  leadSource?: string  // "website", "phone", "referral"
  leadStatus: string
  notes?: string
  
  // Relations
  properties: Property[]
  requests: Request[]
  estimates: Estimate[]
  jobs: Job[]
  invoices: Invoice[]
}
```

## Queries

**Get Leads:**
```typescript
prisma.client.findMany({
  where: { clientStatus: "LEAD" }
})
```

**Get Active Clients:**
```typescript
prisma.client.findMany({
  where: { clientStatus: "ACTIVE" }
})
```

**Get Clients for Selector:**
```typescript
prisma.client.findMany({
  where: { 
    clientStatus: { in: ["LEAD", "ACTIVE"] }
  },
  orderBy: { name: 'asc' }
})
```

## Related

- [Database](/docs/architecture/DATABASE.md)
- [Requests](/docs/features/REQUESTS.md)
- [Estimates](/docs/features/ESTIMATES.md)

