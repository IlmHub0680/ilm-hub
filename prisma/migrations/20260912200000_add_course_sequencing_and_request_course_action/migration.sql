-- CreateEnum
CREATE TYPE "CourseRequestAction" AS ENUM ('ADD', 'DROP');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "semesterLevel" INTEGER;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "courseAction" "CourseRequestAction";

-- CreateTable
CREATE TABLE "_CoursePrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CoursePrerequisites_AB_unique" ON "_CoursePrerequisites"("A", "B");

-- CreateIndex
CREATE INDEX "_CoursePrerequisites_B_index" ON "_CoursePrerequisites"("B");

-- CreateIndex
CREATE INDEX "Request_courseId_idx" ON "Request"("courseId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
