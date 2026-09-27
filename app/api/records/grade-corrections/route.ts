import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Model 19 Section 27 -- a controlled, logged way to change an
// ALREADY-RECORDED Grade after the fact, separate from an instructor's
// ordinary entry in app/api/instructor/portal/grades/route.js (which is
// untouched by this file and keeps working exactly as it did before).
// Every correction made here writes a GradeCorrection row capturing the
// original value, the corrected value, who made the change, and why --
// nothing here overwrites a result silently.
const CORRECTABLE_FIELDS = [
  "quiz1",
  "quiz2",
  "assignment",
  "midterm",
  "final",
  "practical",
] as const;
type CorrectableField = (typeof CORRECTABLE_FIELDS)[number];

function isCorrectableField(value: unknown): value is CorrectableField {
  return typeof value === "string" && (CORRECTABLE_FIELDS as readonly string[]).includes(value);
}

// GET /api/records/grade-corrections?gradeId=... -- the correction
// history for one Grade row, so Academic Records (or an auditor) can
// see exactly what changed and why.
export async function GET(request: Request) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    if (!gradeId) {
      return errorResponse("gradeId is required", 400);
    }

    const corrections = await prisma.gradeCorrection.findMany({
      where: { gradeId },
      orderBy: { correctedAt: "desc" },
    });

    return NextResponse.json({ corrections });
  } catch (error) {
    console.error("Grade corrections GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to fetch grade correction history", 500);
  }
}

// POST /api/records/grade-corrections -- apply and log a correction to
// one field of one already-recorded Grade.
// Body: { gradeId, fieldChanged, correctedValue, reason }
export async function POST(request: Request) {
  try {
    const user = await requireModulePermission("ACADEMIC_RECORDS", "edit");

    const body = await request.json();
    const { gradeId, fieldChanged, correctedValue, reason } = body || {};

    if (!gradeId || typeof gradeId !== "string") {
      return errorResponse("gradeId is required", 400);
    }

    if (!isCorrectableField(fieldChanged)) {
      return errorResponse(
        "fieldChanged must be one of: " + CORRECTABLE_FIELDS.join(", "),
        400
      );
    }

    if (typeof reason !== "string" || !reason.trim()) {
      return errorResponse("A reason is required for every grade correction.", 400);
    }

    let normalizedValue: number | null = null;
    if (correctedValue !== null && correctedValue !== undefined && correctedValue !== "") {
      const numeric = Number(correctedValue);
      if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
        return errorResponse("correctedValue must be a number between 0 and 100", 400);
      }
      normalizedValue = numeric;
    }

    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade) {
      return errorResponse("Grade record not found", 404);
    }

    const originalValue = (grade as Record<string, unknown>)[fieldChanged];

    const [, correction] = await prisma.$transaction([
      prisma.grade.update({
        where: { id: gradeId },
        data: { [fieldChanged]: normalizedValue },
      }),
      prisma.gradeCorrection.create({
        data: {
          gradeId,
          fieldChanged,
          originalValue: typeof originalValue === "number" ? originalValue : null,
          correctedValue: normalizedValue,
          reason: reason.trim(),
          correctedByStaffId: user.id,
          correctedByName: user.name || "Academic Records",
        },
      }),
    ]);

    return NextResponse.json({ success: true, correction });
  } catch (error) {
    console.error("Grade corrections POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Academic Records access required", 403);

    return errorResponse("Failed to apply grade correction", 500);
  }
}
