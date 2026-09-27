import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(p) {
  return {
    id: p.id,
    title: p.title,
    summary: p.summary,
    areaId: p.areaId,
    areaName: p.area?.nameEn || null,
    submittedById: p.submittedById,
    submittedByName: p.submittedBy?.user?.name || "Unknown",
    projectId: p.projectId,
    status: p.status,
    submittedAt: p.submittedAt,
    decidedAt: p.decidedAt,
    reviews: (p.reviews || []).map((r) => ({
      id: r.id,
      reviewerId: r.reviewerId,
      reviewerName: r.reviewer?.user?.name || "Unknown",
      assignedAt: r.assignedAt,
      comments: r.comments,
      revisionNote: r.revisionNote,
      decision: r.decision,
      decidedAt: r.decidedAt,
    })),
    decisions: (p.decisions || []).map((d) => ({
      id: d.id,
      type: d.type,
      actorId: d.actorId,
      actorName: d.actor?.user?.name || "System",
      note: d.note,
      createdAt: d.createdAt,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Full proposal detail: reviewer comments and the append-only decision
// history/audit trail, both ordered oldest-first so the record reads
// as a timeline.
export async function GET(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");
    const { id } = await params;

    const proposal = await prisma.researchProposal.findUnique({
      where: { id },
      include: {
        area: { select: { nameEn: true } },
        submittedBy: { include: { user: { select: { name: true } } } },
        reviews: {
          include: { reviewer: { include: { user: { select: { name: true } } } } },
          orderBy: { assignedAt: "asc" },
        },
        decisions: {
          include: { actor: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!proposal) return json({ success: false, error: "Proposal not found." }, 404);

    return json({ success: true, data: serialize(proposal) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research proposal error:", error);
    return json({ success: false, error: "Failed to load the proposal." }, 500);
  }
}
