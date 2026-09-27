import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["DRAFT", "SUBMITTED", "ACCEPTED", "PUBLISHED", "RETRACTED"];
const EDITABLE_FIELDS = ["title", "venue", "publisher", "doiOrLink", "abstract"];

// Update a publication, including its status transitions. Publishing
// it (its public-visibility transition, isPublic true) and retracting
// it are logged to the shared AuditLog, per this initiative's audit
// requirement ("Publishing actions").
export async function PATCH(request, { params }) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const { id } = await params;

    const existing = await prisma.researchPublication.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Publication not found." }, 404);

    const body = await request.json();
    const data = {};

    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const raw = body[field];
        data[field] = typeof raw === "string" ? raw.trim() || null : null;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "title") && typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, "year")) {
      data.year = Number.isInteger(body.year) ? body.year : null;
    }

    let publishTransition = null;
    if (Object.prototype.hasOwnProperty.call(body, "status") && VALID_STATUSES.includes(body.status)) {
      data.status = body.status;
      const wasPublic = existing.isPublic;
      const willBePublic = body.status === "PUBLISHED";
      data.isPublic = willBePublic;
      data.publishedAt = willBePublic ? (existing.publishedAt || new Date()) : existing.publishedAt;
      if (willBePublic !== wasPublic) {
        publishTransition = willBePublic ? "PUBLISHED" : "UNPUBLISHED";
      }
      if (body.status === "RETRACTED") {
        data.isPublic = false;
        publishTransition = "RETRACTED";
      }
    }

    const publication = await prisma.researchPublication.update({ where: { id }, data });

    if (publishTransition) {
      await logAudit({
        actor: user,
        action: `RESEARCH_PUBLICATION_${publishTransition}`,
        category: "OTHER",
        module: "RESEARCH_OPS",
        targetType: "ResearchPublication",
        targetId: id,
        summary: `Research publication "${publication.title}" ${publishTransition.toLowerCase()}.`,
      });
    }

    return json({ success: true, data: publication });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research publication error:", error);
    return json({ success: false, error: "Failed to update the publication." }, 500);
  }
}
