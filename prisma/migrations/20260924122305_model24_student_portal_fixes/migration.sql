-- Model 24: Student Portal & Learner Experience -- genuine backend
-- gaps found while replacing fake/local-only actions in app/login/page.jsx
-- with real, persisted ones.

-- AlterTable: persist an uploaded profile picture (User had no photo field)
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- AlterTable: let a Private Tutoring request be paid through the same
-- Paystack flow already used for media subscriptions / admissions / author fees
ALTER TABLE "TutoringRequest" ADD COLUMN "paymentGateway" "PaymentGateway";
ALTER TABLE "TutoringRequest" ADD COLUMN "paymentRef" TEXT;
ALTER TABLE "TutoringRequest" ADD COLUMN "paidAmount" DECIMAL(10,2);
CREATE UNIQUE INDEX "TutoringRequest_paymentRef_key" ON "TutoringRequest"("paymentRef");

-- CreateEnum
CREATE TYPE "AbsenceExcuseType" AS ENUM ('LECTURE', 'MIDTERM', 'FINAL');

-- CreateEnum
CREATE TYPE "AbsenceExcuseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: the Absence Excuses tab previously stored submissions only
-- in local React state (lost on refresh, never seen by staff) -- no model
-- existed for it at all.
CREATE TABLE "AbsenceExcuse" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "AbsenceExcuseType" NOT NULL,
    "absenceDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AbsenceExcuseStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsenceExcuse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AbsenceExcuse_studentId_idx" ON "AbsenceExcuse"("studentId");
CREATE INDEX "AbsenceExcuse_courseId_idx" ON "AbsenceExcuse"("courseId");
CREATE INDEX "AbsenceExcuse_status_idx" ON "AbsenceExcuse"("status");

ALTER TABLE "AbsenceExcuse" ADD CONSTRAINT "AbsenceExcuse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AbsenceExcuse" ADD CONSTRAINT "AbsenceExcuse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
