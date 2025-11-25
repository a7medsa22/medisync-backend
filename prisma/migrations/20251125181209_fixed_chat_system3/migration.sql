/*
  Warnings:

  - You are about to drop the column `LastMessagePreview` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."chats" DROP COLUMN "LastMessagePreview",
ADD COLUMN     "lastMessagePreview" VARCHAR(255);
