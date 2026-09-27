import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const user = await requireModulePermission("PROGRAM_MATTERS", "view");

    // ADMIN/SUPER_ADMIN reach this dashboard too (requireModulePermission
    // lets SUPER_ADMIN through with no StaffProfile at all), and
    // /api/coordinator/courses and /api/coordinator/overview already
    // treat them as able to see every programme rather than requiring a
    // StaffProfile row. This route previously didn't -- it 404'd for any
    // admin with no StaffProfile, leaving `programs` empty on the
    // frontend, which hides every tab behind "No programmes are
    // currently assigned to you as coordinator" even though the other
    // two endpoints had real data. Matching that same admin bypass here
    // fixes it.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });

    if (!staff && !isAdmin) {
      return errorResponse("No staff profile found for this account", 404);
    }

    const programs = await prisma.program.findMany({
      where: isAdmin ? {} : { coordinatorId: staff.id },
      include: {
        faculty: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        courses: {
          select: {
            id: true,
            titleEn: true,
            courseCode: true,
            isPublished: true,
          },
        },
      },
    });

    const programIds = programs.map((p) => p.id);

    const studentCount = await prisma.studentProfile.count({
      where: { programId: { in: programIds } },
    });

    return NextResponse.json({
      programs: programs.map((p) => ({
        id: p.id,
        name: p.nameEn,
        level: p.level,
        faculty: p.faculty?.nameEn ?? null,
        department: p.department?.nameEn ?? null,
        courses: p.courses,
      })),
      studentCount,
    });
  } catch (error) {
    console.error("Coordinator portal GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Coordinator access required", 403);

    return errorResponse("Failed to fetch coordinator data", 500);
  }
}