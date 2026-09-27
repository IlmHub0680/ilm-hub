-- CreateEnum
CREATE TYPE "InstructorCourseRole" AS ENUM ('LEAD', 'CO_INSTRUCTOR', 'TEACHING_ASSISTANT');

-- CreateEnum
CREATE TYPE "InstructorCourseStatus" AS ENUM ('ACTIVE', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "InstructorCourse"
  ADD COLUMN "termId" TEXT,
  ADD COLUMN "role" "InstructorCourseRole" NOT NULL DEFAULT 'LEAD',
  ADD COLUMN "status" "InstructorCourseStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "InstructorCourse_termId_idx" ON "InstructorCourse"("termId");

-- AddForeignKey
ALTER TABLE "InstructorCourse" ADD CONSTRAINT "InstructorCourse_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
