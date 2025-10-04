# Decimal Serialization Best Practices

⚠️ **BEST PRACTICE:** Always use `serialize()` utility when passing Prisma data from Server to Client Components. Never manually serialize Decimal fields.

## The Problem

Next.js **cannot pass Prisma Decimal objects** from Server Components to Client Components.

```typescript
// ❌ This fails:
const estimate = await prisma.estimate.findUnique({ where: { id } });
return <ClientComponent data={estimate} />; // Error: Decimal not supported
```

## Why Decimal?

Prisma uses `Decimal` type for precise financial calculations:
- ✅ No floating-point precision errors
- ✅ Safe for money calculations
- ✅ Database stores as exact decimal values

**Example:** `0.1 + 0.2 = 0.30000000000000004` (Float) vs `0.3` (Decimal)

## The Solution

### **Automatic Serialization Utility**

Use the `serialize()` helper to automatically convert all Decimals to numbers.

```typescript
// src/lib/serialization.ts
import { serialize } from '@/lib/serialization';

// ✅ One line, handles everything:
const estimate = await prisma.estimate.findUnique({ where: { id } });
const serialized = serialize(estimate);
return <ClientComponent data={serialized} />;
```

## How It Works

The `serialize()` function:
1. **Recursively traverses** the object tree
2. **Detects Decimal instances** using multiple methods:
   - `instanceof Decimal` check
   - Constructor name check (for different module instances)
   - Duck typing (checks for `s`, `e`, `d` properties)
3. **Converts to number** while preserving structure
4. **Handles nested objects and arrays** automatically
5. **JSON round-trip** as final safety check (removes functions, undefined, etc.)

```typescript
// Handles complex nested structures:
{
  estimate: {
    subtotal: Decimal(100.50),           // → 100.5
    createdAt: Date('2025-01-01'),       // → '2025-01-01T00:00:00.000Z' (ISO string)
    lineItems: [
      { unitPrice: Decimal(25.00) }      // → 25
    ]
  }
}
```

**Note on Dates:** Dates are converted to ISO strings by the JSON round-trip. This is safe for most use cases. If you need Date objects on the client, parse the strings back to Dates in your Client Component.

## Before vs After

### ❌ **Before (Manual)**

```typescript
// 30+ lines of repetitive, error-prone code
const serializedEstimate = {
  id: estimate.id,
  title: estimate.title,
  description: estimate.description,
  clientId: estimate.clientId,
  propertyId: estimate.propertyId,
  amount: Number(estimate.amount),
  subtotal: Number(estimate.subtotal),
  taxRate: Number(estimate.taxRate),
  taxAmount: Number(estimate.taxAmount),
  discountValue: estimate.discountValue ? Number(estimate.discountValue) : null,
  discountAmount: Number(estimate.discountAmount),
  total: Number(estimate.total),
  depositValue: estimate.depositValue ? Number(estimate.depositValue) : null,
  depositAmount: Number(estimate.depositAmount),
  lineItems: estimate.lineItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    total: Number(item.total),
    order: item.order,
  })),
  client: estimate.client,
  property: estimate.property,
  // ... easy to miss fields!
};
```

### ✅ **After (Automatic)**

```typescript
// 1 line, handles everything automatically
const serializedEstimate = serialize(estimate);
```

## Benefits

1. **No More Errors** - Automatically handles all Decimal fields
2. **DRY** - Write once, use everywhere
3. **Safe** - Can't forget to serialize a field
4. **Maintainable** - Schema changes don't break serialization
5. **Type-Safe** - Preserves TypeScript types

## Usage Examples

### **List Pages**

```typescript
// app/(dashboard)/estimates/page.tsx
import { serialize } from '@/lib/serialization';

const estimates = await prisma.estimate.findMany({
  include: { client: true, lineItems: true }
});

// ✅ One line!
const serialized = serialize(estimates);
return <EstimatesPageClient estimates={serialized} />;
```

### **Edit Pages**

```typescript
// app/(dashboard)/estimates/[id]/edit/page.tsx
import { serialize } from '@/lib/serialization';

const estimate = await prisma.estimate.findUnique({
  where: { id },
  include: { lineItems: true }
});

// ✅ Automatically serializes pricing AND line items
const serialized = serialize(estimate);
return <EstimateForm existingEstimate={serialized} />;
```

### **Server Actions**

```typescript
// src/server/actions/jobs.ts
'use server';
import { serialize } from '@/lib/serialization';

export async function updateJob(orgId: string, data: unknown) {
  const job = await prisma.job.update({
    where: { id: data.id },
    data: { ...data },
    include: { client: true, lineItems: true }
  });
  
  // ✅ CRITICAL: Serialize before returning to client
  return serialize(job);
}
```

**Why:** Server actions return data to client components, so Decimals must be serialized.

### **Detail Pages (Server Components)**

```typescript
// Server components can use Decimals directly
const invoice = await prisma.invoice.findUnique({ where: { id } });

// ✅ No serialization needed - stays on server
return (
  <div>
    <p>Total: ${invoice.total.toString()}</p>
  </div>
);
```

## When to Use

| Scenario | Use serialize()? |
|----------|------------------|
| Passing to Client Component | ✅ Yes |
| Server Action return values | ✅ Yes |
| Passing between Server Components | ❌ No |
| Server-side calculations | ❌ No |
| API responses | ✅ Yes |
| Next.js page props | ✅ Yes |

## Alternative Approaches (Not Recommended)

### ❌ **JSON.parse(JSON.stringify())**
```typescript
// Loses type safety, breaks Dates
const serialized = JSON.parse(JSON.stringify(data));
```

### ❌ **Change to Float in Schema**
```typescript
// Loses precision for financial data!
amount Float  // 0.1 + 0.2 = 0.30000000000000004 ❌
```

### ❌ **superjson library**
```typescript
// Overkill for this use case, adds dependency
// Better for tRPC/complex serialization needs
```

## Type Safety

The `Serialized<T>` type helper preserves types:

```typescript
import { Serialized } from '@/lib/serialization';

type Estimate = {
  id: string;
  total: Decimal;
  lineItems: { unitPrice: Decimal }[];
};

type SerializedEstimate = Serialized<Estimate>;
// Result:
// {
//   id: string;
//   total: number;  ← Decimal → number
//   lineItems: { unitPrice: number }[];  ← Nested!
// }
```

## Migration Guide

To update existing code:

1. Import the helper:
   ```typescript
   import { serialize } from '@/lib/serialization';
   ```

2. Replace manual serialization:
   ```typescript
   // Before:
   const serialized = { ...data, amount: Number(data.amount), ... };
   
   // After:
   const serialized = serialize(data);
   ```

3. Remove manual field mappings (keep only business logic):
   ```typescript
   const serialized = {
     ...serialize(estimate),
     clientId: estimate.clientId || '', // Keep business logic
   };
   ```

## Summary

✅ **Use `serialize()` for all Server → Client data passing**  
✅ **Keep Decimal in database for precision**  
✅ **One line replaces 30+ lines of manual code**  
✅ **Type-safe and maintainable**  

This is the **recommended best practice** for handling Prisma Decimals in Next.js applications with Server and Client Components.

