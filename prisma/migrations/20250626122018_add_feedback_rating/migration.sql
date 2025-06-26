-- CreateTable
CREATE TABLE "feedback_ratings" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "domain" TEXT,
    "clarity" INTEGER NOT NULL,
    "relevance" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "actionable" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_ratings_feedbackId_domain_key" ON "feedback_ratings"("feedbackId", "domain");

-- AddForeignKey
ALTER TABLE "feedback_ratings" ADD CONSTRAINT "feedback_ratings_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
