import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    // ADMIN/SUPER_ADMIN reach this dashboard too (requireModulePermission
    // lets SUPER_ADMIN through with no StaffProfile at all, and a plain
    // ADMIN can hold FACULTY_MATTERS via a staff position without being
    // a specific Dean). This route previously hard-403'd for either of
    // them, which meant the whole Dean dashboard (every page depends on
    // this one endpoint via DeanProvider) came up as a hard error for
    // an admin -- not just one section, all of it. app/api/dean/departments
    // already treats "no faculty" as "show everything" for an admin
    // (`faculty ? { facultyId: faculty.id } : {}`); this route now
    // matches that instead of refusing outright.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const faculty = staff
      ? await prisma.faculty.findUnique({ where: { deanId: staff.id } })
      : null;

    if (!faculty && !isAdmin) {
      return NextResponse.json({
        faculty: null,
        message: "You are not currently assigned as Dean of a faculty.",
      });
    }

    // faculty is null only when an admin has no Dean assignment of
    // their own -- in that case these queries cover every faculty
    // (institution-wide view), matching how
    // app/api/dean/departments already handles the same admin case.
    const facultyScope = faculty ? { facultyId: faculty.id } : {};
    const facultyStudentScope = faculty ? { facultyId: faculty.id } : {};
    const facultyProgramScope = faculty ? { program: { facultyId: faculty.id } } : {};
    const facultyQualityScope = faculty
      ? {
          OR: [
            { facultyId: faculty.id },
            { department: { facultyId: faculty.id } },
            { program: { facultyId: faculty.id } },
          ],
        }
      : {};

    const [departmentCount, programCount, staffCount, studentCount, announcements, programs, atRiskCount, termRecords, graduationCandidates, qualityReviews] =
      await Promise.all([
        prisma.department.count({ where: facultyScope }),
        prisma.program.count({ where: facultyScope }),
        prisma.staffProfile.count({ where: { ...facultyScope, isActive: true } }),
        prisma.studentProfile.count({ where: facultyStudentScope }),
        prisma.announcement.findMany({
          where: facultyScope,
          orderBy: { publishedAt: "desc" },
          take: 20,
        }),
        prisma.program.findMany({
          where: facultyScope,
          select: {
            id: true,
            nameEn: true,
            level: true,
            isActive: true,
            department: { select: { nameEn: true } },
            coordinator: { select: { user: { select: { name: true } } } },
            _count: { select: { courses: true, students: true } },
          },
          orderBy: { nameEn: "asc" },
        }),
        prisma.studentProfile.count({
          where: {
            ...facultyStudentScope,
            termRecords: { some: { standing: { in: ["PROBATION", "SUSPENDED"] } } },
          },
        }),
        prisma.termRecord.findMany({
          where: faculty ? { student: { facultyId: faculty.id } } : {},
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { gpa: true },
        }),
        prisma.graduationApplication.findMany({
          where: { ...facultyProgramScope, status: { in: ["ELIGIBLE", "APPLIED", "CLEARANCE_IN_PROGRESS"] } },
          select: { id: true, status: true, student: { select: { studentNo: true, user: { select: { name: true } } } } },
          take: 100,
        }),
        prisma.qualityReview.findMany({
          where: facultyQualityScope,
          select: { id: true, outcome: true, improvementStatus: true },
        }),
      ]);

    const avgGpa =
      termRecords.length > 0
        ? termRecords.reduce((sum, t) => sum + t.gpa, 0) / termRecords.length
        : null;

    const qualityIndicators = {
      totalReviews: qualityReviews.length,
      compliant: qualityReviews.filter((r) => r.outcome === "COMPLIANT").length,
      minorNonCompliance: qualityReviews.filter((r) => r.outcome === "MINOR_NON_COMPLIANCE").length,
      majorNonCompliance: qualityReviews.filter((r) => r.outcome === "MAJOR_NON_COMPLIANCE").length,
      openImprovementPlans: qualityReviews.filter((r) => r.improvementStatus === "PENDING" || r.improvementStatus === "IN_PROGRESS").length,
    };

    return NextResponse.json({
      // null here (an admin viewing institution-wide, not a specific
      // faculty) is intentional -- app/dean-dashboard's pages already
      // check `data.faculty` before rendering faculty-specific chrome.
      faculty: faculty ? { id: faculty.id, nameEn: faculty.nameEn, nameAr: faculty.nameAr } : null,
      departmentCount,
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
      programs,
      progression: {
        studentCount,
        atRiskCount,
        avgGpa,
      },
      graduationCandidates,
      qualityIndicators,
    });
  } catch (error) {
    console.error("Dean portal error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Faculty Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load Dean portal data." }, { status: 500 });
  }
}
