/*
  Warnings:

  - You are about to drop the column `invoiceNumber` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `jobNumber` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."invoices" DROP COLUMN "invoiceNumber";

-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "estimatedCost",
DROP COLUMN "jobNumber";
