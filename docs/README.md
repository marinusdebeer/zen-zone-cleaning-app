# Documentation Index

Clean, organized documentation for the Zen Zone Cleaning application.

## ⚡ Best Practices (Start Here!)

- **[BEST PRACTICES](/docs/BEST_PRACTICES.md)** ← Read this first for secure, maintainable code

Key rules:
- Use `serialize()` for Server → Client data
- Use `withOrgContext()` for database operations
- Use npm scripts for migrations
- Keep files under 300 lines
- Never hard-code colors

## 🚀 Getting Started

- [How to Run](/docs/HOW_TO_RUN.md) - Setup and run the application

## 🏗️ Architecture

Core system design and patterns.

- [Database](/docs/architecture/DATABASE.md) - Schema, multi-tenancy, data flow
- [Components](/docs/architecture/COMPONENTS.md) - Modular design patterns
- [Authentication](/docs/architecture/AUTHENTICATION.md) - User accounts & roles
- [Multi-Tenancy](/docs/architecture/MULTI_TENANCY.md) - Organization isolation
- [Serialization](/docs/architecture/SERIALIZATION.md) - Decimal serialization best practices
- [Theming](/docs/architecture/THEMING_GUIDE.md) - CSS variables and theming

## 📋 Workflow

- [Business Workflow](/docs/WORKFLOW.md) - Request → Estimate → Job → Invoice flow
- [Unified Forms](/docs/UNIFIED_FORMS.md) - Standardized create/edit patterns
- [Conversion Flows](/docs/CONVERSION_FLOWS.md) - How to convert between entities

## ✨ Features

How each feature works.

- [Clients](/docs/features/CLIENTS.md) - Client lifecycle (Lead → Active)
- [Requests](/docs/features/REQUESTS.md) - Customer service requests
- [Estimates](/docs/features/ESTIMATES.md) - Quotes and proposals
- [Jobs](/docs/features/JOBS.md) - Scheduled work
- [Invoices](/docs/features/INVOICES.md) - Billing and payments
- [Job Scheduling](/docs/features/JOB_SCHEDULING.md) - Recurring patterns and visits
- [Calendar](/docs/features/CALENDAR.md) - Calendar interface
- [Email](/docs/features/EMAIL.md) - Email configuration

## 👨‍💻 Development

For developers.

- [Code Standards](/docs/development/CODE_STANDARDS.md) - Coding conventions
- [Deployment](/docs/DEPLOYMENT.md) - Production deployment guide

## 🔧 Admin

For administrators.

- [Admin Guide](/docs/admin/ADMIN_GUIDE.md) - Admin features and setup
- [Adding Organizations](/docs/admin/ADDING_ORGANIZATIONS.md) - Create new organizations
- [Test Data](/docs/admin/TEST_DATA.md) - Seed data reference

## 📦 Component READMEs

- [Job Components](/app/(dashboard)/jobs/_components/README.md)
- [Estimate Components](/app/(dashboard)/estimates/_components/README.md)
- [Migrations](/prisma/migrations/README.md)

## 📚 Archive

Historical documentation (migrations, upgrade guides) in `/docs/archive/`.
