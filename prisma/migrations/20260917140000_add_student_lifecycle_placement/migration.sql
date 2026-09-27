-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('FULL_TIME', 'PART_TIME');

-- CreateEnum
CREATE TYPE "SelfRatedLevel" AS ENUM ('NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFICIENT');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "AdmissionApplication"
  ADD COLUMN "preferredName" TEXT,
  ADD COLUMN "pathwayPreference" TEXT,
  ADD COLUMN "preferredDepartmentId" TEXT,
  ADD COLUMN "specialization" TEXT,
  ADD COLUMN "studyMode" "StudyMode",
  ADD COLUMN "islamicStudiesBackground" TEXT,
  ADD COLUMN "quranReadingSelf" "SelfRatedLevel",
  ADD COLUMN "quranTajweedSelf" "SelfRatedLevel",
  ADD COLUMN "quranHifzSelf" "SelfRatedLevel",
  ADD COLUMN "quranRecitationSelf" "SelfRatedLevel",
  ADD COLUMN "arabicReadingSelf" "SelfRatedLevel",
  ADD COLUMN "arabicWritingSelf" "SelfRatedLevel",
  ADD COLUMN "arabicGrammarSelf" "SelfRatedLevel",
  ADD COLUMN "arabicVocabularySelf" "SelfRatedLevel",
  ADD COLUMN "arabicConversationSelf" "SelfRatedLevel",
  ADD COLUMN "quranicArabicSelf" "SelfRatedLevel",
  ADD COLUMN "learningGoals" TEXT,
  ADD COLUMN "supportNeeds" TEXT,
  ADD COLUMN "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "declarationAcceptedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AdmissionApplication_preferredDepartmentId_idx" ON "AdmissionApplication"("preferredDepartmentId");

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_preferredDepartmentId_fkey" FOREIGN KEY ("preferredDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PlacementAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PENDING',
    "quranReadingLevel" "SelfRatedLevel",
    "quranTajweedLevel" "SelfRatedLevel",
    "quranHifzLevel" "SelfRatedLevel",
    "quranRecitationLevel" "SelfRatedLevel",
    "arabicReadingLevel" "SelfRatedLevel",
    "arabicWritingLevel" "SelfRatedLevel",
    "arabicGrammarLevel" "SelfRatedLevel",
    "arabicVocabularyLevel" "SelfRatedLevel",
    "arabicConversationLevel" "SelfRatedLevel",
    "quranicArabicLevel" "SelfRatedLevel",
    "recommendedPathway" TEXT,
    "recommendedProgramId" TEXT,
    "assessorNote" TEXT,
    "assessedByStaffId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlacementAssessment_studentId_key" ON "PlacementAssessment"("studentId");

-- CreateIndex
CREATE INDEX "PlacementAssessment_status_idx" ON "PlacementAssessment"("status");

-- CreateIndex
CREATE INDEX "PlacementAssessment_recommendedProgramId_idx" ON "PlacementAssessment"("recommendedProgramId");

-- CreateIndex
CREATE INDEX "PlacementAssessment_assessedByStaffId_idx" ON "PlacementAssessment"("assessedByStaffId");

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_recommendedProgramId_fkey" FOREIGN KEY ("recommendedProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_assessedByStaffId_fkey" FOREIGN KEY ("assessedByStaffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
