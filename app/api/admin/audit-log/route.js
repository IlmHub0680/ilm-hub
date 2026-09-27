import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Model 26 rule #11: one place to see Who/What/When/Record for every
// sensitive operation this Institute already tracks. This route does
// NOT introduce a second audit store -- it reads three sources
// together and merges them by time:
//   - AuditLog: the new generic table (Community moderation,
//     graduation clearance/approval/document finalization).
//   - AdmissionAuditLog: admission decisions -- already solid,
//     untouched, existed long before this model.
//   - GradeCorrection: grade corrections -- already solid, untouched,
//     existed long before this model.
// Read-only by design: there is no PATCH/DELETE anywhere in this
// route or in lib/auditLog.js, so no ordinary staff or UI action can
// ever alter or erase a record here (rule #11's explicit requirement).
const CATEGORY_FILTERS = new Set([
  "ALL",
  "ADMISSION_DECISION",
  "GRADE_CORRECTION",
  "DOCUMENT_FINALIZATION",
  "ACADEMIC_RECORD_ADJUSTMENT",
  "COMMUNITY_MODERATION",
  "OTHER",
]);

export async function GET(request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = CATEGORY_FILTERS.has(searchParams.get("category"))
      ? searchParams.get("category")
      : "ALL";
    const limit = 200;

    const wantsAuditLog =
      category === "ALL" ||
      (category !== "ADMISSION_DECISION" && category !== "GRADE_CORRECTION");

    const [auditRows, admissionRows, gradeRows] = await Promise.all([
      wantsAuditLog
        ? prisma.auditLog.findMany({
            where: category === "ALL" ? {} : { category },
            orderBy: { createdAt: "desc" },
            take: limit,
          })
        : Promise.resolve([]),
      category === "ALL" || category === "ADMISSION_DECISION"
        ? prisma.admissionAuditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { application: { select: { applicationNumber: true, fullName: true } } },
          })
        : Promise.resolve([]),
      category === "ALL" || category === "GRADE_CORRECTION"
        ? prisma.gradeCorrection.findMany({
            orderBy: { correctedAt: "desc" },
            take: limit,
          })
        : Promise.resolve([]),
    ]);

    const merged = [
      ...auditRows.map((r) => ({
        id: `audit-${r.id}`,
        source: "AuditLog",
        category: r.category,
        actorName: r.actorName,
        actorRole: r.actorRole,
        department: r.department,
        module: r.module,
        action: r.action,
        summary: r.summary,
        targetType: r.targetType,
        targetId: r.targetId,
        createdAt: r.createdAt,
      })),
      ...admissionRows.map((r) => ({
        id: `admission-${r.id}`,
        source: "AdmissionAuditLog",
        category: "ADMISSION_DECISION",
        actorName: r.actorName || "System",
        actorRole: null,
        department: null,
        module: "ADMISSIONS",
        action: r.action,
        summary: `${r.action}${r.application ? ` — ${r.application.fullName} (${r.application.applicationNumber})` : ""}${r.note ? ` — ${r.note}` : ""}`,
        targetType: "AdmissionApplication",
        targetId: r.applicationId,
        createdAt: r.createdAt,
      })),
      ...gradeRows.map((r) => ({
        id: `grade-${r.id}`,
        source: "GradeCorrection",
        category: "GRADE_CORRECTION",
        actorName: r.correctedByName,
        actorRole: null,
        department: null,
        module: "COURSES_GRADES",
        action: "GRADE_CORRECTED",
        summary: `${r.fieldChanged}: ${r.originalValue ?? "—"} → ${r.correctedValue ?? "—"} — ${r.reason}`,
        targetType: "Grade",
        targetId: r.gradeId,
        createdAt: r.correctedAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: merged.slice(0, limit) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });

    console.error("GET admin audit log error:", error);
    return NextResponse.json({ success: false, error: "Failed to load audit log." }, { status: 500 });
  }
}
