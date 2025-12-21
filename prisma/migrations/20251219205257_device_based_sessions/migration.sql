/*
  Warnings:

  - You are about to drop the column `token` on the `auth_tokens` table. All the data in the column will be lost.
  - Made the column `tokenHash` on table `auth_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."auth_tokens_token_key";

-- AlterTable
ALTER TABLE "public"."auth_tokens" DROP COLUMN "token",
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "tokenHash" SET NOT NULL;
