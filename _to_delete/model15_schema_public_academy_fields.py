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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:100])
    return content.replace(old, new)

path = "prisma/schema.prisma"
c = load(path)

# StaffProfile: two additive, nullable fields for the public Faculty
# directory (Model 15 Section 10) -- no existing field covers a
# biography or profile photo anywhere in the schema.
c = r1(
    c,
    "  specialization  String?\n"
    "  yearsExperience Int?\n"
    "  languages       String[] @default([])\n",
    "  specialization  String?\n"
    "  yearsExperience Int?\n"
    "  languages       String[] @default([])\n"
    "\n"
    "  // Public Faculty profile (Model 15) -- both optional and unset by\n"
    "  // default; a staff member only appears on the public Faculty page\n"
    "  // with a photo/bio once someone actually supplies them. Never a\n"
    "  // personal email or phone number -- those stay off the public API\n"
    "  // regardless of what's added here.\n"
    "  bio      String?\n"
    "  photoUrl String?\n",
    "StaffProfile: add bio + photoUrl",
)

# Course: two additive, nullable fields carrying the real, already-
# approved per-course outcome/assessment text out of the static
# academy-course-catalogue document and onto the actual Course row, so
# a public course listing can show it without sending every visitor to
# a governance document. Populated by a follow-up content script
# (model15_course_outcomes.cjs), never invented here.
c = r1(
    c,
    "  approvalStatus ApprovalStatus @default(APPROVED)\n"
    "  approvalNote   String?\n"
    "\n"
    "  // Curriculum sequencing for real automatic course assignment",
    "  approvalStatus ApprovalStatus @default(APPROVED)\n"
    "  approvalNote   String?\n"
    "\n"
    "  // The course's real, approved primary learning outcome and\n"
    "  // assessment type, exactly as stated in the academy-course-\n"
    "  // catalogue governance document (Model 15) -- not a new academic\n"
    "  // decision, just giving already-approved text a queryable home.\n"
    "  outcomeEn      String?\n"
    "  assessmentType String?\n"
    "\n"
    "  // Curriculum sequencing for real automatic course assignment",
    "Course: add outcomeEn + assessmentType",
)

save(path, c)
print("prisma/schema.prisma: StaffProfile.bio/photoUrl + Course.outcomeEn/assessmentType added.")
