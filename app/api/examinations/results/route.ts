import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The same Grade "buckets" the Instructor already enters into
// (app/api/instructor/portal/grades/route.js) -- this workflow only
// ever reads from these, never writes to them. Which bucket a given
// Exam maps to isn't always unambiguous from examType alone (a course
// can have two QUIZ-type Exam rows in a term -- quiz1 and quiz2 -- and
// a MAKEUP exam can stand in for either a midterm or a final), so the
// Examinations Officer picks/confirms it; GUESSED_BUCKET below is only
// the default the UI pre-fills.
const GRADE_FIELDS = ["quiz1", "quiz2", "assignment", "midterm", "final", "practical"] as const;
type GradeField = (typeof GRADE_FIELDS)[number];

function isGradeField(value: unknown): value is GradeField {
  return typeof value === "string" && (GRADE_FIELDS as readonly string[]).includes(value);
}

function guessBucket(examType: string): GradeField {
  if (examType === "MIDTERM") return "midterm";
  if (examType === "FINAL") return "final";
  if (examType === "QUIZ") return "quiz1";
  return "midterm"; // MAKEUP -- no reliable default, officer confirms/changes it
}

// GET /api/examinations/results -- every exam that needs a result
// verification/reconciliation pass, with LIVE counts: how many
// students are really enrolled (APPROVED) in the exam's course, and
// how many of them really have a non-null value in the Grade bucket
// this exam maps to for that course+term. Nothing here is stored or
// cached -- both counts are computed fresh from Enrollment and Grade
// on every call, so they can never drift from the real data.
export async function GET() {
  try {
    await requireModulePermission("EXAMINATIONS", "view");

    const exams = await prisma.exam.findMany({
      include: {
        course: { select: { titleEn: true } },
        term: { select: { name: true } },
        resultSubmission: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 200,
    });

    const rows = await Promise.all(
      exams.map(async (exam) => {
        const targetGradeField = exam.resultSubmission?.targetGradeField && isGradeField(exam.resultSubmission.targetGradeField)
          ? exam.resultSubmission.targetGradeField
          : guessBucket(exam.examType);

        const [enrolledCount, gradeRows] = await Promise.all([
          prisma.enrollment.count({
            where: { courseId: exam.courseId, status: "APPROVED", user: { role: "STUDENT" } },
          }),
          prisma.grade.findMany({
            where: { courseId: exam.courseId, termId: exam.termId },
            select: { studentId: true, updatedAt: true, [targetGradeField]: true },
          }),
        ]);

        // A student can have more than one Grade row for this
        // course+term (repeat/attempt history) -- take each student's
        // most recently saved row, same tie-break the Instructor
        // gradebook uses, so this count matches what the instructor
        // actually sees as current.
        const latestByStudent = new Map<string, any>();
        for (const g of gradeRows) {
          const existing = latestByStudent.get(g.studentId);
          const existingTime = existing ? new Date(existing.updatedAt).getTime() : -Infinity;
          const time = g.updatedAt ? new Date(g.updatedAt).getTime() : -Infinity;
          if (!existing || time >= existingTime) {
            latestByStudent.set(g.studentId, g);
          }
        }

        let gradedCount = 0;
        for (const g of Array.from(latestByStudent.values())) {
          const value = (g as any)[targetGradeField];
          if (value !== null && value !== undefined) gradedCount += 1;
        }

        return {
          examId: exam.id,
          courseTitle: exam.course.titleEn,
          termName: exam.term.name,
          examType: exam.examType,
          scheduledAt: exam.scheduledAt,
          venue: exam.venue,
          targetGradeField,
          enrolledCount,
          gradedCount,
          status: exam.resultSubmission?.status ?? "PENDING",
          note: exam.resultSubmission?.note ?? null,
          verifiedByUserId: exam.resultSubmission?.verifiedByUserId ?? null,
          verifiedAt: exam.resultSubmission?.verifiedAt ?? null,
        };
      })
    );

    return NextResponse.json({ results: rows, gradeFields: GRADE_FIELDS });
  } catch (error) {
    console.error("Exam results GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Examinations access required", 403);

    return errorResponse("Failed to fetch exam result verification data", 500);
  }
}

// POST /api/examinations/results -- create/update the tracking row for
// one Exam: set which Grade bucket it maps to, and/or move its
// verification status forward (PENDING -> SUBMITTED -> VERIFIED /
// RECONCILED), with an optional note for any discrepancy flagged.
// This NEVER writes to Grade -- it only records that the Examinations
// Officer checked. A real discrepancy is corrected through the
// existing Registrar-controlled GradeCorrection workflow
// (app/api/records/grade-corrections/route.ts), not through this
// endpoint.
// Body: { examId, targetGradeField?, status, note? }
export async function POST(request: Request) {
  try {
    const user = await requireModulePermission("EXAMINATIONS", "edit");

    const body = await request.json();

    const examId = typeof body.examId === "string" ? body.examId : "";
    const status = typeof body.status === "string" ? body.status : "";
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

    const VALID_STATUSES = ["PENDING", "SUBMITTED", "VERIFIED", "RECONCILED"];

    if (!examId) {
      return errorResponse("examId is required", 400);
    }
    if (!VALID_STATUSES.includes(status)) {
      return errorResponse("status must be one of: " + VALID_STATUSES.join(", "), 400);
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return errorResponse("Exam not found", 404);
    }

    let targetGradeField: GradeField;
    if (body.targetGradeField !== undefined) {
      if (!isGradeField(body.targetGradeField)) {
        return errorResponse("targetGradeField must be one of: " + GRADE_FIELDS.join(", "), 400);
      }
      targetGradeField = body.targetGradeField;
    } else {
      const existing = await prisma.examResultSubmission.findUnique({ where: { examId } });
      targetGradeField = existing && isGradeField(existing.targetGradeField)
        ? existing.targetGradeField
        : guessBucket(exam.examType);
    }

    const isVerifyingNow = status === "VERIFIED" || status === "RECONCILED";

    const submission = await prisma.examResultSubmission.upsert({
      where: { examId },
      create: {
        examId,
        targetGradeField,
        status: status as any,
        note,
        verifiedByUserId: isVerifyingNow ? user.id : null,
        verifiedAt: isVerifyingNow ? new Date() : null,
      },
      update: {
        targetGradeField,
        status: status as any,
        note,
        ...(isVerifyingNow
          ? { verifiedByUserId: user.id, verifiedAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error) {
    console.error("Exam results POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Examinations edit access required", 403);

    return errorResponse("Failed to update exam result verification", 500);
  }
}
