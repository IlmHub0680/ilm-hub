-- CreateEnum
CREATE TYPE "QASubjectType" AS ENUM ('PROGRAM', 'COURSE', 'DEPARTMENT', 'FACULTY');

-- CreateEnum
CREATE TYPE "QAReviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QAOutcome" AS ENUM ('COMPLIANT', 'MINOR_NON_COMPLIANCE', 'MAJOR_NON_COMPLIANCE');

-- CreateTable
CREATE TABLE "QualityReview" (
    "id" TEXT NOT NULL,
    "subjectType" "QASubjectType" NOT NULL,
    "programId" TEXT,
    "courseId" TEXT,
    "departmentId" TEXT,
    "facultyId" TEXT,
    "reviewType" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "recommendation" TEXT,
    "status" "QAReviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "outcome" "QAOutcome",
    "followUpDate" TIMESTAMP(3),
    "reviewedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QualityReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QualityReview_subjectType_idx" ON "QualityReview"("subjectType");

-- CreateIndex
CREATE INDEX "QualityReview_status_idx" ON "QualityReview"("status");

-- CreateIndex
CREATE INDEX "QualityReview_programId_idx" ON "QualityReview"("programId");

-- CreateIndex
CREATE INDEX "QualityReview_courseId_idx" ON "QualityReview"("courseId");

-- CreateIndex
CREATE INDEX "QualityReview_departmentId_idx" ON "QualityReview"("departmentId");

-- CreateIndex
CREATE INDEX "QualityReview_facultyId_idx" ON "QualityReview"("facultyId");

-- CreateIndex
CREATE INDEX "QualityReview_reviewedById_idx" ON "QualityReview"("reviewedById");

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
