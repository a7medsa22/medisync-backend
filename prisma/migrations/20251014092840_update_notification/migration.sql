/*
  Warnings:

  - The values [SYSTEM,APPROVAL,REMINDER] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `title` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'QR_SCANNED', 'NEW_MESSAGE');
ALTER TABLE "public"."notifications" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."notifications" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
ALTER TABLE "public"."notifications" ALTER COLUMN "type" SET DEFAULT 'CONNECTION_REQUEST';
COMMIT;

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'CONNECTION_REQUEST';
