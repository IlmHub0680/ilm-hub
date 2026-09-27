import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The real approval side of the Course.approvalStatus workflow (Model
// 11) — a Head of Department reviews a course a Programme Coordinator
// in their own department submitted, and either approves it or returns
// it for revision with a note. Scoped to the caller's own department
// exactly like /api/hod/instructor-assignments already is.
async function resolveOwnDepartment(userId: string) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staff) return null;
  return prisma.department.findUnique({ where: { headId: staff.id } });
}

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "view");

    // ADMIN/SUPER_ADMIN reach this dashboard too -- same reasoning as
    // app/api/hod/portal/route.ts (that fix's comment has the full
    // explanation). An admin with no department of their own now sees
    // course approvals institution-wide instead of an empty list.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const department = await resolveOwnDepartment(user.id);

    if (!department && !isAdmin) {
      return NextResponse.json({
        courses: [],
        message: "You are not currently assigned as Head of a department.",
      });
    }

    const courses = await prisma.course.findMany({
      where: {
        approvalStatus: { in: ["UNDER_REVIEW", "RETURNED_FOR_REVISION", "APPROVED"] },
        ...(department ? { program: { departmentId: department.id } } : {}),
      },
      select: {
        id: true,
        titleEn: true,
        courseCode: true,
        approvalStatus: true,
        approvalNote: true,
        updatedAt: true,
        program: { select: { nameEn: true } },
      },
      orderBy: [{ approvalStatus: "asc" }, { updatedAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error("HoD course approvals GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters access required", 403);
    return errorResponse("Failed to load course approvals", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");

    const department = await resolveOwnDepartment(user.id);
    if (!department) {
      return errorResponse("You are not currently assigned as Head of a department.", 403);
    }

    const body = await request.json();
    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const action = body.action;

    if (!courseId || (action !== "approve" && action !== "return")) {
      return errorResponse("courseId and an action of 'approve' or 'return' are required.", 400);
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, program: { departmentId: department.id } },
    });
    if (!course) return errorResponse("Course not found in your department.", 404);
    if (course.approvalStatus !== "UNDER_REVIEW") {
      return errorResponse("Only a course currently under review can be approved or returned.", 409);
    }

    if (action === "approve") {
      const updated = await prisma.course.update({
        where: { id: courseId },
        data: { approvalStatus: "APPROVED", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note) return errorResponse("A note explaining what needs revision is required to return a course.", 400);

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { approvalStatus: "RETURNED_FOR_REVISION", approvalNote: note },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("HoD course approvals PATCH error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);
    return errorResponse("Failed to record this decision", 500);
  }
}
