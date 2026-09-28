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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:120])
    return content.replace(old, new)

path = "prisma/schema.prisma"
c = load(path)

# -----------------------------------------------------------------------
# Extend the workflow enum with the two intermediate states Model 16
# asks for, so "approved" is never the only step after "under review"
# and an applicant is never told they're in before the decision is
# actually final.
# -----------------------------------------------------------------------
c = r1(
    c,
    "enum StudentAdmissionStatus {\n"
    "  PENDING_PAYMENT\n"
    "  PAID\n"
    "  UNDER_REVIEW\n"
    "  APPROVED\n"
    "  REJECTED\n"
    "}",
    "enum StudentAdmissionStatus {\n"
    "  PENDING_PAYMENT\n"
    "  PAID\n"
    "  UNDER_REVIEW\n"
    "  // Model 16: applicant has cleared initial review but this is NOT\n"
    "  // final admission -- Pending Final Approval still has to happen.\n"
    "  INITIAL_ACCEPTANCE\n"
    "  // Model 16: awaiting the final approval decision. Still not final.\n"
    "  PENDING_FINAL_APPROVAL\n"
    "  APPROVED\n"
    "  // Displayed to applicants as \"Declined\" (see app/admission/track and\n"
    "  // the admin admissions UI) -- the enum value itself is left as\n"
    "  // REJECTED rather than renamed, since it is already referenced by\n"
    "  // real application rows and by status checks throughout the\n"
    "  // codebase; renaming the value itself is a larger, separate change\n"
    "  // if wanted later.\n"
    "  REJECTED\n"
    "}",
    "schema: extend StudentAdmissionStatus with the two intermediate states",
)

# -----------------------------------------------------------------------
# Internal vs Applicant-Visible admission notes, and an audit trail for
# admission decisions -- neither existed before. Model 16 explicitly
# requires both to be clearly separated, with an audit trail for who
# changed what and when.
# -----------------------------------------------------------------------
c = r1(
    c,
    "model User {\n"
    "  id                String       @id\n",
    "enum NoteVisibility {\n"
    "  // Staff-only. Never returned by any applicant-facing route.\n"
    "  INTERNAL\n"
    "  // Shown to the applicant on their tracking page.\n"
    "  APPLICANT_VISIBLE\n"
    "}\n"
    "\n"
    "model AdmissionNote {\n"
    "  id            String         @id @default(cuid())\n"
    "  applicationId String\n"
    "  visibility    NoteVisibility @default(INTERNAL)\n"
    "  note          String         @db.Text\n"
    "  authorStaffId String?\n"
    "  authorName    String\n"
    "  createdAt     DateTime       @default(now())\n"
    "\n"
    "  application AdmissionApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([applicationId])\n"
    "  @@index([visibility])\n"
    "}\n"
    "\n"
    "// Every admission status transition and decision gets a row here --\n"
    "// who did it, when, and the before/after status. This is what Model\n"
    "// 16's \"full audit trail for admission decisions\" requirement is\n"
    "// built on; nothing like it existed before.\n"
    "model AdmissionAuditLog {\n"
    "  id            String   @id @default(cuid())\n"
    "  applicationId String\n"
    "  action        String\n"
    "  fromStatus    String?\n"
    "  toStatus      String?\n"
    "  actorUserId   String?\n"
    "  actorName     String?\n"
    "  note          String?  @db.Text\n"
    "  createdAt     DateTime @default(now())\n"
    "\n"
    "  application AdmissionApplication @relation(fields: [applicationId], references: [id], onDelete: Cascade)\n"
    "\n"
    "  @@index([applicationId])\n"
    "  @@index([createdAt])\n"
    "}\n"
    "\n"
    "model User {\n"
    "  id                String       @id\n",
    "schema: add NoteVisibility, AdmissionNote, AdmissionAuditLog",
)

c = r1(
    c,
    "  payment               AdmissionPayment?\n"
    "  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)",
    "  payment               AdmissionPayment?\n"
    "  notes                 AdmissionNote[]\n"
    "  auditLogs             AdmissionAuditLog[]\n"
    "  program               Program?               @relation(fields: [programId], references: [id], onDelete: Restrict)",
    "schema: relate AdmissionApplication to notes + audit logs",
)

save(path, c)
print("prisma/schema.prisma: 6-state workflow, AdmissionNote, AdmissionAuditLog added.")
