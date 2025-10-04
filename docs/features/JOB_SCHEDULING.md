# Job Scheduling System

## Overview

The job scheduling system uses **Jobs** to represent work agreements and **Visits** to represent individual occurrences.

---

## Core Concepts

### **Job**
A Job is the overall work agreement with a client. It contains:
- Client and property information
- Job title and description
- Recurring pattern (if applicable)
- Start and end dates
- Billing frequency
- Status and priority

### **Visit**
A Visit is a single instance of work being performed. It contains:
- Scheduled date and time
- Status (Scheduled, InProgress, Completed, Canceled, NoShow)
- Assigned team members
- Notes specific to that visit

---

## Job Types

### **One-Off Jobs**
- Single visit or multiple non-repeating visits
- Examples: Spring clean-up, move-out cleaning, HVAC repair
- `isRecurring: false`
- Typically invoiced once at completion

### **Recurring Jobs**
- Multiple visits on a repeating schedule
- Examples: Weekly cleaning, monthly lawn care
- `isRecurring: true`
- Can have multiple invoices based on `billingFrequency`
- **All visits generated upfront** (up to 5 year maximum)

---

## Recurring Patterns

### Supported Patterns:

**Daily**
- Generates a visit every day
- Example: Daily pool maintenance

**Weekly**
- Generates visits on specified days of the week
- `recurringDays`: Array of day numbers [0-6] (0=Sunday, 6=Saturday)
- Example: Every Monday, Wednesday, Friday = `[1, 3, 5]`

**Biweekly**
- Generates visits every two weeks on specified days
- Example: Every other Tuesday = `recurringDays: [2]`

**Monthly**
- Generates visits on the same day of each month
- Example: 15th of every month
- If day doesn't exist in a month (e.g., Jan 31), uses last day

---

## Visit Generation

### Strategy: **Generate All Upfront**

When a recurring job is created, ALL visits are generated immediately with the following rules:

1. **Start Date**: First visit on `startDate`
2. **End Date**: 
   - If `recurringEndDate` is set: Generate up to that date
   - If not set: Generate for 5 years from start
3. **Maximum**: Never exceed 5 years or 1,825 visits
4. **Pattern**: Follow the `recurringPattern` and `recurringDays`

### Example:

```typescript
Job {
  title: "Weekly Pool Cleaning",
  isRecurring: true,
  recurringPattern: "weekly",
  recurringDays: [2], // Tuesday
  startDate: "2025-01-01",
  recurringEndDate: "2025-12-31"
}
```

**Result**: Generates ~52 visits (every Tuesday from Jan 1 to Dec 31, 2025)

---

## Billing Frequency

Controls when invoices are generated:

- `AT_COMPLETION` - One invoice after job is completed (default for one-off)
- `PER_VISIT` - Invoice after each visit
- `WEEKLY` - Invoice weekly for all visits in that week
- `MONTHLY` - Invoice monthly for all visits in that month

---

## Database Schema

### Job Fields

```prisma
model Job {
  id                    String    @id @default(cuid())
  orgId                 String
  clientId              String
  propertyId            String?
  jobNumber             String?   // Optional display number
  title                 String
  description           String?
  status                String    @default("Draft")
  
  // Recurring fields
  isRecurring           Boolean   @default(false)
  recurringPattern      String?   // daily, weekly, biweekly, monthly
  recurringDays         Json?     // [0,1,2,3,4,5,6] for days of week
  startDate             DateTime?
  recurringEndDate      DateTime?
  
  // Billing
  billingFrequency      String    @default("AT_COMPLETION")
  
  // Other
  estimatedCost         Decimal?
  priority              String    @default("normal")
  
  visits                Visit[]
  invoices              Invoice[]
}
```

### Visit Fields

```prisma
model Visit {
  id            String    @id @default(cuid())
  orgId         String
  jobId         String
  scheduledAt   DateTime
  completedAt   DateTime?
  status        String    @default("Scheduled")
  assignees     Json      @default("[]")
  notes         String?
  
  job           Job       @relation(...)
}
```

---

## Usage

### Creating a One-Off Job

```typescript
await createJob(orgId, {
  clientId: "...",
  title: "Spring Clean-Up",
  isRecurring: false,
  startDate: new Date("2025-03-15"),
  billingFrequency: "AT_COMPLETION"
});

// Result: 1 visit created on March 15, 2025
```

### Creating a Recurring Job

```typescript
await createJob(orgId, {
  clientId: "...",
  title: "Weekly Pool Maintenance",
  isRecurring: true,
  recurringPattern: "weekly",
  recurringDays: [2], // Tuesday
  startDate: new Date("2025-01-07"), // First Tuesday
  recurringEndDate: new Date("2025-12-30"),
  billingFrequency: "MONTHLY"
});

// Result: ~52 visits created (every Tuesday for 1 year)
```

---

## Important Rules

### ⚠️ Immutability
Once a job is created, its **type cannot change** (one-off ↔ recurring). This prevents data inconsistencies. If you need to change the type, create a new job.

### ✅ Individual Visit Modifications
While the job pattern is immutable, individual visits CAN be:
- Rescheduled
- Canceled
- Marked as No-Show
- Assigned to different team members

### 🔒 5-Year Maximum
To prevent database bloat:
- Maximum 5 years of visits
- Maximum 1,825 visits per job
- If end date > 5 years, capped at 5 years

---

## Future Enhancements

Potential additions (not yet implemented):

1. **Custom Recurring Patterns**: "Every 3rd Monday", "1st and 15th of month"
2. **Visit Templates**: Default notes, assignees, duration per visit
3. **Auto-Regeneration**: Background job to add more visits as time passes
4. **Bulk Operations**: Reschedule all future visits, cancel all visits
5. **Visit Series**: Edit all future visits in a recurring series at once

---

## API Reference

### Server Actions

```typescript
// Create job (generates visits automatically)
createJob(orgId: string, data: CreateJobInput): Promise<Job>

// Get job with visits
getJob(orgId: string, jobId: string): Promise<Job & { visits: Visit[] }>

// Update job (does NOT regenerate visits)
updateJob(orgId: string, data: UpdateJobInput): Promise<Job>
```

### Utility Functions

```typescript
// Generate visits array (preview before saving)
generateVisitsForJob(schedule: JobSchedule): GeneratedVisit[]

// Calculate total visit count
calculateVisitCount(schedule: JobSchedule): number

// Get preview of first N visits
getVisitPreview(schedule: JobSchedule, count?: number): Date[]
```

---

## Testing

To test the visit generation:

```typescript
import { calculateVisitCount, getVisitPreview } from '@/server/utils/visit-generator';

// Preview weekly visits
const preview = getVisitPreview({
  isRecurring: true,
  recurringPattern: 'weekly',
  recurringDays: [1, 3, 5], // Mon, Wed, Fri
  startDate: new Date('2025-01-01'),
  recurringEndDate: new Date('2025-12-31')
}, 10);

console.log('First 10 visits:', preview);
// Shows: Jan 1, Jan 3, Jan 6, Jan 8, Jan 10, ...

const total = calculateVisitCount({...});
console.log('Total visits:', total);
// Shows: ~156 visits
```

