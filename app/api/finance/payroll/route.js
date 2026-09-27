import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { computeNetPay } from "@/lib/payroll";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Every active staff member, with their salary setup (if any) and their
// most recent payslip (if any) — the Staff Payroll overview table. Full
// payslip history for one staff member lives at /api/finance/payroll/[staffId].
export async function GET() {
  try {
    await requireModulePermission("FINANCE_PAYROLL", "view");

    const staff = await prisma.staffProfile.findMany({
      where: { isActive: true },
      include: {
        user: { select: { name: true, email: true } },
        position: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
        salary: true,
        payslips: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 1,
        },
      },
      orderBy: { employeeNo: "asc" },
    });

    const data = staff.map((s) => ({
      id: s.id,
      employeeNo: s.employeeNo,
      name: s.user.name,
      email: s.user.email,
      position: s.position?.nameEn || null,
      department: s.department?.nameEn || s.faculty?.nameEn || null,
      salary: s.salary
        ? { baseSalary: s.salary.baseSalary, allowances: s.salary.allowances }
        : null,
      latestPayslip: s.payslips[0]
        ? {
            id: s.payslips[0].id,
            year: s.payslips[0].year,
            month: s.payslips[0].month,
            netPay: s.payslips[0].netPay,
            status: s.payslips[0].status,
          }
        : null,
    }));

    return NextResponse.json({ success: true, staff: data });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("You do not have permission to view payroll.", 403);
    }
    console.error("Payroll overview error:", error);
    return errorResponse("Unable to load payroll data.", 500);
  }
}

// Two real actions — not UI-only:
//  - set_salary: upsert a staff member's standing salary structure.
//  - generate_payroll: create one real Payslip per active, salaried staff
//    member for a given month, snapshotting their current salary
//    structure. Idempotent per (staff, year, month) — already-generated
//    staff for that period are skipped, never duplicated or overwritten.
export async function POST(request) {
  try {
    await requireModulePermission("FINANCE_PAYROLL", "edit");

    const body = await request.json();
    const action = body?.action;

    if (action === "set_salary") {
      const { staffId, baseSalary, allowances } = body;

      if (!staffId || typeof staffId !== "string") {
        return errorResponse("A staff member must be specified.", 400);
      }

      const base = Number(baseSalary);
      const allow = allowances === undefined || allowances === null || allowances === "" ? 0 : Number(allowances);

      if (!Number.isFinite(base) || base < 0) {
        return errorResponse("Base salary must be a valid non-negative amount.", 400);
      }
      if (!Number.isFinite(allow) || allow < 0) {
        return errorResponse("Allowances must be a valid non-negative amount.", 400);
      }

      const staff = await prisma.staffProfile.findUnique({ where: { id: staffId } });
      if (!staff) {
        return errorResponse("Staff member not found.", 404);
      }

      const salary = await prisma.staffSalary.upsert({
        where: { staffId },
        update: { baseSalary: base, allowances: allow },
        create: { staffId, baseSalary: base, allowances: allow },
      });

      return NextResponse.json({ success: true, salary });
    }

    if (action === "generate_payroll") {
      const year = Number(body.year);
      const month = Number(body.month);

      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return errorResponse("A valid year is required.", 400);
      }
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        return errorResponse("A valid month (1-12) is required.", 400);
      }

      const staffWithSalary = await prisma.staffProfile.findMany({
        where: { isActive: true, salary: { isNot: null } },
        include: { salary: true },
      });

      let created = 0;
      let skippedExisting = 0;
      const generated = [];

      for (const staff of staffWithSalary) {
        const existing = await prisma.payslip.findUnique({
          where: { staffId_year_month: { staffId: staff.id, year, month } },
        });

        if (existing) {
          skippedExisting += 1;
          continue;
        }

        const baseSalary = staff.salary.baseSalary;
        const allowances = staff.salary.allowances;
        const netPay = computeNetPay({ baseSalary, allowances, deductions: 0 });

        const payslip = await prisma.payslip.create({
          data: {
            staffId: staff.id,
            salaryId: staff.salary.id,
            year,
            month,
            baseSalary,
            allowances,
            deductions: 0,
            netPay,
            status: "PENDING",
          },
        });

        created += 1;
        generated.push(payslip);
      }

      const totalActiveStaff = await prisma.staffProfile.count({ where: { isActive: true } });
      const skippedNoSalary = totalActiveStaff - staffWithSalary.length;

      return NextResponse.json({
        success: true,
        year,
        month,
        created,
        skippedExisting,
        skippedNoSalary,
      });
    }

    return errorResponse("Unknown action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("You do not have permission to manage payroll.", 403);
    }
    console.error("Payroll action error:", error);
    return errorResponse("Unable to process this payroll action.", 500);
  }
}
