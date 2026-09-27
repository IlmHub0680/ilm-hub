-- DropIndex
DROP INDEX "Request_courseId_idx";

-- AlterTable
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CoursePrerequisites_AB_unique";
