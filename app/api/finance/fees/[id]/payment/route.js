import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request, { params }) {
  try {
    await requireModulePermission("FINANCE_FEES", "edit");

    const { id } = await params;
    const body = await request.json();
    const paymentAmount = Number(body.paymentUSD);

    if (!id || !Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return errorResponse("A valid payment amount is required", 400);
    }

    const fee = await prisma.studentFee.findUnique({ where: { id } });

    if (!fee) {
      return errorResponse("Fee record not found", 404);
    }

    const newPaidUSD = fee.paidUSD + paymentAmount;

    let status = "PARTIAL";
    if (newPaidUSD >= fee.amountUSD) {
      status = "PAID";
    } else if (fee.dueDate && new Date() > new Date(fee.dueDate)) {
      status = "OVERDUE";
    }

    const updated = await prisma.studentFee.update({
      where: { id },
      data: { paidUSD: newPaidUSD, status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Finance payment POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance edit access required", 403);

    return errorResponse("Failed to record payment", 500);
  }
}