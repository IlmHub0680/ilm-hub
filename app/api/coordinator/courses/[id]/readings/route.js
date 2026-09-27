import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Model 28's Programme Coordinator surface: readings are selected
// operationally by the course's own programme coordinator, mirroring
// app/api/admin/courses/[id]/readings/route.js's shape exactly (so any
// future shared UI code can reuse either) but scoped to the courses
// this coordinator actually owns -- the same loadOwnedCourse pattern
// already used by app/api/coordinator/courses/[id]/route.js.
async function loadOwnedCourse(user, id) {
  const course = await prisma.course.findUnique({ where: { id }, include: { program: true } });
  if (!course) return { course: null, allowed: false };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) return { course, allowed: true };

  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  const allowed = !!staff && course.program?.coordinatorId === staff.id;

  return { course, allowed };
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

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "view");

    const { id } = await params;
    const { course, allowed } = await loadOwnedCourse(user, id);

    if (!course) return json({ success: false, error: "Course not found." }, 404);
    if (!allowed) return json({ success: false, error: "You do not coordinate this course's programme." }, 403);

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
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Program Matters access required." }, 403);
    console.error("GET coordinator course readings error:", error);
    return json({ success: false, error: "Failed to load readings." }, 500);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "edit");

    const { id } = await params;
    const { course, allowed } = await loadOwnedCourse(user, id);

    if (!course) return json({ success: false, error: "Course not found." }, 404);
    if (!allowed) return json({ success: false, error: "You do not coordinate this course's programme." }, 403);

    const body = await request.json();
    const libraryResourceId = typeof body.libraryResourceId === "string" ? body.libraryResourceId.trim() || null : null;
    const bookId = typeof body.bookId === "string" ? body.bookId.trim() || null : null;
    // Institute Digital Library integration: a coordinator may link an
    // approved institute resource to a course exactly as they already
    // can with a personal Library resource or a Bookstore Book -- a
    // deliberate, additive third option, never a merge of the systems.
    const instituteLibraryResourceId =
      typeof body.instituteLibraryResourceId === "string"
        ? body.instituteLibraryResourceId.trim() || null
        : null;
    const readingType = body.readingType === "RECOMMENDED" ? "RECOMMENDED" : "REQUIRED";
    const note = typeof body.note === "string" ? body.note.trim() || null : null;

    const chosenCount = [libraryResourceId, bookId, instituteLibraryResourceId].filter(Boolean).length;
    if (chosenCount !== 1) {
      return json(
        {
          success: false,
          error: "Choose exactly one: a Library resource, a Book, or a Digital Library resource.",
        },
        400
      );
    }

    if (libraryResourceId) {
      const resource = await prisma.libraryResource.findUnique({ where: { id: libraryResourceId } });
      if (!resource) return json({ success: false, error: "Library resource not found." }, 404);
    }
    if (bookId) {
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) return json({ success: false, error: "Book not found." }, 404);
    }
    if (instituteLibraryResourceId) {
      // Publication state is intentionally NOT checked here -- same
      // "authoring/administering staff member picking a resource to
      // link" exemption already used by the reading-candidates picker
      // for the personal LibraryResource, not a consuming reader
      // browsing the public Digital Library. The linked resource's
      // own visibility/isPublished is enforced separately, for the
      // STUDENT reading it, in app/api/student/courses/[id]/readings.
      const resource = await prisma.instituteLibraryResource.findUnique({
        where: { id: instituteLibraryResourceId },
      });
      if (!resource) return json({ success: false, error: "Digital Library resource not found." }, 404);
    }

    const reading = await prisma.courseReading.create({
      data: { courseId: id, libraryResourceId, bookId, instituteLibraryResourceId, readingType, note },
      include: {
        libraryResource: { select: { id: true, titleEn: true, slug: true } },
        book: { select: { id: true, titleEn: true } },
        instituteLibraryResource: { select: { id: true, titleEn: true, slug: true } },
      },
    });

    return json({ success: true, data: serialize(reading) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Program Matters edit access required." }, 403);
    console.error("POST coordinator course reading error:", error);
    return json({ success: false, error: "Failed to add the reading." }, 500);
  }
}
