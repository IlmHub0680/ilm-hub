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

path = "app/api/admissions/track/route.js"
c = load(path)

c = r1(
    c,
    "    const application =\n"
    "      await prisma.admissionApplication.findUnique({\n"
    "        where: {\n"
    "          applicationNumber,\n"
    "        },\n"
    "        include: {\n"
    "          payment: true,\n"
    "        },\n"
    "      });",
    "    const application =\n"
    "      await prisma.admissionApplication.findUnique({\n"
    "        where: {\n"
    "          applicationNumber,\n"
    "        },\n"
    "        include: {\n"
    "          payment: true,\n"
    "          program: { include: { department: true } },\n"
    "          // Only ever surface APPLICANT_VISIBLE notes here -- INTERNAL\n"
    "          // notes must never reach an applicant-facing route.\n"
    "          notes: {\n"
    "            where: { visibility: 'APPLICANT_VISIBLE' },\n"
    "            orderBy: { createdAt: 'desc' },\n"
    "            select: { id: true, note: true, createdAt: true },\n"
    "          },\n"
    "        },\n"
    "      });",
    "track: include program/department + applicant-visible notes only",
)

c = r1(
    c,
    "    const isSubmitted =\n"
    "      application.status === 'UNDER_REVIEW' ||\n"
    "      application.status === 'APPROVED' ||\n"
    "      application.status === 'REJECTED';\n"
    "\n"
    "    return response({\n"
    "      success: true,\n"
    "      data: {\n"
    "        applicationNumber: application.applicationNumber,\n"
    "        applicantName: application.fullName,\n"
    "\n"
    "        programme: application.programName,\n"
    "        programmeLevel: application.programLevel,\n"
    "        studySession: application.studySession,\n"
    "\n"
    "        status: application.status,",
    "    const isSubmitted =\n"
    "      application.status === 'UNDER_REVIEW' ||\n"
    "      application.status === 'INITIAL_ACCEPTANCE' ||\n"
    "      application.status === 'PENDING_FINAL_APPROVAL' ||\n"
    "      application.status === 'APPROVED' ||\n"
    "      application.status === 'REJECTED';\n"
    "\n"
    "    // Initial Acceptance and Pending Final Approval are real progress,\n"
    "    // but neither one is final admission -- callers (the tracking\n"
    "    // page) must say so plainly rather than letting the applicant\n"
    "    // assume they've been admitted.\n"
    "    const isFinalDecision =\n"
    "      application.status === 'APPROVED' ||\n"
    "      application.status === 'REJECTED';\n"
    "\n"
    "    // A dynamic congratulations line built from this applicant's own\n"
    "    // data -- never a hardcoded message -- for the tracking page to\n"
    "    // show once approved (the same information already went out by\n"
    "    // email when the decision was made).\n"
    "    const congratulationsMessage =\n"
    "      application.status === 'APPROVED'\n"
    "        ? `Congratulations, ${application.fullName}! You have been admitted${\n"
    "            application.program?.nameEn\n"
    "              ? ` into ${application.program.nameEn}${\n"
    "                  application.program.department?.nameEn\n"
    "                    ? ` (${application.program.department.nameEn})`\n"
    "                    : ''\n"
    "                }`\n"
    "              : ''\n"
    "          } at Ulul Azm Institute.`\n"
    "        : null;\n"
    "\n"
    "    return response({\n"
    "      success: true,\n"
    "      data: {\n"
    "        applicationNumber: application.applicationNumber,\n"
    "        applicantName: application.fullName,\n"
    "\n"
    "        programme: application.programName,\n"
    "        programmeLevel: application.programLevel,\n"
    "        studySession: application.studySession,\n"
    "\n"
    "        status: application.status,\n"
    "        isFinalDecision,\n"
    "        congratulationsMessage,\n"
    "        declineReason:\n"
    "          application.status === 'REJECTED' ? application.declineReason || null : null,\n"
    "\n"
    "        // Applicant-visible notes staff have left on this application,\n"
    "        // most recent first. Internal notes are never included.\n"
    "        notes: application.notes.map((n) => ({\n"
    "          note: n.note,\n"
    "          createdAt: n.createdAt,\n"
    "        })),",
    "track: expose isFinalDecision, dynamic congratulations, declineReason, notes",
)

save(path, c)
print("app/api/admissions/track/route.js: reflects the extended workflow, notes, and dynamic messaging.")
