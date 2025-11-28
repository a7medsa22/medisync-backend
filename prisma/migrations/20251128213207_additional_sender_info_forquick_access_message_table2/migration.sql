-- AlterTable
ALTER TABLE "public"."messages" ALTER COLUMN "senderName" DROP NOT NULL,
ALTER COLUMN "senderRole" DROP NOT NULL;
