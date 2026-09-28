import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  getViewerInstituteLibraryRank,
  isVisibleAtInstituteLibraryRank,
} from "@/lib/institute-library-visibility";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Model 28 rule #7/#8: a signed-in, ENROLLED student's own course
// readings -- required/recommended textbooks linked via CourseReading
// to a LibraryResource (personal), Book (personal), or
// InstituteLibraryResource (institute Digital Library) row. Never
// exposes r2FileKey or any other raw storage path; only the same
// public-safe fields those resources' own public pages already show,
// plus a slug/id the student uses to navigate there.
//
// The personal libraryResource/book branches carry no viewer-tiering
// (matching those systems' own no-tiering design -- see
// app/api/library-resources/route.js) and are always shown once
// linked. The institute Digital Library branch is different: an
// InstituteLibraryResource genuinely has a visibility tier, and a
// CourseReading linking to one the student's own tier does NOT
// satisfy (e.g. re-tiered to FACULTY_STAFF_ONLY or RESTRICTED after
// being linked to the course, or simply unpublished/still in review)
// must not leak that resource's title/slug/href to the student -- the
// metadata itself is part of what "enforce visibility consistently"
// covers, not just the resource's own detail page. Such a reading is
// degraded to a safe placeholder (readingAvailable: false) instead of
// being silently dropped, so the student still sees that a reading
// exists for the course without seeing anything about its content.
export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id: courseId } = await params;

    // Real, server-side enrollment check -- not just a UI assumption.
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { status: true },
    });

    if (!enrollment || enrollment.status !== "APPROVED") {
      return json({ success: false, error: "You are not enrolled in this course." }, 403);
    }

    const instituteViewerRank = await getViewerInstituteLibraryRank(user);

    const readings = await prisma.courseReading.findMany({
      where: { courseId },
      include: {
        libraryResource: {
          select: { titleEn: true, slug: true, category: true },
        },
        book: { select: { id: true, titleEn: true } },
        instituteLibraryResource: {
          select: { titleEn: true, slug: true, category: true, isPublished: true, visibility: true },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return json({
      success: true,
      data: readings.map((reading) => {
        let instituteLibraryResource = null;

        if (reading.instituteLibraryResource) {
          if (isVisibleAtInstituteLibraryRank(reading.instituteLibraryResource, instituteViewerRank)) {
            instituteLibraryResource = {
              title: reading.instituteLibraryResource.titleEn,
              href: `/institute-library/${reading.instituteLibraryResource.slug}`,
              category: reading.instituteLibraryResource.category,
              readingAvailable: true,
            };
          } else {
            instituteLibraryResource = {
              title: null,
              href: null,
              category: null,
              readingAvailable: false,
            };
          }
        }

        return {
          id: reading.id,
          readingType: reading.readingType,
          note: reading.note || "",
          libraryResource: reading.libraryResource
            ? {
                title: reading.libraryResource.titleEn,
                href: `/library/${reading.libraryResource.slug}`,
                category: reading.libraryResource.category,
              }
            : null,
          book: reading.book
            ? { title: reading.book.titleEn, href: `/bookstore/${reading.book.id}` }
            : null,
          instituteLibraryResource,
        };
      }),
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    console.error("GET student course readings error:", error);
    return json({ success: false, error: "Failed to load readings." }, 500);
  }
}
