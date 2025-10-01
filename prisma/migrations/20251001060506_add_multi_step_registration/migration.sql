/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `doctorId` to the `medical_records` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ConnectionType" AS ENUM ('SCANNED', 'REQUESTED');

-- CreateEnum
CREATE TYPE "public"."ConnectionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('LAB_RESULT', 'XRAY', 'PRESCRIPTION', 'MEDICAL_REPORT', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- AlterTable
ALTER TABLE "public"."medical_records" ADD COLUMN     "doctorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."appointments";

-- DropEnum
DROP TYPE "public"."AppointmentStatus";

-- CreateTable
CREATE TABLE "public"."doctor_patient_connections" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "connectionType" "public"."ConnectionType" NOT NULL,
    "status" "public"."ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "availableDays" JSONB,
    "availableHours" JSONB,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "doctor_patient_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."follow_up_requests" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "prescriptionImage" TEXT NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "respondedBy" TEXT,

    CONSTRAINT "follow_up_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medications" JSONB NOT NULL,
    "prescribedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_patient_connections_doctorId_patientId_key" ON "public"."doctor_patient_connections"("doctorId", "patientId");

-- AddForeignKey
ALTER TABLE "public"."doctor_patient_connections" ADD CONSTRAINT "doctor_patient_connections_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doctor_patient_connections" ADD CONSTRAINT "doctor_patient_connections_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow_up_requests" ADD CONSTRAINT "follow_up_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow_up_requests" ADD CONSTRAINT "follow_up_requests_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
