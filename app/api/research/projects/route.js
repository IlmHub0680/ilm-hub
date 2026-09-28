import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["PROPOSED", "UNDER_REVIEW", "APPROVED", "ACTIVE", "COMPLETED", "REJECTED", "SUSPENDED"];

function serialize(project) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    areaId: project.areaId,
    areaName: project.area?.nameEn || null,
    principalInvestigatorId: project.principalInvestigatorId,
    principalInvestigatorName: project.principalInvestigator?.user?.name || "Unknown",
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    progressNotes: project.progressNotes,
    milestoneCount: project._count?.milestones ?? undefined,
    teamCount: project._count?.teamMembers ?? undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

// Research Management -- projects, PIs, status, progress. The real
// operational surface for Research & Scholarly Affairs (an
// Institute Delegated Operation), gated by RESEARCH_OPS.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const projects = await prisma.researchProject.findMany({
      include: {
        area: { select: { nameEn: true } },
        principalInvestigator: { include: { user: { select: { name: true } } } },
        _count: { select: { milestones: true, teamMembers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, data: projects.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research projects error:", error);
    return json({ success: false, error: "Failed to load research projects." }, 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const principalInvestigatorId = typeof body.principalInvestigatorId === "string" ? body.principalInvestigatorId : "";
    const areaId = typeof body.areaId === "string" && body.areaId ? body.areaId : null;
    const status = VALID_STATUSES.includes(body.status) ? body.status : "PROPOSED";
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;
    const progressNotes = typeof body.progressNotes === "string" ? body.progressNotes.trim() || null : null;

    if (!title) return json({ success: false, error: "A title is required." }, 400);
    if (!description) return json({ success: false, error: "A description is required." }, 400);
    if (!principalInvestigatorId) return json({ success: false, error: "A Principal Investigator is required." }, 400);

    const pi = await prisma.staffProfile.findUnique({ where: { id: principalInvestigatorId } });
    if (!pi) return json({ success: false, error: "The selected Principal Investigator was not found." }, 400);

    const project = await prisma.researchProject.create({
      data: {
        title,
        description,
        areaId,
        principalInvestigatorId,
        status,
        startDate,
        endDate,
        progressNotes,
      },
      include: {
        area: { select: { nameEn: true } },
        principalInvestigator: { include: { user: { select: { name: true } } } },
      },
    });

    return json({ success: true, data: serialize(project) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research project error:", error);
    return json({ success: false, error: "Failed to create the research project." }, 500);
  }
}
