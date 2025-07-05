-- AlterTable
ALTER TABLE "roast_requests" 
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricePerRoaster" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
ADD COLUMN     "useStructuredForm" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "maxPrice" DROP NOT NULL,
ALTER COLUMN "basePriceMode" DROP NOT NULL,
ALTER COLUMN "basePriceMode" DROP DEFAULT,
ALTER COLUMN "feedbackMode" DROP NOT NULL,
ALTER COLUMN "feedbackMode" DROP DEFAULT,
ALTER COLUMN "freeQuestions" DROP NOT NULL,
ALTER COLUMN "freeQuestions" DROP DEFAULT,
ALTER COLUMN "questionPrice" DROP NOT NULL,
ALTER COLUMN "questionPrice" DROP DEFAULT;

-- Migrate existing data to new pricing model
UPDATE "roast_requests" 
SET "pricePerRoaster" = CASE
  WHEN "feedbackMode" = 'FREE' THEN 3.0
  WHEN "feedbackMode" = 'STRUCTURED' THEN 
    COALESCE("basePriceMode", 3.0) + 
    (
      SELECT COUNT(*) * COALESCE("questionPrice", 0.25)
      FROM "roast_questions" 
      WHERE "roast_questions"."roastRequestId" = "roast_requests"."id"
    )
  ELSE 3.0
END
WHERE "pricePerRoaster" = 3.0;

-- Update structured form flag based on existing mode
UPDATE "roast_requests" 
SET "useStructuredForm" = true
WHERE "feedbackMode" IS NOT NULL;

-- Update feedback prices to match new model (remove urgency markup)
UPDATE "feedbacks" f
SET "finalPrice" = r."pricePerRoaster"
FROM "roast_requests" r
WHERE f."roastRequestId" = r."id"
AND r."isUrgent" = false;
