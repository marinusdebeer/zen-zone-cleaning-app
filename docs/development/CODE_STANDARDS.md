# Code Standards

Coding conventions for the Zen Zone Cleaning application.

## ⚡ Best Practices Summary

Follow these rules for maintainable, secure, and performant code:

1. **Serialization:** Use `serialize()` utility for all Server → Client data
2. **Multi-Tenancy:** Always use `withOrgContext()` for data operations
3. **Modular Design:** Keep files under 300 lines, extract early
4. **Migrations:** Use `npm run prisma:migrate` - never manual SQL
5. **Security:** Validate org membership, use RLS, never trust client input
6. **Theming:** Use CSS variables only, no hard-coded colors
7. **Type Safety:** Use TypeScript strictly, no `any` without justification

See detailed sections below.

---

## File Size Limits

| File Type | Max Lines | Action |
|-----------|-----------|--------|
| React Component | 300 | Extract sections to components |
| Page Component | 300 | Extract to client component |
| Server Action | 350 | Split into multiple files |
| Utility | 200 | Split into focused modules |
| Hook | 300 | Split into multiple hooks |

**Extract early** - Don't wait for files to bloat.

## Theming

All colors use CSS variables from `app/styles/tenant.css`.

**Available:**
- `bg-brand`, `text-brand`, `border-brand`
- `bg-brand-dark`, `text-brand-dark`
- `bg-brand-bg`, `bg-brand-bg-secondary`, `bg-brand-bg-tertiary`

**Status colors (semantic only):**
- `bg-green-*`, `text-green-*` - Success
- `bg-red-*`, `text-red-*` - Error
- `bg-yellow-*`, `text-yellow-*` - Warning
- `bg-blue-*`, `text-blue-*` - Info

❌ **Never:**
- Inline hex colors: `style={{ color: '#4a7c59' }}`
- Hardcoded colors: `bg-purple-500`
- Arbitrary values: `bg-[#123456]`

✅ **Always:**
- Theme utilities: `bg-brand hover:bg-brand-dark`
- Variables: `bg-[var(--tenant-primary)]`

See [Theming Guide](/docs/architecture/THEMING_GUIDE.md) for details.

## Serialization

**BEST PRACTICE:** Always use `serialize()` utility for Server → Client data.

```typescript
// ✅ Correct:
import { serialize } from '@/lib/serialization';

const data = await prisma.estimate.findMany({ include: { lineItems: true } });
const serialized = serialize(data);
return <ClientComponent data={serialized} />;

// ❌ Wrong - Manual serialization:
const serialized = { 
  ...data, 
  amount: Number(data.amount),
  // Easy to miss fields!
};
```

**Why:**
- Prisma Decimal objects cannot pass to Client Components
- Manual serialization is error-prone and unmaintainable
- `serialize()` handles nested objects/arrays automatically
- Schema changes don't break serialization

**See:** [Serialization Guide](/docs/architecture/SERIALIZATION.md)

## TypeScript

### Types
- Use `interface` for object shapes
- Extract shared types to `types.ts` if used in 3+ places
- Use Prisma types where possible
- No `any` unless absolutely necessary

```typescript
// ✅ Good
interface JobFormProps {
  clients: Client[];
  onSubmit: (data: JobData) => void;
}

// ❌ Avoid
type Props = {
  clients: any;
  onSubmit: Function;
};
```

### Strict Typing
- Type all function parameters and returns
- Use union types: `'draft' | 'active' | 'completed'`
- Leverage Prisma generated types

## File Organization

```
feature/
├── page.tsx                    # Server component (data fetching)
├── feature-page-client.tsx     # Main client component
├── _components/                # Feature-specific components
│   ├── README.md              # Component docs
│   ├── feature-form.tsx       # Orchestrator
│   ├── use-feature-form.ts    # Business logic hook
│   └── feature-section.tsx    # UI sections
```

### Import Order
1. React imports
2. Next.js imports
3. Third-party libraries
4. Server actions
5. Components
6. Utils/helpers
7. Types
8. Icons (last)

## Naming Conventions

**Files:**
- `page.tsx` - Route pages
- `feature-page-client.tsx` - Client components
- `use-feature-logic.ts` - Hooks

