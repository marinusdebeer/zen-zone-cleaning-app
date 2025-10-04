# Form Ingestion API Documentation

## Overview

The form ingestion API accepts your website's evolving form submissions, normalizes the data, and creates a Request with associated Client and Property records.

---

## Endpoint

**POST** `/api/requests`

---

## Authentication

**Header Required:**
```
x-zenzone-secret: YOUR_SECRET_KEY
```

Set `FORM_INGEST_SECRET` in your `.env` file.

---

## Request Format

### Complete Example

```json
{
  "submissionId": "req_2024_10_03_abc123xyz",
  "timestamp": "2024-10-03T14:32:15.000Z",
  "formVersion": "2.0",
  
  "contactInfo": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "company": "",
    "email": "sarah.johnson@gmail.com",
    "phone": "+1 (705) 555-1234"
  },
  
  "serviceDetails": {
    "industry": "Home Cleaning",
    "bookingType": "One-Time",
    "cleaningType": "Standard Cleaning",
    "frequency": null,
    "firstTimeDeepCleaning": false,
    "reason": "Preparing for guests/event",
    "reasonOther": ""
  },
  
  "propertyDetails": {
    "propertyType": "House",
    "squareFootage": 2200,
    "levels": 2,
    "bedrooms": 4,
    "bathrooms": 2,
    "powderRooms": 1,
    "basement": "Finished",
    "propertyCondition": "Lived-in",
    "lastCleaned": "3-6 months",
    "occupancyStatus": "Occupied",
    "people": 4,
    "pets": "Dog(s)",
    "petDetails": "1 golden retriever, moderate shedding",
    "furnished": "Fully Furnished",
    "ceilingHeight": "Standard",
    "flooringTypes": ["Hardwood", "Tile", "Carpet"],
    "builtYear": "2010",
    "lastRenovated": "2020",
    "parkingInfo": "Driveway available for 2 vehicles"
  },
  
  "addOns": {
    "extras": ["Inside Oven", "Deep Clean of Baseboards"],
    "interiorWindows": "Basic - Shine Glass",
    "insideEmptyKitchenCabinets": "Not Needed"
  },
  
  "photos": [
    {
      "url": "https://your-storage.com/photos/room1.jpg",
      "name": "Living Room",
      "mimeType": "image/jpeg",
      "sizeBytes": 1024000
    },
    {
      "url": "https://your-storage.com/photos/kitchen.jpg",
      "name": "Kitchen",
      "mimeType": "image/jpeg",
      "sizeBytes": 890000
    }
  ],
  
  "location": {
    "address": "123 Maple Avenue",
    "city": "Barrie",
    "province": "ON",
    "postalCode": "L4N 5J4"
  },
  
  "scheduling": {
    "datePreferences": "Next Thursday morning, between 9am-12pm",
    "accessMethod": "Key hidden on premises",
    "accessDetails": "",
    "specialRequests": "Please focus extra attention on the kitchen."
  },
  
  "marketingInfo": {
    "hearAbout": "Google Maps or GBP",
    "referralName": null,
    "hearAboutOther": null
  },
  
  "pricing": {
    "estimatedPrice": 345,
    "priceRange": {
      "min": 317,
      "max": 373
    },
    "confidence": "high",
    "breakdown": {
      "basePrice": 220,
      "addOnsTotal": 78
    }
  },
  
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "deviceType": "desktop",
    "referrer": "https://google.com",
    "sessionId": "sess_abc123",
    "formMode": "step",
    "completionTime": 420
  }
}
```

---

## Response Format

### Success (201 Created)

```json
{
  "success": true,
  "requestId": "clxxx...",
  "requestNumber": 2,
  "clientId": "clxxx...",
  "clientNumber": 6,
  "propertyId": "clxxx...",
  "submissionId": "req_2024_10_03_abc123xyz",
  "message": "Request received successfully"
}
```

### Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["contactInfo", "email"],
      "message": "Invalid email"
    }
  ]
}
```

### Error (401 Unauthorized)

```json
{
  "error": "Unauthorized"
}
```

---

## Field Mapping

### How Fields Are Processed

**Client Creation:**
- If `contactInfo.company` is provided → `companyName` field
- If no company → `firstName` and `lastName` fields
- `contactInfo.email` → `emails` array
- `contactInfo.phone` → `phones` array
- Created as LEAD with status NEW

**Property Creation:**
- `location.address` + city + province + postal → formatted address
- `propertyDetails.parkingInfo` → property notes
- All `propertyDetails` → stored in property `custom` JSON

**Request Creation:**
- Title: "{industry} - {cleaningType}"
- Description: Combines `serviceDetails.reason` + `scheduling.specialRequests`
- Status: "NEW"
- Full payload stored in `details` JSON field

**Normalized Lookups:**
- `serviceDetails.industry` → mapped to Industry table via slug
- `serviceDetails.cleaningType` → mapped to ServiceType table
- `marketingInfo.hearAbout` → mapped to HearAbout table
- Foreign keys stored for efficient filtering/reporting

---

## Industry Mapping

The API automatically maps industry labels to database slugs:

| Label             | Slug           |
|-------------------|----------------|
| Home Cleaning     | home-cleaning  |
| Office Cleaning   | office         |
| Airbnb Cleaning   | airbnb         |

---

## Service Type Mapping

Cleaning types are mapped to service type slugs:

| Label                       | Slug              |
|-----------------------------|-------------------|
| Standard Cleaning           | standard          |
| Deep Cleaning               | deep              |
| Moving Standard Cleaning    | moving-standard   |
| Moving Deep Cleaning        | moving-deep       |
| Post-Renovation Cleaning    | post-renovation   |
| Recurring Cleaning          | recurring         |
| Office Cleaning             | office            |
| Airbnb Cleaning             | airbnb            |

**Auto-Creation:** If a service type doesn't exist, it's automatically created with the provided label.

---

## Marketing Source Mapping

Hear-about sources mapped to slugs:

| Label                 | Slug              |
|-----------------------|-------------------|
| Google Maps or GBP    | gbp               |
| Google Guaranteed     | google-guaranteed |
| Brochure              | brochure          |
| Referral              | referral          |
| Other                 | other             |

---

## Data Storage

### What's Stored Where

**Client Table:**
```
firstName: "Sarah"
lastName: "Johnson"
companyName: null (empty company field)
emails: ["sarah.johnson@gmail.com"]
phones: ["+1 (705) 555-1234"]
clientStatus: "LEAD"
leadStatus: "NEW"
leadSource: "gbp"
```

**Property Table:**
```
address: "123 Maple Avenue, Barrie, ON, L4N 5J4"
notes: "Driveway available for 2 vehicles"
custom: {
  propertyType: "House",
  squareFootage: 2200,
  bedrooms: 4,
  bathrooms: 2,
  basement: "Finished"
  // ... all propertyDetails
}
```

**Request Table:**
```
number: 2 (auto-incremented per org)
title: "Home Cleaning - Standard Cleaning"
description: "Reason: Preparing for guests/event\nPlease focus extra attention..."
status: "NEW"
source: "gbp"
industryId: "clxxx..." (FK to industries)
serviceTypeId: "clxxx..." (FK to service_types)
hearAboutId: "clxxx..." (FK to hear_about)
preferredAt: null (natural language, not parsed)
details: {
  // ENTIRE form submission stored here
  submissionId: "req_2024_10_03_abc123xyz",
  contactInfo: {...},
  serviceDetails: {...},
  propertyDetails: {...},
  addOns: {...},
  pricing: {...},
  metadata: {...},
  meta: {
    formVersion: "2.0",
    submissionId: "req_2024_10_03_abc123xyz",
    ingested: "2024-10-03T14:35:00.000Z",
    industrySlug: "home-cleaning",
    serviceTypeSlug: "standard",
    hearAboutSlug: "gbp"
  }
}
```

**Activity Table:**
```
type: "SYSTEM"
message: "Request created via website form"
meta: {
  source: "website",
  submissionId: "req_2024_10_03_abc123xyz",
  industry: "Home Cleaning",
  cleaningType: "Standard Cleaning",
  estimatedPrice: 345
}
```

---

## Pricing Information

The `pricing` object from your form is stored in the Request's `details.pricing` field.

This includes:
- Estimated price
- Price range (min/max)
- Confidence level
- Detailed breakdown

**Future Use:**
- Can be used to pre-populate Estimate line items
- Helpful for quoting accuracy analysis
- Stored for historical reference

---

## Evolving Schema Support

The API uses Zod's `.passthrough()` which means:

✅ **New fields automatically accepted** - No code changes needed  
✅ **All data preserved** - Stored in `details` JSON field  
✅ **Core fields validated** - Required fields still enforced  
✅ **Backward compatible** - Old form versions still work  

**When to Update Schema:**
- If a new field becomes frequently filtered/searched → promote to table column
- If data type changes require validation → update Zod schema
- Otherwise → no changes needed!

---

## Testing

### Run the Test Script

```bash
# Make sure dev server is running
npm run dev

