/*
  Add invoiceTotal column to payments table
  - Snapshot of invoice total at payment time
  - For existing payments, use the payment amount as fallback
*/

-- Step 1: Add column as nullable
ALTER TABLE "public"."payments" ADD COLUMN "invoiceTotal" DECIMAL(12,2);

-- Step 2: Populate existing rows (use payment amount as best estimate)
UPDATE "public"."payments" SET "invoiceTotal" = "amount" WHERE "invoiceTotal" IS NULL;

-- Step 3: Make column required
ALTER TABLE "public"."payments" ALTER COLUMN "invoiceTotal" SET NOT NULL;
