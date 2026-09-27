import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("STUDENT_MATTERS", "view");

    const requests = await prisma.request.findMany({
      where: {
        type: { notIn: ["TRANSCRIPT", "GRADE_APPEAL"] },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        assignedStaff: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        details: r.details,
        attachmentUrl: r.attachmentUrl ? true : null,
        responseNote: r.responseNote,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
        studentName: r.student.user.name,
        studentEmail: r.student.user.email,
        studentNo: r.student.studentNo,
        assignedStaffName: r.assignedStaff ? r.assignedStaff.user.name : null,
      })),
    });
  } catch (error) {
    console.error("Student Affairs requests GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs access required", 403);

    return errorResponse("Failed to fetch requests", 500);
  }
}
