import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(reading) {
  return {
    id: reading.id,
    readingType: reading.readingType,
    note: reading.note || "",
    order: reading.order,
    libraryResource: reading.libraryResource
      ? { id: reading.libraryResource.id, title: reading.libraryResource.titleEn, slug: reading.libraryResource.slug }
      : null,
    book: reading.book
      ? { id: reading.book.id, title: reading.book.titleEn }
      : null,
    instituteLibraryResource: reading.instituteLibraryResource
      ? {
          id: reading.instituteLibraryResource.id,
          title: reading.instituteLibraryResource.titleEn,
          slug: reading.instituteLibraryResource.slug,
        }
      : null,
  };
}

// Model 28 rule #8: a Course's required/recommended readings, each
// pointing at an authoritative LibraryResource or Book row rather
// than a duplicated file.
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const course = await prisma.course.findUnique({ where: { id }, select: { id: true, titleEn: true } });
    if (!course) return json({ success: false, error: "Course not found." }, 404);

    const readings = await prisma.courseReading.findMany({
      where: { courseId: id },
      include: {
        libraryResource: { select: { id: true, titleEn: true, slug: true } },
        book: { select: { id: true, titleEn: true } },
        instituteLibraryResource: { select: { id: true, titleEn: true, slug: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return json({ success: true, data: readings.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("GET course readings error:", error);
    return json({ success: false, error: "Failed to load readings." }, 500);
  }
}

// POST (create) intentionally removed from this Admin route -- adding a
// course reading is Programme Coordinator's own operational authority
// (Delegated Operations), scoped to the coordinator's own programme via
// app/api/coordinator/courses/[id]/readings/route.js. Admin retains this
// GET for read-only oversight only; the write path now exists in
// exactly one place, correctly owned.
