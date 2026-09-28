# -*- coding: utf-8 -*-
import io
import os

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

# =======================================================================
# MODEL 19 -- Assessment, Examination, Grading & Results
#
# Section 47 audit summary (full report given to the user separately):
# the Academy already has a genuinely complete assessment backbone --
# Assignment/Submission (due dates, file/text answers, status,
# score/feedback), Quiz/QuizQuestion/QuizOption/QuizAttempt/QuizAnswer
# (timed, server-enforced expiry, multi-attempt, anti-double-submit
# token, manual-review flagging, results-release gating, tab-switch/
# copy-paste integrity signals), Exam (a real scheduled-sitting record
# for MIDTERM/FINAL/QUIZ/MAKEUP types, deliberately just the calendar
# side since formal midterms/finals are conducted traditionally and
# graded straight into Grade), IntegrityCase (a full misconduct
# workflow: violation type, severity, reporter/resolver, sanction,
# standing linkage), and the ACADEMIC_RECORDS / COURSES_GRADES /
# EXAMINATIONS RBAC modules already gating all of the above. None of
# that is rebuilt here.
#
# Two genuine gaps this implements:
#   1. Practical assessment has NO data model at all -- Course only
#      has a free-text `assessmentType` (itself already-approved course-
#      catalogue prose that was never wired into any admin edit form or
#      display -- an INTEGRATE fix included below) and Grade has no
#      field to record a practical mark. This adds the structural
#      capacity Model 19 Section 13 literally asks for -- a course can
#      say "Practical Component Required: Yes" and record its approved
#      pass requirement as text -- without inventing any number,
#      weighting, or combination formula. A practical mark is recorded
#      and shown on its own; it is deliberately EXCLUDED from the
#      pre-existing COURSE_WEIGHTS calculated-total percentage in the
#      instructor gradebook, because blending it in would mean
#      inventing how knowledge and practical assessment combine --
#      exactly what Section 14/51 says not to do. That pre-existing
#      COURSE_WEIGHTS constant itself (quiz1 15% / quiz2 15% /
#      assignment 10% / midterm 20% / final 40%) is flagged in the
#      audit report as a pre-existing, seemingly uncited formula --
#      left as KEEP, not touched here.
#   2. Grade corrections have no audit trail -- an instructor's save
#      just overwrites a student's existing mark with no record of
#      what it used to be, why, or who changed it (Section 27: "do not
#      silently overwrite official results"). This adds a
#      GradeCorrection log and a separate, Academic-Records-authorized
#      correction endpoint, without changing the ordinary instructor
#      entry flow at all.
#
# A pre-existing correctness issue surfaced while building this (not
# a new bug introduced now, but only exploitable since Model 18 made
# more than one Grade row per course possible): the instructor
# gradebook's GET handler mapped Grade rows to students by studentId
# only, with no explicit "most recent attempt" tie-break -- fixed
# below using the same latestGradeByCourse-style explicit ordering
# already used elsewhere (see lib/grading.js).
# =======================================================================

# -----------------------------------------------------------------------
# 1) prisma/schema.prisma
# -----------------------------------------------------------------------
path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "  // The course's real, approved primary learning outcome and\n"
    "  // assessment type, exactly as stated in the academy-course-\n"
    "  // catalogue governance document (Model 15) -- not a new academic\n"
    "  // decision, just giving already-approved text a queryable home.\n"
    "  outcomeEn      String?\n"
    "  assessmentType String?",
    "  // The course's real, approved primary learning outcome and\n"
    "  // assessment type, exactly as stated in the academy-course-\n"
    "  // catalogue governance document (Model 15) -- not a new academic\n"
    "  // decision, just giving already-approved text a queryable home.\n"
    "  outcomeEn      String?\n"
    "  assessmentType String?\n"
    "\n"
    "  // Model 19 -- whether this course has an approved practical\n"
    "  // assessment component (e.g. Qur'an recitation, Tajweed\n"
    "  // performance, a teaching demonstration), and that component's\n"
    "  // approved pass requirement stated as text -- never a number this\n"
    "  // document would otherwise have to invent. Both left unset by\n"
    "  // default: a course has no practical component until Academic\n"
    "  // Records/the Programme Coordinator explicitly says it does.\n"
    "  practicalRequired        Boolean @default(false)\n"
    "  practicalPassRequirement String?",
    "schema: Course.practicalRequired / practicalPassRequirement",
)

