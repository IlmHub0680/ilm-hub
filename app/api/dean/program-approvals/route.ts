import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The Dean-facing twin of /api/hod/course-approvals (Model 11) — a
// Dean reviews a programme a Head of Department in their own faculty
// submitted, and either approves it or returns it for revision.
async function resolveOwnFaculty(userId: string) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staff) return null;
  return prisma.faculty.findUnique({ where: { deanId: staff.id } });
}

export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    // ADMIN/SUPER_ADMIN reach this dashboard too -- same reasoning as
    // app/api/dean/portal/route.ts (that fix's comment has the full
    // explanation). An admin with no faculty of their own now sees
    // programme approvals institution-wide instead of an empty list.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const faculty = await resolveOwnFaculty(user.id);

    if (!faculty && !isAdmin) {
      return NextResponse.json({
        programs: [],
        message: "You are not currently assigned as Dean of a faculty.",
      });
    }

    const programs = await prisma.program.findMany({
      where: {
        approvalStatus: { in: ["UNDER_REVIEW", "RETURNED_FOR_REVISION", "APPROVED"] },
        ...(faculty ? { facultyId: faculty.id } : {}),
      },
      select: {
        id: true,
        nameEn: true,
        code: true,
        approvalStatus: true,
        approvalNote: true,
        updatedAt: true,
        department: { select: { nameEn: true } },
      },
      orderBy: [{ approvalStatus: "asc" }, { updatedAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ success: true, programs });
  } catch (error: any) {
    console.error("Dean program approvals GET error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters access required", 403);
    return errorResponse("Failed to load programme approvals", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "edit");

    const faculty = await resolveOwnFaculty(user.id);
    if (!faculty) {
      return errorResponse("You are not currently assigned as Dean of a faculty.", 403);
    }

    const body = await request.json();
    const programId = typeof body.programId === "string" ? body.programId : "";
    const action = body.action;

    if (!programId || (action !== "approve" && action !== "return")) {
      return errorResponse("programId and an action of 'approve' or 'return' are required.", 400);
    }

    const program = await prisma.program.findFirst({
      where: { id: programId, facultyId: faculty.id },
    });
    if (!program) return errorResponse("Programme not found in your faculty.", 404);
    if (program.approvalStatus !== "UNDER_REVIEW") {
      return errorResponse("Only a programme currently under review can be approved or returned.", 409);
    }

    if (action === "approve") {
      const updated = await prisma.program.update({
        where: { id: programId },
        data: { approvalStatus: "APPROVED", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note) return errorResponse("A note explaining what needs revision is required to return a programme.", 400);

    const updated = await prisma.program.update({
      where: { id: programId },
      data: { approvalStatus: "RETURNED_FOR_REVISION", approvalNote: note },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Dean program approvals PATCH error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Faculty Matters edit access required", 403);
    return errorResponse("Failed to record this decision", 500);
  }
}
