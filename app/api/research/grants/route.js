import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["APPLIED", "AWARDED", "DECLINED", "ACTIVE", "CLOSED"];

function serialize(g) {
  return {
    id: g.id,
    projectId: g.projectId,
    projectTitle: g.project?.title || null,
    fundingSource: g.fundingSource,
    amountRequested: g.amountRequested,
    amountAwarded: g.amountAwarded,
    currency: g.currency,
    status: g.status,
    appliedAt: g.appliedAt,
    decidedAt: g.decidedAt,
    closedAt: g.closedAt,
    reportCount: g._count?.reports ?? undefined,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

// Research Funding -- "if applicable". Grant applications/awards/
// status/reporting as RECORDS only. Finance remains responsible for
// actual financial transactions -- no money-movement logic anywhere
// in this route; amountRequested/amountAwarded are plain record
// fields, never posted to any ledger or payment mechanism.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const grants = await prisma.researchGrant.findMany({
      include: {
        project: { select: { title: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, data: grants.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research grants error:", error);
    return json({ success: false, error: "Failed to load grants." }, 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");

    const body = await request.json();
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const fundingSource = typeof body.fundingSource === "string" ? body.fundingSource.trim() : "";
    const amountRequested = typeof body.amountRequested === "number" ? body.amountRequested : null;
    const currency = typeof body.currency === "string" && body.currency.trim() ? body.currency.trim().toUpperCase() : "USD";

    if (!projectId) return json({ success: false, error: "A project is required." }, 400);
    if (!fundingSource) return json({ success: false, error: "A funding source is required." }, 400);

    const project = await prisma.researchProject.findUnique({ where: { id: projectId } });
    if (!project) return json({ success: false, error: "The selected project was not found." }, 400);

    const grant = await prisma.researchGrant.create({
      data: { projectId, fundingSource, amountRequested, currency },
      include: { project: { select: { title: true } } },
    });

    return json({ success: true, data: serialize(grant) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research grant error:", error);
    return json({ success: false, error: "Failed to create the grant record." }, 500);
  }
}
