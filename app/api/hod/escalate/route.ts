import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

// POST /api/hod/escalate -- gap #4: a real, persisted way for the HOD
// to flag something up to the Dean (or Admin, when the department has
// no Dean assigned yet). Same escalation-mechanism decision as
// app/api/dean/escalate/route.ts (see its comment for the full
// reasoning): AuditLog (category OTHER) for the permanent record, plus
// a real Notification row for every actual recipient -- the
// department's own Dean (via Department.faculty.dean.user) when one is
// assigned, and every ADMIN/SUPER_ADMIN otherwise/in addition, so this
// never silently notifies nobody.
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const department = staff
      ? await prisma.department.findUnique({
          where: { headId: staff.id },
          include: { faculty: { select: { nameEn: true, dean: { select: { user: { select: { id: true } } } } } } },
        })
      : null;

    if (!department && !isAdmin) {
      return NextResponse.json({ error: "You are not currently assigned as Head of a department." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : "";
    const relatedTo = typeof body.relatedTo === "string" ? body.relatedTo.trim() : null;

    if (!subject || !details) {
      return NextResponse.json({ error: "Subject and details are required." }, { status: 400 });
    }

    await logAudit({
      actor: user,
      action: "HOD_ESCALATION",
      category: "OTHER",
      module: "DEPARTMENT_MATTERS",
      department: department?.nameEn ?? null,
      targetType: relatedTo ? "EscalationReference" : null,
      targetId: null,
      summary: `HOD escalation${department ? ` (${department.nameEn})` : ""}: ${subject}`,
      metadata: { subject, details, relatedTo, departmentId: department?.id ?? null },
    });

    const recipientIds = new Set<string>();

    const deanUserId = department?.faculty?.dean?.user?.id;
    if (deanUserId) recipientIds.add(deanUserId);

    // Always also notify Admin -- the Dean seat can be vacant, and an
    // escalation must never end up visible to nobody.
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true },
    });
    for (const a of admins) recipientIds.add(a.id);

    await prisma.notification.createMany({
      data: Array.from(recipientIds).map((userId) => ({
        userId,
        title: `HOD escalation: ${subject}`,
        message: `${user.name} (Head of Department${department ? `, ${department.nameEn}` : ""}) escalated: ${details}${relatedTo ? ` [Ref: ${relatedTo}]` : ""}`,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HOD escalation error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Department Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to submit escalation." }, { status: 500 });
  }
}
