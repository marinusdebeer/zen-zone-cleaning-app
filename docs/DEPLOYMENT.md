# Deployment Guide

Production deployment best practices.

## Build vs Deploy

### Local Development
```bash
npm run build          # Generate Prisma client + build Next.js (NO migrations)
npm run dev            # Development server
```

### Production Deployment
```bash
# Step 1: Apply migrations
npm run prisma:migrate:deploy

# Step 2: Build application
npm run build

# Step 3: Start server
npm run start
```

## Hosting Platforms

### Vercel (Recommended)

**Configuration:** `vercel.json`
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

**Why migrations in build for Vercel:**
- Vercel doesn't have separate pre-deploy hooks
- Build runs on Vercel's infrastructure with database access
- Migrations must complete before app starts
- Vercel automatically rolls back if build fails

**Environment Variables:**
Set in Vercel dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your domain (e.g., `https://yourapp.vercel.app`)
- `NEXTAUTH_SECRET` - Random secret key
- Email credentials (if using email features)

**Deployment Flow:**
1. Push to GitHub
2. Vercel detects changes
3. Runs: `prisma generate && prisma migrate deploy && next build`
4. If successful, deploys new version
5. If failed, keeps current version (safe!)

### Railway / Render / Other Platforms

**Separate Steps Approach:**

1. **Add build command:**
   ```json
   "build": "prisma generate && next build"
   ```

2. **Add release/deploy command:**
   ```bash
   npm run prisma:migrate:deploy && npm run start
   ```

3. **Or use platform hooks:**
   - Railway: `railway.json` with separate migrate + start
   - Render: "Pre-Deploy Command" + "Start Command"

## Environment Variables

Required for all environments:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Auth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<random-secret-here>"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

## Database Setup

### First Deploy

```bash
# 1. Create database
createdb your_database_name

# 2. Apply migrations
npm run prisma:migrate:deploy

# 3. Seed data (optional)
npm run db:seed

# 4. Build and start
npm run build
npm run start
```

### Subsequent Deploys

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
npm install

# 3. Apply new migrations
npm run prisma:migrate:deploy

# 4. Rebuild
npm run build

# 5. Restart server
npm run start
```

## Production Checklist

Before deploying to production:

- [ ] Backup database: `pg_dump $DATABASE_URL > backup.sql`
- [ ] Test migrations on staging first
- [ ] Review migration SQL files
- [ ] Set all environment variables
- [ ] Test build locally: `npm run build`
- [ ] Verify `NEXTAUTH_SECRET` is cryptographically random
- [ ] Enable HTTPS/SSL on hosting platform
- [ ] Set up monitoring/error tracking (optional)

## Rollback

If deployment fails:

### Vercel
- Vercel automatically keeps previous version
- Revert in Vercel dashboard → "Deployments" → "Promote to Production"

### Self-Hosted
```bash
# 1. Restore database
psql $DATABASE_URL < backup.sql

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Rebuild
npm run build
npm run start
```

## Zero-Downtime Deploys

For production systems:

1. **Blue-Green Deployment:**
   - Deploy to new instance
   - Run migrations on new instance
   - Switch traffic to new instance
   - Keep old instance as fallback

2. **Rolling Migrations:**
   - Ensure migrations are backward compatible
   - Deploy code that works with both old and new schema
   - Apply migration
   - Deploy new code

3. **Database Connection Pooling:**
   - Use PgBouncer or connection pooler
   - Prevents connection exhaustion during deploys

## Summary

| Environment | Build Command | Deploy Command |
|-------------|---------------|----------------|
| **Local Dev** | `npm run build` | N/A |
| **Vercel** | `prisma generate && prisma migrate deploy && next build` | Automatic |
| **Self-Hosted** | `npm run build` | `npm run prisma:migrate:deploy` then `npm run start` |

**Key Principle:** 
- ✅ Build = Code compilation only (local)
- ✅ Deploy = Migrations + Start server (production)
- ⚠️ Exception: Vercel combines them (platform-specific)

**See Also:**
- [Migrations Guide](/docs/architecture/MIGRATION_BEST_PRACTICES.md)
- [Best Practices](/docs/BEST_PRACTICES.md)

