# -*- coding: utf-8 -*-
import io

PATH = "prisma/schema.prisma"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


# ============================================================
# 1. AdmissionApplication — new self-reported fields collected
#    at application time (Model 9 §2 application-form fields).
# ============================================================

content = r1(
    content,
    "  fullName              String\n  dateOfBirth           DateTime",
    "  fullName              String\n  preferredName         String?\n  dateOfBirth           DateTime",
    "preferredName field",
)

content = r1(
    content,
    "  programId             String?\n  programLevel          String?\n  programName           String?\n  admissionType         AdmissionType          @default(PROGRAM)",
    """  programId             String?
  programLevel          String?
  programName           String?
  // Which of the Academy's five pathways (Academy Pathways §1) the
  // applicant believes fits them — a starting point for Placement
  // (§8 of that document), never a substitute for it: the actual
  // pathway a learner enters is decided by the placement assessment
  // below, not by this preference alone.
  pathwayPreference     String?
  preferredDepartmentId String?
  specialization        String?
  studyMode             StudyMode?
  admissionType         AdmissionType          @default(PROGRAM)""",
    "pathway/department/specialization/studyMode fields",
)

content = r1(
    content,
    "  studySession          String\n  identityDocType       String",
    """  studySession          String

  // Academic background and placement self-assessment, collected at
  // application time. These are the applicant's own account, used as
  // a starting point for the actual Placement workflow (Academy
  // Pathways §8) — never treated as the placement result itself; see
  // the PlacementAssessment model below for the assessed outcome.
  islamicStudiesBackground String?         @db.Text
  quranReadingSelf         SelfRatedLevel?
  quranTajweedSelf         SelfRatedLevel?
  quranHifzSelf            SelfRatedLevel?
  quranRecitationSelf      SelfRatedLevel?
  arabicReadingSelf        SelfRatedLevel?
  arabicWritingSelf        SelfRatedLevel?
  arabicGrammarSelf        SelfRatedLevel?
  arabicVocabularySelf     SelfRatedLevel?
  arabicConversationSelf   SelfRatedLevel?
  quranicArabicSelf        SelfRatedLevel?
  learningGoals            String?         @db.Text
  supportNeeds             String?         @db.Text
  declarationAccepted      Boolean         @default(false)
  declarationAcceptedAt    DateTime?

  identityDocType       String""",
    "placement self-assessment + learning goals/support/declaration fields",
)

content = r1(
    content,
    "  payment               AdmissionPayment?\n  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)\n\n  @@index([email])\n  @@index([status])\n  @@index([createdAt])\n  @@index([countryOfResidence])\n  @@index([programId])\n}",
    """  payment               AdmissionPayment?
  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)
  preferredDepartment   Department?            @relation(fields: [preferredDepartmentId], references: [id], onDelete: SetNull)

  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@index([countryOfResidence])
  @@index([programId])
  @@index([preferredDepartmentId])
}""",
    "AdmissionApplication preferredDepartment relation + index",
)

# ============================================================
# 2. Department — back-relation for the new preference field.
# ============================================================

content = r1(
    content,
    "  complaintRequests Request[]        @relation(\"RequestRecipientDepartment\")\n\n  @@index([facultyId])\n  @@index([isActive])\n  @@index([headId])\n}",
    """  complaintRequests Request[]        @relation("RequestRecipientDepartment")
  preferredByApplicants AdmissionApplication[]

  @@index([facultyId])
  @@index([isActive])
  @@index([headId])
}""",
    "Department preferredByApplicants back-relation",
)

# ============================================================
# 3. Program — back-relation for placement recommendations.
# ============================================================

content = r1(
    content,
    "  qualityReviews         QualityReview[]\n  graduationApplications GraduationApplication[]\n\n  @@index([facultyId])\n  @@index([departmentId])\n  @@index([categoryId])\n  @@index([coordinatorId])\n  @@index([level])\n  @@index([isActive])\n}",
    """  qualityReviews         QualityReview[]
  graduationApplications GraduationApplication[]
  placementRecommendations PlacementAssessment[]

  @@index([facultyId])
  @@index([departmentId])
  @@index([categoryId])
  @@index([coordinatorId])
  @@index([level])
  @@index([isActive])
}""",
    "Program placementRecommendations back-relation",
)

# ============================================================
# 4. StaffProfile — back-relation for assessments conducted.
# ============================================================

