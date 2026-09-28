-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'RETURNED_FOR_REVISION');

-- CreateEnum
CREATE TYPE "IntegrityViolationType" AS ENUM ('PLAGIARISM', 'CHEATING', 'UNAUTHORIZED_COLLABORATION', 'FALSIFICATION', 'IMPERSONATION', 'ASSESSMENT_MISCONDUCT', 'AI_MISUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrityCaseSeverity" AS ENUM ('MINOR', 'MAJOR');

-- CreateEnum
CREATE TYPE "IntegrityCaseStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Course"
  ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "approvalNote" TEXT;

-- AlterTable
ALTER TABLE "Program"
  ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "approvalNote" TEXT;

-- CreateTable
CREATE TABLE "IntegrityCase" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "violationType" "IntegrityViolationType" NOT NULL,
    "severity" "IntegrityCaseSeverity" NOT NULL DEFAULT 'MINOR',
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "status" "IntegrityCaseStatus" NOT NULL DEFAULT 'REPORTED',
    "sanction" TEXT,
    "standingActionTaken" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrityCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegrityCase_studentId_idx" ON "IntegrityCase"("studentId");

-- CreateIndex
CREATE INDEX "IntegrityCase_courseId_idx" ON "IntegrityCase"("courseId");

-- CreateIndex
CREATE INDEX "IntegrityCase_reportedById_idx" ON "IntegrityCase"("reportedById");

-- CreateIndex
CREATE INDEX "IntegrityCase_status_idx" ON "IntegrityCase"("status");

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "StaffProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrityCase" ADD CONSTRAINT "IntegrityCase_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
