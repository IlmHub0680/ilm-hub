import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Coordinator-scoped equivalent of
// app/api/admin/courses/reading-candidates/route.js -- searches
// published LibraryResource and Book rows by title so a Programme
// Coordinator can attach an existing, authoritative resource to one of
// their own courses rather than re-uploading a file that already
// exists in the Library or Bookstore. Read-only lookup gated on
// PROGRAM_MATTERS view access only (no course ownership to check here,
// since nothing is written); the coordinator readings routes still
// enforce course ownership on POST/DELETE.
export async function GET(request) {
  try {
    await requireModulePermission("PROGRAM_MATTERS", "view");

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const typeParam = searchParams.get("type");
    const type = typeParam === "book" ? "book" : typeParam === "institute" ? "institute" : "library";

    if (q.length < 2) {
      return json({ success: true, data: [] });
    }

    if (type === "book") {
      const books = await prisma.book.findMany({
        where: { status: "PUBLISHED", titleEn: { contains: q, mode: "insensitive" } },
        select: { id: true, titleEn: true },
        take: 10,
      });
      return json({ success: true, data: books.map((b) => ({ id: b.id, title: b.titleEn })) });
    }

    // Institute Digital Library candidates -- same "authoring staff
    // member picking a resource to link" exemption as the personal
    // Library branch below: isPublished is required (a draft isn't a
    // real, finished resource yet), but visibility tiers are
    // deliberately NOT applied here. The student-facing consumer of
    // the resulting CourseReading link
    // (app/api/student/courses/[id]/readings/route.js) is where
    // visibility is actually enforced against the reading student's
    // own tier.
    if (type === "institute") {
      const resources = await prisma.instituteLibraryResource.findMany({
        where: { isPublished: true, titleEn: { contains: q, mode: "insensitive" } },
        select: { id: true, titleEn: true, slug: true },
        take: 10,
      });
      return json({ success: true, data: resources.map((r) => ({ id: r.id, title: r.titleEn, slug: r.slug })) });
    }

    // Digital Library visibility tiers (lib/institute-library-visibility.js)
    // are deliberately NOT applied here either. This picker is used by an
    // academic staff member AUTHORING an official course-resource link, not
    // by a consuming reader browsing the public Library -- they need to be
    // able to find and link any real published resource regardless of its
    // public-facing visibility tier. isPublished is still required (an
    // unpublished/draft resource isn't a real, finished resource yet, so
    // it isn't offered as linkable). The student-facing consumer of the
    // resulting CourseReading link
    // (app/api/student/courses/[id]/readings/route.js) is where visibility
    // is actually enforced against the reading student's own tier.
    const resources = await prisma.libraryResource.findMany({
      where: { isPublished: true, titleEn: { contains: q, mode: "insensitive" } },
      select: { id: true, titleEn: true, slug: true },
      take: 10,
    });
    return json({ success: true, data: resources.map((r) => ({ id: r.id, title: r.titleEn, slug: r.slug })) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Program Matters access required." }, 403);
    console.error("GET coordinator reading candidates error:", error);
    return json({ success: false, error: "Search failed." }, 500);
  }
}
