import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Program Learning Outcomes (Model 30 §6) -- the approved, programme-
// level outcome catalogue. Course Learning Outcomes (see the sibling
// [id]/learning-outcomes routes under app/api/admin/courses) trace up
// to these, so this is the first thing a programme needs before any
// course can record depth mapping against it.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");
    const { id } = await params;

    const program = await prisma.program.findUnique({ where: { id }, select: { id: true, nameEn: true } });
    if (!program) return errorResponse("Programme not found", 404);

    const outcomes = await prisma.programLearningOutcome.findMany({
      where: { programId: id },
      include: { _count: { select: { courseLearningOutcomes: true } } },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({
      success: true,
      program: { id: program.id, name: program.nameEn },
      data: outcomes.map((o) => ({
        id: o.id,
        code: o.code,
        statementEn: o.statementEn,
        statementAr: o.statementAr,
        isActive: o.isActive,
        mappedCourseOutcomeCount: o._count.courseLearningOutcomes,
      })),
    });
  } catch (error: any) {
    console.error("GET program learning outcomes error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA access required", 403);
    return errorResponse("Failed to load programme learning outcomes", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const { id } = await params;

    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) return errorResponse("Programme not found", 404);

    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const statementEn = typeof body.statementEn === "string" ? body.statementEn.trim() : "";
    const statementAr = typeof body.statementAr === "string" ? body.statementAr.trim() || null : null;

    if (!code) return errorResponse("A short code (e.g. PLO1) is required", 400);
    if (!statementEn) return errorResponse("An outcome statement is required", 400);

    const existing = await prisma.programLearningOutcome.findUnique({
      where: { programId_code: { programId: id, code } },
    });
    if (existing) return errorResponse(`Code "${code}" is already used for this programme`, 409);

    const outcome = await prisma.programLearningOutcome.create({
      data: { programId: id, code, statementEn, statementAr },
    });

    return NextResponse.json({ success: true, data: outcome }, { status: 201 });
  } catch (error: any) {
    console.error("POST program learning outcome error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to create programme learning outcome", 500);
  }
}
