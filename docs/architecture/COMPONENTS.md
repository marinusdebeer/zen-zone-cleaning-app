# Component Architecture

## Modular Design Principle

**Break large components into focused, reusable pieces under 300 lines each.**

## Structure Pattern

```
feature/
  _components/
    feature-form.tsx           (orchestrator)
    use-feature-form.ts        (business logic hook)
    feature-section-1.tsx      (UI section)
    feature-section-2.tsx      (UI section)
    README.md                  (component docs)
```

## Example: Job Form

**Before:** 672-line monolithic component  
**After:** 8 components, 50-150 lines each

```
jobs/_components/
  job-form.tsx                 (main orchestrator - 235 lines)
  use-job-form.ts             (state management - 160 lines)
  job-type-selector.tsx       (UI component - 67 lines)
  job-client-selector.tsx     (UI component - 89 lines)
  job-details-section.tsx     (UI component - 52 lines)
  job-schedule-section.tsx    (UI component - 134 lines)
  job-billing-section.tsx     (UI component - 78 lines)
  job-team-section.tsx        (UI component - 92 lines)
```

## Component Communication

```
Form (Orchestrator)
  ↓ uses
Hook (Business Logic)
  ↓ provides state to
Section Components (UI)
  ↓ emit events via
Props callbacks (onChange)
  ↓ handled by
Hook → Server Actions
```

## Benefits

✅ **Reusable** - Components used across features  
✅ **Testable** - Isolated logic  
✅ **Maintainable** - Easy to locate issues  
✅ **Scalable** - Add features without bloat  

## When to Extract

Extract when component exceeds:
- 300 lines for page components
- 200 lines for section components  
- 150 lines for hooks

## Pattern: Unified Create/Edit

Same component for both modes:

```typescript
<FeatureForm
  existingItem={item}  // undefined = create mode
  onSuccess={() => ...}
/>
```

## File Organization

```
app/(dashboard)/
  feature/
    page.tsx                    (server component)
    feature-page-client.tsx     (client wrapper)
    _components/                (feature components)
    [id]/
      page.tsx                  (detail page)
      edit/
        page.tsx                (edit page)
    new/
      page.tsx                  (create page)
```

## Component READMEs

Each `_components/` folder has README explaining:
- Architecture decisions
- Component responsibilities
- Usage examples
- Future enhancements

## Related

- [Jobs Components](/app/(dashboard)/jobs/_components/README.md)
- [Estimates Components](/app/(dashboard)/estimates/_components/README.md)
- [Code Standards](/docs/development/CODE_STANDARDS.md)

