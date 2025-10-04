-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "assignees" JSONB NOT NULL DEFAULT '[]';
