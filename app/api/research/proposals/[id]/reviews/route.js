import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Reviewer assignment -- a genuinely different actor from the
// proposal's submitter (the assigned reviewer), so this is its own
// gated endpoint per the task's own guidance. Both the assigning
// Research staff member and the reviewer being assigned are
// RESEARCH_OPS holders; there is no separate "reviewer" role/module,
// mirroring how QA reviewers are just QA staff assigned to a review.
export async function POST(request, { params }) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const actorStaff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    const { id: proposalId } = await params;

    const proposal = await prisma.researchProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) return json({ success: false, error: "Proposal not found." }, 404);

    const body = await request.json();
    const reviewerId = typeof body.reviewerId === "string" ? body.reviewerId : "";
    if (!reviewerId) return json({ success: false, error: "A reviewer is required." }, 400);

    const reviewer = await prisma.staffProfile.findUnique({ where: { id: reviewerId } });
    if (!reviewer) return json({ success: false, error: "The selected reviewer was not found." }, 400);

    const [review] = await prisma.$transaction([
      prisma.researchProposalReview.create({
        data: { proposalId, reviewerId },
        include: { reviewer: { include: { user: { select: { name: true } } } } },
      }),
      prisma.researchProposal.update({
        where: { id: proposalId },
        data: { status: proposal.status === "SUBMITTED" ? "UNDER_REVIEW" : proposal.status },
      }),
      prisma.researchProposalDecision.create({
        data: {
          proposalId,
          type: "REVIEWER_ASSIGNED",
          actorId: actorStaff?.id || null,
          note: `Reviewer assigned: ${reviewer.id}`,
        },
      }),
    ]);

    return json({
      success: true,
      data: {
        id: review.id,
        reviewerId: review.reviewerId,
        reviewerName: review.reviewer?.user?.name || "Unknown",
        decision: review.decision,
        assignedAt: review.assignedAt,
      },
    }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research proposal reviewer error:", error);
    return json({ success: false, error: "Failed to assign the reviewer." }, 500);
  }
}

// A reviewer records their own comments and decision recommendation
// (PENDING/APPROVE/REQUEST_REVISION/REJECT) here -- this does not by
// itself change the proposal's own status; the final call is made
// through .../decision below by whoever holds edit access, who can
// see every reviewer's input first.
export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: proposalId } = await params;

    const body = await request.json();
    const reviewId = typeof body.reviewId === "string" ? body.reviewId : "";
    if (!reviewId) return json({ success: false, error: "A review id is required." }, 400);

    const existing = await prisma.researchProposalReview.findUnique({ where: { id: reviewId } });
    if (!existing || existing.proposalId !== proposalId) {
      return json({ success: false, error: "Review not found." }, 404);
    }

    const VALID_DECISIONS = ["PENDING", "APPROVE", "REQUEST_REVISION", "REJECT"];
    const data = {};
    if (typeof body.comments === "string") data.comments = body.comments.trim() || null;
    if (typeof body.revisionNote === "string") data.revisionNote = body.revisionNote.trim() || null;
    if (VALID_DECISIONS.includes(body.decision)) {
      data.decision = body.decision;
      data.decidedAt = body.decision === "PENDING" ? null : new Date();
    }

    const review = await prisma.researchProposalReview.update({ where: { id: reviewId }, data });

    return json({ success: true, data: review });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research proposal review error:", error);
    return json({ success: false, error: "Failed to update the review." }, 500);
  }
}
