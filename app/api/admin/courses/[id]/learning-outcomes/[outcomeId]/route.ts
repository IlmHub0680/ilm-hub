import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_DEPTHS = ["INTRODUCED", "DEVELOPED", "REINFORCED", "MASTERED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; outcomeId: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const { outcomeId } = await params;

    const existing = await prisma.courseLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!existing) return errorResponse("Course learning outcome not found", 404);

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (typeof body.statementEn === "string" && body.statementEn.trim()) {
      data.statementEn = body.statementEn.trim();
    }
    if (typeof body.statementAr === "string") {
      data.statementAr = body.statementAr.trim() || null;
    }
    if (typeof body.assessmentMethods === "string") {
      data.assessmentMethods = body.assessmentMethods.trim() || null;
    }
    if (body.depth === null || VALID_DEPTHS.includes(body.depth)) {
      data.depth = body.depth;
    }
    if (body.programLearningOutcomeId === null) {
      data.programLearningOutcomeId = null;
    } else if (typeof body.programLearningOutcomeId === "string" && body.programLearningOutcomeId.trim()) {
      const plo = await prisma.programLearningOutcome.findUnique({
        where: { id: body.programLearningOutcomeId.trim() },
      });
      if (!plo) return errorResponse("Selected programme learning outcome not found", 404);
      data.programLearningOutcomeId = plo.id;
    }

    const updated = await prisma.courseLearningOutcome.update({
      where: { id: outcomeId },
      data,
      include: { programLearningOutcome: { select: { id: true, code: true, statementEn: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH course learning outcome error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to update course learning outcome", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; outcomeId: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const { outcomeId } = await params;

    const existing = await prisma.courseLearningOutcome.findUnique({ where: { id: outcomeId } });
    if (!existing) return errorResponse("Course learning outcome not found", 404);

    await prisma.courseLearningOutcome.delete({ where: { id: outcomeId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE course learning outcome error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to remove course learning outcome", 500);
  }
}
