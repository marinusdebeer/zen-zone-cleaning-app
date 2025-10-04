# Job Components

Modular, maintainable components for job creation and editing.

## Architecture

The job form has been broken down into small, focused components following best practices:

### **Main Component**
- `job-form.tsx` - Main orchestrator component that composes all sections

### **Form Sections (UI Components)**
- `job-type-selector.tsx` - One-off vs Recurring selection
- `job-client-selector.tsx` - Client & property selection
- `job-details-section.tsx` - Title & description fields
- `job-schedule-section.tsx` - Date, time, recurring settings
- `job-billing-section.tsx` - Billing frequency & cost
- `job-team-section.tsx` - Team member assignment
- `visit-preview-card.tsx` - Visit generation preview

### **Business Logic**
- `use-job-form.ts` - Custom hook managing form state and submission logic

## Benefits

### **Separation of Concerns**
Each component has a single responsibility:
- UI components handle display and user input
- Business logic is in the hook
- Server actions are separate

### **Reusability**
Components can be used elsewhere:
- `JobClientSelector` could be used in estimates, invoices
- `VisitPreviewCard` could be used in scheduling
- `JobBillingSection` could be reused in settings

### **Maintainability**
- Small files (50-150 lines each vs 672 lines)
- Easy to locate and fix issues
- Changes to one section don't affect others
- Easy to test individual components

### **Scalability**
Easy to add new features:
- Add new sections by creating new components
- Hook can be extended with more logic
- Form validation can be added per section
- Easy to add conditional sections

## Component Communication

```
job-form.tsx (Orchestrator)
    ↓ (uses)
use-job-form.ts (Business Logic)
    ↓ (provides state to)
Individual Section Components
    ↓ (emit events via)
Props callbacks (onChange, onSubmit)
    ↓ (handled by)
use-job-form.ts
    ↓ (calls)
Server Actions
```

## Usage

### Create New Job
```tsx
<JobForm 
  clients={clients}
  teamMembers={teamMembers}
  orgId={orgId}
/>
```

### Edit Existing Job
```tsx
<JobForm 
  clients={clients}
  teamMembers={teamMembers}
  orgId={orgId}
  existingJob={job}  // Pre-populates form
/>
```

### With Callbacks (Modal)
```tsx
<JobForm 
  clients={clients}
  teamMembers={teamMembers}
  orgId={orgId}
  onCancel={() => closeModal()}
  onSuccess={() => {
    closeModal();
    refreshData();
  }}
/>
```

## Adding New Features

### Add a New Form Section
1. Create component in `_components/job-[section-name].tsx`
2. Add state to `use-job-form.ts`
3. Import and render in `job-form.tsx`

### Add Validation
Add to `use-job-form.ts`:
```typescript
const validateForm = () => {
  if (!formData.title) return 'Title required';
  if (!formData.clientId) return 'Client required';
  // ... more validation
};
```

### Add Conditional Logic
In `job-form.tsx`:
```tsx
{formData.status === 'Active' && (
  <NewSection ... />
)}
```

## File Structure

```
app/(dashboard)/jobs/
├── _components/           # Shared job components
│   ├── README.md          # This file
│   ├── job-form.tsx       # Main form orchestrator
│   ├── use-job-form.ts    # Form logic hook
│   ├── job-type-selector.tsx
│   ├── job-client-selector.tsx
│   ├── job-details-section.tsx
│   ├── job-schedule-section.tsx
│   ├── job-billing-section.tsx
│   ├── job-team-section.tsx
│   └── visit-preview-card.tsx
├── new/
│   └── page.tsx           # Create job page (uses JobForm)
└── [id]/
    ├── page.tsx           # View job page
    ├── job-detail-client.tsx
    └── edit/
        └── page.tsx       # Edit job page (uses JobForm)
```

## Best Practices Followed

✅ **Single Responsibility** - Each component does one thing  
✅ **DRY (Don't Repeat Yourself)** - Shared logic in hook  
✅ **Composition over Inheritance** - Small components compose together  
✅ **Props Down, Events Up** - Unidirectional data flow  
✅ **Theme Compliance** - All use theme variables  
✅ **TypeScript** - Fully typed interfaces  
✅ **Accessibility** - Proper labels, disabled states  
✅ **Server/Client Separation** - Clear boundaries  

## Future Enhancements

Ideas for future additions:
- Form validation library (react-hook-form, zod)
- Optimistic UI updates
- Auto-save drafts
- Undo/redo functionality
- Form progress indicator
- Field-level error messages
- Keyboard shortcuts
- Accessibility improvements (ARIA labels)

