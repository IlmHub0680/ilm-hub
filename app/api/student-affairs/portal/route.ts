import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireModulePermission("STUDENT_MATTERS", "view");

    const [
      studentCount,
      activeStudentCount,
      programmeCount,
      activeStaffCount,
      openCaseCount,
      unassignedCaseCount,
      tutoringPendingCount,
      absenceExcusePendingCount,
    ] =
      await Promise.all([
        prisma.studentProfile.count(),
        // Was previously a placeholder duplicate of studentCount above.
        // Real filter on the actual StudentStatus enum value.
        prisma.studentProfile.count({ where: { status: "ACTIVE" } }),
        prisma.program.count(),
        prisma.staffProfile.count({
          where: {
            isActive: true,
          },
        }),
        // Model 32 §3/§6 -- Student Affairs work queue: every Request not
        // yet in a terminal state (APPROVED/REJECTED/COMPLETED), a real
        // count, never mocked.
        prisma.request.count({
          where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        }),
        prisma.request.count({
          where: {
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
            assignedStaffId: null,
          },
        }),
        prisma.tutoringRequest.count({ where: { status: "PENDING" } }),
        prisma.absenceExcuse.count({ where: { status: "PENDING" } }),
      ]);

    return NextResponse.json({
      studentCount,
      activeStudents: activeStudentCount,
      programmeCount,
      activeStaffCount,
      openCaseCount,
      unassignedCaseCount,
      tutoringPendingCount,
      absenceExcusePendingCount,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.error("Student Affairs portal error:", error);

    return NextResponse.json(
      { error: "Failed to load Student Affairs data." },
      { status: 500 }
    );
  }
}
