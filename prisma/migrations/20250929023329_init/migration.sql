/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserStatus_new" AS ENUM ('INIT', 'PENDING_EMAIL_VERIFICATION', 'EMAIL_VERIFIED', 'ACTIVE', 'INACTIVE', 'SUSPENDED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "status" TYPE "public"."UserStatus_new" USING ("status"::text::"public"."UserStatus_new");
ALTER TYPE "public"."UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "public"."UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationStep" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" DROP DEFAULT;
