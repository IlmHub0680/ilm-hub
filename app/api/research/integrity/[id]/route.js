import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["REPORTED", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"];

// Investigate/resolve a research integrity case. Strict permissions:
// edit access to RESEARCH_OPS only (see the collection route's own
// comment for the full reasoning).
export async function PATCH(request, { params }) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    const { id } = await params;

    const existing = await prisma.researchIntegrityCase.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Integrity case not found." }, 404);

    const body = await request.json();
    const data = {};

    if (typeof body.investigationNotes === "string") data.investigationNotes = body.investigationNotes.trim() || null;
    if (typeof body.outcome === "string") data.outcome = body.outcome.trim() || null;
    if (typeof body.isConfidential === "boolean") data.isConfidential = body.isConfidential;

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!VALID_STATUSES.includes(body.status)) {
        return json({ success: false, error: "A valid status is required." }, 400);
      }
      data.status = body.status;
      if (body.status === "RESOLVED" || body.status === "DISMISSED") {
        data.resolvedById = staff?.id || null;
        data.resolvedAt = new Date();
      }
    }

    const updated = await prisma.researchIntegrityCase.update({ where: { id }, data });

    return json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research integrity case error:", error);
    return json({ success: false, error: "Failed to update the integrity case." }, 500);
  }
}
