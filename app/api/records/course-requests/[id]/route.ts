import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const responseNote =
      typeof body.responseNote === "string" ? body.responseNote.trim() || null : null;

    const existing = await prisma.request.findUnique({
      where: { id },
      include: { student: { select: { userId: true } } },
    });

    if (!existing || existing.type !== "COURSE_ADD_DROP") {
      return errorResponse("Course add/drop request not found", 404);
    }

    if (existing.status === "APPROVED" || existing.status === "REJECTED" || existing.status === "COMPLETED") {
      return errorResponse(`Request is already ${existing.status.toLowerCase()}`, 409);
    }

    if (action === "reject") {
      const updated = await prisma.request.update({
        where: { id },
        data: { status: "REJECTED", resolvedAt: new Date(), responseNote },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "approve") {
      if (!existing.courseId || !existing.courseAction) {
        return errorResponse(
          "This request has no structured course/action to act on — it predates the add/drop workflow and must be handled manually.",
          422
        );
      }

      // The real effect an "approval" here always used to be missing:
      // actually create or remove the Enrollment row, not just flip a
      // status flag while the student's registered courses stay the same.
      if (existing.courseAction === "ADD") {
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: { userId: existing.student.userId, courseId: existing.courseId },
          },
          update: {},
          create: {
            id: crypto.randomUUID(),
            userId: existing.student.userId,
            courseId: existing.courseId,
            status: "APPROVED",
          },
        });
      } else if (existing.courseAction === "DROP") {
        await prisma.enrollment.deleteMany({
          where: { userId: existing.student.userId, courseId: existing.courseId },
        });
      }

      const updated = await prisma.request.update({
        where: { id },
        data: { status: "APPROVED", resolvedAt: new Date(), responseNote },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Invalid action", 400);
  } catch (error) {
    console.error("Records course-requests PATCH error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to update course add/drop request", 500);
  }
}
