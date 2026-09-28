import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

// POST /api/dean/escalate -- gap #4: the Dean's brief says to
// "escalate issues to the appropriate institutional authority," and
// there was no explicit way to do that anywhere in the dashboard.
//
// Escalation-mechanism decision (see this session's audit): the
// shared Request model is studentId-bound (every field, and its
// RequestType enum, exists to carry a *student's* request through
// Records/Student Affairs/Examinations) -- it has no shape for "Dean
// flags an institutional matter to Admin" that isn't about a specific
// student's case, and adding a new RequestType value would touch an
// enum three other domains already depend on for something that isn't
// really a request in that sense. Instead this reuses two mechanisms
// already in the codebase for exactly this kind of cross-domain,
// persisted, visible-to-someone signal:
//   - AuditLog (lib/auditLog.js), category OTHER -- a permanent,
//     queryable institutional record of the escalation (visible via
//     the existing /api/admin/audit-log viewer), and
//   - Notification, one row per ADMIN/SUPER_ADMIN user -- so the
//     escalation is actually visible to somebody, not just logged.
// Nothing here is a client-side toast: both writes are real Prisma
// rows a relevant party can see.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const faculty = staff
      ? await prisma.faculty.findUnique({ where: { deanId: staff.id } })
      : null;

    if (!faculty && !isAdmin) {
      return NextResponse.json({ error: "You are not currently assigned as Dean of a faculty." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    // Free-text context: which existing record this escalation is
    // about, e.g. "Quality Review qr_123" or "Graduation Application
    // ga_456" -- optional, since some escalations are general.
    const relatedTo = typeof body.relatedTo === "string" ? body.relatedTo.trim() : null;

    if (!subject || !details) {
      return NextResponse.json({ error: "Subject and details are required." }, { status: 400 });
    }

    await logAudit({
      actor: user,
      action: "DEAN_ESCALATION",
      category: "OTHER",
      module: "FACULTY_MATTERS",
      department: faculty?.nameEn ?? null,
      targetType: relatedTo ? "EscalationReference" : null,
      targetId: null,
      summary: `Dean escalation${faculty ? ` (${faculty.nameEn})` : ""}: ${subject}`,
      metadata: { subject, details, relatedTo, facultyId: faculty?.id ?? null },
    });

    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: `Dean escalation: ${subject}`,
        message: `${user.name} (Dean${faculty ? `, ${faculty.nameEn}` : ""}) escalated: ${details}${relatedTo ? ` [Ref: ${relatedTo}]` : ""}`,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dean escalation error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Faculty Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to submit escalation." }, { status: 500 });
  }
}
