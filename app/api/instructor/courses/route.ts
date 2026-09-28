import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Real "My Assigned Courses" list for the Instructor dashboard's own
// landing page (app/instructor-dashboard/courses/page.tsx), which was
// previously a static 8-line placeholder with zero real functionality.
// Nothing here is new data -- InstructorCourse + Course + AcademicTerm
// + Enrollment already carry all of it; this just joins them into the
// one shape the page needs, the same pattern app/api/instructor/roster
// already uses for the roster lookup.
//
// Instructor permissions are restricted to courses assigned to that
// instructor: instructorId: user.id, never client-supplied.
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("COURSES_GRADES", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const assignments = await prisma.instructorCourse.findMany({
      where: isAdmin ? {} : { instructorId: user.id },
      include: {
        course: {
          select: {
            id: true,
            titleEn: true,
            courseCode: true,
            creditHours: true,
            descriptionEn: true,
            isPublished: true,
            approvalStatus: true,
          },
        },
        term: {
          select: { id: true, name: true, code: true, isCurrent: true },
        },
      },
      orderBy: [{ course: { courseCode: "asc" } }],
    });

    const courseIds = assignments.map((a) => a.courseId);

    const enrollmentCounts = courseIds.length
      ? await prisma.enrollment.groupBy({
          by: ["courseId"],
          where: { courseId: { in: courseIds }, status: "APPROVED" },
          _count: { _all: true },
        })
      : [];

    const countByCourse = new Map(
      enrollmentCounts.map((row) => [row.courseId, row._count._all])
    );

    return NextResponse.json({
      success: true,
      courses: assignments.map((a) => ({
        assignmentId: a.id,
        courseId: a.course.id,
        titleEn: a.course.titleEn,
        courseCode: a.course.courseCode,
        creditHours: a.course.creditHours,
        descriptionEn: a.course.descriptionEn,
        isPublished: a.course.isPublished,
        approvalStatus: a.course.approvalStatus,
        role: a.role,
        status: a.status,
        term: a.term
          ? { id: a.term.id, name: a.term.name, code: a.term.code, isCurrent: a.term.isCurrent }
          : null,
        enrolledCount: countByCourse.get(a.courseId) || 0,
      })),
    });
  } catch (error: any) {
    console.error("Instructor courses GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Courses & Grades access required", 403);
    return errorResponse("Failed to load assigned courses", 500);
  }
}
