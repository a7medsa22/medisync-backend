-- DropForeignKey
ALTER TABLE "public"."doctors" DROP CONSTRAINT "doctors_specializationId_fkey";

-- AlterTable
ALTER TABLE "public"."doctors" ALTER COLUMN "specializationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."doctors" ADD CONSTRAINT "doctors_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "public"."specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
