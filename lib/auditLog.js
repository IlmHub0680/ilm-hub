import { prisma } from "@/lib/prisma";

// Model 26: a single, append-only place to log sensitive operations
// that had no audit trail before -- Community moderation actions and
// graduation clearance/approval/document-finalization decisions.
// Admission decisions (AdmissionAuditLog) and grade corrections
// (GradeCorrection) already have their own solid, dedicated tables
// and are NOT duplicated here; the unified viewer at
// /api/admin/audit-log reads all three sources together.
//
// There is deliberately no update/delete path anywhere in this file
// or exposed through any route -- per Model 26 rule #11, ordinary
// staff and external UI routes must never be able to alter or erase
// an audit record.
export const AUDIT_CATEGORIES = [
  "DOCUMENT_FINALIZATION",
  "ACADEMIC_RECORD_ADJUSTMENT",
  "COMMUNITY_MODERATION",
  "OTHER",
];

export async function logAudit({
  actor,
  action,
  category,
  module = null,
  department = null,
  targetType = null,
  targetId = null,
  summary,
  metadata = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: actor?.id || null,
        actorName: actor?.name || "Unknown",
        actorRole: actor?.role || "UNKNOWN",
        department: department || null,
        module: module || null,
        action,
        category,
        targetType,
        targetId,
        summary,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // An audit-log failure must never block the underlying operation
    // (clearing a graduation requirement, moderating a post, etc.) --
    // the same principle already used for notification creation
    // elsewhere in this codebase.
    console.error("Audit log write failed:", error);
  }
}