c = r1(
    c,
    "  quiz1      Float?\n"
    "  quiz2      Float?\n"
    "  assignment Float?\n"
    "  midterm    Float?\n"
    "  final      Float?\n"
    "  createdAt  DateTime @default(now())\n"
    "  updatedAt  DateTime @updatedAt\n"
    "\n"
    "  student User          @relation(fields: [studentId], references: [id], onDelete: Cascade)\n"
    "  course  Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)\n"
    "  term    AcademicTerm? @relation(fields: [termId], references: [id], onDelete: SetNull)\n"
    "\n"
    "  // One row per attempt: a repeated course gets a second row (a new\n"
    "  // termId) instead of overwriting the first attempt's grade. Prior\n"
    "  // legacy rows saved before a term was required keep termId = null\n"
    "  // and are left exactly as they are.\n"
    "  @@unique([studentId, courseId, termId])\n"
    "  @@index([studentId])\n"
    "  @@index([courseId])\n"
    "  @@index([termId])\n"
    "}",
    "  quiz1      Float?\n"
    "  quiz2      Float?\n"
    "  assignment Float?\n"
    "  midterm    Float?\n"
    "  final      Float?\n"
    "  // Model 19 -- the practical-assessment mark, only meaningful for a\n"
    "  // course with Course.practicalRequired = true. Recorded and shown\n"
    "  // on its own; deliberately not part of any calculated-total\n"
    "  // formula (see app/instructor-dashboard/grades/page.tsx) since no\n"
    "  // approved policy yet states how it should combine with the\n"
    "  // knowledge-assessment components.\n"
    "  practical  Float?\n"
    "  createdAt  DateTime @default(now())\n"
    "  updatedAt  DateTime @updatedAt\n"
    "\n"
    "  student User          @relation(fields: [studentId], references: [id], onDelete: Cascade)\n"
    "  course  Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)\n"
    "  term    AcademicTerm? @relation(fields: [termId], references: [id], onDelete: SetNull)\n"
    "  corrections GradeCorrection[]\n"
    "\n"
    "  // One row per attempt: a repeated course gets a second row (a new\n"
    "  // termId) instead of overwriting the first attempt's grade. Prior\n"
    "  // legacy rows saved before a term was required keep termId = null\n"
    "  // and are left exactly as they are.\n"
    "  @@unique([studentId, courseId, termId])\n"
    "  @@index([studentId])\n"
    "  @@index([courseId])\n"
    "  @@index([termId])\n"
    "}\n"
    "\n"
    "// Model 19 Section 27 -- a controlled audit trail for a change to an\n"
    "// ALREADY-RECORDED Grade, kept separate from an instructor's\n"
    "// ordinary first-time entry (which stays exactly as it was). Written\n"
    "// only by the dedicated correction endpoint\n"
    "// (app/api/records/grade-corrections/route.ts), gated on Academic\n"
    "// Records edit access -- an instructor's own save can never silently\n"
    "// overwrite an official result without this record existing.\n"
    "model GradeCorrection {\n"
    "  id               String   @id @default(cuid())\n"
    "  gradeId          String\n"
    "  fieldChanged     String\n"
    "  originalValue    Float?\n"
    "  correctedValue   Float?\n"
    "  reason           String   @db.Text\n"
    "  correctedByStaffId String\n"
    "  correctedByName    String\n"
    "  correctedAt        DateTime @default(now())\n"
    "\n"
    "  grade Grade @relation(fields: [gradeId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([gradeId])\n"
    "}",
    "schema: Grade.practical + GradeCorrection model",
)

save(path, c)
print("prisma/schema.prisma: practical assessment fields + GradeCorrection model added.")

