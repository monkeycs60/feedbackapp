-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "projectsPosted" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roaster_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialties" TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['Français']::TEXT[],
    "experience" TEXT NOT NULL DEFAULT 'Débutant',
    "portfolio" TEXT,
    "bio" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedRoasts" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 24,
    "maxActiveRoasts" INTEGER NOT NULL DEFAULT 3,
    "currentActive" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'rookie',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roaster_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roast_requests" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "appUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAudience" TEXT,
    "focusAreas" TEXT[],
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roast_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "roastRequestId" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "firstImpression" TEXT NOT NULL,
    "strengthsFound" TEXT[],
    "weaknessesFound" TEXT[],
    "actionableSteps" TEXT[],
    "competitorComparison" TEXT,
    "screenshots" TEXT[],
    "aiQualityScore" DOUBLE PRECISION,
    "creatorRating" INTEGER,
    "finalPrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "daysSinceSignup" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hasTriedBothRoles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "primaryRole" TEXT DEFAULT 'creator';

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_userId_key" ON "creator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roaster_profiles_userId_key" ON "roaster_profiles"("userId");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roaster_profiles" ADD CONSTRAINT "roaster_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roast_requests" ADD CONSTRAINT "roast_requests_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_roastRequestId_fkey" FOREIGN KEY ("roastRequestId") REFERENCES "roast_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;