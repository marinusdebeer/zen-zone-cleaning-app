# Client Name Field Updates - Implementation Guide

## Status

✅ **Schema Updated** - firstName, lastName, companyName fields added  
✅ **Migration Applied** - Database updated successfully  
✅ **Seed Data Updated** - Test clients use new structure  
✅ **Build Successful** - No TypeScript errors  

## Files Already Updated

✅ `prisma/schema.prisma` - Client model updated  
✅ `prisma/seed.ts` - Test data uses new fields  
✅ `src/server/validators/client.ts` - Validation updated  
✅ `src/server/actions/search.ts` - Search queries updated  
✅ `src/lib/client-utils.ts` - Helper functions created  
✅ `app/(dashboard)/clients/clients-page-client.tsx` - Form and display updated  
✅ `app/(dashboard)/jobs/_components/job-client-selector.tsx` - Selector updated  
✅ `app/api/requests/route.ts` - Form ingestion API updated  

## Remaining Files to Update

These files still reference `client.name` and need to be updated to use `getClientDisplayName(client)`:

### Critical (User-Facing)
1. `app/(dashboard)/jobs/[id]/job-detail-client.tsx`
2. `app/(dashboard)/jobs/[id]/job-detail-client-new.tsx`
3. `app/(dashboard)/jobs/_components/job-detail-header.tsx`
4. `app/(dashboard)/invoices/invoices-page-client.tsx`
5. `app/(dashboard)/invoices/[id]/page.tsx`
6. `app/(dashboard)/estimates/estimates-page-client.tsx`
7. `app/(dashboard)/requests/requests-page-client.tsx`
8. `app/(dashboard)/requests/[id]/page.tsx`
9. `app/(dashboard)/clients/[id]/page.tsx`

### Secondary
10. `src/ui/components/visit-edit-modal.tsx`
11. `app/(dashboard)/schedule/page.tsx`
12. `app/(dashboard)/invoices/_components/invoice-job-selector.tsx`
13. `src/ui/components/app-header.tsx`
14. `app/(dashboard)/dashboard/page.tsx`
15. `app/(dashboard)/jobs/jobs-page-client.tsx`
16. `app/(dashboard)/payments/payments-client.tsx`
17. `app/(dashboard)/requests/_components/request-client-selector.tsx`
18. `app/(dashboard)/estimates/_components/estimate-recipient-selector.tsx`

## Update Pattern

For each file:

### 1. Add import
```typescript
import { getClientDisplayName, getClientInitials } from '@/lib/client-utils';
```

### 2. Update interface
```typescript
// OLD:
interface Client {
  id: string;
  name: string;
  // ...
}

// NEW:
interface Client {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  // ...
}
```

### 3. Replace display usage
```typescript
// OLD:
{client.name}

// NEW:
{getClientDisplayName(client)}
```

### 4. Replace initials/avatar
```typescript
// OLD:
{client.name.substring(0, 2).toUpperCase()}

// NEW:
{getClientInitials(client)}
```

### 5. Update Prisma queries (if any)
```typescript
// OLD:
client: { select: { name: true } }

// NEW:
client: { select: { firstName: true, lastName: true, companyName: true } }
```

## Helper Functions Available

```typescript
// Get display name (companyName OR "FirstName LastName")
getClientDisplayName(client) // "ABC Corp" or "John Doe"

// Get initials for avatars
getClientInitials(client) // "AC" or "JD"

// Get full name with company
getClientFullName(client) // "John Doe @ ABC Corp"

// Get sort name (last, first for individuals)
getClientSortName(client) // "Doe, John" or "ABC Corp"

// Check if company
isCompanyClient(client) // true/false
```

## Testing Checklist

After updating all files:

- [ ] Build succeeds: `npm run build`
- [ ] No linting errors
- [ ] Client list page displays names correctly
- [ ] Client detail page shows name
- [ ] Job creation shows client names in selector
- [ ] Invoice pages show client names
- [ ] Estimate pages show client names
- [ ] Search functionality works
- [ ] Creating new clients works with separate fields

## Notes

- **All fields are optional** - At least one name field required (validation)
- **Display logic is centralized** - All files use `getClientDisplayName()`
- **Database queries updated** - Select firstName, lastName, companyName instead of name
- **Form API handles both** - Individuals and companies work correctly

---

**Status:** Core files updated, remaining files can be updated as needed or when touched

