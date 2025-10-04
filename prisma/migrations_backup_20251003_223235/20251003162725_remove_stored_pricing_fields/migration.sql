/*
  Warnings:

  - You are about to drop the column `amount` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `depositAmount` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `estimates` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."estimates" DROP COLUMN "amount",
DROP COLUMN "depositAmount",
DROP COLUMN "discountAmount",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
DROP COLUMN "total",
ALTER COLUMN "taxRate" SET DEFAULT 13;

-- AlterTable
ALTER TABLE "public"."invoices" DROP COLUMN "discountAmount",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
DROP COLUMN "total",
ALTER COLUMN "taxRate" SET DEFAULT 13;

-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "discountAmount",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
DROP COLUMN "total",
ALTER COLUMN "taxRate" SET DEFAULT 13;
