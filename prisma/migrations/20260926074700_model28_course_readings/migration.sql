-- Model 28 rule #8: link a Course's syllabus directly to an
-- authoritative LibraryResource or Book row for required textbooks /
-- recommended readings, instead of duplicating files across rows.
-- Exactly one of libraryResourceId / bookId is expected to be set per
-- row (enforced at the application layer, not a DB constraint, since
-- Postgres has no native XOR check across nullable FKs).

-- CreateEnum
CREATE TYPE "CourseReadingType" AS ENUM ('REQUIRED', 'RECOMMENDED');

-- CreateTable
CREATE TABLE "CourseReading" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "libraryResourceId" TEXT,
    "bookId" TEXT,
    "readingType" "CourseReadingType" NOT NULL DEFAULT 'REQUIRED',
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseReading_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseReading_courseId_idx" ON "CourseReading"("courseId");
CREATE INDEX "CourseReading_libraryResourceId_idx" ON "CourseReading"("libraryResourceId");
CREATE INDEX "CourseReading_bookId_idx" ON "CourseReading"("bookId");

-- AddForeignKey
ALTER TABLE "CourseReading" ADD CONSTRAINT "CourseReading_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReading" ADD CONSTRAINT "CourseReading_libraryResourceId_fkey" FOREIGN KEY ("libraryResourceId") REFERENCES "LibraryResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReading" ADD CONSTRAINT "CourseReading_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
