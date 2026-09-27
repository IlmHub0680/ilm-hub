import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED", "DISCONTINUED"];

export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id } = await params;

    const existing = await prisma.researchSupervision.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Supervision record not found." }, 404);

    const body = await request.json();
    const data = {};

    if (typeof body.progressNotes === "string") data.progressNotes = body.progressNotes.trim() || null;
    if (typeof body.topic === "string" && body.topic.trim()) data.topic = body.topic.trim();

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!VALID_STATUSES.includes(body.status)) {
        return json({ success: false, error: "A valid status is required." }, 400);
      }
      data.status = body.status;
      data.completedAt = body.status === "COMPLETED" ? new Date() : existing.completedAt;
    }

    const supervision = await prisma.researchSupervision.update({ where: { id }, data });

    return json({ success: true, data: supervision });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research supervision error:", error);
    return json({ success: false, error: "Failed to update the supervision record." }, 500);
  }
}
