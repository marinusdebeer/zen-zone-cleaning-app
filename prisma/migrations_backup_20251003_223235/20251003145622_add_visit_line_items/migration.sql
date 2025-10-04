/*
  Warnings:

  - You are about to drop the `_InvoiceToVisit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_InvoiceToVisit" DROP CONSTRAINT "_InvoiceToVisit_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_InvoiceToVisit" DROP CONSTRAINT "_InvoiceToVisit_B_fkey";

-- AlterTable
ALTER TABLE "public"."visits" ADD COLUMN     "invoiceId" TEXT;

-- DropTable
DROP TABLE "public"."_InvoiceToVisit";

-- CreateTable
CREATE TABLE "public"."visit_line_items" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_line_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visit_line_items" ADD CONSTRAINT "visit_line_items_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "public"."visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
