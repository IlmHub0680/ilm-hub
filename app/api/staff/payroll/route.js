import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Position an account without a StaffProfile should be enrolled under,
// so Finance can actually process payroll for them, keyed by the account's
// Role rather than a specific staff position (which this account, by
// definition, never had). Super Admin and top-level oversight admins are
// real people the institute pays too — they just never went through the
// ordinary /admin/staff onboarding flow that normally creates this row.
const AUTO_ENROLL_POSITION_BY_ROLE = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Rector",
};

// Self-service payroll view — any signed-in staff member can see their
// OWN salary structure and payslip history. Deliberately not gated by
// a Finance module permission: this is personal data about the signed-in
// user, the same way a student sees their own fee balance.
export async function GET() {
  try {
    const user = await requireUser();

    let staff = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
      include: {
        salary: true,
        payslips: { orderBy: [{ year: "desc" }, { month: "desc" }] },
      },
    });

    // Lazily enroll a top-level Admin/Super Admin into a real StaffProfile
    // the first time they open this page, so the Finance Office has an
    // actual staff record to set a salary and run payroll against —
    // rather than telling the institute's own leadership they simply
    // aren't paid.
    if (!staff && AUTO_ENROLL_POSITION_BY_ROLE[user.role]) {
      const position = await prisma.position.findUnique({
        where: { nameEn: AUTO_ENROLL_POSITION_BY_ROLE[user.role] },
      });

      if (position) {
        const created = await prisma.staffProfile.create({
          data: {
            userId: user.id,
            positionId: position.id,
            employeeNo: `EMP-${user.id.slice(0, 8).toUpperCase()}`,
          },
        });

        staff = { ...created, salary: null, payslips: [] };
      }
    }

    if (!staff) {
      return errorResponse("Only staff members have a payroll record.", 403);
    }

    return NextResponse.json({
      success: true,
      salary: staff.salary
        ? { baseSalary: staff.salary.baseSalary, allowances: staff.salary.allowances }
        : null,
      payslips: staff.payslips,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }
    console.error("Staff payroll self-service error:", error);
    return errorResponse("Unable to load your payroll information.", 500);
  }
}
