-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ConnectionType" ADD VALUE 'QR_CODE';
ALTER TYPE "public"."ConnectionType" ADD VALUE 'ADMIN_ADDED';

-- AlterTable
ALTER TABLE "public"."doctor_patient_connections" ALTER COLUMN "connectionType" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."qr_tokens" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CONNECTION',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_tokens_token_key" ON "public"."qr_tokens"("token");

-- CreateIndex
CREATE INDEX "qr_tokens_token_idx" ON "public"."qr_tokens"("token");

-- CreateIndex
CREATE INDEX "qr_tokens_doctorId_idx" ON "public"."qr_tokens"("doctorId");

-- CreateIndex
CREATE INDEX "qr_tokens_expiresAt_idx" ON "public"."qr_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "qr_tokens_isUsed_idx" ON "public"."qr_tokens"("isUsed");

-- CreateIndex
CREATE INDEX "doctor_patient_connections_doctorId_idx" ON "public"."doctor_patient_connections"("doctorId");

-- CreateIndex
CREATE INDEX "doctor_patient_connections_patientId_idx" ON "public"."doctor_patient_connections"("patientId");

-- CreateIndex
CREATE INDEX "doctor_patient_connections_status_idx" ON "public"."doctor_patient_connections"("status");

-- AddForeignKey
ALTER TABLE "public"."qr_tokens" ADD CONSTRAINT "qr_tokens_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_tokens" ADD CONSTRAINT "qr_tokens_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
