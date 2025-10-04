-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "billingFrequency" TEXT NOT NULL DEFAULT 'AT_COMPLETION',
ADD COLUMN     "jobNumber" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);
