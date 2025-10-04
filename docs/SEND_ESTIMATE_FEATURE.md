# Send Estimate Feature

## Overview

Send estimates to clients via email with a professional modal interface.

## How It Works

### Accessing the Feature

**From Estimate Detail Page:**
1. Click "Edit" dropdown button (top right)
2. Select "Send to Client"
3. Modal opens with pre-filled email template

**Available When:**
- Estimate status = "DRAFT"
- After sending, status changes to "SENT"

## Send Estimate Modal

### Pre-Populated Fields

**Client Information:**
- Name (display only)
- Email address (editable - uses first email from client record)

**Email Template:**
```
To: client@example.com (editable)
Subject: Estimate for [Estimate Title]
Body:
  Hi [Client First Name],

  Thank you for your interest in our services. Please find 
  attached the estimate for "[Estimate Title]".

  Total: $[Estimate Total]

  Please review and let us know if you have any questions. 
  We look forward to working with you!

  Best regards
```

### User Can Edit

✅ **To Email** - Change recipient if needed  
✅ **Subject** - Customize subject line  
✅ **Body** - Edit message content  
✅ **Attachments** - Add additional files  

**Automatic:** Estimate PDF is automatically attached

### File Attachments

- Click "Attachments" input to browse files
- Multiple files supported
- Shows file name and size
- Estimate PDF automatically included

## Technical Implementation

### Component Structure

```
estimates/[id]/
  estimate-actions.tsx        # Dropdown with "Send to Client" action
  send-estimate-modal.tsx     # Email modal (client component)
```

### State Management

```typescript
const [showSendModal, setShowSendModal] = useState(false);

// Open modal
onClick: () => setShowSendModal(true)

// Modal component
<SendEstimateModal
  isOpen={showSendModal}
  onClose={() => setShowSendModal(false)}
  clientName="John Doe"
  clientEmail="john@example.com"
  ...
/>
```

### Email Sending (To Be Implemented)

```typescript
// TODO: Implement actual email sending
const response = await fetch('/api/send-estimate', {
  method: 'POST',
  body: JSON.stringify({
    estimateId,
    to: formData.to,
    subject: formData.subject,
    body: formData.body,
    attachments,
  }),
});
```

## Future Enhancements

**Planned:**
- [ ] Generate PDF from estimate data
- [ ] Send via configured SMTP (see `/docs/features/EMAIL.md`)
- [ ] Track email opens/views
- [ ] Email templates library
- [ ] Schedule send for later
- [ ] CC/BCC support
- [ ] Email preview before sending

## Related

- [Email Setup](/docs/features/EMAIL.md) - SMTP configuration
- [Estimates](/docs/features/ESTIMATES.md) - Estimate management
- [Workflow](/docs/WORKFLOW.md) - Business process flow

