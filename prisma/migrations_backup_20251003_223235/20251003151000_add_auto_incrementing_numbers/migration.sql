-- Add number columns to all tables
ALTER TABLE "clients" ADD COLUMN "number" INTEGER;
ALTER TABLE "requests" ADD COLUMN "number" INTEGER;
ALTER TABLE "estimates" ADD COLUMN "number" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "number" INTEGER;
ALTER TABLE "visits" ADD COLUMN "number" INTEGER;
ALTER TABLE "invoices" ADD COLUMN "number" INTEGER;
ALTER TABLE "payments" ADD COLUMN "number" INTEGER;

-- Assign sequential numbers to existing rows
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "clients"
)
UPDATE "clients" SET "number" = numbered.new_number
FROM numbered WHERE "clients".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "requests"
)
UPDATE "requests" SET "number" = numbered.new_number
FROM numbered WHERE "requests".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "estimates"
)
UPDATE "estimates" SET "number" = numbered.new_number
FROM numbered WHERE "estimates".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "jobs"
)
UPDATE "jobs" SET "number" = numbered.new_number
FROM numbered WHERE "jobs".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "visits"
)
UPDATE "visits" SET "number" = numbered.new_number
FROM numbered WHERE "visits".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "invoices"
)
UPDATE "invoices" SET "number" = numbered.new_number
FROM numbered WHERE "invoices".id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as new_number
  FROM "payments"
)
UPDATE "payments" SET "number" = numbered.new_number
FROM numbered WHERE "payments".id = numbered.id;

-- Make number columns NOT NULL and add unique constraints
ALTER TABLE "clients" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "requests" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "estimates" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "jobs" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "visits" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "invoices" ALTER COLUMN "number" SET NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "number" SET NOT NULL;

-- Add unique constraints
CREATE UNIQUE INDEX "clients_number_key" ON "clients"("number");
CREATE UNIQUE INDEX "requests_number_key" ON "requests"("number");
CREATE UNIQUE INDEX "estimates_number_key" ON "estimates"("number");
CREATE UNIQUE INDEX "jobs_number_key" ON "jobs"("number");
CREATE UNIQUE INDEX "visits_number_key" ON "visits"("number");
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");
CREATE UNIQUE INDEX "payments_number_key" ON "payments"("number");

