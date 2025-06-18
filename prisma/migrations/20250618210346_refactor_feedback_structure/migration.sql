/*
  Warnings:

  - Added the required column `generalFeedback` to the `feedbacks` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the generalFeedback column with a temporary default
ALTER TABLE "feedbacks" ADD COLUMN "generalFeedback" TEXT DEFAULT 'Feedback migré depuis ancien format';

-- Update existing feedbacks to have a general feedback based on existing data
UPDATE "feedbacks" SET "generalFeedback" = 
  'Première impression: ' || "firstImpression" || 
  E'\n\nPoints forts:\n• ' || array_to_string("strengthsFound", E'\n• ') ||
  E'\n\nPoints faibles:\n• ' || array_to_string("weaknessesFound", E'\n• ') ||
  E'\n\nActions recommandées:\n• ' || array_to_string("actionableSteps", E'\n• ') ||
  CASE 
    WHEN "competitorComparison" IS NOT NULL THEN E'\n\nComparaison concurrentielle:\n' || "competitorComparison"
    ELSE ''
  END;

-- Remove the default value and make it required
ALTER TABLE "feedbacks" ALTER COLUMN "generalFeedback" DROP DEFAULT;
ALTER TABLE "feedbacks" ALTER COLUMN "generalFeedback" SET NOT NULL;

-- Make legacy fields optional and set defaults
ALTER TABLE "feedbacks" ALTER COLUMN "firstImpression" DROP NOT NULL,
ALTER COLUMN "strengthsFound" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "weaknessesFound" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "actionableSteps" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "question_responses" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_responses_feedbackId_questionId_key" ON "question_responses"("feedbackId", "questionId");

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;