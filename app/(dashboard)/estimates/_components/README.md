# Estimate (Quote) Components

Modular, maintainable components for estimate creation and editing.

## Architecture

The estimate form follows the same pattern as jobs, broken down into small, focused components:

### **Main Component**
- `estimate-form.tsx` - Main orchestrator component that composes all sections

### **Form Sections (UI Components)**
- `estimate-recipient-selector.tsx` - Client/Lead selection
- `estimate-details-section.tsx` - Title & description fields
- `estimate-pricing-section.tsx` - Amount, valid until date, status
- `estimate-line-items.tsx` - Line items with products/services (future)

### **Business Logic**
- `use-estimate-form.ts` - Custom hook managing form state and submission logic

## Estimate Features

The estimate system includes:

1. **Unified Create/Edit Workflow** - Same component for both creating and editing
2. **Recipient Selection** - Choose between existing client or lead
3. **Property Association** - Link estimate to specific property
4. **Line Items** - Add products and services with quantities and pricing
5. **Pricing Details** - Amount, tax, discounts, valid until date
6. **Status Management** - Draft, Sent, Approved, Rejected, Converted

## Benefits

### **Separation of Concerns**
- UI components handle display and user input
- Business logic in the hook
- Server actions are separate

### **Reusability**
- `EstimateRecipientSelector` can be used in invoices
- `EstimatePricingSection` can be reused elsewhere
- Components can be composed in different ways

### **Maintainability**
- Small files (50-150 lines each)
- Easy to locate and fix issues
- Changes to one section don't affect others

## Usage

### Create New Estimate
```tsx
<EstimateForm 
  clients={clients}
  leads={leads}
  orgId={orgId}
/>
```

### Edit Existing Estimate
```tsx
<EstimateForm 
  clients={clients}
  leads={leads}
  orgId={orgId}
  existingEstimate={estimate}  // Pre-populates form
/>
```

### With Callbacks (Modal)
```tsx
<EstimateForm 
  clients={clients}
  leads={leads}
  orgId={orgId}
  onCancel={() => closeModal()}
  onSuccess={() => {
    closeModal();
    refreshData();
  }}
/>
```

## File Structure

```
app/(dashboard)/estimates/
├── _components/              # Shared estimate components
│   ├── README.md             # This file
│   ├── estimate-form.tsx     # Main form orchestrator
│   ├── use-estimate-form.ts  # Form logic hook
│   ├── estimate-recipient-selector.tsx
│   ├── estimate-details-section.tsx
│   └── estimate-pricing-section.tsx
├── new/
│   └── page.tsx              # Create estimate page (uses EstimateForm)
└── [id]/
    ├── page.tsx              # View estimate page
    └── edit/
        └── page.tsx          # Edit estimate page (uses EstimateForm)
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

- Line items with product catalog integration
- Tax calculation and configuration
- Discount management
- PDF generation and preview
- Email sending directly from estimate
- Digital signature capture
- Terms and conditions templates
- Required deposits

