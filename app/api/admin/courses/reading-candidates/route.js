import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Lookup used by the Course Readings admin picker -- searches
// published LibraryResource and Book rows by title so a coordinator
// can attach an existing, authoritative resource rather than
// re-uploading a file that already exists in the Library or
// Bookstore.
export async function GET(request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const type = searchParams.get("type") === "book" ? "book" : "library";

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

        // Digital Library visibility tiers (lib/institute-library-visibility.js) are
    // deliberately NOT applied here. This picker is used by an academic
    // staff member AUTHORING an official course-resource link, not by a
    // consuming reader browsing the public Library -- they need to be
    // able to find and link any real institute-tier-and-above resource
    // regardless of its public-facing visibility tier. isPublished is
    // still required (an unpublished/draft resource isn't a real,
    // finished resource yet, so it isn't offered as linkable). The
    // student-facing consumer of the resulting CourseReading link
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
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("GET reading candidates error:", error);
    return json({ success: false, error: "Search failed." }, 500);
  }
}
