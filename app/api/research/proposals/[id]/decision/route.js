import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const ACTION_TO_STATUS = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  REQUEST_REVISION: "REVISION_REQUESTED",
  WITHDRAW: "WITHDRAWN",
};

const ACTION_TO_DECISION_TYPE = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  REQUEST_REVISION: "REVISION_REQUESTED",
  WITHDRAW: "WITHDRAWN",
};

// Final proposal decision -- approval / rejection / revision request /
// withdrawal. Every call appends a ResearchProposalDecision row (the
// append-only audit trail) and, per this initiative's audit
// requirement ("Research decisions"), writes to the shared AuditLog
// too. Approving a proposal creates the real ResearchProject it
// becomes, linked back via ResearchProposal.projectId.
export async function PATCH(request, { params }) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const actorStaff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    const { id: proposalId } = await params;

    const proposal = await prisma.researchProposal.findUnique({
      where: { id: proposalId },
      include: { submittedBy: { include: { user: { select: { name: true } } } } },
    });
    if (!proposal) return json({ success: false, error: "Proposal not found." }, 404);

    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const note = typeof body.note === "string" ? body.note.trim() || null : null;

    if (!Object.prototype.hasOwnProperty.call(ACTION_TO_STATUS, action)) {
      return json({ success: false, error: "A valid decision action is required." }, 400);
    }

    if (action === "REQUEST_REVISION" && !note) {
      return json({ success: false, error: "A revision note is required when requesting revisions." }, 400);
    }

    const newStatus = ACTION_TO_STATUS[action];
    let createdProjectId = null;

    const result = await prisma.$transaction(async (tx) => {
      if (action === "APPROVE" && !proposal.projectId) {
        const project = await tx.researchProject.create({
          data: {
            title: proposal.title,
            description: proposal.summary,
            areaId: proposal.areaId,
            principalInvestigatorId: proposal.submittedById,
            status: "APPROVED",
          },
        });
        createdProjectId = project.id;
      }

      const updated = await tx.researchProposal.update({
        where: { id: proposalId },
        data: {
          status: newStatus,
          decidedAt: new Date(),
          ...(createdProjectId ? { projectId: createdProjectId } : {}),
        },
      });

      await tx.researchProposalDecision.create({
        data: {
          proposalId,
          type: ACTION_TO_DECISION_TYPE[action],
          actorId: actorStaff?.id || null,
          note,
        },
      });

      return updated;
    });

    await logAudit({
      actor: user,
      action: `RESEARCH_PROPOSAL_${ACTION_TO_DECISION_TYPE[action]}`,
      category: "OTHER",
      module: "RESEARCH_OPS",
      targetType: "ResearchProposal",
      targetId: proposalId,
      summary: `Research proposal "${proposal.title}" (submitted by ${proposal.submittedBy?.user?.name || "Unknown"}) ${ACTION_TO_DECISION_TYPE[action].toLowerCase().replace(/_/g, " ")}.${note ? ` Note: ${note}` : ""}`,
    });

    return json({ success: true, data: { id: result.id, status: result.status, projectId: result.projectId } });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("PATCH research proposal decision error:", error);
    return json({ success: false, error: "Failed to record the decision." }, 500);
  }
}
