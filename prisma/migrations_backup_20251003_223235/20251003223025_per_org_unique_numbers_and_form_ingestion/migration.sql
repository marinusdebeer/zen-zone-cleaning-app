/*
  Warnings:

  - A unique constraint covering the columns `[orgId,number]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `estimates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `requests` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,number]` on the table `visits` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."clients_number_key";

-- DropIndex
DROP INDEX "public"."estimates_number_key";

-- DropIndex
DROP INDEX "public"."invoices_number_key";

-- DropIndex
DROP INDEX "public"."jobs_number_key";

-- DropIndex
DROP INDEX "public"."payments_number_key";

-- DropIndex
DROP INDEX "public"."requests_number_key";

-- DropIndex
DROP INDEX "public"."visits_number_key";

-- AlterTable
ALTER TABLE "public"."requests" ADD COLUMN     "details" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "hearAboutId" TEXT,
ADD COLUMN     "industryId" TEXT,
ADD COLUMN     "preferredAt" TIMESTAMP(3),
ADD COLUMN     "serviceTypeId" TEXT;

-- CreateTable
CREATE TABLE "public"."industries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_types" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hear_about" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hear_about_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."access_methods" (
    "id" TEXT NOT NULL,
    "industryId" TEXT,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reasons" (
    "id" TEXT NOT NULL,
    "industryId" TEXT,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "requestId" TEXT,
    "jobId" TEXT,
    "invoiceId" TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."org_counters" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "org_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_slug_key" ON "public"."industries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_slug_key" ON "public"."service_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hear_about_slug_key" ON "public"."hear_about"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "access_methods_slug_key" ON "public"."access_methods"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "reasons_slug_key" ON "public"."reasons"("slug");

-- CreateIndex
CREATE INDEX "activities_requestId_createdAt_idx" ON "public"."activities"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "files_requestId_idx" ON "public"."files"("requestId");

-- CreateIndex
CREATE INDEX "files_jobId_idx" ON "public"."files"("jobId");

-- CreateIndex
CREATE INDEX "files_invoiceId_idx" ON "public"."files"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "org_counters_orgId_scope_key" ON "public"."org_counters"("orgId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "clients_orgId_number_key" ON "public"."clients"("orgId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "estimates_orgId_number_key" ON "public"."estimates"("orgId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_orgId_number_key" ON "public"."invoices"("orgId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_orgId_number_key" ON "public"."jobs"("orgId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orgId_number_key" ON "public"."payments"("orgId", "number");

-- CreateIndex
CREATE INDEX "requests_industryId_idx" ON "public"."requests"("industryId");

-- CreateIndex
CREATE INDEX "requests_serviceTypeId_idx" ON "public"."requests"("serviceTypeId");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "public"."requests"("status");

-- CreateIndex
CREATE INDEX "requests_createdAt_idx" ON "public"."requests"("createdAt");

-- CreateIndex
CREATE INDEX "requests_preferredAt_idx" ON "public"."requests"("preferredAt");

-- CreateIndex
CREATE UNIQUE INDEX "requests_orgId_number_key" ON "public"."requests"("orgId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "visits_orgId_number_key" ON "public"."visits"("orgId", "number");

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "public"."service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_hearAboutId_fkey" FOREIGN KEY ("hearAboutId") REFERENCES "public"."hear_about"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_types" ADD CONSTRAINT "service_types_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."access_methods" ADD CONSTRAINT "access_methods_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reasons" ADD CONSTRAINT "reasons_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_counters" ADD CONSTRAINT "org_counters_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
