/*
  Warnings:

  - You are about to drop the column `targetAudience` on the `roast_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "roast_requests" DROP COLUMN "targetAudience",
ADD COLUMN     "targetAudienceId" TEXT;

-- CreateTable
CREATE TABLE "target_audiences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_audiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "target_audiences_name_key" ON "target_audiences"("name");

-- AddForeignKey
ALTER TABLE "roast_requests" ADD CONSTRAINT "roast_requests_targetAudienceId_fkey" FOREIGN KEY ("targetAudienceId") REFERENCES "target_audiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "target_audiences" ADD CONSTRAINT "target_audiences_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