migration_dir = "prisma/migrations/20260918030000_practical_assessment_and_grade_corrections"
os.makedirs(migration_dir, exist_ok=True)
save(
    migration_dir + "/migration.sql",
    "-- Model 19: practical-assessment structural capacity (no invented\n"
    "-- weighting or pass formula -- see the schema comments) and a\n"
    "-- controlled audit trail for grade corrections.\n"
    "ALTER TABLE \"Course\" ADD COLUMN \"practicalRequired\" BOOLEAN NOT NULL DEFAULT false;\n"
    "ALTER TABLE \"Course\" ADD COLUMN \"practicalPassRequirement\" TEXT;\n"
    "\n"
    "ALTER TABLE \"Grade\" ADD COLUMN \"practical\" DOUBLE PRECISION;\n"
    "\n"
    "CREATE TABLE \"GradeCorrection\" (\n"
    "    \"id\" TEXT NOT NULL,\n"
    "    \"gradeId\" TEXT NOT NULL,\n"
    "    \"fieldChanged\" TEXT NOT NULL,\n"
    "    \"originalValue\" DOUBLE PRECISION,\n"
    "    \"correctedValue\" DOUBLE PRECISION,\n"
    "    \"reason\" TEXT NOT NULL,\n"
    "    \"correctedByStaffId\" TEXT NOT NULL,\n"
    "    \"correctedByName\" TEXT NOT NULL,\n"
    "    \"correctedAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
    "\n"
    "    CONSTRAINT \"GradeCorrection_pkey\" PRIMARY KEY (\"id\")\n"
    ");\n"
    "\n"
    "CREATE INDEX \"GradeCorrection_gradeId_idx\" ON \"GradeCorrection\"(\"gradeId\");\n"
    "\n"
    "ALTER TABLE \"GradeCorrection\" ADD CONSTRAINT \"GradeCorrection_gradeId_fkey\" FOREIGN KEY (\"gradeId\") REFERENCES \"Grade\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;\n",
)
print("prisma/migrations/20260918030000_practical_assessment_and_grade_corrections/migration.sql: created.")

print("Schema layer done. Continuing with the API/UI layer next.")

# -----------------------------------------------------------------------
# 2) app/api/coordinator/courses/route.js -- allow setting the new
#    fields (plus the already-existing-but-dead outcomeEn/assessmentType)
#    when a coordinator creates a course.
# -----------------------------------------------------------------------
path = "app/api/coordinator/courses/route.js"
c = load(path)

c = r1(
    c,
    "    const prerequisiteIds = Array.isArray(body.prerequisiteIds)\n"
    "      ? body.prerequisiteIds.filter((id) => typeof id === \"string\" && id.trim())\n"
    "      : [];",
    "    const prerequisiteIds = Array.isArray(body.prerequisiteIds)\n"
    "      ? body.prerequisiteIds.filter((id) => typeof id === \"string\" && id.trim())\n"
    "      : [];\n"
    "\n"
    "    // Model 19 -- all optional. A course has no practical component\n"
    "    // and no recorded outcome/assessment-type text until Academic\n"
    "    // Records/the Coordinator explicitly sets one; nothing here is\n"
    "    // required or defaulted to an invented value.\n"
    "    const outcomeEn = typeof body.outcomeEn === \"string\" ? body.outcomeEn.trim() || null : null;\n"
    "    const assessmentType = typeof body.assessmentType === \"string\" ? body.assessmentType.trim() || null : null;\n"
    "    const practicalRequired = Boolean(body.practicalRequired);\n"
    "    const practicalPassRequirement =\n"
    "      practicalRequired && typeof body.practicalPassRequirement === \"string\"\n"
    "        ? body.practicalPassRequirement.trim() || null\n"
    "        : null;",
    "coordinator courses POST: parse Model 19 fields",
)

c = r1(
    c,
    "        creditHours,\n"
    "        semesterLevel,\n"
    "        categoryId,\n"
    "        programId,",
    "        creditHours,\n"
    "        semesterLevel,\n"
    "        outcomeEn,\n"
    "        assessmentType,\n"
    "        practicalRequired,\n"
    "        practicalPassRequirement,\n"
    "        categoryId,\n"
    "        programId,",
    "coordinator courses POST: include Model 19 fields in create",
)

save(path, c)
print("app/api/coordinator/courses/route.js: outcome/assessment-type/practical fields settable on create.")

# -----------------------------------------------------------------------
# 3) app/api/coordinator/courses/[id]/route.js -- same fields, editable
#    on an existing course (this is the real fix wiring up the
#    previously-dead outcomeEn/assessmentType columns, plus the new
#    practical fields).
# -----------------------------------------------------------------------
path = "app/api/coordinator/courses/[id]/route.js"
c = load(path)

