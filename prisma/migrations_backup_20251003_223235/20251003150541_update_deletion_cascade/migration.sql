-- DropForeignKey
ALTER TABLE "public"."visits" DROP CONSTRAINT "visits_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."visits" DROP CONSTRAINT "visits_jobId_fkey";

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visits" ADD CONSTRAINT "visits_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
