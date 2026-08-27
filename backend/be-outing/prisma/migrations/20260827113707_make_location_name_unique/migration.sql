/*
  Warnings:

  - You are about to drop the column `endDate` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Location` table. All the data in the column will be lost.
  - The `imageUrl` column on the `Location` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Companion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistrationSequence` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Companion" DROP CONSTRAINT "Companion_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_locationId_fkey";

-- DropIndex
DROP INDEX "Location_startDate_idx";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "beds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "carparkCapacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "residentCapacity" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[];

-- DropTable
DROP TABLE "Companion";

-- DropTable
DROP TABLE "Registration";

-- DropTable
DROP TABLE "RegistrationSequence";

-- DropEnum
DROP TYPE "RegistrationStatus";

-- CreateTable
CREATE TABLE "form" (
    "id" UUID NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "locationId" TEXT NOT NULL,
    "follower" INTEGER NOT NULL DEFAULT 0,
    "companions" JSONB NOT NULL DEFAULT '[]',
    "travelOption" TEXT NOT NULL DEFAULT 'SELF_DRIVE',
    "carShare" BOOLEAN NOT NULL DEFAULT false,
    "emptySeats" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "form_registrationNumber_key" ON "form"("registrationNumber");

-- CreateIndex
CREATE INDEX "form_locationId_idx" ON "form"("locationId");

-- CreateIndex
CREATE INDEX "form_status_idx" ON "form"("status");

-- CreateIndex
CREATE INDEX "form_createdAt_idx" ON "form"("createdAt");

-- CreateIndex
CREATE INDEX "form_phone_idx" ON "form"("phone");
