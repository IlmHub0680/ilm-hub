import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Research Milestone -- progress tracking / project completion.
export async function POST(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: projectId } = await params;

    const project = await prisma.researchProject.findUnique({ where: { id: projectId } });
    if (!project) return json({ success: false, error: "Research project not found." }, 404);

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    if (!title) return json({ success: false, error: "A title is required." }, 400);

    const milestone = await prisma.researchMilestone.create({
      data: { projectId, title, description, dueDate },
    });

    return json({ success: true, data: milestone }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research milestone error:", error);
    return json({ success: false, error: "Failed to create the milestone." }, 500);
  }
}

// PATCH: toggle completion (or edit title/description/dueDate) for a
// single milestone, identified by ?milestoneId= -- kept on this same
// collection route rather than a third nested [milestoneId] segment,
// matching how QA duplication flags keep their own resolve action
// simple.
export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: projectId } = await params;

    const body = await request.json();
    const milestoneId = typeof body.milestoneId === "string" ? body.milestoneId : "";
    if (!milestoneId) return json({ success: false, error: "A milestone id is required." }, 400);

    const existing = await prisma.researchMilestone.findUnique({ where: { id: milestoneId } });
    if (!existing || existing.projectId !== projectId) {
      return json({ success: false, error: "Milestone not found." }, 404);
    }

    const data = {};
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body.description === "string") data.description = body.description.trim() || null;
    if (Object.prototype.hasOwnProperty.call(body, "dueDate")) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (typeof body.isCompleted === "boolean") {
      data.isCompleted = body.isCompleted;
      data.completedAt = body.isCompleted ? new Date() : null;
    }

    const milestone = await prisma.researchMilestone.update({ where: { id: milestoneId }, data });

    return json({ success: true, data: milestone });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research milestone error:", error);
    return json({ success: false, error: "Failed to update the milestone." }, 500);
  }
}
