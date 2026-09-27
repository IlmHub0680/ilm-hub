-- Model 19: practical-assessment structural capacity (no invented
-- weighting or pass formula -- see the schema comments) and a
-- controlled audit trail for grade corrections.
ALTER TABLE "Course" ADD COLUMN "practicalRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "practicalPassRequirement" TEXT;

ALTER TABLE "Grade" ADD COLUMN "practical" DOUBLE PRECISION;

CREATE TABLE "GradeCorrection" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "originalValue" DOUBLE PRECISION,
    "correctedValue" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "correctedByStaffId" TEXT NOT NULL,
    "correctedByName" TEXT NOT NULL,
    "correctedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeCorrection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GradeCorrection_gradeId_idx" ON "GradeCorrection"("gradeId");

ALTER TABLE "GradeCorrection" ADD CONSTRAINT "GradeCorrection_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