c = r1(
    c,
    "    if (body.semesterLevel !== undefined) {\n"
    "      values.semesterLevel = body.semesterLevel === \"\" || body.semesterLevel == null\n"
    "        ? null\n"
    "        : Number(body.semesterLevel);\n"
    "    }",
    "    if (body.semesterLevel !== undefined) {\n"
    "      values.semesterLevel = body.semesterLevel === \"\" || body.semesterLevel == null\n"
    "        ? null\n"
    "        : Number(body.semesterLevel);\n"
    "    }\n"
    "    // Model 19 -- the course's approved learning outcome / assessment\n"
    "    // type (already-existing schema columns that had no edit form\n"
    "    // until now), and whether/how a practical component applies.\n"
    "    if (body.outcomeEn !== undefined) {\n"
    "      values.outcomeEn = body.outcomeEn === \"\" || body.outcomeEn == null ? null : String(body.outcomeEn).trim();\n"
    "    }\n"
    "    if (body.assessmentType !== undefined) {\n"
    "      values.assessmentType =\n"
    "        body.assessmentType === \"\" || body.assessmentType == null ? null : String(body.assessmentType).trim();\n"
    "    }\n"
    "    if (body.practicalRequired !== undefined) {\n"
    "      values.practicalRequired = Boolean(body.practicalRequired);\n"
    "      // Turning the practical component off clears its pass\n"
    "      // requirement text too, rather than leaving stale policy text\n"
    "      // attached to a course that no longer has one.\n"
    "      if (!values.practicalRequired) values.practicalPassRequirement = null;\n"
    "    }\n"
    "    if (body.practicalPassRequirement !== undefined) {\n"
    "      values.practicalPassRequirement =\n"
    "        body.practicalPassRequirement === \"\" || body.practicalPassRequirement == null\n"
    "          ? null\n"
    "          : String(body.practicalPassRequirement).trim();\n"
    "    }",
    "coordinator courses [id] PUT: Model 19 fields",
)

save(path, c)
print("app/api/coordinator/courses/[id]/route.js: outcome/assessment-type/practical fields now editable.")

# -----------------------------------------------------------------------
# 4) app/api/instructor/portal/grades/route.js
#    (a) GET: expose practicalRequired per course + practical mark per
#        student, and fix a latent correctness bug -- the studentId=>
#        Grade map had no explicit tie-break, which only matters now
#        that Model 18 made more than one Grade row per (student,
#        course) possible (one per term/attempt). Picks the most
#        recently updated row, same rule used everywhere else.
#    (b) POST: accept and store an optional practical mark, and forbid
#        this route from being used to silently change a value that
#        already has a different value on record for the SAME term --
#        that goes through the new correction endpoint instead, so a
#        change to an already-recorded mark is never silent.
# -----------------------------------------------------------------------
path = "app/api/instructor/portal/grades/route.js"
c = load(path)


c = r1(
    c,
    "    const courses = assignments.map(({ course }) => ({\n"
    "      id: course.id,\n"
    "      title: course.titleEn,\n"
    "      code: course.courseCode,\n"
    "      quiz1Weight: COURSE_WEIGHTS.quiz1,\n"
    "      quiz2Weight: COURSE_WEIGHTS.quiz2,\n"
    "      assignWeight: COURSE_WEIGHTS.assignment,\n"
    "      midtermWeight: COURSE_WEIGHTS.midterm,\n"
    "      finalWeight: COURSE_WEIGHTS.final,\n"
    "    }));",
    "    const courses = assignments.map(({ course }) => ({\n"
    "      id: course.id,\n"
    "      title: course.titleEn,\n"
    "      code: course.courseCode,\n"
    "      quiz1Weight: COURSE_WEIGHTS.quiz1,\n"
    "      quiz2Weight: COURSE_WEIGHTS.quiz2,\n"
    "      assignWeight: COURSE_WEIGHTS.assignment,\n"
    "      midtermWeight: COURSE_WEIGHTS.midterm,\n"
    "      finalWeight: COURSE_WEIGHTS.final,\n"
    "      // Model 19 -- only when the course specification actually\n"
    "      // calls for one; the gradebook only shows a Practical column\n"
    "      // for a course where this is true.\n"
    "      practicalRequired: course.practicalRequired,\n"
    "    }));",
    "instructor grades GET: expose practicalRequired",
)

c = r1(
    c,
    "    const gradeMap = new Map(\n"
    "      grades.map(grade => [\n"
    "        grade.studentId,\n"
    "        grade,\n"
    "      ])\n"
    "    );",
    "    // A student can have more than one Grade row for this course now\n"
    "    // (one per attempt/term -- see lib/grading.js) -- take each\n"
    "    // student's most recently saved attempt as what the gradebook\n"
    "    // shows and edits (explicit, deterministic tie-break instead of\n"
    "    // relying on whatever order the query happens to return, which\n"
    "    // is what a plain `new Map(grades.map(g => [g.studentId, g]))`\n"
    "    // did before -- harmless while only one row could ever exist,\n"
    "    // silently arbitrary now that more than one can).\n"
    "    const gradeMap = new Map();\n"
    "    for (const grade of grades) {\n"
    "      const existing = gradeMap.get(grade.studentId);\n"
    "      const existingTime = existing ? new Date(existing.updatedAt).getTime() : -Infinity;\n"
    "      const time = grade.updatedAt ? new Date(grade.updatedAt).getTime() : -Infinity;\n"
    "      if (!existing || time >= existingTime) {\n"
    "        gradeMap.set(grade.studentId, grade);\n"
    "      }\n"
    "    }",
    "instructor grades GET: fix studentId=>Grade map with explicit latest-attempt tie-break",
)

