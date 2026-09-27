import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Research Collaboration -- external institutional partners, and
// their link to collaborative projects. Kept intentionally simple, a
// lookup plus a per-project link, rather than a full partner CRM.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const partners = await prisma.researchCollaborationPartner.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { name: "asc" },
    });

    return json({
      success: true,
      data: partners.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        country: p.country,
        contactName: p.contactName,
        contactEmail: p.contactEmail,
        notes: p.notes,
        projectCount: p._count.projects,
      })),
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research partners error:", error);
    return json({ success: false, error: "Failed to load collaboration partners." }, 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() || null : null;
    const country = typeof body.country === "string" ? body.country.trim() || null : null;
    const contactName = typeof body.contactName === "string" ? body.contactName.trim() || null : null;
    const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() || null : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;

    if (!name) return json({ success: false, error: "A partner name is required." }, 400);

    const partner = await prisma.researchCollaborationPartner.create({
      data: {
        name,
        type,
        country,
        contactName,
        contactEmail,
        notes,
        ...(projectId ? { projects: { create: [{ projectId, role: typeof body.role === "string" ? body.role.trim() || null : null }] } } : {}),
      },
    });

    return json({ success: true, data: partner }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research partner error:", error);
    return json({ success: false, error: "Failed to create the partner." }, 500);
  }
}