**Components:**
- `PascalCase` - Component names
- Descriptive - `JobScheduleSection`, not `Section3`

**Functions:**
- `camelCase` - Function names
- Verb prefixes - `handleSubmit`, `calculateTotal`
- Boolean prefixes - `isValid`, `hasPermission`

**Constants:**
- `UPPER_SNAKE_CASE` - True constants
- `camelCase` - Configuration objects

## Component Patterns

### Client Components
```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  // Uses hooks, state, browser APIs
}
```

### Server Components
```typescript
import { prisma } from '@/server/db';

export default async function Page() {
  const data = await prisma.model.findMany();
  return <ClientComponent data={data} />;
}
```

## Security

**BEST PRACTICES:** Always follow these security rules.

### Multi-Tenancy (Critical)

```typescript
// ✅ Always use withOrgContext for data operations
const job = await withOrgContext(orgId, async () => {
  return await prisma.job.findUnique({ where: { id } });
});
// → Validates user membership AND sets RLS context

// ❌ NEVER bypass context:
const job = await prisma.job.findUnique({ where: { id } }); // Unsafe!
```

### Input Validation

```typescript
// ✅ Validate on server (never trust client):
export async function updateJob(orgId: string, data: unknown) {
  const validatedData = updateJobSchema.parse(data); // Zod validation
  // ... use validatedData
}

// ❌ Never trust client data:
export async function updateJob(data: any) { // No validation!
  await prisma.job.update({ data }); // Dangerous!
}
```

### Authentication

```typescript
// ✅ Check auth on every server action/page:
const session = await auth();
if (!session?.user) throw new Error('Unauthorized');

// ❌ Never skip auth checks
```

### Row Level Security (RLS)

- All tenant tables have RLS policies
- Database enforces org isolation
- Even if code has bugs, database blocks cross-tenant access
- **Defense in depth:** `withOrgContext()` + RLS = 2 layers

**See:** [Multi-Tenancy Guide](/docs/architecture/MULTI_TENANCY.md)

### Custom Hooks
```typescript
// use-job-form.ts
export function useJobForm(props) {
  const [state, setState] = useState();
  return { state, handlers };
}
```

## Data Fetching

### Server Components
```typescript
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  
  const data = await withOrgContext(orgId, async () => {
    return await prisma.model.findMany();
  });
  
  return <ClientComponent data={data} />;
}
```

### Client Components
```typescript
'use client';

const handleCreate = async () => {
  await createRecord(orgId, formData);
  router.refresh();
};
```

## Security

### Authentication
```typescript
const session = await auth();
if (!session?.user) redirect('/auth/signin');
```

### Multi-Tenancy
```typescript
return withOrgContext(orgId, async () => {
  return await prisma.model.findMany();
});
```

### Input Validation
```typescript
const validated = schema.parse(data); // Zod validation
```

## Documentation

### Required
- **Routing pages** - Inline header comment
- **Component folders** - README.md in `_components/`
- **Complex utilities** - JSDoc comments

```typescript
/**
 * PAGE NAME
 * Route: /path
 * 
 * Purpose: What it does
 * Data Fetching: What's queried
 * Component: What's rendered
 */
```

### Comments
✅ Comment: Complex logic, workarounds, non-obvious solutions  
❌ Don't comment: Obvious code, simple operations

## Git Commits

**Format:** `type: description`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `style:` - Formatting, theme
- `docs:` - Documentation
- `chore:` - Maintenance

**Examples:**
- `feat: add recurring job scheduling`
- `fix: correct invoice total calculation`
- `refactor: extract job form components`

## Quick Checklist

- [ ] Components under 300 lines
- [ ] Use theme variables
- [ ] Add page documentation
- [ ] Strict TypeScript
- [ ] Validate inputs with Zod
- [ ] Check auth/authorization
- [ ] Serialize Decimals for client
- [ ] Extract logic to hooks
- [ ] Add component README

## Related

- [Components](/docs/architecture/COMPONENTS.md) - Modular design patterns
- [Database](/docs/architecture/DATABASE.md) - Schema and queries
- [Theming](/docs/architecture/THEMING_GUIDE.md) - Theme variables