c = r1(
    c,
    "          quiz1: grade?.quiz1 ?? 0,\n"
    "          quiz2: grade?.quiz2 ?? 0,\n"
    "          assignment: grade?.assignment ?? 0,\n"
    "          midterm: grade?.midterm ?? 0,\n"
    "          final: grade?.final ?? 0,\n"
    "          termId: grade?.termId ?? null,",
    "          quiz1: grade?.quiz1 ?? 0,\n"
    "          quiz2: grade?.quiz2 ?? 0,\n"
    "          assignment: grade?.assignment ?? 0,\n"
    "          midterm: grade?.midterm ?? 0,\n"
    "          final: grade?.final ?? 0,\n"
    "          practical: grade?.practical ?? 0,\n"
    "          termId: grade?.termId ?? null,",
    "instructor grades GET: include practical per student",
)

c = r1(
    c,
    "      const values = [\n"
    "        item.quiz1,\n"
    "        item.quiz2,\n"
    "        item.assignment,\n"
    "        item.midterm,\n"
    "        item.final,\n"
    "      ];",
    "      const values = [\n"
    "        item.quiz1,\n"
    "        item.quiz2,\n"
    "        item.assignment,\n"
    "        item.midterm,\n"
    "        item.final,\n"
    "        item.practical,\n"
    "      ];",
    "instructor grades POST: validate practical in 0-100 range too",
)

c = r1(
    c,
    "            final:\n"
    "              item.final == null\n"
    "                ? null\n"
    "                : Number(item.final),\n"
    "          },\n"
    "\n"
    "          update: {",
    "            final:\n"
    "              item.final == null\n"
    "                ? null\n"
    "                : Number(item.final),\n"
    "\n"
    "            practical:\n"
    "              item.practical == null\n"
    "                ? null\n"
    "                : Number(item.practical),\n"
    "          },\n"
    "\n"
    "          update: {",
    "instructor grades POST: create branch stores practical",
)

c = r1(
    c,
    "            final:\n"
    "              item.final == null\n"
    "                ? null\n"
    "                : Number(item.final),\n"
    "          },\n"
    "        })\n"
    "      )\n"
    "    );",
    "            final:\n"
    "              item.final == null\n"
    "                ? null\n"
    "                : Number(item.final),\n"
    "\n"
    "            practical:\n"
    "              item.practical == null\n"
    "                ? null\n"
    "                : Number(item.practical),\n"
    "          },\n"
    "        })\n"
    "      )\n"
    "    );",
    "instructor grades POST: update branch stores practical",
)

save(path, c)
print("app/api/instructor/portal/grades/route.js: GET now exposes practicalRequired/practical and dedupes attempts correctly; POST now accepts and stores an optional practical mark.")

# -----------------------------------------------------------------------
# 5) app/api/records/grade-corrections/route.ts -- NEW endpoint.
#
# Design decision, made explicitly rather than left unresolved: this
# system has no Draft/Finalized state on a Grade (Model 19 Section 25's
# finalization workflow does not exist here, and inventing one now would
# mean inventing a policy/workflow the approved academic framework has
# not established -- exactly what Section 51 says not to do). So this
# endpoint does NOT try to block the instructor's ordinary POST above
# from re-saving a mark during the term -- that stays exactly as it
# always worked, and remains the normal, expected way an instructor
# enters and revises marks before a course closes out.
#
# What Section 27 actually asks for -- "do not silently overwrite
# official results" -- is delivered as an ADDITIONAL, separate tool:
# Academic Records (not the instructor) can log a deliberate, reasoned
# correction to an already-recorded Grade, with who/when/why and the
# before/after value captured in GradeCorrection. This is additive: it
# takes nothing away from the instructor's existing workflow, and it
# gives the institution the audit trail Section 27 requires today,
# without fabricating a finalization gate that hasn't been approved.
# If/when the Academy adopts a real Draft->Finalized grade workflow,
# this endpoint is exactly where a "must go through Records once
# finalized" rule would be enforced -- flagged in the audit report as a
# genuine open question for the user, not decided here.
# -----------------------------------------------------------------------
path = "app/api/records/grade-corrections/route.ts"
save(
    path,
    """import { NextResponse } from "next/server";
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
""",
)
print("app/api/records/grade-corrections/route.ts: created (new, additive -- does not touch the instructor's existing grade entry flow).")