# In another terminal:
./test-form-ingestion.sh
```

### Manual Test with curl

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "x-zenzone-secret: YOUR_SECRET" \
  -d @test-submission.json
```

### Check Database

```sql
-- View latest request
SELECT 
  r.id, 
  r.number, 
  r.title,
  c."firstName",
  c."lastName", 
  c."companyName",
  p.address,
  r.details->'pricing'->>'estimatedPrice' as price
FROM requests r
JOIN clients c ON r."clientId" = c.id
JOIN properties p ON r."propertyId" = p.id
ORDER BY r.number DESC
LIMIT 1;

-- View full details JSON
SELECT details 
FROM requests 
ORDER BY number DESC 
LIMIT 1;

-- View activity log
SELECT type, message, meta, "createdAt"
FROM activities
WHERE "requestId" = (SELECT id FROM requests ORDER BY number DESC LIMIT 1);
```

---

## Error Handling

### Common Errors

**Invalid Secret (401)**
```json
{
  "error": "Unauthorized"
}
```
→ Check `x-zenzone-secret` header matches `.env`

**Invalid Industry (400)**
```json
{
  "error": "Invalid industry: Some Industry"
}
```
→ Industry not in database. Add to seed or update mapping function.

**Validation Error (400)**
```json
{
  "error": "Validation failed",
  "details": [...]
}
```
→ Required field missing or invalid format

**Server Error (500)**
```json
{
  "error": "Internal server error"
}
```
→ Check server logs for details

---

## Integration Checklist

### Website Integration

- [ ] Add `x-zenzone-secret` header to form submission
- [ ] Send POST request to `/api/requests` endpoint
- [ ] Handle success response (show confirmation to user)
- [ ] Handle error responses (show appropriate messages)
- [ ] Include `submissionId` for tracking
- [ ] Include all form fields (structure can evolve)

### Backend Setup

- [ ] Set `FORM_INGEST_SECRET` in environment variables
- [ ] Set `DEFAULT_ORG_ID` in environment variables (your org slug)
- [ ] Run migrations to create tables
- [ ] Run seed to populate lookup tables
- [ ] Test endpoint with sample data
- [ ] Monitor Activity log for successful ingestion

---

## Security

- ✅ Secret header validation
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ Rate limiting (recommended to add)
- ✅ CORS configuration (configure in Next.js)

**Recommended Additional Security:**
```typescript
// Add to middleware.ts
export const config = {
  matcher: '/api/requests',
};

export function middleware(request: NextRequest) {
  // Rate limiting
  // IP whitelisting
  // CORS headers
}
```

---

## Monitoring & Debugging

### Check Ingestion Status

