# Migrations

Database schema migrations managed by Prisma.

## Structure

Each migration is in a timestamped folder:
```
YYYYMMDDHHMMSS_descriptive_name/
  migration.sql
```

## Applied Migrations

- `20250930000001_baseline` - Initial schema with RLS
- `20250930000002_add_organization_timezone` - Timezone support
- `20251002221005_add_job_scheduling_fields` - Job scheduling
- `20251002224458_add_expenses` - Expense tracking

## Pending Migrations

- `20251003000001_unified_client_and_line_items` - Unified Client model + Line items

## Commands

**Check status:**
```bash
npx prisma migrate status
```

**Apply (production):**
```bash
npx prisma migrate deploy
```

**Apply (development):**
```bash
npx prisma migrate dev
```

See `/docs/MIGRATIONS.md` for complete guide.

## Rules

- ✅ Migrations are **append-only** (never edit applied migrations)
- ✅ Always **backup before production deploys**
- ✅ **Test on staging first**
- ❌ Never delete migration files
- ❌ Never run `migrate dev` in production

