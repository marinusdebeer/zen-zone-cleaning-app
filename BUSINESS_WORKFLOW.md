# 🔄 Complete Business Workflow

Your app now implements a **professional cleaning business workflow** from lead to payment!

## 📊 The Complete Flow

```
1. LEAD
   ↓ (provide estimate)
2. ESTIMATE
   ↓ (approve)
3. CLIENT (converted from lead)
   ↓ (create job)
4. JOB
   ↓ (schedule)
5. VISITS (one or multiple)
   ↓ (complete visits)
6. INVOICE (from completed visits)
   ↓ (collect payment)
7. PAYMENT
```

## 🎯 Entity Relationships

### Lead → Client Conversion
- **Lead**: Potential customer (name, contact info, source)
- **Status**: New → Contacted → Qualified → Converted
- **Conversion**: Lead converts to Client when first job is created
- **Tracking**: `convertedToClientId` links lead to client

### Estimate → Job Conversion
- **Estimate**: Quote for services (can be for lead or client)
- **Status**: Draft → Sent → Approved → Converted
- **Conversion**: Approved estimate converts to Job
- **Tracking**: `convertedToJobId` and `convertedFromEstimateId`

### Job → Visits Structure
- **Job**: Container for work (recurring or one-time)
- **Visits**: Individual calendar appointments
- **One-Time Job** = Multiple visits (e.g., 3-phase renovation)
- **Recurring Job** = Auto-generated + manual visits
- **Line Items**: Attached to job, apply to all visits

### Visit → Invoice Creation
- **Visits**: Scheduled appointments (status: Scheduled → InProgress → Completed)
- **Invoice**: Generated from completed visits
- **Selection**: Choose which visits to invoice
- **Default**: Auto-selects uncompleted visits
- **Multiple**: Can create multiple invoices per job

### Invoice → Payment Tracking
- **Invoice**: Bill to client (subtotal + tax = total)
- **Status**: Draft → Sent → Paid/Overdue
- **Payments**: One or multiple payments per invoice
- **Methods**: Cash, Credit Card, Debit, eTransfer, Check

## 📋 Database Schema

### Lead Table
```typescript
- id, orgId
- name, emails, phones, addresses
- source (website, referral, phone, etc.)
- status (New, Contacted, Qualified, Lost)
- notes
- convertedToClientId
```

### Estimate Table
```typescript
- id, orgId
- leadId OR clientId (can belong to either)
- propertyId (optional)
- title, description, amount
- status (Draft, Sent, Approved, Rejected, Converted)
- validUntil
- convertedToJobId
```

### Client Table
```typescript
- id, orgId
- name, emails, phones, addresses
- convertedFromLeadId (if was a lead)
- Relations: properties, estimates, jobs, invoices
```

### Job Table
```typescript
- id, orgId, clientId, propertyId
- title, description
- status (Draft, Active, Completed, Canceled)
- isRecurring, recurringPattern, recurringDays, recurringEndDate
- estimatedCost, priority
- convertedFromEstimateId
- Relations: visits, lineItems, invoices
```

### Visit Table
```typescript
- id, orgId, jobId
- scheduledAt, completedAt
- status (Scheduled, InProgress, Completed, Canceled, NoShow)
- assignees (team members)
- isManual (true if manually added to recurring job)
- notes
- Relations: invoices
```

### LineItem Table
```typescript
- id, orgId, jobId
- name, qty, unitPrice, taxRate
- Attached to job, transferred to visits
```

### Invoice Table
```typescript
- id, orgId, jobId, clientId
- visitIds (array of visit IDs in this invoice)
- subtotal, taxAmount, total
- status (Draft, Sent, Paid, Overdue, Canceled)
- issuedAt, dueAt, paidAt
- Relations: job, client, visits, payments
```

### Payment Table
```typescript
- id, orgId, invoiceId
- amount, method, reference
- paidAt, notes
- Relations: invoice
```

## 💼 Business Scenarios

### Scenario 1: New Lead → First Job
1. Lead enters system (from website form)
2. Create estimate for lead
3. Send estimate
4. Lead approves → Convert lead to client
5. Create job from estimate
6. Schedule visit(s)
7. Complete visit
8. Generate invoice
9. Receive payment

### Scenario 2: Existing Client → Quick Job
1. Client calls for service
2. Create job directly (skip estimate)
3. Add line items
4. Schedule visit
5. Complete visit
6. Auto-invoice
7. Payment

