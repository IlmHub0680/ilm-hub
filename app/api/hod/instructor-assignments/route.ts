import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Instructor assignment (Model 10, HOD Portal) — a Head of Department
// assigning or removing which instructor teaches which course in
// their own department. Writes directly to InstructorCourse, the same
// model every existing instructor-facing page already reads from —
// this is real assignment, not a separate parallel list.
async function requireOwnDepartment(userId: string) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staff) throw new Error("NO_STAFF_PROFILE");

  const department = await prisma.department.findUnique({ where: { headId: staff.id } });
  if (!department) throw new Error("NOT_A_HEAD");

  return department;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");
    const department = await requireOwnDepartment(user.id);

    const body = await request.json();
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const instructorUserId = typeof body.instructorUserId === "string" ? body.instructorUserId : "";

    if (!courseId || !instructorUserId) {
      return errorResponse("courseId and instructorUserId are required.", 400);
    }

    // Model 21 -- optional academic period and role on assignment. Both
    // stay unset unless the Head of Department chooses one; role
    // defaults to LEAD (the schema default), matching the "one
    // instructor per course" case this app has only ever had so far.
    const VALID_ROLES = ["LEAD", "CO_INSTRUCTOR", "TEACHING_ASSISTANT"];
    const termId = typeof body.termId === "string" && body.termId ? body.termId : null;
    const role = VALID_ROLES.includes(body.role) ? body.role : undefined;

    const course = await prisma.course.findFirst({
      where: { id: courseId, program: { departmentId: department.id } },
    });
    if (!course) return errorResponse("This course is not in your department.", 403);

    if (termId) {
      const term = await prisma.academicTerm.findUnique({ where: { id: termId } });
      if (!term) return errorResponse("The selected academic term could not be found.", 400);
    }

    // Re-assigning a previously withdrawn pairing reactivates it (status
    // back to ACTIVE) rather than leaving it WITHDRAWN underneath a
    // "successful" assign -- upsert already lets one instructor/course
    // pairing exist only once (@@unique([instructorId, courseId])), so
    // there is nothing to duplicate here.
    const assignment = await prisma.instructorCourse.upsert({
      where: { instructorId_courseId: { instructorId: instructorUserId, courseId } },
      update: { status: "ACTIVE", ...(termId ? { termId } : {}), ...(role ? { role } : {}) },
      create: { instructorId: instructorUserId, courseId, termId, ...(role ? { role } : {}) },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error("HOD instructor assignment POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);
    if (error instanceof Error && (error.message === "NO_STAFF_PROFILE" || error.message === "NOT_A_HEAD")) {
      return errorResponse("You are not currently assigned as Head of a department.", 403);
    }

    return errorResponse("Failed to assign instructor", 500);
  }
}

// Model 21 -- end an assignment without destroying the historical
// teaching record (grades, exams, evaluations already reference this
// InstructorCourse row). The existing DELETE below stays available for
// correcting an assignment made in error.
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");
    const department = await requireOwnDepartment(user.id);

    const body = await request.json();
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const instructorUserId = typeof body.instructorUserId === "string" ? body.instructorUserId : "";
    const status = body.status === "WITHDRAWN" || body.status === "ACTIVE" ? body.status : "";

    if (!courseId || !instructorUserId || !status) {
      return errorResponse("courseId, instructorUserId and a valid status are required.", 400);
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, program: { departmentId: department.id } },
    });
    if (!course) return errorResponse("This course is not in your department.", 403);

    const assignment = await prisma.instructorCourse.update({
      where: { instructorId_courseId: { instructorId: instructorUserId, courseId } },
      data: { status },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error("HOD instructor assignment PATCH error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);
    if (error instanceof Error && (error.message === "NO_STAFF_PROFILE" || error.message === "NOT_A_HEAD")) {
      return errorResponse("You are not currently assigned as Head of a department.", 403);
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Assignment not found.", 404);
    }

    return errorResponse("Failed to update instructor assignment", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");
    const department = await requireOwnDepartment(user.id);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || "";
    const instructorUserId = searchParams.get("instructorUserId") || "";

    if (!courseId || !instructorUserId) {
      return errorResponse("courseId and instructorUserId are required.", 400);
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, program: { departmentId: department.id } },
    });
    if (!course) return errorResponse("This course is not in your department.", 403);

    await prisma.instructorCourse.deleteMany({
      where: { instructorId: instructorUserId, courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HOD instructor assignment DELETE error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);
    if (error instanceof Error && (error.message === "NO_STAFF_PROFILE" || error.message === "NOT_A_HEAD")) {
      return errorResponse("You are not currently assigned as Head of a department.", 403);
    }

    return errorResponse("Failed to remove instructor assignment", 500);
  }
}