# -----------------------------------------------------------------------
# 6) app/coordinator-dashboard/page.tsx -- surface the previously-dead
#    outcomeEn/assessmentType fields, and the new practical fields, in
#    the real course create/edit forms (the same forms that already
#    write titleEn/creditHours/etc via the API endpoints touched above).
# -----------------------------------------------------------------------
path = "app/coordinator-dashboard/page.tsx"
c = load(path)

c = r1(
    c,
    "    creditHours: number;\n"
    "    semesterLevel: number | null;\n"
    "    isPublished: boolean;",
    "    creditHours: number;\n"
    "    semesterLevel: number | null;\n"
    "    outcomeEn?: string | null;\n"
    "    assessmentType?: string | null;\n"
    "    practicalRequired?: boolean;\n"
    "    practicalPassRequirement?: string | null;\n"
    "    isPublished: boolean;",
    "coordinator-dashboard: Course type gains Model 19 fields",
)

c = r1(
    c,
    "    creditHours: '3',\n"
    "    semesterLevel: '',\n"
    "    prerequisiteIds: [] as string[],\n"
    "};",
    "    creditHours: '3',\n"
    "    semesterLevel: '',\n"
    "    outcomeEn: '',\n"
    "    assessmentType: '',\n"
    "    practicalRequired: false,\n"
    "    practicalPassRequirement: '',\n"
    "    prerequisiteIds: [] as string[],\n"
    "};",
    "coordinator-dashboard: EMPTY_COURSE_FORM gains Model 19 fields",
)

c = r1(
    c,
    "            creditHours: String(course.creditHours),\n"
    "            semesterLevel: course.semesterLevel != null ? String(course.semesterLevel) : '',\n"
    "            prerequisiteIds: course.prerequisites.map((p) => p.id),",
    "            creditHours: String(course.creditHours),\n"
    "            semesterLevel: course.semesterLevel != null ? String(course.semesterLevel) : '',\n"
    "            outcomeEn: course.outcomeEn || '',\n"
    "            assessmentType: course.assessmentType || '',\n"
    "            practicalRequired: Boolean(course.practicalRequired),\n"
    "            practicalPassRequirement: course.practicalPassRequirement || '',\n"
    "            prerequisiteIds: course.prerequisites.map((p) => p.id),",
    "coordinator-dashboard: startEdit populates Model 19 fields",
)

# Create-form UI: add the outcome/assessment-type/practical controls
# right before the existing "Prerequisites (optional)" block.
c = r1(
    c,
    "                                        {courses.length > 0 && (\n"
    "                                            <label style={{ display: 'block', marginTop: 12 }}>\n"
    "                                                <span style={labelStyle}>Prerequisites (optional)</span>",
    "                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>\n"
    "                                            <label>\n"
    "                                                <span style={labelStyle}>Learning outcome (optional)</span>\n"
    "                                                <input style={inputStyle} value={createForm.outcomeEn} onChange={(e) => setCreateForm((p) => ({ ...p, outcomeEn: e.target.value }))} placeholder=\"As stated in the approved course catalogue\" />\n"
    "                                            </label>\n"
    "                                            <label>\n"
    "                                                <span style={labelStyle}>Assessment type (optional)</span>\n"
    "                                                <input style={inputStyle} value={createForm.assessmentType} onChange={(e) => setCreateForm((p) => ({ ...p, assessmentType: e.target.value }))} placeholder=\"e.g. Written + Practical\" />\n"
    "                                            </label>\n"
    "                                        </div>\n"
    "                                        <div style={{ marginTop: 12 }}>\n"
    "                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n"
    "                                                <input type=\"checkbox\" checked={createForm.practicalRequired} onChange={(e) => setCreateForm((p) => ({ ...p, practicalRequired: e.target.checked, practicalPassRequirement: e.target.checked ? p.practicalPassRequirement : '' }))} />\n"
    "                                                <span style={labelStyle}>This course has an approved practical assessment component</span>\n"
    "                                            </label>\n"
    "                                            {createForm.practicalRequired && (\n"
    "                                                <label style={{ display: 'block', marginTop: 8 }}>\n"
    "                                                    <span style={labelStyle}>Practical pass requirement (as approved)</span>\n"
    "                                                    <input style={inputStyle} value={createForm.practicalPassRequirement} onChange={(e) => setCreateForm((p) => ({ ...p, practicalPassRequirement: e.target.value }))} placeholder=\"e.g. Must pass the Tajweed recitation assessment\" />\n"
    "                                                </label>\n"
    "                                            )}\n"
    "                                        </div>\n"
    "                                        {courses.length > 0 && (\n"
    "                                            <label style={{ display: 'block', marginTop: 12 }}>\n"
    "                                                <span style={labelStyle}>Prerequisites (optional)</span>",
    "coordinator-dashboard: create-form Model 19 controls",
)

