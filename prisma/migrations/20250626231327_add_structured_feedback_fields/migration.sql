-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "additionalComments" TEXT,
ADD COLUMN     "experienceRating" INTEGER,
ADD COLUMN     "firstImpression" TEXT,
ADD COLUMN     "globalRating" INTEGER,
ADD COLUMN     "performanceRating" INTEGER,
ADD COLUMN     "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "uxUiRating" INTEGER,
ADD COLUMN     "valueRating" INTEGER,
ADD COLUMN     "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "generalFeedback" DROP NOT NULL;
