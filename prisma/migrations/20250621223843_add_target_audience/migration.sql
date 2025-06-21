/*
  Warnings:

  - You are about to drop the column `targetAudienceId` on the `roast_requests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "roast_requests" DROP CONSTRAINT "roast_requests_targetAudienceId_fkey";

-- AlterTable
ALTER TABLE "roast_requests" DROP COLUMN "targetAudienceId";

-- CreateTable
CREATE TABLE "roast_request_audiences" (
    "id" TEXT NOT NULL,
    "roastRequestId" TEXT NOT NULL,
    "targetAudienceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roast_request_audiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roast_request_audiences_roastRequestId_targetAudienceId_key" ON "roast_request_audiences"("roastRequestId", "targetAudienceId");

-- AddForeignKey
ALTER TABLE "roast_request_audiences" ADD CONSTRAINT "roast_request_audiences_roastRequestId_fkey" FOREIGN KEY ("roastRequestId") REFERENCES "roast_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roast_request_audiences" ADD CONSTRAINT "roast_request_audiences_targetAudienceId_fkey" FOREIGN KEY ("targetAudienceId") REFERENCES "target_audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
