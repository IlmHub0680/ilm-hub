import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET /api/hod/attendance -- gap #3: "Attendance review where
// applicable." The Attendance model (app/api/instructor/attendance)
// rolls up cleanly to department level via the same
// course -> program -> departmentId chain used everywhere else in
// app/api/hod/*: Attendance has courseId, Course has programId,
// Program has departmentId. Real per-course aggregate rates computed
// directly from Attendance.totalClasses/attended/late/absent -- no
// separate attendance-session log exists in this schema, only this
// per-student-per-course running tally, so a course-level rollup
// (not a per-session calendar) is the real granularity available.
// Read-only -- attendance is recorded by the Instructor
// (app/api/instructor/attendance/route.js), never edited here.
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const department = staff
      ? await prisma.department.findUnique({ where: { headId: staff.id } })
      : null;

    if (!department && !isAdmin) {
      return NextResponse.json({
        department: null,
        message: "You are not currently assigned as Head of a department.",
      });
    }

    const courseScope = department ? { program: { departmentId: department.id } } : {};

    const courses = await prisma.course.findMany({
      where: courseScope,
      select: {
        id: true,
        titleEn: true,
        courseCode: true,
        program: { select: { nameEn: true } },
        attendanceRecords: {
          select: { totalClasses: true, attended: true, late: true, absent: true },
        },
      },
      orderBy: { courseCode: "asc" },
    });

    const rows = courses
      .filter((c) => c.attendanceRecords.length > 0)
      .map((course) => {
        const totals = course.attendanceRecords.reduce(
          (acc, r) => ({
            totalClasses: acc.totalClasses + r.totalClasses,
            attended: acc.attended + r.attended,
            late: acc.late + r.late,
            absent: acc.absent + r.absent,
          }),
          { totalClasses: 0, attended: 0, late: 0, absent: 0 }
        );

        const attendanceRate = totals.totalClasses > 0 ? totals.attended / totals.totalClasses : null;

        return {
          courseId: course.id,
          courseTitle: course.titleEn,
          courseCode: course.courseCode,
          programme: course.program?.nameEn ?? null,
          studentsTracked: course.attendanceRecords.length,
          totalClasses: totals.totalClasses,
          attended: totals.attended,
          late: totals.late,
          absent: totals.absent,
          attendanceRate,
        };
      });

    const untracked = courses.length - rows.length;

    return NextResponse.json({
      department: department ? { id: department.id, nameEn: department.nameEn } : null,
      courses: rows,
      untrackedCourseCount: untracked,
    });
  } catch (error) {
    console.error("HOD attendance review error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Department Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load department attendance data." }, { status: 500 });
  }
}
