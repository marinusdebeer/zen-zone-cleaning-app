# 📚 Zen Zone Cleaning - Documentation

Complete documentation for your multi-tenant cleaning business management platform.

## 🚀 Quick Start

- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Starting and stopping the app

## 👤 User Management

- **[USER_ACCOUNTS.md](./USER_ACCOUNTS.md)** - Login credentials, password reset, account settings
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** ⭐ **NEW** - Email configuration for password resets and notifications

## 🏢 Multi-Tenancy

- **[MULTI_TENANCY.md](./MULTI_TENANCY.md)** - How multi-tenant architecture works
- **[ADDING_BUSINESSES.md](./ADDING_BUSINESSES.md)** - How to add new organizations

## 🛡️ Admin Dashboard

- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - Super admin dashboard and tenant management

## 💼 Business Workflow

- **[BUSINESS_WORKFLOW.md](./BUSINESS_WORKFLOW.md)** - Complete lead → payment workflow
- **[NAVIGATION_FLOW.md](./NAVIGATION_FLOW.md)** - How to navigate between related entities

## 📅 Calendar System

- **[CALENDAR_FEATURES.md](./CALENDAR_FEATURES.md)** - Advanced calendar features
- **[CALENDAR_USAGE.md](./CALENDAR_USAGE.md)** - How to use the calendar
- **[DRAG_TO_CREATE_GUIDE.md](./DRAG_TO_CREATE_GUIDE.md)** - Drag-to-create jobs feature

## 📊 Test Data

- **[TEST_DATA.md](./TEST_DATA.md)** - Overview of seed data and relationships

## 🔐 Login Credentials

### Super Admin (Platform Manager)
```
Email: marinusdebeer@gmail.com
Password: password123
Access: /admin
```

**Can do:**
- ✅ Manage all organizations
- ✅ View system-wide stats
- ✅ Add new tenants
- ✅ Manage all users

### Zen Zone Cleaning Admin
```
Email: admin@zenzonecleaning.com
Password: password123
Access: /dashboard
```

**Can do:**
- ✅ Manage Zen Zone Cleaning organization
- ✅ View clients, jobs, invoices
- ✅ Use calendar and all features
- ❌ Cannot see other organizations

## 📖 Documentation Structure

```
/docs/
  ├── README.md (this file)
  │
  ├── Getting Started
  │   ├── HOW_TO_RUN.md
  │   └── USER_ACCOUNTS.md
  │
  ├── Platform Architecture
  │   ├── MULTI_TENANCY.md
  │   ├── BUSINESS_WORKFLOW.md
  │   └── ADDING_BUSINESSES.md
  │
  ├── Admin Features
  │   └── ADMIN_GUIDE.md
  │
  ├── User Features
  │   ├── CALENDAR_FEATURES.md
  │   ├── CALENDAR_USAGE.md
  │   ├── DRAG_TO_CREATE_GUIDE.md
  │   └── NAVIGATION_FLOW.md
  │
  └── Reference
      └── TEST_DATA.md
```

## 🎯 Common Tasks

### Starting Development
```bash
npm run dev
# Visit: http://localhost:3000
```

### Resetting Database
```bash
npx prisma db push --force-reset
npm run seed
```

### Adding Test Data
```bash
npm run seed
```

### Building for Production
```bash
npm run build
npm start
```

## 🆘 Need Help?

1. Check the relevant guide in `/docs`
2. Review `README.md` in project root
3. Check console for error messages
4. Verify environment variables are set

## 🔄 Quick Reference

| Task | Command |
|------|---------|
| Start dev | `npm run dev` |
| Build | `npm run build` |
| Seed database | `npm run seed` |
| Generate Prisma | `npx prisma generate` |
| Push schema | `npx prisma db push` |
| Reset database | `npx prisma db push --force-reset` |
| Stop server | `Ctrl + C` or `lsof -ti:3000 \| xargs kill -9` |

---

**Happy building! 🎉**
