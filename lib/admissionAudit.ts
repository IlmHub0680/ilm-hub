import { prisma } from '@/lib/prisma';

// Model 16: "full audit trail for admission decisions (who/what/when/
// before/after)". Every status transition and every note-worthy admin
// action on an AdmissionApplication should call this. Best-effort by
// design -- an audit log write failing must never block the actual
// admissions workflow, so this never throws.
export async function logAdmissionEvent(params: {
  applicationId: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  note?: string | null;
}): Promise<void> {
  try {
    await prisma.admissionAuditLog.create({
      data: {
        applicationId: params.applicationId,
        action: params.action,
        fromStatus: params.fromStatus || null,
        toStatus: params.toStatus || null,
        actorUserId: params.actorUserId || null,
        actorName: params.actorName || null,
        note: params.note || null,
      },
    });
  } catch (error) {
    console.error('[admissionAudit] Failed to write audit log entry:', error);
  }
}
