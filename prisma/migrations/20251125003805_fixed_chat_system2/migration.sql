/*
  Warnings:

  - You are about to drop the column `LastMassagePreview` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `lastMassageAt` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `lastMassageAt` on the `doctor_patient_connections` table. All the data in the column will be lost.
  - You are about to drop the `massages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."massages" DROP CONSTRAINT "massages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."massages" DROP CONSTRAINT "massages_senderId_fkey";

-- DropIndex
DROP INDEX "public"."chats_lastMassageAt_idx";

-- AlterTable
ALTER TABLE "public"."chats" DROP COLUMN "LastMassagePreview",
DROP COLUMN "lastMassageAt",
ADD COLUMN     "LastMessagePreview" VARCHAR(255),
ADD COLUMN     "lastMessageAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."doctor_patient_connections" DROP COLUMN "lastMassageAt",
ADD COLUMN     "lastMessageAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."massages";

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_chatId_idx" ON "public"."messages"("chatId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "public"."messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "public"."messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_isRead_idx" ON "public"."messages"("isRead");

-- CreateIndex
CREATE INDEX "messages_chatId_createdAt_idx" ON "public"."messages"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "chats_lastMessageAt_idx" ON "public"."chats"("lastMessageAt");

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
