# Request Components

Modular components for customer service request management.

## Architecture

### **Main Component**
- `request-form.tsx` - Main orchestrator (unified create/edit)

### **Form Sections**
- `request-client-selector.tsx` - Client and property selection
- `request-details-section.tsx` - Title, description, urgency, source

### **Business Logic**
- `use-request-form.ts` - Form state and submission logic

## Usage

**Create Request:**
```tsx
<RequestForm orgId={orgId} clients={clients} />
```

**Edit Request:**
```tsx
<RequestForm orgId={orgId} existingRequest={request} clients={clients} />
```

## Pattern

Same unified form for both create and edit - detects mode via `existingRequest` prop.

