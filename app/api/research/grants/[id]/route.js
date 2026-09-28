import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["APPLIED", "AWARDED", "DECLINED", "ACTIVE", "CLOSED"];

// Update a grant record's status (AWARDED/DECLINED/ACTIVE/CLOSED) and
// the awarded amount -- still records only, never an actual
// disbursement; that happens through Finance's own existing
// mechanism, outside this route entirely.
export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id } = await params;

    const existing = await prisma.researchGrant.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Grant record not found." }, 404);

    const body = await request.json();
    const data = {};

    if (typeof body.fundingSource === "string" && body.fundingSource.trim()) {
      data.fundingSource = body.fundingSource.trim();
    }
    if (typeof body.amountAwarded === "number") data.amountAwarded = body.amountAwarded;

    if (Object.prototype.hasOwnProperty.call(body, "status")) {
      if (!VALID_STATUSES.includes(body.status)) {
        return json({ success: false, error: "A valid status is required." }, 400);
      }
      data.status = body.status;
      if (body.status === "AWARDED" || body.status === "DECLINED") data.decidedAt = new Date();
      if (body.status === "CLOSED") data.closedAt = new Date();
    }

    const grant = await prisma.researchGrant.update({ where: { id }, data });

    return json({ success: true, data: grant });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research grant error:", error);
    return json({ success: false, error: "Failed to update the grant record." }, 500);
  }
}
