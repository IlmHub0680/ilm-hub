import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// A small, real roster lookup the integrity-case report form needs —
// an instructor's assigned courses, and (given one) the students
// really enrolled in it, resolved to their actual StudentProfile.id
// (what IntegrityCase.studentId points at), not the User.id
// InstructorCourse/Enrollment/Grade use internally. Nothing here is
// new data: InstructorCourse and Enrollment already carry all of it —
// this just joins them into the one shape the form needs.
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("COURSES_GRADES", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      const assignments = await prisma.instructorCourse.findMany({
        where: isAdmin ? {} : { instructorId: user.id },
        select: { course: { select: { id: true, titleEn: true, courseCode: true } } },
        orderBy: { course: { courseCode: "asc" } },
      });
      return NextResponse.json({
        success: true,
        courses: assignments.map((a) => a.course),
      });
    }

    if (!isAdmin) {
      const owns = await prisma.instructorCourse.findFirst({ where: { instructorId: user.id, courseId } });
      if (!owns) return errorResponse("You are not assigned to this course.", 403);
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: "APPROVED" },
      select: { userId: true },
    });
    const userIds = enrollments.map((e) => e.userId);

    const students = userIds.length
      ? await prisma.studentProfile.findMany({
          where: { userId: { in: userIds } },
          select: {
            id: true,
            studentNo: true,
            level: true,
            status: true,
            user: { select: { name: true, email: true } },
            program: { select: { nameEn: true } },
          },
          orderBy: { studentNo: "asc" },
        })
      : [];

    return NextResponse.json({
      success: true,
      students: students.map((s) => ({
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        level: s.level,
        status: s.status,
        program: s.program?.nameEn || null,
      })),
    });
  } catch (error: any) {
    console.error("Instructor roster GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Courses & Grades access required", 403);
    return errorResponse("Failed to load roster", 500);
  }
}
