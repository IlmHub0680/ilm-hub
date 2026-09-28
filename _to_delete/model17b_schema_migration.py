# -*- coding: utf-8 -*-
import io

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
# prisma/schema.prisma
#   1. New AdmissionLetterStatus enum + AdmissionLetter model, inserted
#      right after AdmissionAuditLog (mirrors AdmissionNote/AuditLog's
#      own placement pattern).
#   2. New `admissionLetter` back-relation on AdmissionApplication.
# =======================================================================
path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "  application AdmissionApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([applicationId])\n"
    "  @@index([createdAt])\n"
    "}\n"
    "\n"
    "model User {",
    "  application AdmissionApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([applicationId])\n"
    "  @@index([createdAt])\n"
    "}\n"
    "\n"
    "// Model 17 (Registry, Admission Decisions & Admission Documents).\n"
    "// The Letter of Admission workflow: Generate (DRAFT, editable) ->\n"
    "// Review -> Finalize (locked, official PDF). A correction after\n"
    "// finalization reopens the letter (status back to DRAFT, version\n"
    "// incremented) rather than silently overwriting the issued document\n"
    "// -- the prior version is preserved in `previousVersions` for\n"
    "// traceability. One letter per application; the applicant only ever\n"
    "// sees the current FINALIZED pdfUrl (via /api/admissions/track/letter\n"
    "// and the student portal), never a DRAFT.\n"
    "enum AdmissionLetterStatus {\n"
    "  DRAFT\n"
    "  FINALIZED\n"
    "}\n"
    "\n"
    "model AdmissionLetter {\n"
    "  id                 String                @id @default(cuid())\n"
    "  applicationId      String                @unique\n"
    "  status             AdmissionLetterStatus @default(DRAFT)\n"
    "  version            Int                   @default(1)\n"
    "  programmeText      String?\n"
    "  departmentText     String?\n"
    "  qualificationText  String?\n"
    "  intakeSession      String?\n"
    "  admissionDate      DateTime?\n"
    "  conditions         String?               @db.Text\n"
    "  signatoryName      String?\n"
    "  signatoryTitle     String?\n"
    "  pdfUrl             String?\n"
    "  previousVersions   Json?\n"
    "  generatedByStaffId String?\n"
    "  generatedByName    String?\n"
    "  finalizedByStaffId String?\n"
    "  finalizedByName    String?\n"
    "  finalizedAt        DateTime?\n"
    "  createdAt          DateTime              @default(now())\n"
    "  updatedAt          DateTime              @updatedAt\n"
    "\n"
    "  application AdmissionApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([applicationId])\n"
    "  @@index([status])\n"
    "}\n"
    "\n"
    "model User {",
    "schema: insert AdmissionLetterStatus enum + AdmissionLetter model after AdmissionAuditLog",
)

c = r1(
    c,
    "  payment               AdmissionPayment?\n"
    "  notes                 AdmissionNote[]\n"
    "  auditLogs             AdmissionAuditLog[]\n"
    "  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)",
    "  payment               AdmissionPayment?\n"
    "  notes                 AdmissionNote[]\n"
    "  auditLogs             AdmissionAuditLog[]\n"
    "  admissionLetter       AdmissionLetter?\n"
    "  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)",
    "schema: add admissionLetter back-relation on AdmissionApplication",
)

save(path, c)
print("prisma/schema.prisma: AdmissionLetter model + relation added.")
