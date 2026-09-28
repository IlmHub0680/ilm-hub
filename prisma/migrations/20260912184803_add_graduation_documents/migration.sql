-- CreateEnum
CREATE TYPE "GraduationDocumentType" AS ENUM ('CERTIFICATE', 'STATEMENT_OF_COMPLETION');

-- CreateTable
CREATE TABLE "GraduationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "GraduationDocumentType" NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GraduationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GraduationDocument_applicationId_idx" ON "GraduationDocument"("applicationId");

-- CreateIndex
CREATE INDEX "GraduationDocument_studentId_idx" ON "GraduationDocument"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "GraduationDocument_applicationId_type_key" ON "GraduationDocument"("applicationId", "type");

-- AddForeignKey
ALTER TABLE "GraduationDocument" ADD CONSTRAINT "GraduationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GraduationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationDocument" ADD CONSTRAINT "GraduationDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
