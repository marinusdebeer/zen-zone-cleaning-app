# Calendar & Scheduling

## Overview

Full-featured calendar for viewing and managing visits from recurring and one-off jobs.

## Features

- **Week/Month Views** - Navigate between views
- **Drag-to-Create** - Click and drag to create time blocks
- **Visit Management** - View, edit, complete visits
- **Team Assignment** - Assign staff to visits
- **Status Tracking** - Scheduled, In Progress, Completed, Canceled

## Visit Generation

Jobs automatically generate visits based on schedule:

**One-off Job:**
```typescript
startDate: "2025-10-15"
→ Creates 1 visit on Oct 15
```

**Recurring Job:**
```typescript
recurringPattern: "weekly"
recurringDays: [1, 3, 5]  // Mon, Wed, Fri
startDate: "2025-10-01"
recurringEndDate: "2026-03-31"
→ Creates visit for every Mon/Wed/Fri
```

## Drag-to-Create

1. Click and drag on calendar
2. Select client and job
3. Visit created at dragged time slot

Useful for:
- Manual scheduling
- Rescheduling
- Adding one-off visits to recurring jobs

## Visit Status Flow

```
Scheduled → In Progress → Completed
     ↓
  Canceled
```

**Scheduled** - Default, future visit  
**In Progress** - Team member checked in  
**Completed** - Work done, can invoice  
**Canceled** - No longer happening  

## Team Assignment

Assign staff when creating visit or anytime before:
```typescript
visit.assignees = ["user-id-1", "user-id-2"]
```

Team members see only their assigned visits.

## Calendar Navigation

**Week View:**
- Shows 7 days in columns
- Time slots by hour
- Best for detailed scheduling

**Month View:**
- Shows full month grid
- Visit count per day
- Best for overview

## Related

- [Job Scheduling](/docs/features/JOB_SCHEDULING.md)
- [Team Management](/docs/admin/ADMIN_GUIDE.md)

