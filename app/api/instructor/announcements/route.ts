import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Course announcements for the Instructor dashboard -- Announcement
// already has a COURSE AnnouncementScope and a courseId field (see
// prisma/schema.prisma), and creation for FACULTY/DEPARTMENT scope
// already exists (app/api/dean/announcements, app/api/hod/announcements)
// following this same shape; this is the missing COURSE-scope
// counterpart for Instructor. Reused, not duplicated: same
// Announcement model, same requireModulePermission gate pattern.
//
// GET lists announcements the calling instructor has posted to their
// own assigned courses; POST creates one. Read side for students is
// app/api/student/portal/route.js (courseAnnouncements query).
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("COURSES_GRADES", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const assignedCourseIds = isAdmin
      ? undefined
      : (
          await prisma.instructorCourse.findMany({
            where: { instructorId: user.id },
            select: { courseId: true },
          })
        ).map((a) => a.courseId);

    const announcements = await prisma.announcement.findMany({
      where: {
        scope: "COURSE",
        ...(assignedCourseIds ? { courseId: { in: assignedCourseIds } } : {}),
      },
      include: { createdBy: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Instructor announcements GET error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Courses & Grades access required", 403);
    return errorResponse("Failed to load announcements", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    await requireModulePermission("COURSES_GRADES", "edit");

    const body = await request.json();

    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const bodyEn = typeof body.bodyEn === "string" ? body.bodyEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" && body.titleAr.trim() ? body.titleAr.trim() : titleEn;
    const bodyAr = typeof body.bodyAr === "string" && body.bodyAr.trim() ? body.bodyAr.trim() : bodyEn;
    const expiresAt =
      typeof body.expiresAt === "string" && body.expiresAt.trim() ? new Date(body.expiresAt) : null;

    if (!courseId || !titleEn || !bodyEn) {
      return errorResponse("courseId, titleEn and bodyEn are required", 400);
    }

    // Instructor permissions are restricted to courses assigned to that
    // instructor -- verified server-side, never trusted from the client.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!isAdmin) {
      const owns = await prisma.instructorCourse.findUnique({
        where: { instructorId_courseId: { instructorId: user.id, courseId } },
      });
      if (!owns) {
        return errorResponse("You are not assigned to this course", 403);
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        titleEn,
        titleAr,
        bodyEn,
        bodyAr,
        scope: "COURSE",
        courseId,
        createdById: user.id,
        ...(expiresAt && !Number.isNaN(expiresAt.getTime()) ? { expiresAt } : {}),
      },
    });

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Instructor announcement POST error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Courses & Grades edit access required", 403);
    return errorResponse("Failed to publish announcement", 500);
  }
}
