-- Model 17 (Registry, Admission Decisions & Admission Documents)
-- Adds the Letter of Admission workflow (generate draft -> review ->
-- finalize) for approved applications. Builds on the existing
-- AdmissionApplication / AdmissionAuditLog tables from Model 16; no
-- existing table is altered.

-- CreateEnum
CREATE TYPE "AdmissionLetterStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable
CREATE TABLE "AdmissionLetter" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "AdmissionLetterStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "programmeText" TEXT,
    "departmentText" TEXT,
    "qualificationText" TEXT,
    "intakeSession" TEXT,
    "admissionDate" TIMESTAMP(3),
    "conditions" TEXT,
    "signatoryName" TEXT,
    "signatoryTitle" TEXT,
    "pdfUrl" TEXT,
    "previousVersions" JSONB,
    "generatedByStaffId" TEXT,
    "generatedByName" TEXT,
    "finalizedByStaffId" TEXT,
    "finalizedByName" TEXT,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionLetter_applicationId_key" ON "AdmissionLetter"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionLetter_applicationId_idx" ON "AdmissionLetter"("applicationId");

-- CreateIndex
CREATE INDEX "AdmissionLetter_status_idx" ON "AdmissionLetter"("status");

-- AddForeignKey
ALTER TABLE "AdmissionLetter" ADD CONSTRAINT "AdmissionLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AdmissionApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
