import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function resolveOwnStaff(user) {
  return prisma.staffProfile.findUnique({ where: { userId: user.id } });
}

// The Programme Coordinator Portal's real dashboard data — applicants,
// active/at-risk students, and graduation candidates, all scoped
// strictly to the programmes this coordinator actually coordinates
// (Program.coordinatorId === their own StaffProfile.id), matching the
// exact scoping rule /api/coordinator/courses already established.
// Admin/Super Admin may pass programId explicitly to view any
// programme the same way an admin already can for course management.
export async function GET(request) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "view");

    const staff = await resolveOwnStaff(user);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const { searchParams } = new URL(request.url);
    const requestedProgramId = searchParams.get("programId");

    let programIds;
    if (requestedProgramId) {
      if (!isAdmin) {
        const owns = await prisma.program.findFirst({
          where: { id: requestedProgramId, coordinatorId: staff?.id },
        });
        if (!owns) return errorResponse("You do not coordinate this programme.", 403);
      }
      programIds = [requestedProgramId];
    } else if (isAdmin) {
      const all = await prisma.program.findMany({ where: { isActive: true }, select: { id: true } });
      programIds = all.map((p) => p.id);
    } else {
      if (!staff) return errorResponse("No staff profile found.", 403);
      const owned = await prisma.program.findMany({ where: { coordinatorId: staff.id }, select: { id: true } });
      programIds = owned.map((p) => p.id);
    }

    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, nameEn: true, code: true },
    });

    if (programIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { programs: [], stats: {}, applicants: [], students: [], graduationCandidates: [] },
      });
    }

    const [applications, students, graduationApplications] = await Promise.all([
      prisma.admissionApplication.findMany({
        where: {
          programId: { in: programIds },
          status: { in: ["PAID", "UNDER_REVIEW", "INITIAL_ACCEPTANCE", "PENDING_FINAL_APPROVAL"] },
        },
        select: { id: true, fullName: true, email: true, status: true, programId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.studentProfile.findMany({
        where: { programId: { in: programIds }, status: { in: ["ACTIVE", "SUSPENDED", "DEFERRED"] } },
        select: {
          id: true,
          studentNo: true,
          status: true,
          user: { select: { name: true, email: true } },
          program: { select: { nameEn: true } },
          termRecords: { orderBy: { createdAt: "desc" }, take: 1, select: { standing: true, gpa: true } },
          placementAssessment: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
      prisma.graduationApplication.findMany({
        where: { programId: { in: programIds }, status: { not: "NOT_STARTED" } },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          student: { select: { studentNo: true, user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
    ]);

    const studentsWithStanding = students.map((s) => {
      const latestStanding = s.termRecords[0]?.standing || null;
      const atRisk = latestStanding === "PROBATION" || latestStanding === "SUSPENDED";
      return {
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        status: s.status,
        programme: s.program?.nameEn,
        latestGpa: s.termRecords[0]?.gpa ?? null,
        standing: latestStanding,
        atRisk,
        placementStatus: s.placementAssessment?.status || null,
      };
    });

    const stats = {
      pendingApplicants: applications.length,
      activeStudents: studentsWithStanding.filter((s) => s.status === "ACTIVE").length,
      atRiskStudents: studentsWithStanding.filter((s) => s.atRisk).length,
      graduationCandidates: graduationApplications.filter((g) => g.status === "ELIGIBLE" || g.status === "APPLIED").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        programs,
        stats,
        applicants: applications,
        students: studentsWithStanding,
        graduationCandidates: graduationApplications,
      },
    });
  } catch (error) {
    console.error("Coordinator overview GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Programme Coordinator access required", 403);

    return errorResponse("Failed to load coordinator overview", 500);
  }
}
