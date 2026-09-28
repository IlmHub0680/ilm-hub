# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

SCHEMA = "prisma/schema.prisma"
with io.open(SCHEMA, "r", encoding="utf-8") as f:
    s = f.read()

# ---------------------------------------------------------------------
# 1. StaffProfile — new scalar fields (Instructor Profile: specialization,
#    experience, languages) + new relation fields for qualifications,
#    professional development, and performance reviews.
# ---------------------------------------------------------------------
s = r1(
    s,
    """model StaffProfile {
  id           String    @id @default(cuid())
  userId       String    @unique
  facultyId    String?
  departmentId String?
  positionId   String
  employeeNo   String    @unique
  title        String?
  isActive     Boolean   @default(true)
  joinedAt     DateTime?""",
    """model StaffProfile {
  id           String    @id @default(cuid())
  userId       String    @unique
  facultyId    String?
  departmentId String?
  positionId   String
  employeeNo   String    @unique
  title        String?
  isActive     Boolean   @default(true)
  joinedAt     DateTime?

  // Instructor Profile (Model 10) — a staff member's own teaching
  // profile, distinct from the operational fields above. Qualifications
  // (general and Islamic) and professional development are one-to-many
  // (StaffQualification / StaffDevelopmentRecord below) since a person
  // may hold several; specialization/experience/languages are simple
  // enough to keep as scalars here rather than their own tables.
  specialization  String?
  yearsExperience Int?
  languages       String[] @default([])""",
    "StaffProfile scalar fields",
)

s = r1(
    s,
    "  qualityReviews       QualityReview[]       @relation(\"QAReviewer\")\n  graduationClearances GraduationClearance[]\n  placementAssessments PlacementAssessment[]\n  salary               StaffSalary?\n  payslips             Payslip[]",
    """  qualityReviews       QualityReview[]       @relation("QAReviewer")
  qaSubjectReviews     QualityReview[]       @relation("QAStaffSubject")
  graduationClearances GraduationClearance[]
  placementAssessments PlacementAssessment[]
  salary               StaffSalary?
  payslips             Payslip[]

  qualifications              StaffQualification[]
  developmentRecords          StaffDevelopmentRecord[]
  performanceReviewsReceived  StaffPerformanceReview[] @relation("StaffPerformanceReviewee")
  performanceReviewsConducted StaffPerformanceReview[] @relation("StaffPerformanceReviewer")""",
    "StaffProfile relation fields",
)

# ---------------------------------------------------------------------
# 2. QualityReview — instructor evaluation (STAFF subject type),
#    improvement-plan tracking, and an evidence repository.
# ---------------------------------------------------------------------
s = r1(
    s,
    """model QualityReview {
  id             String         @id @default(cuid())
  subjectType    QASubjectType
  programId      String?
  courseId       String?
  departmentId   String?
  facultyId      String?
  reviewType     String
  findings       String
  recommendation String?
  status         QAReviewStatus @default(SCHEDULED)
  outcome        QAOutcome?
  followUpDate   DateTime?
  reviewedById   String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  completedAt    DateTime?

  program    Program?     @relation(fields: [programId], references: [id], onDelete: Cascade)
  course     Course?      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  department Department?  @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  faculty    Faculty?     @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  reviewedBy StaffProfile @relation("QAReviewer", fields: [reviewedById], references: [id], onDelete: Cascade)

  @@index([subjectType])
  @@index([status])
  @@index([programId])
  @@index([courseId])
  @@index([departmentId])
  @@index([facultyId])
  @@index([reviewedById])
}

enum QASubjectType {
  PROGRAM
  COURSE
  DEPARTMENT
  FACULTY
}""",
    """model QualityReview {
  id             String         @id @default(cuid())
  subjectType    QASubjectType
  programId      String?
  courseId       String?
  departmentId   String?
  facultyId      String?
  // Set when subjectType = STAFF — an instructor evaluation. Kept on
  // the same model as every other QA review type rather than a
  // parallel "InstructorEvaluation" table, since an instructor
  // evaluation is, in substance, a QualityReview whose subject happens
  // to be a person: same findings/recommendation/status/outcome shape,
  // same reviewer relation, same follow-up mechanism.
  staffId        String?
  reviewType     String
  findings       String
  recommendation String?
  status         QAReviewStatus @default(SCHEDULED)
  outcome        QAOutcome?
  // Real tracking for a recommendation that becomes a required
  // improvement plan, distinct from outcome (which grades the review
  // itself) — NOT_REQUIRED is the default so existing/typical reviews
  // are not misread as having an open plan.
  improvementStatus ImprovementPlanStatus @default(NOT_REQUIRED)
  // A lightweight evidence repository: supporting documents (an
  // observation record, a syllabus excerpt, a sample of graded work,
  // a survey export) attached directly to the review they evidence,
  // rather than a separate unlinked document store.
  evidenceUrls   String[]       @default([])
  followUpDate   DateTime?
  reviewedById   String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  completedAt    DateTime?

  program    Program?      @relation(fields: [programId], references: [id], onDelete: Cascade)
  course     Course?       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  department Department?   @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  faculty    Faculty?      @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  staff      StaffProfile? @relation("QAStaffSubject", fields: [staffId], references: [id], onDelete: Cascade)
  reviewedBy StaffProfile  @relation("QAReviewer", fields: [reviewedById], references: [id], onDelete: Cascade)

  @@index([subjectType])
  @@index([status])
  @@index([programId])
  @@index([courseId])
  @@index([departmentId])
  @@index([facultyId])
  @@index([staffId])
  @@index([reviewedById])
}

enum QASubjectType {
  PROGRAM
  COURSE
  DEPARTMENT
  FACULTY
  STAFF
}

enum ImprovementPlanStatus {
  NOT_REQUIRED
  PENDING
  IN_PROGRESS
  COMPLETED
}""",
    "QualityReview staff evaluation + improvement plan + evidence",
)