content = r1(
    content,
    "  graduationClearances GraduationClearance[]\n  salary               StaffSalary?\n  payslips             Payslip[]",
    """  graduationClearances GraduationClearance[]
  placementAssessments PlacementAssessment[]
  salary               StaffSalary?
  payslips             Payslip[]""",
    "StaffProfile placementAssessments back-relation",
)

# ============================================================
# 5. StudentProfile — one placement assessment per student.
# ============================================================

content = r1(
    content,
    "  graduationApplication GraduationApplication?\n  graduationDocuments   GraduationDocument[]",
    """  graduationApplication GraduationApplication?
  graduationDocuments   GraduationDocument[]
  placementAssessment   PlacementAssessment?""",
    "StudentProfile placementAssessment back-relation",
)

# ============================================================
# 6. New enums: StudyMode, SelfRatedLevel, PlacementStatus.
# ============================================================

content = r1(
    content,
    "enum AdmissionType {\n  PROGRAM\n  PRIVATE_COURSE\n}",
    """enum AdmissionType {
  PROGRAM
  PRIVATE_COURSE
}

enum StudyMode {
  FULL_TIME
  PART_TIME
}

// A single self-rating scale reused for both the applicant's own
// account of their ability (AdmissionApplication, self-reported) and
// the staff-assessed outcome (PlacementAssessment, evidence-based) —
// same scale, so the two are directly comparable rather than using
// two different vocabularies for the same seven Academy Pathways §8
// placement inputs.
enum SelfRatedLevel {
  NONE
  BEGINNER
  INTERMEDIATE
  ADVANCED
  PROFICIENT
}""",
    "StudyMode + SelfRatedLevel enums",
)

content = r1(
    content,
    "enum ClearanceStatus {\n  PENDING\n  CLEARED\n  FLAGGED\n}",
    """enum ClearanceStatus {
  PENDING
  CLEARED
  FLAGGED
}

enum PlacementStatus {
  PENDING
  SCHEDULED
  IN_PROGRESS
  COMPLETED
}""",
    "PlacementStatus enum",
)

# ============================================================
# 7. New PlacementAssessment model — the actual, staff-run
#    placement workflow (Academy Pathways §8), one per student,
#    created once their AdmissionApplication is APPROVED.
# ============================================================

old_advisor_message_block = """model AdvisorMessage {
  id         String        @id @default(cuid())
  studentId  String
  senderRole MessageSender
  message    String
  isRead     Boolean       @default(false)
  createdAt  DateTime      @default(now())

  student StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@index([isRead])
}"""

new_advisor_message_block = old_advisor_message_block + """

// =====================================================================
// PLACEMENT
// The evidence-based assessment Academy Pathways §8 requires before a
// learner is confirmed into a pathway — never the applicant's own
// self-assessment alone (AdmissionApplication's *Self fields above),
// and never age. One row per student, created once their
// AdmissionApplication reaches APPROVED and administered by Academic
// Advising or the relevant Department, per that document's placement
// principle.
// =====================================================================

model PlacementAssessment {
  id        String          @id @default(cuid())
  studentId String          @unique
  status    PlacementStatus @default(PENDING)

  quranReadingLevel       SelfRatedLevel?
  quranTajweedLevel       SelfRatedLevel?
  quranHifzLevel          SelfRatedLevel?
  quranRecitationLevel    SelfRatedLevel?
  arabicReadingLevel      SelfRatedLevel?
  arabicWritingLevel      SelfRatedLevel?
  arabicGrammarLevel      SelfRatedLevel?
  arabicVocabularyLevel   SelfRatedLevel?
  arabicConversationLevel SelfRatedLevel?
  quranicArabicLevel      SelfRatedLevel?

  // The assessment's actual output: which pathway (Academy Pathways
  // §1 naming, e.g. "Foundation Studies") and, once one is chosen,
  // which specific Program the student is placed into.
  recommendedPathway   String?
  recommendedProgramId String?

  assessorNote      String?   @db.Text
  assessedByStaffId String?
  scheduledAt       DateTime?
  completedAt       DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  student            StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  recommendedProgram Program?       @relation(fields: [recommendedProgramId], references: [id], onDelete: SetNull)
  assessedByStaff    StaffProfile?  @relation(fields: [assessedByStaffId], references: [id], onDelete: SetNull)

  @@index([status])
  @@index([recommendedProgramId])
  @@index([assessedByStaffId])
}"""

content = r1(content, old_advisor_message_block, new_advisor_message_block, "insert PlacementAssessment model")

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Model 9 schema changes applied.")
