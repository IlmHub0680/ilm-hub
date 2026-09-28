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
    reviewCount: p._count?.reviews ?? undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Proposal Workflow -- submission, reviewer assignment, review,
// revision requests, approval, rejection, with a full decision
// history/audit trail (ResearchProposalDecision, appended below).
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const proposals = await prisma.researchProposal.findMany({
      include: {
        area: { select: { nameEn: true } },
        submittedBy: { include: { user: { select: { name: true } } } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    });

    return json({ success: true, data: proposals.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research proposals error:", error);
    return json({ success: false, error: "Failed to load research proposals." }, 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return json({ success: false, error: "No staff profile found for this account." }, 403);

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";
    const areaId = typeof body.areaId === "string" && body.areaId ? body.areaId : null;
    // The submitter is normally whoever is signed in, but Research
    // staff may log a proposal on behalf of another researcher.
    const submittedById = typeof body.submittedById === "string" && body.submittedById ? body.submittedById : staff.id;

    if (!title) return json({ success: false, error: "A title is required." }, 400);
    if (!summary) return json({ success: false, error: "A summary is required." }, 400);

    const proposal = await prisma.researchProposal.create({
      data: {
        title,
        summary,
        areaId,
        submittedById,
        status: "SUBMITTED",
      },
      include: {
        area: { select: { nameEn: true } },
        submittedBy: { include: { user: { select: { name: true } } } },
      },
    });

    await prisma.researchProposalDecision.create({
      data: {
        proposalId: proposal.id,
        type: "SUBMITTED",
        actorId: staff.id,
        note: "Proposal submitted.",
      },
    });

    return json({ success: true, data: serialize(proposal) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research proposal error:", error);
    return json({ success: false, error: "Failed to submit the proposal." }, 500);
  }
}