# ---------------------------------------------------------------------
# 3. Course — add the CourseEvaluation back-relation next to the other
#    course-scoped relations.
# ---------------------------------------------------------------------
s = r1(
    s,
    "  discussions       Discussion[]\n  liveClasses       LiveClass[]\n\n  @@index([categoryId])\n  @@index([programId])\n}",
    "  discussions       Discussion[]\n  liveClasses       LiveClass[]\n  evaluations       CourseEvaluation[]\n\n  @@index([categoryId])\n  @@index([programId])\n}",
    "Course evaluations back-relation",
)

# ---------------------------------------------------------------------
# 4. StudentProfile — add the CourseEvaluation back-relation.
# ---------------------------------------------------------------------
s = r1(
    s,
    "  graduationDocuments   GraduationDocument[]\n  placementAssessment   PlacementAssessment?",
    "  graduationDocuments   GraduationDocument[]\n  placementAssessment   PlacementAssessment?\n  courseEvaluations     CourseEvaluation[]",
    "StudentProfile evaluations back-relation",
)

# ---------------------------------------------------------------------
# 5. AcademicTerm — add the CourseEvaluation back-relation.
# ---------------------------------------------------------------------
s = r1(
    s,
    "  termRecords TermRecord[]\n  exams       Exam[]\n  fees        StudentFee[]\n  grades      Grade[]",
    "  termRecords TermRecord[]\n  exams       Exam[]\n  fees        StudentFee[]\n  grades      Grade[]\n  courseEvaluations CourseEvaluation[]",
    "AcademicTerm evaluations back-relation",
)

# ---------------------------------------------------------------------
# 6. New models appended at the end of the file: StaffQualification,
#    StaffDevelopmentRecord, StaffPerformanceReview (+ 2 enums),
#    CourseEvaluation.
# ---------------------------------------------------------------------
NEW_MODELS = """

// =====================================================================
// INSTRUCTOR PROFILE (Model 10)
// A staff member's qualifications, professional development, and
// performance review history — none of which existed anywhere in the
// schema before this. Kept as their own tables (rather than JSON blobs
// on StaffProfile) since each is a genuine one-to-many history a
// department head, dean, or the instructor themselves needs to browse
// and add to over time.
// =====================================================================

enum QualificationType {
  GENERAL
  ISLAMIC
}

model StaffQualification {
  id           String            @id @default(cuid())
  staffId      String
  type         QualificationType
  title        String
  institution  String?
  yearObtained Int?
  createdAt    DateTime          @default(now())

  staff StaffProfile @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
}

model StaffDevelopmentRecord {
  id             String    @id @default(cuid())
  staffId        String
  title          String
  provider       String?
  completedAt    DateTime?
  hours          Float?
  certificateUrl String?
  createdAt      DateTime  @default(now())

  staff StaffProfile @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
}

enum StaffPerformanceRating {
  NEEDS_IMPROVEMENT
  MEETS_EXPECTATIONS
  EXCEEDS_EXPECTATIONS
  OUTSTANDING
}

enum StaffPerformanceReviewStatus {
  DRAFT
  SUBMITTED
  ACKNOWLEDGED
}

// One review cycle's outcome for one staff member. Free-text `period`
// (e.g. "2026 Semester 1") rather than a relation to AcademicTerm,
// since a performance review cycle applies to all staff, not only
// those tied to a specific student-facing term.
model StaffPerformanceReview {
  id             String                       @id @default(cuid())
  staffId        String
  reviewerId     String
  period         String
  rating         StaffPerformanceRating?
  strengths      String?
  areasForGrowth String?
  status         StaffPerformanceReviewStatus @default(DRAFT)
  reviewedAt     DateTime?
  createdAt      DateTime                     @default(now())
  updatedAt      DateTime                     @updatedAt

  staff    StaffProfile @relation("StaffPerformanceReviewee", fields: [staffId], references: [id], onDelete: Cascade)
  reviewer StaffProfile @relation("StaffPerformanceReviewer", fields: [reviewerId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([reviewerId])
}

// =====================================================================
// COURSE EVALUATIONS (Model 10)
// A real, minimal student-submitted course evaluation — no such
// system existed before this. One submission per student per course
// per term; QA reads these aggregated, never attributed by name when
// isAnonymous is true (enforced at the API layer).
// =====================================================================

model CourseEvaluation {
  id               String        @id @default(cuid())
  studentId        String
  courseId         String
  termId           String?
  ratingOverall    Int
  ratingContent    Int?
  ratingInstructor Int?
  comments         String?
  isAnonymous      Boolean       @default(true)
  createdAt        DateTime      @default(now())

  student StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  course  Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  term    AcademicTerm?  @relation(fields: [termId], references: [id], onDelete: SetNull)

  @@unique([studentId, courseId, termId])
  @@index([courseId])
  @@index([termId])
}
"""

s = s.rstrip("\n") + "\n" + NEW_MODELS

with io.open(SCHEMA, "w", encoding="utf-8") as f:
    f.write(s)

print("schema.prisma updated for Model 10.")
