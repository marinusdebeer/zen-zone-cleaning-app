# Modular Design Guidelines

## Philosophy

**Keep files small and focused.** Large files are hard to maintain, test, and understand. Extract components and functions early and often.

---

## File Size Limits

**Hard Limits:**
- React Components: **300 lines max**
- Utility Functions: **200 lines max**
- Server Actions: **250 lines max**
- Page Components: **150 lines max** (should mostly be data fetching + rendering)

**When approaching these limits:** Extract immediately, don't wait.

---

## When to Extract

### **Extract Components When:**
- File exceeds 200 lines
- Component has 3+ distinct sections
- Logic is reused in multiple places
- Component handles multiple concerns
- Testing becomes difficult

### **Extract Functions When:**
- Function exceeds 50 lines
- Logic is reused
- Function has complex business logic
- Multiple responsibilities in one function

### **Extract Hooks When:**
- State management exceeds 100 lines
- Multiple components need same logic
- Complex side effects or data fetching

---

## Directory Structure

### **Component Organization:**

```
feature/
├── page.tsx                    # Route handler (data fetching only)
├── feature-page-client.tsx     # Main client component (orchestrator)
├── _components/                # Feature-specific components
│   ├── README.md              # Component documentation
│   ├── section-one.tsx        # Focused sub-component
│   ├── section-two.tsx        # Another focused component
│   ├── shared-form.tsx        # Reusable form component
│   └── use-feature-logic.ts   # Custom hook for business logic
└── _lib/                      # Feature-specific utilities
    ├── validators.ts          # Validation schemas
    ├── helpers.ts             # Helper functions
    └── constants.ts           # Constants and types
```

### **Example: Jobs Section**

```
jobs/
├── page.tsx                           # 91 lines ✅
├── jobs-page-client.tsx              # 330 lines ⚠️ (could be split)
├── new/
│   └── page.tsx                      # 70 lines ✅
├── [id]/
│   ├── page.tsx                      # 94 lines ✅
│   ├── job-detail-client.tsx         # 620 lines ❌ (needs splitting)
│   └── edit/
│       └── page.tsx                  # 99 lines ✅
└── _components/                      # ✅ PERFECT MODULAR EXAMPLE
    ├── README.md                     # Documentation
    ├── job-form.tsx                  # 220 lines ✅ (orchestrator)
    ├── use-job-form.ts               # 145 lines ✅ (business logic)
    ├── job-type-selector.tsx         # 75 lines ✅
    ├── job-client-selector.tsx       # 77 lines ✅
    ├── job-details-section.tsx       # 59 lines ✅
    ├── job-schedule-section.tsx      # 175 lines ✅
    ├── job-billing-section.tsx       # 68 lines ✅
    ├── job-team-section.tsx          # 68 lines ✅
    └── visit-preview-card.tsx        # 55 lines ✅
```

---

## Extraction Patterns

### **Pattern 1: Section Components**

**Before:**
```tsx
// job-form.tsx - 800 lines ❌
export function JobForm() {
  return (
    <form>
      {/* 200 lines of job details fields */}
      {/* 200 lines of scheduling fields */}
      {/* 200 lines of billing fields */}
      {/* 200 lines of team selection */}
    </form>
  );
}
```

**After:**
```tsx
// job-form.tsx - 100 lines ✅
export function JobForm() {
  return (
    <form>
      <JobDetailsSection {...props} />
      <JobScheduleSection {...props} />
      <JobBillingSection {...props} />
      <JobTeamSection {...props} />
    </form>
  );
}
```

### **Pattern 2: Custom Hooks**

**Before:**
```tsx
// component.tsx - 500 lines ❌
export function Component() {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // 200 lines of state management
  // 200 lines of business logic
  // 100 lines of UI
}
```

**After:**
```tsx
// component.tsx - 500 lines ✅
export function Component() {
  const { data, handlers } = useComponentLogic();
  // 100 lines of UI only
}

// use-component-logic.ts - 200 lines ✅
export function useComponentLogic() {
  // All state and business logic
  return { data, handlers };
}
```

### **Pattern 3: Utility Functions**

**Before:**
```tsx
// component.tsx - 400 lines ❌
export function Component() {
  const calculateTotal = () => { /* 50 lines */ };
  const validateData = () => { /* 50 lines */ };
  const formatDate = () => { /* 30 lines */ };
  // UI code
}
```

**After:**
```tsx
// component.tsx - 500 lines ✅
import { calculateTotal, validateData, formatDate } from './helpers';

export function Component() {
  // Just UI code
}

// helpers.ts - 500 lines ✅
export function calculateTotal() { /* 50 lines */ }
export function validateData() { /* 50 lines */ }
export function formatDate() { /* 30 lines */ }
```

---

## Naming Conventions

### **Components:**
- `FeatureSection.tsx` - Section of a larger component
- `FeatureCard.tsx` - Reusable card component
- `FeatureForm.tsx` - Form component
- `FeatureList.tsx` - List component
- `FeatureDetail.tsx` - Detail view component

### **Hooks:**
- `use-feature-logic.ts` - Business logic hook
- `use-feature-data.ts` - Data fetching hook
- `use-feature-state.ts` - State management hook

### **Utilities:**
- `helpers.ts` - Helper functions
- `validators.ts` - Validation functions
- `formatters.ts` - Formatting functions
- `constants.ts` - Constants and enums
- `types.ts` - TypeScript types/interfaces

---

## Red Flags

🚩 **File is too large if:**
- Scrolling takes more than 3 seconds
- Finding a function requires search
- Multiple developers can't work on it simultaneously
- Testing requires mocking many things
- Code review takes more than 10 minutes

🚩 **Component is too complex if:**
- Has more than 5 props
- Has more than 3 useState calls
- Has more than 2 useEffect calls
- Renders more than 5 distinct sections
- Business logic mixed with UI

🚩 **Function is too long if:**
- More than 50 lines
- Has more than 3 levels of nesting
- Does more than one thing
- Hard to name clearly

---

## Refactoring Checklist

When a file becomes too large:

1. **Identify sections** - Group related code
2. **Extract components** - Each section becomes a component
3. **Extract hooks** - State management into custom hooks
4. **Extract utilities** - Pure functions into helper files
5. **Test** - Ensure everything still works
6. **Document** - Add README to _components folder

---

## Example: Perfect Modular Structure

See `app/(dashboard)/jobs/_components/` for a perfect example:

✅ **Before:** 1 file, 800+ lines  
✅ **After:** 9 focused files, each 50-220 lines  
✅ **Benefits:**
- Easy to find specific logic
- Can test components independently
- Multiple developers can work simultaneously
- Changes are isolated and safe
- Code review is fast and focused

---

## Rules

1. **Extract early** - Don't wait for files to become massive
2. **One concern per file** - Each file should do one thing well
3. **Prefer many small files** over few large files
4. **Use _components/** - For feature-specific components
5. **Use _lib/** - For feature-specific utilities
6. **Document extractions** - Add README when creating _components
7. **Follow conventions** - Use consistent naming and structure

---

## Quick Reference

| File Type | Max Lines | Action at Limit |
|-----------|-----------|-----------------|
| Page | 500 | Extract to client component |
| Client Component |500| Extract sections to components |
| Server Action | 350 | Extract to multiple action files |
| Utility | 200 | Split into focused modules |
| Hook | 500 | Split into multiple hooks |

**Remember:** These are maximums, not targets. Smaller is better.

