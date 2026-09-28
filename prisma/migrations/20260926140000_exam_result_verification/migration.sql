-- Result submission / verification / reconciliation for the
-- Examinations Officer role. Closes a real gap: Exam (a scheduled
-- sitting) and Grade (the score of record, owned by the Instructor)
-- were never linked, so there was no way to track "this exam happened,
-- results were collected from the instructor, and I have reconciled
-- them against Grade" for a specific Exam sitting.
--
-- ExamResultSubmission is a tracking/verification layer only -- it
-- never stores a score itself (that stays on Grade) and this migration
-- does not touch Grade or the grading framework/weights in any way.
-- One row per Exam (examId is unique): a course can have several
-- Exam rows of the same examType in one term (e.g. a resit MIDTERM),
-- so the mapping to a Grade bucket (targetGradeField) is recorded
-- per-Exam rather than assumed from examType alone. Purely additive --
-- a brand-new table, no existing data touched.

-- CreateEnum
CREATE TYPE "ExamResultStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'RECONCILED');

-- CreateTable
CREATE TABLE "ExamResultSubmission" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "targetGradeField" TEXT NOT NULL,
    "status" "ExamResultStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamResultSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamResultSubmission_examId_key" ON "ExamResultSubmission"("examId");

-- CreateIndex
CREATE INDEX "ExamResultSubmission_status_idx" ON "ExamResultSubmission"("status");

-- AddForeignKey
ALTER TABLE "ExamResultSubmission" ADD CONSTRAINT "ExamResultSubmission_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
