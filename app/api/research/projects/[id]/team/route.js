import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_ROLES = ["PRINCIPAL_INVESTIGATOR", "CO_INVESTIGATOR", "RESEARCHER", "RESEARCH_ASSISTANT", "EXTERNAL_COLLABORATOR"];

// Research Collaboration -- internal researchers (StaffProfile) and
// external collaborators (plain name/affiliation/email, since they
// aren't platform users), added to a project's team.
export async function POST(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: projectId } = await params;

    const project = await prisma.researchProject.findUnique({ where: { id: projectId } });
    if (!project) return json({ success: false, error: "Research project not found." }, 404);

    const body = await request.json();
    const role = VALID_ROLES.includes(body.role) ? body.role : "RESEARCHER";
    const staffId = typeof body.staffId === "string" && body.staffId ? body.staffId : null;
    const externalName = typeof body.externalName === "string" ? body.externalName.trim() || null : null;

    if (!staffId && !externalName) {
      return json({ success: false, error: "Either an internal staff member or an external collaborator name is required." }, 400);
    }

    if (staffId) {
      const staff = await prisma.staffProfile.findUnique({ where: { id: staffId } });
      if (!staff) return json({ success: false, error: "The selected staff member was not found." }, 400);
    }

    const member = await prisma.researchTeamMember.create({
      data: {
        projectId,
        staffId,
        externalName: staffId ? null : externalName,
        externalAffiliation: staffId ? null : (typeof body.externalAffiliation === "string" ? body.externalAffiliation.trim() || null : null),
        externalEmail: staffId ? null : (typeof body.externalEmail === "string" ? body.externalEmail.trim() || null : null),
        role,
      },
      include: { staff: { include: { user: { select: { name: true } } } } },
    });

    return json({
      success: true,
      data: {
        id: member.id,
        staffId: member.staffId,
        staffName: member.staff?.user?.name || null,
        externalName: member.externalName,
        externalAffiliation: member.externalAffiliation,
        externalEmail: member.externalEmail,
        role: member.role,
      },
    }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research team member error:", error);
    return json({ success: false, error: "Failed to add the team member." }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: projectId } = await params;

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return json({ success: false, error: "A team member id is required." }, 400);

    const existing = await prisma.researchTeamMember.findUnique({ where: { id: memberId } });
    if (!existing || existing.projectId !== projectId) {
      return json({ success: false, error: "Team member not found." }, 404);
    }

    await prisma.researchTeamMember.delete({ where: { id: memberId } });

    return json({ success: true });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("DELETE research team member error:", error);
    return json({ success: false, error: "Failed to remove the team member." }, 500);
  }
}
