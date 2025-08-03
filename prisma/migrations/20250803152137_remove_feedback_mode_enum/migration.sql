-- Remove feedbackMode column from RoastRequest table
ALTER TABLE "roast_requests" DROP COLUMN IF EXISTS "feedbackMode";

-- Drop the FeedbackMode enum type
DROP TYPE IF EXISTS "FeedbackMode";