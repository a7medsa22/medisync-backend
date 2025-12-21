-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "authProvider" "public"."AuthProvider" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "profilePhoto" TEXT;
