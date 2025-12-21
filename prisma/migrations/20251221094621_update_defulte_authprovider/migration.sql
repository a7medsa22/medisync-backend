/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "profilePhoto",
ALTER COLUMN "authProvider" SET DEFAULT 'LOCAL';
