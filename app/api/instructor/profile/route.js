import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// An instructor's own read-only view of their Instructor Profile
// (Model 10) — the same data an admin sees on /admin/staff/[id], but
// scoped strictly to the caller's own StaffProfile, and editable only
// by Academic Administration (see /admin/staff/[id]) so a self-report
// can never overwrite a verified qualification or performance review.
export async function GET() {
  try {
    const user = await requireInstructor();

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
      include: {
        position: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        qualifications: { orderBy: { yearObtained: "desc" } },
        developmentRecords: { orderBy: { completedAt: "desc" } },
        performanceReviewsReceived: {
          where: { status: { not: "DRAFT" } },
          orderBy: { createdAt: "desc" },
          include: { reviewer: { select: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({
        success: true,
        data: { hasProfile: false },
      });
    }

    const authorizedCourses = await prisma.instructorCourse.findMany({
      where: { instructorId: user.id },
      include: { course: { select: { id: true, titleEn: true, courseCode: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        hasProfile: true,
        ...staff,
        authorizedCourses: authorizedCourses.map((a) => a.course),
      },
    });
  } catch (error) {
    console.error("Instructor profile GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Instructor access required", 403);

    return errorResponse("Failed to load your profile", 500);
  }
}
