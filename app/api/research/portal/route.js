import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Research & Scholarly Affairs dashboard overview -- a delegated
// operation (RESEARCH_OPS module), mirroring the qa/portal route's
// shape: a handful of counts the ClientShell/context loads once.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const [
      projectCount,
      activeProjectCount,
      proposalCount,
      pendingProposalCount,
      publicationCount,
      publishedPublicationCount,
      grantCount,
      activeGrantCount,
      supervisionCount,
      openIntegrityCaseCount,
      areas,
    ] = await Promise.all([
      prisma.researchProject.count(),
      prisma.researchProject.count({ where: { status: "ACTIVE" } }),
      prisma.researchProposal.count(),
      prisma.researchProposal.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"] } } }),
      prisma.researchPublication.count(),
      prisma.researchPublication.count({ where: { status: "PUBLISHED" } }),
      prisma.researchGrant.count(),
      prisma.researchGrant.count({ where: { status: { in: ["AWARDED", "ACTIVE"] } } }),
      prisma.researchSupervision.count(),
      prisma.researchIntegrityCase.count({ where: { status: { in: ["REPORTED", "UNDER_INVESTIGATION"] } } }),
      prisma.researchArea.findMany({
        where: { isActive: true },
        select: { id: true, nameEn: true, nameAr: true },
        orderBy: { nameEn: "asc" },
      }),
    ]);

    return json({
      success: true,
      projectCount,
      activeProjectCount,
      proposalCount,
      pendingProposalCount,
      publicationCount,
      publishedPublicationCount,
      grantCount,
      activeGrantCount,
      supervisionCount,
      openIntegrityCaseCount,
      areas,
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research portal error:", error);
    return json({ success: false, error: "Failed to load the Research overview." }, 500);
  }
}
