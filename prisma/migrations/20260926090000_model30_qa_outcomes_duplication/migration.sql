-- Model 30: Curriculum Outcome Mapping (PLO/CLO) + Duplication Flags

-- CreateEnum
CREATE TYPE "OutcomeDepthLevel" AS ENUM ('INTRODUCED', 'DEVELOPED', 'REINFORCED', 'MASTERED');

-- CreateEnum
CREATE TYPE "DuplicateFlagSubjectType" AS ENUM ('COURSE', 'PROGRAM', 'CATEGORY');

-- CreateEnum
CREATE TYPE "DuplicateFlagStatus" AS ENUM ('OPEN', 'CONFIRMED_DUPLICATE', 'NOT_A_DUPLICATE', 'MERGED');

-- CreateTable
CREATE TABLE "ProgramLearningOutcome" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "statementEn" TEXT NOT NULL,
    "statementAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramLearningOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLearningOutcome" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "programLearningOutcomeId" TEXT,
    "code" TEXT NOT NULL,
    "statementEn" TEXT NOT NULL,
    "statementAr" TEXT,
    "depth" "OutcomeDepthLevel",
    "assessmentMethods" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLearningOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateFlag" (
    "id" TEXT NOT NULL,
    "subjectType" "DuplicateFlagSubjectType" NOT NULL,
    "subjectAId" TEXT NOT NULL,
    "subjectBId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DuplicateFlagStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "flaggedById" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuplicateFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramLearningOutcome_programId_code_key" ON "ProgramLearningOutcome"("programId", "code");

-- CreateIndex
CREATE INDEX "ProgramLearningOutcome_programId_idx" ON "ProgramLearningOutcome"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLearningOutcome_courseId_code_key" ON "CourseLearningOutcome"("courseId", "code");

-- CreateIndex
CREATE INDEX "CourseLearningOutcome_courseId_idx" ON "CourseLearningOutcome"("courseId");

-- CreateIndex
CREATE INDEX "CourseLearningOutcome_programLearningOutcomeId_idx" ON "CourseLearningOutcome"("programLearningOutcomeId");

-- CreateIndex
CREATE INDEX "DuplicateFlag_subjectType_idx" ON "DuplicateFlag"("subjectType");

-- CreateIndex
CREATE INDEX "DuplicateFlag_status_idx" ON "DuplicateFlag"("status");

-- CreateIndex
CREATE INDEX "DuplicateFlag_flaggedById_idx" ON "DuplicateFlag"("flaggedById");

-- AddForeignKey
ALTER TABLE "ProgramLearningOutcome" ADD CONSTRAINT "ProgramLearningOutcome_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLearningOutcome" ADD CONSTRAINT "CourseLearningOutcome_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLearningOutcome" ADD CONSTRAINT "CourseLearningOutcome_programLearningOutcomeId_fkey" FOREIGN KEY ("programLearningOutcomeId") REFERENCES "ProgramLearningOutcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateFlag" ADD CONSTRAINT "DuplicateFlag_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateFlag" ADD CONSTRAINT "DuplicateFlag_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
