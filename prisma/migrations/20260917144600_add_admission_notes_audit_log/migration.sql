-- Model 16 (Admissions & Application System)
-- Internal vs Applicant-Visible admission notes, and a full audit trail
-- for admission status transitions/decisions. Neither existed before.
-- Applied after migration_a_workflow_enum.sql, which must land first.

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INTERNAL', 'APPLICANT_VISIBLE');

-- CreateTable
CREATE TABLE "AdmissionNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "note" TEXT NOT NULL,
    "authorStaffId" TEXT,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionAuditLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "actorUserId" TEXT,
    "actorName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdmissionNote_applicationId_idx" ON "AdmissionNote"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionNote_visibility_idx" ON "AdmissionNote"("visibility");

-- CreateIndex
CREATE INDEX "AdmissionAuditLog_applicationId_idx" ON "AdmissionAuditLog"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionAuditLog_createdAt_idx" ON "AdmissionAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AdmissionNote" ADD CONSTRAINT "AdmissionNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionAuditLog" ADD CONSTRAINT "AdmissionAuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
