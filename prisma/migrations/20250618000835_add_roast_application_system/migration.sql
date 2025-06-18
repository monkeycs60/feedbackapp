-- CreateTable
CREATE TABLE "roast_applications" (
    "id" TEXT NOT NULL,
    "roastRequestId" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "motivation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roast_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roast_applications_roastRequestId_roasterId_key" ON "roast_applications"("roastRequestId", "roasterId");

-- AddForeignKey
ALTER TABLE "roast_applications" ADD CONSTRAINT "roast_applications_roastRequestId_fkey" FOREIGN KEY ("roastRequestId") REFERENCES "roast_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roast_applications" ADD CONSTRAINT "roast_applications_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
