-- Model 26: cross-cutting AuditLog for sensitive operations that had
-- no audit trail at all (Community moderation, graduation clearance/
-- approval/document finalization). Admission decisions and grade
-- corrections keep their own existing, already-solid tables
-- (AdmissionAuditLog, GradeCorrection) -- this is purely additive and
-- changes nothing about them.

-- CreateEnum
CREATE TYPE "AuditCategory" AS ENUM ('DOCUMENT_FINALIZATION', 'ACADEMIC_RECORD_ADJUSTMENT', 'COMMUNITY_MODERATION', 'OTHER');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "department" TEXT,
    "module" "Module",
    "action" TEXT NOT NULL,
    "category" "AuditCategory" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
