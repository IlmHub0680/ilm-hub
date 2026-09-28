-- CreateEnum
CREATE TYPE "GraduationStatus" AS ENUM ('NOT_STARTED', 'ELIGIBLE', 'APPLIED', 'CLEARANCE_IN_PROGRESS', 'CLEARED', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('PENDING', 'CLEARED', 'FLAGGED');

-- AlterEnum
ALTER TYPE "RequestType" ADD VALUE 'COMPLAINT';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "creditHours" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "recipientDepartmentId" TEXT,
ADD COLUMN     "topic" TEXT;

-- CreateTable
CREATE TABLE "RequestActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromLabel" TEXT,
    "toLabel" TEXT,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus",
    "note" TEXT,
    "actorLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationApplication" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programId" TEXT,
    "status" "GraduationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "appliedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraduationClearance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "clearedByStaffId" TEXT,
    "clearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationClearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestActivity_requestId_idx" ON "RequestActivity"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationApplication_studentId_key" ON "GraduationApplication"("studentId");

-- CreateIndex
CREATE INDEX "GraduationApplication_studentId_idx" ON "GraduationApplication"("studentId");

-- CreateIndex
CREATE INDEX "GraduationApplication_programId_idx" ON "GraduationApplication"("programId");

-- CreateIndex
CREATE INDEX "GraduationApplication_status_idx" ON "GraduationApplication"("status");

-- CreateIndex
CREATE INDEX "GraduationClearance_applicationId_idx" ON "GraduationClearance"("applicationId");

-- CreateIndex
CREATE INDEX "GraduationClearance_unitId_idx" ON "GraduationClearance"("unitId");

-- CreateIndex
CREATE INDEX "GraduationClearance_status_idx" ON "GraduationClearance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationClearance_applicationId_unitId_key" ON "GraduationClearance"("applicationId", "unitId");

-- CreateIndex
CREATE INDEX "Request_recipientDepartmentId_idx" ON "Request"("recipientDepartmentId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_recipientDepartmentId_fkey" FOREIGN KEY ("recipientDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestActivity" ADD CONSTRAINT "RequestActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationApplication" ADD CONSTRAINT "GraduationApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationApplication" ADD CONSTRAINT "GraduationApplication_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GraduationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationClearance" ADD CONSTRAINT "GraduationClearance_clearedByStaffId_fkey" FOREIGN KEY ("clearedByStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
