import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VIOLATION_TYPES = [
  "PLAGIARISM",
  "CHEATING",
  "UNAUTHORIZED_COLLABORATION",
  "FALSIFICATION",
  "IMPERSONATION",
  "ASSESSMENT_MISCONDUCT",
  "AI_MISUSE",
  "OTHER",
];

// The real system behind Course Specifications' "proposed, not yet
// founder-confirmed" academic integrity paragraph (Model 11 §2). Any
// staff member holding COURSES_GRADES, DEPARTMENT_MATTERS, or
// QUALITY_ASSURANCE edit can report a case; a Head of Department sees
// every case touching their own department, an instructor sees the
// cases they themselves reported, and Admin/Super Admin see all of it
// — there is no student-facing view, since this is a staff-side
// integrity record, not something a Request is filed against.
async function resolveOwnStaff(userId: string) {
  return prisma.staffProfile.findUnique({ where: { userId } });
}

async function resolveOwnDepartment(userId: string) {
  const staff = await resolveOwnStaff(userId);
  if (!staff) return null;
  return prisma.department.findUnique({ where: { headId: staff.id } });
}

export async function GET() {
  try {
    const user = await requireUser();
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const staff = await resolveOwnStaff(user.id);
    const department = await resolveOwnDepartment(user.id);

    let where: any = {};

    if (!isAdmin) {
      if (department) {
        // A Head of Department sees every case in their department,
        // whether tied to a course in it or to a student enrolled in it.
        where = {
          OR: [
            { course: { program: { departmentId: department.id } } },
            { student: { departmentId: department.id } },
            { reportedById: staff?.id },
          ],
        };
      } else if (staff) {
        where = { reportedById: staff.id };
      } else {
        return errorResponse("No staff profile found.", 403);
      }
    }

    const cases = await prisma.integrityCase.findMany({
      where,
      include: {
        student: { select: { studentNo: true, user: { select: { name: true } } } },
        course: { select: { titleEn: true, courseCode: true } },
        reportedBy: { select: { user: { select: { name: true } } } },
        resolvedBy: { select: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 300,
    });

    return NextResponse.json({ success: true, cases });
  } catch (error: any) {
    console.error("Integrity cases GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to load integrity cases", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    // Any of these three positions is a legitimate reporter — an
    // instructor grading their own course, a Head of Department, or
    // Quality Assurance following up on something found during a
    // review. All three already exist as real module permissions.
    let staff = null;
    for (const [module, action] of [
      ["COURSES_GRADES", "edit"],
      ["DEPARTMENT_MATTERS", "edit"],
      ["QUALITY_ASSURANCE", "edit"],
    ] as const) {
      try {
        await requireModulePermission(module, action);
        staff = await resolveOwnStaff(user.id);
        break;
      } catch {
        // try the next module
      }
    }
    if (!staff && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return errorResponse("You do not have permission to report an integrity case.", 403);
    }
    if (!staff) {
      return errorResponse("A staff profile is required to report an integrity case.", 403);
    }

    const body = await request.json();
    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const violationType = String(body.violationType || "").toUpperCase();
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const severity = body.severity === "MAJOR" ? "MAJOR" : "MINOR";
    const courseId = typeof body.courseId === "string" && body.courseId ? body.courseId : null;

    if (!studentId || !VIOLATION_TYPES.includes(violationType) || !description) {
      return errorResponse(
        `studentId, a description, and a violationType (one of: ${VIOLATION_TYPES.join(", ")}) are required.`,
        400
      );
    }

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) return errorResponse("Student not found.", 404);

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return errorResponse("Course not found.", 404);
    }

    const created = await prisma.integrityCase.create({
      data: {
        studentId,
        courseId,
        violationType: violationType as any,
        severity: severity as any,
        description,
        reportedById: staff.id,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Integrity cases POST error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to report this case", 500);
  }
}
