# Migration Best Practices

How to properly manage database migrations.

## Golden Rules

✅ **Always use `prisma migrate dev`** - Let Prisma generate migrations  
✅ **Review before applying** - Check generated SQL  
✅ **Test on staging first** - Never test on production  
❌ **Never manually create migrations** - Leads to errors  
❌ **Never edit applied migrations** - They're immutable  

## Proper Workflow

### 1. Make Schema Changes
```typescript
// Edit prisma/schema.prisma
model Client {
  newField String  // Add this
}
```

### 2. Generate Migration
```bash
npm run prisma:migrate -- --name add_client_new_field
```

**Prisma will:**
- Detect schema changes
- Generate SQL automatically
- Apply to shadow DB (validates it works)
- Apply to your DB
- Regenerate Prisma Client

### 3. Review Generated SQL
```bash
cat prisma/migrations/YYYYMMDDHHMMSS_add_client_new_field/migration.sql
```

### 4. Commit to Git
```bash
git add prisma/migrations/
git commit -m "feat: add client new field"
```

## If Migration Fails Partway

### Option 1: Mark as Rolled Back (Preferred)
```bash
# Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Fix the issue in schema or database
# Then regenerate
npx prisma migrate dev --name fixed_migration
```

### Option 2: Reset (Development Only - Destroys Data)
```bash
npx prisma migrate reset --force
```

**Never use reset in production!**

## Shadow Database

**What it is:** Temporary database Prisma creates to validate migrations.

**Why it's important:**
- Tests migrations work from scratch
- Catches ordering issues
- Validates SQL syntax
- Prevents production failures

**Don't bypass it** - If shadow DB fails, fix the root cause.

## Manual Migrations (Advanced)

Only when necessary (complex data transformations):

```bash
# 1. Create empty migration
npm run prisma:migrate -- --create-only --name custom_data_migration

# 2. Edit the generated migration.sql
vim prisma/migrations/YYYYMMDDHHMMSS_custom_data_migration/migration.sql

# 3. Apply it
npm run prisma:migrate
```

**Still use Prisma commands** - Don't create folders manually.

## Common Mistakes

### ❌ Manually Creating Migration Folders
```bash
# DON'T DO THIS
mkdir prisma/migrations/my_migration
echo "ALTER TABLE..." > prisma/migrations/my_migration/migration.sql
```

**Why it fails:** Prisma doesn't track it properly, SQL may have bugs.

### ❌ Editing Applied Migrations
```bash
# DON'T DO THIS
vim prisma/migrations/20251003_already_applied/migration.sql
```

**Why it fails:** Migration already applied, changes won't take effect.

### ❌ Skipping Migrations
```bash
# DON'T DO THIS
npx prisma migrate resolve --applied MIGRATION_NAME  # Without actually applying
```

**Why it fails:** Database and schema out of sync.

## Recovery Scenarios

### Scenario 1: Migration Failed, Database Partially Updated
```bash
# 1. Mark as rolled back
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# 2. Manually clean up partial changes (if needed)
psql $DATABASE_URL < cleanup.sql

# 3. Fix schema issue
vim prisma/schema.prisma

# 4. Generate new migration
npx prisma migrate dev --name fixed_version
```

### Scenario 2: Schema Drift (DB != Schema)
```bash
# Development: Reset
npx prisma migrate reset

# Production: Pull actual schema
npx prisma db pull
# Then create migration to fix drift
npx prisma migrate dev --name sync_schema
```

### Scenario 3: Migration Applied but Folder Missing
```bash
# Database thinks it's applied, but folder doesn't exist

# Option A: Recreate migration folder from DB
# This is complex - usually better to reset in dev

# Option B: Reset (dev only)
npx prisma migrate reset
```

## Current Issue Resolution

**Problem:** Manually created migration failed partway.

**Solution:**
1. Database has partial changes
2. Migration folder removed
3. Need to clean slate

**For Development:**
```bash
npx prisma migrate reset --force
# This is safe because it's dev data
```

**For Production:**
```bash
# Never reset!
# Manually fix database
# Create corrective migration
```

## Prevention Checklist

- [ ] Always use `prisma migrate dev`
- [ ] Let Prisma generate SQL
- [ ] Review generated SQL before applying
- [ ] Test on staging before production
- [ ] Never manually create migration folders
- [ ] Never edit applied migrations
- [ ] Commit migrations to git immediately

