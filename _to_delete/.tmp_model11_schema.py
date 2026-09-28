# -*- coding: utf-8 -*-
import io

PATH = "prisma/schema.prisma"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


# ---------------------------------------------------------------------
# 1. Course — real approval workflow (Academic Governance already
#    flagged this as open twice: only isPublished existed, no approval
#    state). Defaults to APPROVED so the existing 42 published courses
#    are not retroactively unapproved; the coordinator creation API is
#    updated separately to start a brand-new course at DRAFT.
# ---------------------------------------------------------------------
c = r1(
    c,
    """  isPublished   Boolean  @default(false)
  categoryId    String
  programId     String?
  createdAt     DateTime @default(now())""",
    """  isPublished   Boolean  @default(false)
  categoryId    String
  programId     String?
  createdAt     DateTime @default(now())

  // Course approval workflow (Model 11) — Academic Governance already
  // named this gap twice: a course had isPublished only, no distinct
  // "approved" state a Head of Department could actually set. Defaults
  // to APPROVED so the Academy's existing, already-taught courses are
  // not silently unapproved by this migration; a course created going
  // forward through the Programme Coordinator's own creation API starts
  // at DRAFT instead (see app/api/coordinator/courses/route.js).
  approvalStatus ApprovalStatus @default(APPROVED)
  approvalNote   String?""",
    "Course approval fields",
)

# ---------------------------------------------------------------------
# 2. Program — the same real approval workflow, Dean-facing.
# ---------------------------------------------------------------------
c = r1(
    c,
    """  durationYears Int?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  faculty                Faculty                 @relation(fields: [facultyId], references: [id], onDelete: Restrict)""",
    """  durationYears Int?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Programme approval workflow (Model 11) — the Program-level twin of
  // Course.approvalStatus above; same reasoning, same default.
  approvalStatus ApprovalStatus @default(APPROVED)
  approvalNote   String?

  faculty                Faculty                 @relation(fields: [facultyId], references: [id], onDelete: Restrict)""",
    "Program approval fields",
)

# ---------------------------------------------------------------------
# 3. ApprovalStatus enum — shared by Course and Program.
# ---------------------------------------------------------------------
c = r1(
    c,
    "enum QualificationType {\n  GENERAL\n  ISLAMIC\n}",
    "enum QualificationType {\n  GENERAL\n  ISLAMIC\n}\n\n// Shared by Course and Program (Model 11) — the real approval state\n// Academic Governance already named as missing. RETURNED_FOR_REVISION\n// is distinct from DRAFT so a coordinator/HOD can see \"this was\n// reviewed and sent back\" rather than confusing it with \"never\n// submitted.\"\nenum ApprovalStatus {\n  DRAFT\n  UNDER_REVIEW\n  APPROVED\n  RETURNED_FOR_REVISION\n}",
    "ApprovalStatus enum",
)

# ---------------------------------------------------------------------
# 4. StudentProfile — back-relation to IntegrityCase.
# ---------------------------------------------------------------------
c = r1(
    c,
    "  placementAssessment   PlacementAssessment?\n  courseEvaluations     CourseEvaluation[]",
    "  placementAssessment   PlacementAssessment?\n  courseEvaluations     CourseEvaluation[]\n  integrityCases        IntegrityCase[]",
    "StudentProfile integrityCases back-relation",
)

# ---------------------------------------------------------------------
# 5. Course — back-relation to IntegrityCase.
# ---------------------------------------------------------------------
c = r1(
    c,
    "  discussions       Discussion[]\n  liveClasses       LiveClass[]\n  evaluations       CourseEvaluation[]",
    "  discussions       Discussion[]\n  liveClasses       LiveClass[]\n  evaluations       CourseEvaluation[]\n  integrityCases    IntegrityCase[]",
    "Course integrityCases back-relation",
)

# ---------------------------------------------------------------------
# 6. StaffProfile — back-relations for reporting/resolving cases.
# ---------------------------------------------------------------------
c = r1(
    c,
    "  placementAssessments PlacementAssessment[]\n  salary               StaffSalary?",
    "  placementAssessments PlacementAssessment[]\n  reportedIntegrityCases  IntegrityCase[] @relation(\"IntegrityCaseReporter\")\n  resolvedIntegrityCases  IntegrityCase[] @relation(\"IntegrityCaseResolver\")\n  salary               StaffSalary?",
    "StaffProfile integrity case back-relations",
)

# ---------------------------------------------------------------------
# 7. IntegrityCase — the real Academic Integrity system (Model 11 §2).
#    Formalizes the "proposed, not yet founder-confirmed" paragraph
#    already sitting in Course Specifications' Foundation-tier common
#    policies into an actual, working case-tracking system, matching
#    the same escalation path that paragraph already describes:
#    instructor-level for a first/minor case, Head of Department for a
#    repeat or major one, optionally engaging the existing
#    AcademicStanding process — none of that escalation logic is new,
#    only the ability to actually record and track it is.
# ---------------------------------------------------------------------
NEW_MODELS = r"""
// =====================================================================
// ACADEMIC INTEGRITY (Model 11)
// The real system behind the academic integrity paragraph already
// drafted, but marked "proposed, not yet founder-confirmed," in Course
// Specifications' Foundation-tier common policies. No case-tracking of
// any kind existed before this — violations could only be described in
// free text through the generic Request/Complaint mechanism, with
// nothing to query, no severity, and no sanction record.
// =====================================================================

enum IntegrityViolationType {
  PLAGIARISM
  CHEATING
  UNAUTHORIZED_COLLABORATION
  FALSIFICATION
  IMPERSONATION
  ASSESSMENT_MISCONDUCT
  AI_MISUSE
  OTHER
}

enum IntegrityCaseSeverity {
  MINOR
  MAJOR
}

enum IntegrityCaseStatus {
  REPORTED
  UNDER_REVIEW
  RESOLVED
  DISMISSED
}

model IntegrityCase {
  id             String                 @id @default(cuid())
  studentId      String
  courseId       String?
  violationType  IntegrityViolationType
  severity       IntegrityCaseSeverity  @default(MINOR)
  description    String
  reportedById   String
  status         IntegrityCaseStatus    @default(REPORTED)
  // What was actually applied — free text since real sanctions vary
  // (a resubmission, a grade penalty, a course fail) rather than a
  // fixed catalogue this document would otherwise have to invent.
  sanction       String?
  // True only when this case actually moved the student through the
  // existing AcademicStanding process (§9's drafted policy already
  // anticipates this for a repeat/severe case) — never a second,
  // competing standing mechanism of its own.
  standingActionTaken Boolean           @default(false)
  resolvedById   String?
  resolvedAt     DateTime?
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  student    StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course     Course?        @relation(fields: [courseId], references: [id], onDelete: SetNull)
  reportedBy StaffProfile   @relation("IntegrityCaseReporter", fields: [reportedById], references: [id], onDelete: Restrict)
  resolvedBy StaffProfile?  @relation("IntegrityCaseResolver", fields: [resolvedById], references: [id], onDelete: SetNull)

  @@index([studentId])
  @@index([courseId])
  @@index([reportedById])
  @@index([status])
}
"""

c = c.rstrip("\n") + "\n" + NEW_MODELS

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("Model 11 schema changes applied to schema.prisma")
