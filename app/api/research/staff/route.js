import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Active staff lookup -- used by the Research dashboard's own pickers
// (Principal Investigator, reviewer assignment, supervisor/
// co-supervisor). Deliberately not scoped to any one position: any
// active staff member can be named a PI/reviewer/supervisor, matching
// how QA's own subject pickers work.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const staff = await prisma.staffProfile.findMany({
      where: { isActive: true },
      select: { id: true, user: { select: { name: true } }, position: { select: { nameEn: true } } },
      orderBy: { user: { name: "asc" } },
    });

    return json({
      success: true,
      data: staff.map((s) => ({ id: s.id, name: s.user.name, position: s.position?.nameEn || "" })),
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research staff lookup error:", error);
    return json({ success: false, error: "Failed to load staff." }, 500);
  }
}
