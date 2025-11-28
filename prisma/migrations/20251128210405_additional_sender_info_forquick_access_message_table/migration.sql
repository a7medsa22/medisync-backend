/*
  Warnings:

  - Added the required column `senderName` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderRole` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "senderAvatar" TEXT,
ADD COLUMN     "senderName" TEXT NOT NULL,
ADD COLUMN     "senderRole" TEXT NOT NULL;
