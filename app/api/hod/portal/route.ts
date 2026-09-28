import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    // ADMIN/SUPER_ADMIN reach this dashboard too, the same way they
    // reach Dean's and Coordinator's -- see the matching comment in
    // app/api/dean/portal/route.ts. app/api/hod/programs already
    // treats "no department" as "show everything" for an admin
    // (`department ? { departmentId: department.id } : {}`); this
    // route now matches that instead of hard-403ing.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const department = staff
      ? await prisma.department.findUnique({
          where: { headId: staff.id },
          include: { faculty: { select: { nameEn: true } } },
        })
      : null;

    if (!department && !isAdmin) {
      return NextResponse.json({
        department: null,
        message: "You are not currently assigned as Head of a department.",
      });
    }

    const departmentScope = department ? { departmentId: department.id } : {};
    const departmentCourseScope = department ? { program: { departmentId: department.id } } : {};
    const departmentStudentScope = department ? { student: { departmentId: department.id } } : {};

    const [programCount, staffCount, studentCount, announcements, courses, instructors, atRiskCount, termRecords, terms] = await Promise.all([
      prisma.program.count({ where: departmentScope }),
      prisma.staffProfile.count({ where: { ...departmentScope, isActive: true } }),
      prisma.studentProfile.count({ where: departmentScope }),
      prisma.announcement.findMany({
        where: departmentScope,
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      // Department courses (Course has no direct departmentId — a
      // course belongs to a department only through its programme).
      prisma.course.findMany({
        where: departmentCourseScope,
        select: {
          id: true,
          titleEn: true,
          courseCode: true,
          isPublished: true,
          program: { select: { nameEn: true } },
          instructors: {
            select: {
              instructor: { select: { id: true, name: true } },
              role: true,
              status: true,
              term: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { courseCode: "asc" },
      }),
      prisma.staffProfile.findMany({
        where: { ...departmentScope, isActive: true, position: { isAcademic: true } },
        select: {
          id: true,
          userId: true,
          specialization: true,
          user: { select: { name: true } },
          position: { select: { nameEn: true } },
        },
        orderBy: { user: { name: "asc" } },
      }),
      // A crude but real department-level at-risk count: students in
      // the department whose most recent TermRecord standing is
      // Probation or Suspended (Assessment, Grading & Progression §4.7).
      prisma.studentProfile.count({
        where: {
          ...departmentScope,
          termRecords: { some: { standing: { in: ["PROBATION", "SUSPENDED"] } } },
        },
      }),
      prisma.termRecord.findMany({
        where: departmentStudentScope,
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { gpa: true },
      }),
      // Model 21 -- active terms, for the instructor-assignment form
      // (same "recent, active terms" convention already used for
      // exams/grades, e.g. app/api/instructor/exams/route.js).
      prisma.academicTerm.findMany({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
        take: 10,
        select: { id: true, name: true, code: true },
      }),
    ]);

    const avgGpa =
      termRecords.length > 0
        ? termRecords.reduce((sum, t) => sum + t.gpa, 0) / termRecords.length
        : null;

    return NextResponse.json({
      // null here means an admin viewing institution-wide, not a
      // specific department -- app/hod-dashboard's pages already check
      // data.department before rendering department-specific chrome.
      department: department
        ? {
            id: department.id,
            nameEn: department.nameEn,
            nameAr: department.nameAr,
            facultyName: department.faculty.nameEn,
          }
        : null,
      programCount,
      staffCount,
      studentCount,
      announcements: announcements.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        bodyEn: a.bodyEn,
        isActive: a.isActive,
        publishedAt: a.publishedAt,
      })),
      courses: courses.map((c) => ({
        id: c.id,
        titleEn: c.titleEn,
        courseCode: c.courseCode,
        isPublished: c.isPublished,
        programName: c.program?.nameEn,
        instructors: c.instructors.map((i) => ({
          ...i.instructor,
          role: i.role,
          status: i.status,
          term: i.term,
        })),
      })),
      instructors,
      terms,
      performance: {
        studentCount,
        atRiskCount,
        avgGpa,
      },
    });
  } catch (error) {
    console.error("HOD portal error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Department Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load department portal data." }, { status: 500 });
  }
}
