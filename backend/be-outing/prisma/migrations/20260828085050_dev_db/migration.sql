/*
  Warnings:

  - You are about to drop the column `follower` on the `form` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "form" DROP COLUMN "follower";
