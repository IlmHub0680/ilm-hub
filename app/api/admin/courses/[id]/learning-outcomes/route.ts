import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_DEPTHS = ["INTRODUCED", "DEVELOPED", "REINFORCED", "MASTERED"];

// Course Learning Outcomes (Model 30 §4/§6) -- a course's own outcome
// statements, each optionally traced up to one of its programme's
// approved Program Learning Outcomes with a depth level (introduced /
// developed / reinforced / mastered). Leaving programLearningOutcomeId
// unset is valid -- not every course-level outcome has to map to a
// programme outcome, but the ones that do are what curriculum review
// (§4) actually checks for coherent progression.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, titleEn: true, programId: true },
    });
    if (!course) return errorResponse("Course not found", 404);

    const [outcomes, programOutcomes] = await Promise.all([
      prisma.courseLearningOutcome.findMany({
        where: { courseId: id },
        include: { programLearningOutcome: { select: { id: true, code: true, statementEn: true } } },
        orderBy: { code: "asc" },
      }),
      course.programId
        ? prisma.programLearningOutcome.findMany({
            where: { programId: course.programId, isActive: true },
            select: { id: true, code: true, statementEn: true },
            orderBy: { code: "asc" },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      course: { id: course.id, title: course.titleEn, programId: course.programId },
      availableProgramOutcomes: programOutcomes,
      data: outcomes.map((o) => ({
        id: o.id,
        code: o.code,
        statementEn: o.statementEn,
        statementAr: o.statementAr,
        depth: o.depth,
        assessmentMethods: o.assessmentMethods,
        programLearningOutcome: o.programLearningOutcome
          ? { id: o.programLearningOutcome.id, code: o.programLearningOutcome.code, statementEn: o.programLearningOutcome.statementEn }
          : null,
      })),
    });
  } catch (error: any) {
    console.error("GET course learning outcomes error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA access required", 403);
    return errorResponse("Failed to load course learning outcomes", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");
    const { id } = await params;

    const course = await prisma.course.findUnique({ where: { id }, select: { id: true, programId: true } });
    if (!course) return errorResponse("Course not found", 404);

    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const statementEn = typeof body.statementEn === "string" ? body.statementEn.trim() : "";
    const statementAr = typeof body.statementAr === "string" ? body.statementAr.trim() || null : null;
    const depth = VALID_DEPTHS.includes(body.depth) ? body.depth : null;
    const assessmentMethods =
      typeof body.assessmentMethods === "string" ? body.assessmentMethods.trim() || null : null;
    const programLearningOutcomeId =
      typeof body.programLearningOutcomeId === "string" ? body.programLearningOutcomeId.trim() || null : null;

    if (!code) return errorResponse("A short code (e.g. CLO1) is required", 400);
    if (!statementEn) return errorResponse("An outcome statement is required", 400);

    if (programLearningOutcomeId) {
      const plo = await prisma.programLearningOutcome.findUnique({ where: { id: programLearningOutcomeId } });
      if (!plo) return errorResponse("Selected programme learning outcome not found", 404);
      if (course.programId && plo.programId !== course.programId) {
        return errorResponse("That programme learning outcome does not belong to this course's programme", 400);
      }
    }

    const existing = await prisma.courseLearningOutcome.findUnique({
      where: { courseId_code: { courseId: id, code } },
    });
    if (existing) return errorResponse(`Code "${code}" is already used for this course`, 409);

    const outcome = await prisma.courseLearningOutcome.create({
      data: {
        courseId: id,
        code,
        statementEn,
        statementAr,
        depth,
        assessmentMethods,
        programLearningOutcomeId,
      },
      include: { programLearningOutcome: { select: { id: true, code: true, statementEn: true } } },
    });

    return NextResponse.json({ success: true, data: outcome }, { status: 201 });
  } catch (error: any) {
    console.error("POST course learning outcome error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA edit access required", 403);
    return errorResponse("Failed to create course learning outcome", 500);
  }
}
