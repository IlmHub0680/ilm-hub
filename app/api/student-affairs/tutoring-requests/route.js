import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Student Affairs' queue for Private Tutoring requests -- previously
// there was no way for anything to move a TutoringRequest off PENDING
// or set its fee, so the student-side "pay once approved" flow was
// real but unreachable. Same STUDENT_MATTERS module as the general
// Student Requests queue (app/api/student-affairs/requests).
export async function GET() {
  try {
    await requireModulePermission("STUDENT_MATTERS", "view");

    const requests = await prisma.tutoringRequest.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        course: { select: { titleEn: true, courseCode: true } },
        instructor: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        studentName: r.student.user.name,
        studentEmail: r.student.user.email,
        course: r.course.titleEn,
        courseCode: r.course.courseCode,
        instructor: r.instructor?.user?.name ?? null,
        preferredSchedule: r.preferredSchedule,
        notes: r.notes,
        feeUSD: r.feeUSD,
        isPaid: r.isPaid,
        paidAmount: r.paidAmount === null ? null : Number(r.paidAmount),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Student Affairs tutoring requests GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs access required", 403);

    return errorResponse("Failed to fetch tutoring requests", 500);
  }
}
