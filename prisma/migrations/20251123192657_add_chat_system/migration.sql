/*
  Warnings:

  - You are about to drop the `medical_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEW_CHAT_MESSAGE';

-- DropForeignKey
ALTER TABLE "public"."medical_records" DROP CONSTRAINT "medical_records_patientId_fkey";

-- AlterTable
ALTER TABLE "public"."doctor_patient_connections" ADD COLUMN     "lastMassageAt" TIMESTAMP(3),
ADD COLUMN     "unreadCount" INTEGER;

-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "chronicDiseases" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "currentMedications" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "governorate" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."medical_records";

-- CreateTable
CREATE TABLE "public"."MedicalRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "doctorId" TEXT,
    "connectionId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "public"."DocumentType" NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "treatment" TEXT,
    "medications" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "attachments" JSONB,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chats" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "lastMassageAt" TIMESTAMP(3),
    "LastMassagePreview" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."massages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "massageType" TEXT NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "massages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "public"."MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_idx" ON "public"."MedicalRecord"("doctorId");

-- CreateIndex
CREATE INDEX "MedicalRecord_connectionId_idx" ON "public"."MedicalRecord"("connectionId");

-- CreateIndex
CREATE INDEX "MedicalRecord_createdAt_idx" ON "public"."MedicalRecord"("createdAt");

-- CreateIndex
CREATE INDEX "MedicalRecord_recordDate_idx" ON "public"."MedicalRecord"("recordDate");

-- CreateIndex
CREATE UNIQUE INDEX "chats_connectionId_key" ON "public"."chats"("connectionId");

-- CreateIndex
CREATE INDEX "chats_connectionId_idx" ON "public"."chats"("connectionId");

-- CreateIndex
CREATE INDEX "chats_lastMassageAt_idx" ON "public"."chats"("lastMassageAt");

-- CreateIndex
CREATE INDEX "massages_chatId_idx" ON "public"."massages"("chatId");

-- CreateIndex
CREATE INDEX "massages_senderId_idx" ON "public"."massages"("senderId");

-- CreateIndex
CREATE INDEX "massages_createdAt_idx" ON "public"."massages"("createdAt");

-- CreateIndex
CREATE INDEX "massages_isRead_idx" ON "public"."massages"("isRead");

-- CreateIndex
CREATE INDEX "massages_chatId_createdAt_idx" ON "public"."massages"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "doctor_patient_connections_status_connectedAt_idx" ON "public"."doctor_patient_connections"("status", "connectedAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "patients_userId_idx" ON "public"."patients"("userId");

-- CreateIndex
CREATE INDEX "prescriptions_isActive_idx" ON "public"."prescriptions"("isActive");

-- CreateIndex
CREATE INDEX "prescriptions_prescribedAt_idx" ON "public"."prescriptions"("prescribedAt");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."doctor_patient_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."doctor_patient_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."massages" ADD CONSTRAINT "massages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."massages" ADD CONSTRAINT "massages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
