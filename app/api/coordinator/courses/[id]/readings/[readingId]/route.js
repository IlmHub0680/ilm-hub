import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Same ownership pattern as the sibling readings/route.js and
// app/api/coordinator/courses/[id]/route.js -- kept as a local copy
// rather than a shared import so this route family matches the
// existing admin readings routes file-for-file.
async function loadOwnedCourse(user, id) {
  const course = await prisma.course.findUnique({ where: { id }, include: { program: true } });
  if (!course) return { course: null, allowed: false };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) return { course, allowed: true };

  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  const allowed = !!staff && course.program?.coordinatorId === staff.id;

  return { course, allowed };
}

// No hard delete for the reading link is a meaningful distinction --
// this join row *is* the "remove from syllabus" action itself.
// Removing a CourseReading row never touches the underlying
// LibraryResource or Book record. The reading is looked up by its own
// id and its courseId is checked against the URL's course id, so a
// coordinator can never delete a reading that belongs to a different
// course (and, by the ownership check above, never a course outside
// their own coordinated programme either).
export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "edit");

    const { id, readingId } = await params;
    const { course, allowed } = await loadOwnedCourse(user, id);

    if (!course) return json({ success: false, error: "Course not found." }, 404);
    if (!allowed) return json({ success: false, error: "You do not coordinate this course's programme." }, 403);

    const reading = await prisma.courseReading.findUnique({ where: { id: readingId } });
    if (!reading || reading.courseId !== id) {
      return json({ success: false, error: "Reading not found." }, 404);
    }

    await prisma.courseReading.delete({ where: { id: readingId } });

    return json({ success: true });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Program Matters edit access required." }, 403);
    console.error("DELETE coordinator course reading error:", error);
    return json({ success: false, error: "Failed to remove the reading." }, 500);
  }
}
