# Unified Forms - CRUD Standardization

All entities now use the same unified create/edit pattern.

## ✅ Standardized Entities

| Entity | Form Component | Create | Edit | Pattern |
|--------|----------------|--------|------|---------|
| **Clients** | `client-form.tsx` | `/clients/new` | `/clients/[id]/edit` | ✅ Standard |
| **Requests** | `request-form.tsx` | `/requests/new` | `/requests/[id]/edit` | ✅ Standard |
| **Estimates** | `estimate-form.tsx` | `/estimates/new` | `/estimates/[id]/edit` | ✅ Standard |
| **Jobs** | `job-form.tsx` | `/jobs/new` | `/jobs/[id]/edit` | ✅ Standard |
| **Invoices** | `invoice-form.tsx` | `/invoices/new` | `/invoices/[id]/edit` | ✅ Standard |

## Standard Pattern

### Same Component for Create & Edit

**Detects mode via prop:**
```tsx
const isEditMode = !!existingEntity;
```

**Dynamic UI:**
```tsx
<h1>{isEditMode ? 'Edit' : 'Create'} Entity</h1>
<button>{isEditMode ? 'Update' : 'Create'} Entity</button>
```

**Usage:**

**Create:**
```tsx
<EntityForm orgId={orgId} clients={clients} />
```

**Edit:**
```tsx
<EntityForm orgId={orgId} existingEntity={entity} clients={clients} />
```

## Directory Structure

```
entity/
├── _components/
│   ├── entity-form.tsx              # Unified create/edit form
│   ├── use-entity-form.ts          # Business logic hook
│   ├── entity-section-1.tsx        # Modular UI sections
│   ├── entity-section-2.tsx
│   └── README.md
├── new/
│   └── page.tsx                     # Create page
├── [id]/
│   ├── entity-actions.tsx           # Action dropdown (client component)
│   ├── page.tsx                     # Detail view
│   └── edit/
│       └── page.tsx                 # Edit page
├── entity-page-client.tsx           # List view client component
└── page.tsx                         # List view server page
```

## Navigation

All create/edit buttons lead to unified form:
- ✅ "Create" button → `/entity/new`
- ✅ "Edit" button (header) → `/entity/[id]/edit`
- ✅ "Edit" dropdown action → `/entity/[id]/edit`

**Same component used in all cases.**

## Benefits

✅ **Consistency** - Identical UX across all entities  
✅ **Less Code** - One form for create + edit (50% less code)  
✅ **Maintainability** - Fix once, works everywhere  
✅ **Easier Testing** - Test one pattern, covers all  
✅ **Faster Development** - Copy pattern for new entities

## Key Files

### Unified Forms (Main)
- `app/(dashboard)/clients/client-form.tsx`
- `app/(dashboard)/requests/_components/request-form.tsx`
- `app/(dashboard)/estimates/_components/estimate-form.tsx`
- `app/(dashboard)/jobs/_components/job-form.tsx`
- `app/(dashboard)/invoices/_components/invoice-form.tsx`

### Business Logic Hooks
- `app/(dashboard)/requests/_components/use-request-form.ts`
- `app/(dashboard)/estimates/_components/use-estimate-form.ts`
- `app/(dashboard)/jobs/_components/use-job-form.ts`
- `app/(dashboard)/invoices/_components/use-invoice-form.ts`

### Server Actions
- `src/server/actions/clients.ts`
- `src/server/actions/requests.ts`
- `src/server/actions/estimates.ts`
- `src/server/actions/jobs.ts`
- `src/server/actions/invoices.ts`

**All return `serialize()` to prevent Decimal errors.**

