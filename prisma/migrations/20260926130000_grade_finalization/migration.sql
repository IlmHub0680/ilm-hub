-- Grade finalization: closes the gap where an instructor could
-- silently overwrite an already-recorded grade forever. A Grade row
-- now carries a status -- DRAFT (freely editable by the instructor,
-- the existing behavior) or FINALIZED (locked; the only way to
-- change it afterward is the Registrar's controlled GradeCorrection
-- workflow, app/api/records/grade-corrections/route.ts, untouched by
-- this migration). Every existing row defaults to DRAFT via the
-- column default -- nothing is backfilled to FINALIZED.

-- CreateEnum
CREATE TYPE "GradeStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN "status" "GradeStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Grade" ADD COLUMN "finalizedAt" TIMESTAMP(3);
ALTER TABLE "Grade" ADD COLUMN "finalizedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Grade_status_idx" ON "Grade"("status");
