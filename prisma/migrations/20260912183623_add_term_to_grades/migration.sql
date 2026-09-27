-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "termId" TEXT;

-- CreateIndex
CREATE INDEX "Grade_termId_idx" ON "Grade"("termId");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_termId_fkey" FOREIGN KEY ("termId") REFERENCES "AcademicTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
