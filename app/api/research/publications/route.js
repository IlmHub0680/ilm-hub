import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_TYPES = ["JOURNAL_ARTICLE", "BOOK", "BOOK_CHAPTER", "CONFERENCE_PAPER", "RESEARCH_REPORT", "WORKING_PAPER", "OTHER"];

function serialize(p) {
  return {
    id: p.id,
    projectId: p.projectId,
    projectTitle: p.project?.title || null,
    type: p.type,
    status: p.status,
    title: p.title,
    venue: p.venue,
    publisher: p.publisher,
    year: p.year,
    doiOrLink: p.doiOrLink,
    abstract: p.abstract,
    isPublic: p.isPublic,
    publishedAt: p.publishedAt,
    authors: (p.authors || []).map((a) => ({
      id: a.id,
      staffId: a.staffId,
      staffName: a.staff?.user?.name || null,
      externalName: a.externalName,
      order: a.order,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Scholarly Publications -- journal articles, books, book chapters,
// conference papers, research reports, working papers, other
// scholarly outputs. Its own model, entirely separate from the
// personal ManuscriptSubmission/Book publishing pipeline (zero
// coupling by design -- no import from, or reference to, those
// models anywhere in this route).
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const publications = await prisma.researchPublication.findMany({
      include: {
        project: { select: { title: true } },
        authors: { include: { staff: { include: { user: { select: { name: true } } } } }, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, data: publications.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research publications error:", error);
    return json({ success: false, error: "Failed to load publications." }, 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireModulePermission("RESEARCH_OPS", "edit");
    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
    if (!staff) return json({ success: false, error: "No staff profile found for this account." }, 403);

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const type = VALID_TYPES.includes(body.type) ? body.type : "";
    const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
    const venue = typeof body.venue === "string" ? body.venue.trim() || null : null;
    const publisher = typeof body.publisher === "string" ? body.publisher.trim() || null : null;
    const year = Number.isInteger(body.year) ? body.year : null;
    const doiOrLink = typeof body.doiOrLink === "string" ? body.doiOrLink.trim() || null : null;
    const abstract = typeof body.abstract === "string" ? body.abstract.trim() || null : null;
    const authors = Array.isArray(body.authors) ? body.authors : [];

    if (!title) return json({ success: false, error: "A title is required." }, 400);
    if (!type) return json({ success: false, error: "A valid publication type is required." }, 400);

    const publication = await prisma.researchPublication.create({
      data: {
        title,
        type,
        projectId,
        venue,
        publisher,
        year,
        doiOrLink,
        abstract,
        createdById: staff.id,
        authors: {
          create: authors.map((a, index) => ({
            staffId: typeof a.staffId === "string" && a.staffId ? a.staffId : null,
            externalName: typeof a.externalName === "string" ? a.externalName.trim() || null : null,
            order: index,
          })),
        },
      },
      include: {
        project: { select: { title: true } },
        authors: { include: { staff: { include: { user: { select: { name: true } } } } }, orderBy: { order: "asc" } },
      },
    });

    return json({ success: true, data: serialize(publication) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research publication error:", error);
    return json({ success: false, error: "Failed to create the publication." }, 500);
  }
}
