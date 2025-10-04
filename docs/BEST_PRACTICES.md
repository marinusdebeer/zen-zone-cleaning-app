# Best Practices

Consolidated best practices for the Zen Zone Cleaning application. **Follow these rules for secure, maintainable, and performant code.**

---

## 🔐 Security (Critical)

### 1. Multi-Tenancy - Always Use `withOrgContext()`

```typescript
// ✅ ALWAYS do this:
const data = await withOrgContext(orgId, async () => {
  return await prisma.job.findMany();
});

// ❌ NEVER bypass:
const data = await prisma.job.findMany(); // Unsafe! No tenant isolation
```

**Why:** 
- Validates user has membership in organization
- Sets PostgreSQL RLS context
- Prevents cross-tenant data leaks
- Defense in depth (code + database enforcement)

**See:** [Multi-Tenancy Guide](/docs/architecture/MULTI_TENANCY.md)

---

### 2. Authentication - Check Every Request

```typescript
// ✅ Every server action and page:
const session = await auth();
if (!session?.user) throw new Error('Unauthorized');

const orgId = (session as any).selectedOrgId;
if (!orgId) throw new Error('No organization selected');
```

**Why:** Never trust that user is authenticated or has selected an org.

---

### 3. Input Validation - Never Trust Client Data

```typescript
// ✅ Validate with Zod on server:
export async function updateJob(orgId: string, data: unknown) {
  const validated = updateJobSchema.parse(data); // Throws if invalid
  // ... use validated
}

// ❌ Never trust client:
export async function updateJob(data: any) {
  await prisma.job.update({ data }); // Dangerous!
}
```

**Why:** Client can send any data. Always validate on server.

---

## 📊 Data Serialization

### 4. Use `serialize()` for Server → Client Data

```typescript
// ✅ ALWAYS:
import { serialize } from '@/lib/serialization';

const estimate = await prisma.estimate.findMany({ include: { lineItems: true } });
const serialized = serialize(estimate);
return <ClientComponent data={serialized} />;

// ❌ NEVER manual:
const serialized = { 
  ...estimate, 
  amount: Number(estimate.amount) 
  // Easy to miss nested Decimals!
};
```

**Why:**
- Prisma Decimal objects can't pass to Client Components
- Manual serialization is error-prone
- `serialize()` handles nested objects/arrays automatically
- Schema changes don't break it

**See:** [Serialization Guide](/docs/architecture/SERIALIZATION.md)

---

## 🗄️ Database

### 5. Migrations - Use npm Scripts

```bash
# ✅ Development:
npm run prisma:migrate -- --name description

# ✅ Production:
npm run prisma:migrate:deploy

# ❌ NEVER:
npx prisma db push  # Bypasses migration history
# Manual SQL files    # Error-prone, no shadow DB validation
```

**Why:**
- Migration history for version control
- Shadow database validates migrations work
- Rollback capability
- Team collaboration

**See:** [Migration Best Practices](/docs/architecture/MIGRATION_BEST_PRACTICES.md)

---

### 6. RLS (Row Level Security)

- All tenant tables have RLS policies automatically
- Database enforces `WHERE orgId = current_setting('app.org_id')`
- Even if application code has bugs, database prevents cross-tenant access
- **Never disable RLS** on tenant tables

---

## 🎨 UI & Components

### 7. Modular Design - Keep Files Small

| File Type | Max Lines | Action |
|-----------|-----------|--------|
| React Component | 300 | Extract sections |
| Page Component | 300 | Extract to client component |
| Server Action | 350 | Split into multiple files |
| Hook | 300 | Split into focused hooks |

**Why:** Maintainability, testability, reusability.

**See:** [Modular Design](/docs/architecture/COMPONENTS.md)

---

### 8. Theming - CSS Variables Only

```typescript
// ✅ Use theme variables:
className="bg-brand text-white hover:bg-brand-dark"
className="bg-[var(--tenant-primary)]"

// ❌ Never hardcode:
className="bg-purple-500"  // Won't adapt to tenant theme
style={{ color: '#4a7c59' }}  // Hard-coded hex
```

**Why:** Multi-tenant app needs dynamic theming per organization.

**See:** [Theming Guide](/docs/architecture/THEMING_GUIDE.md)

---

### 9. Component Architecture

**Pattern:**
```
feature/
├── page.tsx                    # Server component (data fetching)
├── feature-page-client.tsx     # Main client component
├── _components/                # Feature-specific components
│   ├── README.md              # Document the components
│   ├── feature-form.tsx       # Orchestrator
│   ├── use-feature-form.ts    # Business logic hook
│   └── feature-section.tsx    # UI sections (< 150 lines each)
```