### Scenario 3: Recurring Service
1. Client wants weekly cleaning
2. Create job with recurring pattern
3. System auto-generates visits (Mon, Wed, Fri)
4. Add manual visit for special occasion
5. Complete visits throughout month
6. Generate monthly invoice with all visits
7. Payment

### Scenario 4: Multi-Visit Project
1. Client has large project
2. Create one job: "Post-Renovation"
3. Schedule 3 visits: Phase 1, 2, 3
4. Complete Phase 1 → Invoice it
5. Complete Phase 2 → Invoice it
6. Complete Phase 3 → Final invoice
7. All payments tracked

## 🎨 Calendar Behavior

### What Appears on Calendar
- **Visits** (not jobs!)
- Each visit is a scheduled appointment
- Color-coded by visit status
- Recurring jobs show all their visits
- Manual visits persist even if pattern changes

### Creating Appointments
- **Drag on calendar** → Creates visit
- **Visit links to job**
- **Job has line items** 
- **Line items transfer to invoice**

### Recurring Jobs
- **Pattern set on job** (daily, weekly, biweekly, monthly)
- **Visits auto-generated** based on pattern
- **Manual visits** can be added (flagged with `isManual: true`)
- **Pattern changes** don't affect manual visits

## 📈 Current Test Data

### 2 Leads
1. David Wilson - Contacted (website lead)
2. ABC Corporation - Qualified (referral)

### 6 Clients
1. Sarah Johnson (residential)
2. Mike Chen / TechCorp (commercial)
3. Lisa Davis (residential)
4. Martinez Family (with access codes)
5. BuildCo Construction (commercial)
6. Jennifer Thompson (Orillia)

### 3 Properties
1. Sarah's Home (1800 sq ft)
2. TechCorp Office (5000 sq ft)
3. Lisa's Home (2400 sq ft)

### 2 Estimates
1. For Lead: David Wilson - $250 (Sent)
2. For Client: Sarah Johnson - $450 (Approved, converted to job)

### 4 Jobs
1. **Deep Clean** (Sarah) - Converted from estimate
2. **Weekly Office Cleaning** (TechCorp) - Recurring (Mon, Wed, Fri)
3. **Post-Renovation** (Lisa) - Multi-visit project
4. **Move In Cleaning** (Martinez) - Draft

### 8 Visits
1. Deep Clean visit - **Completed** ✅
2. Office visit 1 - **Completed** ✅
3. Office visit 2 - **Scheduled** (today)
4. Office visit 3 - **Scheduled** (future)
5. Renovation Phase 1 - **Completed** ✅
6. Renovation Phase 2 - **Scheduled** (tomorrow)
7. Renovation Phase 3 - **Scheduled** (next week)
8. Office Manual visit - **Scheduled** (special event)

### 5 Line Items
1-2. Deep Clean job (service + carpets)
3. Office Cleaning service
4-5. Renovation Phase 1 & 2

### 2 Invoices
1. Sarah Johnson - $508.50 - **Paid** ✅ (from visit 1)
2. Lisa Davis - $452.00 - **Sent** (from renovation phase 1)

### 1 Payment
- Sarah's invoice - $508.50 via Credit Card

## 🔒 RLS Security

All new tables have Row Level Security enabled:
- ✅ leads
- ✅ estimates  
- ✅ visits
- ✅ payments

**Policy**: `"orgId" = current_setting('app.org_id')`

## 🚀 Next Steps

### Update Server Actions
You'll need to create new server actions for:
- Lead management (create, convert to client)
- Estimate management (create, approve, convert to job)
- Visit management (schedule, complete, add manual visits)
- Payment processing (record, track methods)

### Update UI Components
- Leads page to manage potential clients
- Estimate conversion workflow
- Visit scheduling on calendar
- Invoice generation from visits
- Payment tracking

### Calendar Integration
- Show visits (not jobs) on calendar
- Color-code by visit status
- Drag to create visits for jobs
- Display job info on visit cards

## 📁 Files Changed

1. **`prisma/schema.prisma`** - New tables: Lead, Estimate, Visit, Payment
2. **`prisma/seed.ts`** - Comprehensive workflow data
3. **`prisma/migrations/.../migration.sql`** - RLS policies for new tables

## ✅ Ready to Build!

Your database now supports a **complete, professional cleaning business workflow** from first contact to final payment! 🎉