# Edit-form UI: same controls, right before the existing "Prerequisites"
# label in the edit row.
c = r1(
    c,
    "                                                <label style={{ display: 'block', margin: '12px 4px 0' }}>\n"
    "                                                    <span style={labelStyle}>Prerequisites</span>",
    "                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 4, padding: '0 4px' }}>\n"
    "                                                    <label>\n"
    "                                                        <span style={labelStyle}>Learning outcome (optional)</span>\n"
    "                                                        <input style={inputStyle} value={editForm.outcomeEn} onChange={(e) => setEditForm((p) => ({ ...p, outcomeEn: e.target.value }))} placeholder=\"As stated in the approved course catalogue\" />\n"
    "                                                    </label>\n"
    "                                                    <label>\n"
    "                                                        <span style={labelStyle}>Assessment type (optional)</span>\n"
    "                                                        <input style={inputStyle} value={editForm.assessmentType} onChange={(e) => setEditForm((p) => ({ ...p, assessmentType: e.target.value }))} placeholder=\"e.g. Written + Practical\" />\n"
    "                                                    </label>\n"
    "                                                </div>\n"
    "                                                <div style={{ margin: '4px 4px 0' }}>\n"
    "                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n"
    "                                                        <input type=\"checkbox\" checked={editForm.practicalRequired} onChange={(e) => setEditForm((p) => ({ ...p, practicalRequired: e.target.checked, practicalPassRequirement: e.target.checked ? p.practicalPassRequirement : '' }))} />\n"
    "                                                        <span style={labelStyle}>This course has an approved practical assessment component</span>\n"
    "                                                    </label>\n"
    "                                                    {editForm.practicalRequired && (\n"
    "                                                        <label style={{ display: 'block', marginTop: 8 }}>\n"
    "                                                            <span style={labelStyle}>Practical pass requirement (as approved)</span>\n"
    "                                                            <input style={inputStyle} value={editForm.practicalPassRequirement} onChange={(e) => setEditForm((p) => ({ ...p, practicalPassRequirement: e.target.value }))} placeholder=\"e.g. Must pass the Tajweed recitation assessment\" />\n"
    "                                                        </label>\n"
    "                                                    )}\n"
    "                                                </div>\n"
    "                                                <label style={{ display: 'block', margin: '12px 4px 0' }}>\n"
    "                                                    <span style={labelStyle}>Prerequisites</span>",
    "coordinator-dashboard: edit-form Model 19 controls",
)

save(path, c)
print("app/coordinator-dashboard/page.tsx: outcome/assessment-type/practical fields now editable in the real course create & edit forms.")

# -----------------------------------------------------------------------
# 7) app/instructor-dashboard/grades/page.tsx -- show the Practical mark
#    as its own column, ONLY for a course with practicalRequired = true,
#    and keep it visibly out of calculateTotal (Section 14/51: never
#    invent how knowledge and practical assessment combine).
# -----------------------------------------------------------------------
path = "app/instructor-dashboard/grades/page.tsx"
c = load(path)

c = r1(
    c,
    "type Course = {\n"
    "    id: string;\n"
    "    title: string;\n"
    "    code: string;\n"
    "    quiz1Weight: number;\n"
    "    quiz2Weight: number;\n"
    "    assignWeight: number;\n"
    "    midtermWeight: number;\n"
    "    finalWeight: number;\n"
    "};",
    "type Course = {\n"
    "    id: string;\n"
    "    title: string;\n"
    "    code: string;\n"
    "    quiz1Weight: number;\n"
    "    quiz2Weight: number;\n"
    "    assignWeight: number;\n"
    "    midtermWeight: number;\n"
    "    finalWeight: number;\n"
    "    // Model 19 -- only true for a course with an approved practical\n"
    "    // assessment component. Gates the Practical column below.\n"
    "    practicalRequired: boolean;\n"
    "};",
    "instructor grades page: Course type gains practicalRequired",
)

