import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Course add/drop requests — split out from the transcript queue in
// app/api/records/requests so Academic Records can act on them with a
// real Enrollment side-effect (see [id]/route.ts), not just a status flag.
export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const requests = await prisma.request.findMany({
      where: { type: "COURSE_ADD_DROP" },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        course: { select: { id: true, titleEn: true, courseCode: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        details: r.details,
        courseAction: r.courseAction,
        course: r.course,
        createdAt: r.createdAt,
        studentName: r.student.user.name,
        studentNo: r.student.studentNo,
        studentId: r.studentId,
        responseNote: r.responseNote,
      })),
    });
  } catch (error) {
    console.error("Records course-requests GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to fetch course add/drop requests", 500);
  }
}
