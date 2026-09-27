import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// PATCH: edit an existing Program Learning Outcome's text, or retire it
// (isActive: false) without deleting the historical mapping rows that
// already point to it. DELETE is intentionally not offered here -- an
// outcome that's ever been mapped from a course should be retired, not
// removed, so completed QA history stays intact (Model 30 §12).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; outcomeId: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const { outcomeId } = await params;

    const existing = await prisma.programLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!existing) return errorResponse("Programme learning outcome not found", 404);

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (typeof body.statementEn === "string" && body.statementEn.trim()) {
      data.statementEn = body.statementEn.trim();
    }
    if (typeof body.statementAr === "string") {
      data.statementAr = body.statementAr.trim() || null;
    }
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    const updated = await prisma.programLearningOutcome.update({
      where: { id: outcomeId },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH program learning outcome error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to update programme learning outcome", 500);
  }
}
