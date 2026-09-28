import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Grant reporting -- periodic reporting notes required by a funding
// source, kept separate from the grant's own status.
export async function POST(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: grantId } = await params;

    const grant = await prisma.researchGrant.findUnique({ where: { id: grantId } });
    if (!grant) return json({ success: false, error: "Grant record not found." }, 404);

    const body = await request.json();
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const reportDate = body.reportDate ? new Date(body.reportDate) : new Date();

    if (!notes) return json({ success: false, error: "Report notes are required." }, 400);

    const report = await prisma.researchGrantReport.create({
      data: { grantId, notes, reportDate },
    });

    return json({ success: true, data: report }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research grant report error:", error);
    return json({ success: false, error: "Failed to log the grant report." }, 500);
  }
}

export async function GET(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");
    const { id: grantId } = await params;

    const reports = await prisma.researchGrantReport.findMany({
      where: { grantId },
      orderBy: { reportDate: "desc" },
    });

    return json({ success: true, data: reports });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research grant reports error:", error);
    return json({ success: false, error: "Failed to load grant reports." }, 500);
  }
}