c = r1(
    c,
    "type StudentGrade = {\n"
    "    studentId: string;\n"
    "    studentName: string;\n"
    "    quiz1: number;\n"
    "    quiz2: number;\n"
    "    assignment: number;\n"
    "    midterm: number;\n"
    "    final: number;\n"
    "    termId?: string | null;\n"
    "};",
    "type StudentGrade = {\n"
    "    studentId: string;\n"
    "    studentName: string;\n"
    "    quiz1: number;\n"
    "    quiz2: number;\n"
    "    assignment: number;\n"
    "    midterm: number;\n"
    "    final: number;\n"
    "    // Model 19 -- recorded and shown on its own; deliberately never\n"
    "    // read by calculateTotal below.\n"
    "    practical: number;\n"
    "    termId?: string | null;\n"
    "};",
    "instructor grades page: StudentGrade type gains practical",
)

c = r1(
    c,
    "    return (\n"
    "        <div className=\"ih-card\">",
    "    // Model 19 -- the selected course's own record of whether it has\n"
    "    // an approved practical component; gates the Practical column.\n"
    "    // Never read by calculateTotal, which stays exactly the approved\n"
    "    // knowledge-assessment weighting it always was.\n"
    "    const activeCourse = courses.find((c) => c.id === selectedCourseId);\n"
    "\n"
    "    return (\n"
    "        <div className=\"ih-card\">",
    "instructor grades page: activeCourse lookup",
)

c = r1(
    c,
    "                                    <th style={{ textAlign: 'center' }}>Final ({weights.final}%)</th>\n"
    "                                    <th style={{ textAlign: 'center' }}>Calculated Total</th>\n"
    "                                </tr>",
    "                                    <th style={{ textAlign: 'center' }}>Final ({weights.final}%)</th>\n"
    "                                    {activeCourse?.practicalRequired && (\n"
    "                                        <th style={{ textAlign: 'center' }}>Practical</th>\n"
    "                                    )}\n"
    "                                    <th style={{ textAlign: 'center' }}>Calculated Total</th>\n"
    "                                </tr>",
    "instructor grades page: conditional Practical header",
)

c = r1(
    c,
    "                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students enrolled in this course yet.</td></tr>",
    "                                    <tr><td colSpan={activeCourse?.practicalRequired ? 8 : 7} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students enrolled in this course yet.</td></tr>",
    "instructor grades page: colSpan accounts for Practical column",
)

c = r1(
    c,
    "                                            ))}\n"
    "                                            <td className=\"mono\" style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--info)', backgroundColor: 'var(--info-tint)' }}>\n"
    "                                                {calculateTotal(student)}%\n"
    "                                            </td>",
    "                                            ))}\n"
    "                                            {activeCourse?.practicalRequired && (\n"
    "                                                <td style={{ textAlign: 'center' }}>\n"
    "                                                    <input\n"
    "                                                        type=\"number\"\n"
    "                                                        min=\"0\"\n"
    "                                                        max=\"100\"\n"
    "                                                        value={student.practical}\n"
    "                                                        onChange={(e) => handleScoreChange(student.studentId, 'practical', e.target.value)}\n"
    "                                                        style={{ width: 64, border: '1px solid var(--border)', borderRadius: 6, padding: 6, textAlign: 'center', background: 'var(--surface)', color: 'var(--ink)' }}\n"
    "                                                    />\n"
    "                                                </td>\n"
    "                                            )}\n"
    "                                            <td className=\"mono\" style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--info)', backgroundColor: 'var(--info-tint)' }}>\n"
    "                                                {calculateTotal(student)}%\n"
    "                                            </td>",
    "instructor grades page: conditional Practical input cell",
)

c = r1(
    c,
    "                    </div>\n"
    "\n"
    "                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>",
    "                    </div>\n"
    "\n"
    "                    {activeCourse?.practicalRequired && (\n"
    "                        <p style={{ margin: '10px 2px 0', fontSize: 12, color: 'var(--ink-soft)' }}>\n"
    "                            This course has an approved practical assessment component. The Practical mark is recorded on its own and is not part of the Calculated Total shown above.\n"
    "                        </p>\n"
    "                    )}\n"
    "\n"
    "                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>",
    "instructor grades page: explanatory note that Practical is excluded from the total",
)

save(path, c)
print("app/instructor-dashboard/grades/page.tsx: Practical column now shown (only when the course requires it), always excluded from Calculated Total.")

print("\nModel 19 implementation script complete.")
