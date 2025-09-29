# Quick Guide: Adding New Businesses

## Your Setup
Your app now supports **multiple independent businesses** in one database with complete data isolation.

## How to Add a New Business

### Quick Method (Recommended for Development)

1. **Edit `prisma/seed.ts`**
   - Uncomment the example organization code (lines 122-165)
   - Customize the values:
     ```typescript
     name: 'Your Company Name',
     slug: 'your-company-slug',  // Must be unique, URL-friendly
     email: 'owner@yourcompany.com',
     ```

2. **Run the seed:**
   ```bash
   npm run seed
   ```

3. **Login with new credentials:**
   - Email: `owner@yourcompany.com`
   - Password: `password123`

### Production Method

**Option A: Add to seed file before deploying**
- Edit seed file as above
- Push to GitHub
- Vercel will run seed during deployment

**Option B: Direct database access (Neon)**
1. Go to Neon Console → SQL Editor
2. Run SQL to create organization:
   ```sql
   INSERT INTO organizations (id, name, slug, industry, settings, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'New Company Name',
     'new-company-slug',
     'cleaning',
     '{"features":{"quotes":true,"invoices":true}}',
     NOW(),
     NOW()
   );
   ```
3. Create user and membership similarly

## Important Notes

✅ **Each business is completely isolated** - no data sharing
✅ **Use unique slugs** - they identify organizations
✅ **Users can belong to multiple businesses** - great for consultants
✅ **No code changes needed** - just add data
⚠️ **Slugs are permanent** - choose wisely (used in database lookups)
⚠️ **Test in development first** - use seed file to experiment

## What You Get Per Business

Each organization automatically gets:
- ✅ Isolated client database
- ✅ Separate jobs and invoices
- ✅ Independent team members
- ✅ Custom settings and branding
- ✅ Secure RLS protection

## Need Help?

See `MULTI_TENANCY.md` for full architecture documentation.