**Separation of Concerns:**
- Server Components: Data fetching, authentication
- Client Components: Interactivity, state
- Hooks: Business logic (separate from UI)
- UI Components: Presentational only

---

## 💾 Data Independence

### 10. Copy Data on Conversion

```
Request → Estimate → Job → Invoice
(copy)    (copy)      (copy)
```

**Rule:** When converting between entities, **COPY data**, don't reference.

**Why:** Editing a Job shouldn't affect the original Estimate.

**Exception:** Client and Property are **shared** references (not copied).

**See:** [Data Flow](/docs/WORKFLOW.md)

---

## ⚡ Performance

### 11. Server Components by Default

```typescript
// ✅ Default to Server Component:
export default async function Page() {
  const data = await prisma.model.findMany();
  return <div>{data}</div>;
}

// ✅ Only use 'use client' when needed:
'use client';  // For hooks, state, browser APIs only
```

**Why:** 
- Faster page loads
- Less JavaScript to client
- Direct database access
- Better SEO

---

### 12. Database Query Optimization

```typescript
// ✅ Select only needed fields:
const clients = await prisma.client.findMany({
  select: { id: true, name: true }  // Not full objects
});

// ✅ Include relations wisely:
include: { lineItems: true }  // Only if actually needed

// ❌ Don't over-fetch:
const clients = await prisma.client.findMany();  // Gets everything!
```

---

## 📝 TypeScript

### 13. Strict Type Safety

```typescript
// ✅ Type everything:
interface JobFormProps {
  clients: Client[];
  onSubmit: (data: JobData) => Promise<void>;
}

// ✅ Use union types:
type JobStatus = 'Draft' | 'Active' | 'Completed' | 'Canceled';

// ❌ Avoid any:
function process(data: any) { }  // No type safety!
```

**Why:** Catch errors at compile time, better IDE support.

---

## 🧪 Testing

### 14. Validate Before Deploying

```bash
# Before committing:
npm run build        # TypeScript & build errors
npm run lint         # Linting errors

# Before deploying to prod:
# 1. Test on staging first
# 2. Backup database
# 3. Run migrations
# 4. Verify functionality
```

---

## 📚 Documentation

### 15. Document Complex Logic

**When to document:**
- Component with > 200 lines → Add README.md
- Non-obvious business logic → Add inline comments
- Server actions → Document in file header
- New patterns → Update relevant docs

**Format:**
```typescript
/**
 * FILE PURPOSE
 * 
 * Purpose: What this does
 * Why: Business reason
 * How: High-level approach
 */
```

---

## ✅ Quick Checklist

Before committing code, verify:

- [ ] Used `serialize()` for Server → Client data
- [ ] Used `withOrgContext()` for database operations
- [ ] Validated input with Zod on server
- [ ] Checked authentication/authorization
- [ ] Used theme CSS variables (no hard-coded colors)
- [ ] Kept files under 300 lines
- [ ] Added TypeScript types
- [ ] No linter errors
- [ ] Tested multi-tenant isolation
- [ ] Updated documentation if needed

---

## 📖 Related Documentation

- [Code Standards](/docs/development/CODE_STANDARDS.md) - Detailed coding conventions
- [Serialization](/docs/architecture/SERIALIZATION.md) - Decimal handling
- [Multi-Tenancy](/docs/architecture/MULTI_TENANCY.md) - Security & RLS
- [Migrations](/docs/architecture/MIGRATION_BEST_PRACTICES.md) - Database changes
- [Components](/docs/architecture/COMPONENTS.md) - Modular design
- [Database](/docs/architecture/DATABASE.md) - Schema & queries

---

## 🚨 Common Mistakes to Avoid

1. ❌ Forgetting to serialize Decimals → Use `serialize()`
2. ❌ Bypassing `withOrgContext()` → Security vulnerability
3. ❌ Manual migrations → Use `npm run prisma:migrate`
4. ❌ Hard-coded colors → Use CSS variables
5. ❌ Monolithic components → Extract early, stay under 300 lines
6. ❌ Missing input validation → Always validate on server
7. ❌ Using `any` type → Use proper TypeScript types
8. ❌ Skipping authentication → Check session on every request

---

**Remember:** These best practices exist to prevent bugs, security issues, and maintenance nightmares. Follow them consistently! 🎯

