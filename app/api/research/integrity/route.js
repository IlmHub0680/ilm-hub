import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_CONCERN_TYPES = ["PLAGIARISM", "DATA_FABRICATION", "AUTHORSHIP_DISPUTE", "ETHICS_VIOLATION", "CONFLICT_OF_INTEREST", "OTHER"];

function serialize(c) {
  return {
    id: c.id,
    projectId: c.projectId,
    projectTitle: c.project?.title || null,
    publicationId: c.publicationId,
    publicationTitle: c.publication?.title || null,
    concernType: c.concernType,
    description: c.description,
    reportedById: c.reportedById,
    reportedByName: c.reportedBy?.user?.name || "Unknown",
    status: c.status,
    investigationNotes: c.investigationNotes,
    outcome: c.outcome,
    isConfidential: c.isConfidential,
    resolvedById: c.resolvedById,
    resolvedByName: c.resolvedBy?.user?.name || null,
    resolvedAt: c.resolvedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// Research Integrity -- "where applicable". Deliberately its own
// model (ResearchIntegrityCase), entirely separate from IntegrityCase
// (student academic integrity in a course context): this tracks
// misconduct by a RESEARCHER in a RESEARCH PROJECT/PUBLICATION context
// (authorship disputes, data fabrication, ethics violations).
//
// "Apply strict permissions" (spec): edit access to RESEARCH_OPS is
// already the narrowest real permission this codebase has for the
// department (one dedicated position holds it), so it is reused as
// the gate here rather than inventing a second, parallel module --
// but every route in this file requires the EDIT permission even for
// reading (never the weaker "view"), so a Research staff member who
// only has view-only access into the department (there is currently
// no such position, but the schema allows one) cannot see these
// confidential records either. Admin/SUPER_ADMIN reach this data only
// through the read-only oversight page at app/admin/research, which
// deliberately never surfaces isConfidential=true case details in the
// list the way this operational route does -- see that page's own
// comment.
async function requireResearchIntegrityAccess() {
  return requireModulePermission("RESEARCH_OPS", "edit");
}

export async function GET() {
  try {
    await requireResearchIntegrityAccess();

    const cases = await prisma.researchIntegrityCase.findMany({
      include: {
        project: { select: { title: true } },
        publication: { select: { title: true } },
        reportedBy: { include: { user: { select: { name: true } } } },
        resolvedBy: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return json({ success: true, data: cases.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("GET research integrity cases error:", error);
    return json({ success: false, error: "Failed to load integrity cases." }, 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireResearchIntegrityAccess();
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return json({ success: false, error: "No staff profile found for this account." }, 403);

    const body = await request.json();
    const concernType = VALID_CONCERN_TYPES.includes(body.concernType) ? body.concernType : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    const publicationId = typeof body.publicationId === "string" && body.publicationId ? body.publicationId : null;
    const isConfidential = typeof body.isConfidential === "boolean" ? body.isConfidential : true;

    if (!concernType) return json({ success: false, error: "A valid concern type is required." }, 400);
    if (!description) return json({ success: false, error: "A description is required." }, 400);

    const integrityCase = await prisma.researchIntegrityCase.create({
      data: {
        concernType,
        description,
        projectId,
        publicationId,
        isConfidential,
        reportedById: staff.id,
      },
      include: {
        project: { select: { title: true } },
        publication: { select: { title: true } },
        reportedBy: { include: { user: { select: { name: true } } } },
      },
    });

    return json({ success: true, data: serialize(integrityCase) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research integrity case error:", error);
    return json({ success: false, error: "Failed to log the integrity concern." }, 500);
  }
}
