# Documentation Guide

How documentation is organized in this project.

## Structure

```
docs/
├── README.md                    Main index
├── HOW_TO_RUN.md               Getting started
├── WORKFLOW.md                 Request → Estimate → Job → Invoice flow
├── DOCUMENTATION_SUMMARY.md    This file
│
├── architecture/                Core system design
│   ├── DATABASE.md             Schema, multi-tenancy, migrations
│   ├── COMPONENTS.md           Modular design patterns
│   ├── AUTHENTICATION.md       User accounts & roles
│   ├── MULTI_TENANCY.md        Organization isolation
│   └── THEMING_GUIDE.md        CSS variables and theming
│
├── features/                    How features work
│   ├── CLIENTS.md              Client lifecycle
│   ├── REQUESTS.md             Customer inquiries
│   ├── ESTIMATES.md            Quotes and proposals
│   ├── JOBS.md                 Scheduled work
│   ├── INVOICES.md             Billing and payments
│   ├── JOB_SCHEDULING.md       Recurring patterns
│   ├── CALENDAR.md             Calendar interface
│   └── EMAIL.md                Email configuration
│
├── development/                 Developer reference
│   └── CODE_STANDARDS.md       Coding conventions
│
└── admin/                       Administrator guides
    ├── ADMIN_GUIDE.md          Admin features
    ├── ADDING_ORGANIZATIONS.md Organization setup
    └── TEST_DATA.md            Seed data
```

## Principles

- **Current state focus** - Explains what is, not what changed
- **Concise** - Each doc under 200 lines
- **Organized** - Clear categories
- **Linked** - Cross-references between related docs

## Navigation

Start at `docs/README.md` for complete index.

## Component READMEs

Component documentation lives with the code:
- `app/(dashboard)/jobs/_components/README.md`
- `app/(dashboard)/estimates/_components/README.md`
- `prisma/migrations/README.md`

