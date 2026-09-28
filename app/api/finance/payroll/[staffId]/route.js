import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { computeNetPay } from "@/lib/payroll";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// One staff member's full payroll detail: their standing salary
// structure and their complete payslip history, most recent first.
export async function GET(request, { params }) {
  try {
    await requireModulePermission("FINANCE_PAYROLL", "view");

    const { staffId } = await params;

    const staff = await prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: {
        user: { select: { name: true, email: true } },
        position: { select: { nameEn: true } },
        salary: true,
        payslips: { orderBy: [{ year: "desc" }, { month: "desc" }] },
      },
    });

    if (!staff) {
      return errorResponse("Staff member not found.", 404);
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        employeeNo: staff.employeeNo,
        name: staff.user.name,
        email: staff.user.email,
        position: staff.position?.nameEn || null,
        salary: staff.salary
          ? { baseSalary: staff.salary.baseSalary, allowances: staff.salary.allowances }
          : null,
      },
      payslips: staff.payslips,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("You do not have permission to view payroll.", 403);
    }
    console.error("Payroll detail error:", error);
    return errorResponse("Unable to load payroll detail.", 500);
  }
}

// Edit a specific payslip's deductions/note (recomputing netPay for
// real — never a manually-typed figure) and/or mark it as paid. Only
// PENDING payslips can be edited or marked paid; a PAID payslip is a
// closed financial record.
export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("FINANCE_PAYROLL", "edit");

    const { staffId } = await params;
    const body = await request.json();
    const { payslipId, deductions, note, markPaid } = body;

    if (!payslipId || typeof payslipId !== "string") {
      return errorResponse("A payslip must be specified.", 400);
    }

    const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });

    if (!payslip || payslip.staffId !== staffId) {
      return errorResponse("Payslip not found for this staff member.", 404);
    }

    if (payslip.status === "PAID") {
      return errorResponse("This payslip has already been paid and can no longer be edited.", 400);
    }

    const nextDeductions =
      deductions === undefined || deductions === null || deductions === ""
        ? payslip.deductions
        : Number(deductions);

    if (!Number.isFinite(nextDeductions) || nextDeductions < 0) {
      return errorResponse("Deductions must be a valid non-negative amount.", 400);
    }

    const netPay = computeNetPay({
      baseSalary: payslip.baseSalary,
      allowances: payslip.allowances,
      deductions: nextDeductions,
    });

    const updated = await prisma.payslip.update({
      where: { id: payslipId },
      data: {
        deductions: nextDeductions,
        netPay,
        note: note === undefined ? payslip.note : note || null,
        ...(markPaid ? { status: "PAID", paidAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, payslip: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("You do not have permission to manage payroll.", 403);
    }
    console.error("Payslip update error:", error);
    return errorResponse("Unable to update this payslip.", 500);
  }
}
