import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Active student lookup -- used by Research Supervision's own
// student picker. Research Supervision only applies to students
// actually enrolled on a research-based programme (see
// ResearchSupervision's schema comment); since none is currently
// seeded this simply returns every active student, and stays a thin
// lookup rather than filtering by a programme level nothing uses yet.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const students = await prisma.studentProfile.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, studentNo: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
      take: 500,
    });

    return json({
      success: true,
      data: students.map((s) => ({ id: s.id, name: s.user.name, studentNo: s.studentNo })),
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research students lookup error:", error);
    return json({ success: false, error: "Failed to load students." }, 500);
  }
}
