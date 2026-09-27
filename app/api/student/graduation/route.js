import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { computeGraduationEligibility } from "@/lib/graduationEligibility";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Offices whose sign-off is required before a graduation application can
// be approved. Real Unit rows of these types are turned into a
// GraduationClearance row automatically when a student applies; adding
// another office here (or seeding a new active Unit of one of these
// types) is the only change needed to extend the checklist.
const CLEARANCE_UNIT_TYPES = [
  "LIBRARY",
  "FINANCE",
  "ACADEMIC_ADMINISTRATION",
  "STUDENT_AFFAIRS",
];

async function loadApplication(studentId) {
  return prisma.graduationApplication.findUnique({
    where: { studentId },
    include: {
      program: { select: { nameEn: true, level: true } },
      clearances: {
        include: {
          unit: { select: { nameEn: true, nameAr: true, type: true } },
          clearedByStaff: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
      documents: {
        orderBy: { issuedAt: "asc" },
      },
    },
  });
}

export async function GET() {
  try {
    const user = await requireUser();

    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });

    if (!student) {
      return errorResponse("Only students can view graduation status", 403);
    }

    const application = await loadApplication(student.id);
    const eligibility = await computeGraduationEligibility(student.id);

    return NextResponse.json({ success: true, data: application, eligibility });
  } catch (error) {
    console.error("Get graduation application error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);

    return errorResponse("Failed to load graduation status", 500);
  }
}

export async function POST() {
  try {
    const user = await requireUser();

    const student = await prisma.studentProfile.findUnique({ where: { userId: user.id } });

    if (!student) {
      return errorResponse("Only students can apply for graduation", 403);
    }

    const existing = await prisma.graduationApplication.findUnique({
      where: { studentId: student.id },
    });

    if (existing) {
      return errorResponse("You already have a graduation application on file", 409);
    }

    // Server-authoritative eligibility gate. The student portal disables
    // the "Apply for Graduation" button until every requirement is met,
    // but that is cosmetic — this is the real enforcement, so a direct
    // API call can never create an application ahead of actual
    // eligibility (completed levels, study plan, passed required
    // courses, credit hours, and standing — see
    // lib/graduationEligibility.js).
    const eligibility = await computeGraduationEligibility(student.id);

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error:
            eligibility.reasons[0] ||
            "You are not yet eligible to apply for graduation.",
          reasons: eligibility.reasons,
        },
        { status: 403 }
      );
    }

    const clearanceUnits = await prisma.unit.findMany({
      where: { isActive: true, type: { in: CLEARANCE_UNIT_TYPES } },
      select: { id: true },
    });

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.graduationApplication.create({
        data: {
          studentId: student.id,
          programId: student.programId,
          status: "APPLIED",
          appliedAt: new Date(),
        },
      });

      if (clearanceUnits.length > 0) {
        await tx.graduationClearance.createMany({
          data: clearanceUnits.map((u) => ({
            applicationId: created.id,
            unitId: u.id,
          })),
        });
      }

      return created;
    });

    const full = await loadApplication(student.id);

    return NextResponse.json({ success: true, data: full || application });
  } catch (error) {
    console.error("Create graduation application error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);

    return errorResponse("Failed to submit graduation application", 500);
  }
}
