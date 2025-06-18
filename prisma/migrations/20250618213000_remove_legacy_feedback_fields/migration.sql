-- Remove legacy feedback fields
ALTER TABLE "feedbacks" 
DROP COLUMN IF EXISTS "firstImpression",
DROP COLUMN IF EXISTS "strengthsFound",
DROP COLUMN IF EXISTS "weaknessesFound", 
DROP COLUMN IF EXISTS "actionableSteps",
DROP COLUMN IF EXISTS "competitorComparison";