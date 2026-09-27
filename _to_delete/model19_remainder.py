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
    "                                                                <label style={{ display: 'block', margin: '12px 4px 0' }}>\n"
    "                                                                    <span style={labelStyle}>Prerequisites</span>",
    "                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 4, padding: '0 4px' }}>\n"
    "                                                                    <label>\n"
    "                                                                        <span style={labelStyle}>Learning outcome (optional)</span>\n"
    "                                                                        <input style={inputStyle} value={editForm.outcomeEn} onChange={(e) => setEditForm((p) => ({ ...p, outcomeEn: e.target.value }))} placeholder=\"As stated in the approved course catalogue\" />\n"
    "                                                                    </label>\n"
    "                                                                    <label>\n"
    "                                                                        <span style={labelStyle}>Assessment type (optional)</span>\n"
    "                                                                        <input style={inputStyle} value={editForm.assessmentType} onChange={(e) => setEditForm((p) => ({ ...p, assessmentType: e.target.value }))} placeholder=\"e.g. Written + Practical\" />\n"
    "                                                                    </label>\n"
    "                                                                </div>\n"
    "                                                                <div style={{ margin: '4px 4px 0' }}>\n"
    "                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>\n"
    "                                                                        <input type=\"checkbox\" checked={editForm.practicalRequired} onChange={(e) => setEditForm((p) => ({ ...p, practicalRequired: e.target.checked, practicalPassRequirement: e.target.checked ? p.practicalPassRequirement : '' }))} />\n"
    "                                                                        <span style={labelStyle}>This course has an approved practical assessment component</span>\n"
    "                                                                    </label>\n"
    "                                                                    {editForm.practicalRequired && (\n"
    "                                                                        <label style={{ display: 'block', marginTop: 8 }}>\n"
    "                                                                            <span style={labelStyle}>Practical pass requirement (as approved)</span>\n"
    "                                                                            <input style={inputStyle} value={editForm.practicalPassRequirement} onChange={(e) => setEditForm((p) => ({ ...p, practicalPassRequirement: e.target.value }))} placeholder=\"e.g. Must pass the Tajweed recitation assessment\" />\n"
    "                                                                        </label>\n"
    "                                                                    )}\n"
    "                                                                </div>\n"
    "                                                                <label style={{ display: 'block', margin: '12px 4px 0' }}>\n"
    "                                                                    <span style={labelStyle}>Prerequisites</span>",
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