```sql
-- Count requests by source
SELECT source, COUNT(*) 
FROM requests 
GROUP BY source;

-- Recent website submissions
SELECT 
  r.number,
  r.title,
  r."createdAt",
  r.details->'submissionId' as submission_id,
  r.details->'pricing'->>'estimatedPrice' as price
FROM requests r
WHERE source = 'website'
ORDER BY r."createdAt" DESC
LIMIT 10;

-- Activity log for debugging
SELECT * 
FROM activities 
WHERE type = 'SYSTEM'
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### Server Logs

The API logs errors to console:
```
Form ingestion error: [error details]
```

Check your server logs for detailed error information.

---

## What Happens When Form is Submitted

1. ✅ **Validate secret header**
2. ✅ **Parse and validate JSON** against Zod schema
3. ✅ **Map labels to slugs** (industry, cleaningType, hearAbout)
4. ✅ **Lookup or create service type** (if new)
5. ✅ **Create Client record** (as LEAD)
   - Separate firstName/lastName or companyName
   - Email and phone as arrays
   - Lead tracking enabled
6. ✅ **Create Property record**
   - Formatted address
   - Property details in `custom` JSON
7. ✅ **Create Request record**
   - Sequential per-org number
   - Normalized lookups (industryId, serviceTypeId, hearAboutId)
   - Complete form snapshot in `details` JSON
   - Pricing information preserved
8. ✅ **Log Activity** for audit trail
9. ✅ **Return success response** with all IDs

---

## Future Enhancements

### Potential Additions

1. **Duplicate Detection**
   - Check if client with same email exists
   - Merge or link to existing client

2. **Email Notifications**
   - Send confirmation email to client
   - Notify staff of new request

3. **Webhook Support**
   - Send webhook on successful ingestion
   - Integrate with other systems

4. **Rate Limiting**
   - Prevent abuse
   - Per-IP or per-secret limits

5. **Rate Limiting**
   - Per-IP or per-secret limits
   - Prevent abuse/spam

---

## 📸 Photos & File Attachments

### **How to Send Photos**

Include a `photos` array in your request with URLs to the images:

```json
{
  "contactInfo": { ... },
  "serviceDetails": { ... },
  
  "images": {
    "folder": "submissions/2024-10-03/sarah-johnson",
    "archiveLink": "https://your-storage.com/archives/req_2024_10_03_abc123xyz.zip",
    "count": 8,
    "noPhotosReason": null
  },
  
  ...
}
```

### **Image Archive Workflow**

**Your images come as a ZIP archive from email:**

```javascript
// 1. User submits form with photos on your website
// 2. Your website creates a zip archive and uploads it
// 3. Include archive link in form submission

const requestPayload = {
  ...formData,
  images: {
    folder: "submissions/2024-10-03/client-name",
    archiveLink: "https://your-storage.com/archives/submission_abc123.zip",
    count: 8,  // Number of photos in the archive
    noPhotosReason: null
  }
};
```

**If no photos provided:**
```json
{
  "images": {
    "folder": null,
    "archiveLink": null,
    "count": 0,
    "noPhotosReason": "Client did not provide photos"
  }
}
```

### **What Happens**
- ✅ Archive link stored in `request.details.images`
- ✅ NOT stored in database (just the link)
- ✅ Displayed in request detail page with download button
- ✅ Shows photo count and folder path
- ✅ One-click download of entire archive

### **Frontend Display**
- Shows: "Photo Archive (8 photos)"
- Button: "Download ZIP"
- Direct link to your storage/CDN
- No extraction needed - users download and unzip locally

---

## Troubleshooting

### Form not creating requests

**Check:**
1. Is dev server running? `npm run dev`
2. Is secret correct in `.env`?
3. Is `DEFAULT_ORG_ID` set?
4. Are lookup tables populated? Run `npm run db:seed`
5. Check server console for errors

### Invalid industry error

**Solution:**
Add to industry mapping function or add to database:
```typescript
// In mapIndustryToSlug()
'Your Industry': 'your-industry',
```

Then add to seed:
```sql
INSERT INTO industries (id, slug, label, active)
VALUES (gen_random_uuid(), 'your-industry', 'Your Industry', true);
```

### Pricing not showing in estimate conversion

The pricing from the form is stored in `request.details.pricing`. You can access it when converting to an estimate to pre-populate pricing fields.

---

## Related Documentation

- [Form Ingestion Implementation](/docs/FORM_INGESTION_IMPLEMENTATION.md)
- [Request Feature](/docs/features/REQUESTS.md)
- [Database Architecture](/docs/architecture/DATABASE.md)
- [Multi-Tenancy](/docs/architecture/MULTI_TENANCY.md)

---

**Status:** Production Ready ✅  
**Last Updated:** October 3, 2025  
**Version:** 2.0

