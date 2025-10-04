# Invoice Components

Modular, maintainable components for invoice creation and editing.

## Architecture

### **Main Component**
- `invoice-form.tsx` - Main orchestrator component (unified create/edit)

### **Form Sections**
- `invoice-job-selector.tsx` - Select job or create from scratch
- `invoice-line-items.tsx` - Line items display/edit
- `invoice-pricing-calculator.tsx` - Tax, discount, totals

### **Business Logic**
- `use-invoice-form.ts` - Form state management and submission

## Usage

**Create Invoice:**
```tsx
<InvoiceForm orgId={orgId} jobs={jobs} clients={clients} />
```

**Edit Invoice:**
```tsx
<InvoiceForm orgId={orgId} existingInvoice={invoice} />
```

## Pattern

Same unified form for both create and edit modes - detects mode via `existingInvoice` prop.

