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
    milestones: (project.milestones || []).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      dueDate: m.dueDate,
      isCompleted: m.isCompleted,
      completedAt: m.completedAt,
    })),
    teamMembers: (project.teamMembers || []).map((t) => ({
      id: t.id,
      staffId: t.staffId,
      staffName: t.staff?.user?.name || null,
      externalName: t.externalName,
      externalAffiliation: t.externalAffiliation,
      externalEmail: t.externalEmail,
      role: t.role,
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function GET(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");
    const { id } = await params;

    const project = await prisma.researchProject.findUnique({
      where: { id },
      include: {
        area: { select: { nameEn: true } },
        principalInvestigator: { include: { user: { select: { name: true } } } },
        milestones: { orderBy: { dueDate: "asc" } },
        teamMembers: { include: { staff: { include: { user: { select: { name: true } } } } } },
      },
    });

    if (!project) return json({ success: false, error: "Research project not found." }, 404);

    return json({ success: true, data: serialize(project) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research project error:", error);
    return json({ success: false, error: "Failed to load the research project." }, 500);
  }
}

const EDITABLE_FIELDS = ["title", "description", "progressNotes"];

export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id } = await params;

    const existing = await prisma.researchProject.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Research project not found." }, 404);

    const body = await request.json();
    const data = {};

    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const raw = body[field];
        const value = typeof raw === "string" ? raw.trim() || null : null;
        if ((field === "title" || field === "description") && !value) {
          return json({ success: false, error: `${field} cannot be empty.` }, 400);
        }
        data[field] = value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!VALID_STATUSES.includes(body.status)) {
        return json({ success: false, error: "A valid status is required." }, 400);
      }
      data.status = body.status;
    }

    if (Object.prototype.hasOwnProperty.call(body, "areaId")) {
      data.areaId = typeof body.areaId === "string" && body.areaId ? body.areaId : null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "startDate")) {
      data.startDate = body.startDate ? new Date(body.startDate) : null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "endDate")) {
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "principalInvestigatorId") && typeof body.principalInvestigatorId === "string" && body.principalInvestigatorId) {
      const pi = await prisma.staffProfile.findUnique({ where: { id: body.principalInvestigatorId } });
      if (!pi) return json({ success: false, error: "The selected Principal Investigator was not found." }, 400);
      data.principalInvestigatorId = body.principalInvestigatorId;
    }

    const project = await prisma.researchProject.update({
      where: { id },
      data,
      include: {
        area: { select: { nameEn: true } },
        principalInvestigator: { include: { user: { select: { name: true } } } },
        milestones: { orderBy: { dueDate: "asc" } },
        teamMembers: { include: { staff: { include: { user: { select: { name: true } } } } } },
      },
    });

    return json({ success: true, data: serialize(project) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research project error:", error);
    return json({ success: false, error: "Failed to update the research project." }, 500);
  }
}
