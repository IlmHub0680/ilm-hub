import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("FINANCE_FEES", "view");

    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { nameEn: true } },
        fees: {
          include: { term: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const terms = await prisma.academicTerm.findMany({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
      take: 10,
    });

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        studentNo: s.studentNo,
        name: s.user.name,
        email: s.user.email,
        program: s.program?.nameEn ?? null,
        fees: s.fees.map((f) => ({
          id: f.id,
          feeType: f.feeType,
          amountUSD: f.amountUSD,
          paidUSD: f.paidUSD,
          balanceUSD: f.amountUSD - f.paidUSD,
          status: f.status,
          term: f.term?.name ?? null,
          dueDate: f.dueDate,
        })),
      })),
      terms: terms.map((t) => ({ id: t.id, name: t.name })),
    });
  } catch (error) {
    console.error("Finance portal GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance access required", 403);

    return errorResponse("Failed to fetch finance data", 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("FINANCE_FEES", "edit");

    const body = await request.json();

    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const feeType = typeof body.feeType === "string" ? body.feeType.trim() : "";
    const amountUSD = Number(body.amountUSD);
    const termId = typeof body.termId === "string" && body.termId ? body.termId : null;
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    if (!studentId || !feeType || !Number.isFinite(amountUSD) || amountUSD <= 0) {
      return errorResponse("Student, fee type, and a valid amount are required", 400);
    }

    const fee = await prisma.studentFee.create({
      data: { studentId, feeType, amountUSD, termId, dueDate },
    });

    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("Finance portal POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Finance edit access required", 403);

    return errorResponse("Failed to create fee record", 500);
  }
}