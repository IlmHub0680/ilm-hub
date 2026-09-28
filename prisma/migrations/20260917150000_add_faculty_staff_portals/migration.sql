-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('GENERAL', 'ISLAMIC');

-- CreateEnum
CREATE TYPE "StaffPerformanceRating" AS ENUM ('NEEDS_IMPROVEMENT', 'MEETS_EXPECTATIONS', 'EXCEEDS_EXPECTATIONS', 'OUTSTANDING');

-- CreateEnum
CREATE TYPE "StaffPerformanceReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "ImprovementPlanStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
ALTER TYPE "QASubjectType" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "StaffProfile"
  ADD COLUMN "specialization" TEXT,
  ADD COLUMN "yearsExperience" INTEGER,
  ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "QualityReview"
  ADD COLUMN "staffId" TEXT,
  ADD COLUMN "improvementStatus" "ImprovementPlanStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN "evidenceUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "QualityReview_staffId_idx" ON "QualityReview"("staffId");

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "StaffQualification" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" "QualificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "yearObtained" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffQualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffQualification_staffId_idx" ON "StaffQualification"("staffId");

-- AddForeignKey
ALTER TABLE "StaffQualification" ADD CONSTRAINT "StaffQualification_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "StaffDevelopmentRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "completedAt" TIMESTAMP(3),
    "hours" DOUBLE PRECISION,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffDevelopmentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffDevelopmentRecord_staffId_idx" ON "StaffDevelopmentRecord"("staffId");

-- AddForeignKey
ALTER TABLE "StaffDevelopmentRecord" ADD CONSTRAINT "StaffDevelopmentRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "StaffPerformanceReview" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "rating" "StaffPerformanceRating",
    "strengths" TEXT,
    "areasForGrowth" TEXT,
    "status" "StaffPerformanceReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffPerformanceReview_staffId_idx" ON "StaffPerformanceReview"("staffId");

-- CreateIndex
CREATE INDEX "StaffPerformanceReview_reviewerId_idx" ON "StaffPerformanceReview"("reviewerId");

-- AddForeignKey
ALTER TABLE "StaffPerformanceReview" ADD CONSTRAINT "StaffPerformanceReview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPerformanceReview" ADD CONSTRAINT "StaffPerformanceReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CourseEvaluation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "termId" TEXT,
    "ratingOverall" INTEGER NOT NULL,
    "ratingContent" INTEGER,
    "ratingInstructor" INTEGER,
    "comments" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseEvaluation_studentId_courseId_termId_key" ON "CourseEvaluation"("studentId", "courseId", "termId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_courseId_idx" ON "CourseEvaluation"("courseId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_termId_idx" ON "CourseEvaluation"("termId");

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
