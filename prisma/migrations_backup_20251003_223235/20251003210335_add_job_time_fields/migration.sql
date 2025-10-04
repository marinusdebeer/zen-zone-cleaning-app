-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "startTime" TEXT;
