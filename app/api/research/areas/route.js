import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Research Area lookup -- used to categorize projects/proposals.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const areas = await prisma.researchArea.findMany({
      orderBy: { nameEn: "asc" },
    });

    return json({ success: true, data: areas });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research areas error:", error);
    return json({ success: false, error: "Failed to load research areas." }, 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");

    const body = await request.json();
    const nameEn = typeof body.nameEn === "string" ? body.nameEn.trim() : "";
    const nameAr = typeof body.nameAr === "string" ? body.nameAr.trim() || null : null;
    const description = typeof body.description === "string" ? body.description.trim() || null : null;

    if (!nameEn) {
      return json({ success: false, error: "A name is required." }, 400);
    }

    const area = await prisma.researchArea.create({
      data: { nameEn, nameAr, description },
    });

    return json({ success: true, data: area }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    if (error?.code === "P2002") return json({ success: false, error: "A research area with that name already exists." }, 409);
    console.error("POST research area error:", error);
    return json({ success: false, error: "Failed to create the research area." }, 500);
  }
}
