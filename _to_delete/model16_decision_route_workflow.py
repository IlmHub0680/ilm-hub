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

path = "app/api/admin/admissions/[id]/decision/route.ts"
c = load(path)

c = r1(
    c,
    'import {\n'
    '  sendAdmissionApprovedEmail,\n'
    '  sendAdmissionDeclinedEmail,\n'
    '} from "@/lib/admissionEmails";\n'
    "import crypto from \"crypto\";",
    'import {\n'
    '  sendAdmissionApprovedEmail,\n'
    '  sendAdmissionDeclinedEmail,\n'
    '} from "@/lib/admissionEmails";\n'
    'import { logAdmissionEvent } from "@/lib/admissionAudit";\n'
    "import crypto from \"crypto\";",
    "decision route: import audit logger",
)

# -----------------------------------------------------------------------
# Approving/declining used to require UNDER_REVIEW specifically. Now
# that Initial Acceptance and Pending Final Approval sit between Under
# Review and Approved, a decline can happen at any of those three
# review stages, but an approval can only happen from Pending Final
# Approval -- the stage the brief calls the final gate.
# -----------------------------------------------------------------------
c = r1(
    c,
    "    if (application.status !== \"UNDER_REVIEW\") {\n"
    "      return NextResponse.json(\n"
    "        {\n"
    "          success: false,\n"
    "          error:\n"
    "            \"Only applications with UNDER_REVIEW status can be approved or rejected.\",\n"
    "          currentStatus: application.status,\n"
    "        },\n"
    "        { status: 409 }\n"
    "      );\n"
    "    }",
    "    const REVIEWABLE_STATUSES = [\n"
    '      "UNDER_REVIEW",\n'
    '      "INITIAL_ACCEPTANCE",\n'
    '      "PENDING_FINAL_APPROVAL",\n'
    "    ];\n"
    "\n"
    "    if (\n"
    '      decision === "REJECTED" &&\n'
    "      !REVIEWABLE_STATUSES.includes(application.status)\n"
    "    ) {\n"
    "      return NextResponse.json(\n"
    "        {\n"
    "          success: false,\n"
    "          error:\n"
    '            "Only applications under review (Under Review, Initial Acceptance, or Pending Final Approval) can be declined.",\n'
    "          currentStatus: application.status,\n"
    "        },\n"
    "        { status: 409 }\n"
    "      );\n"
    "    }\n"
    "\n"
    "    if (\n"
    '      decision === "APPROVED" &&\n'
    '      application.status !== "PENDING_FINAL_APPROVAL"\n'
    "    ) {\n"
    "      return NextResponse.json(\n"
    "        {\n"
    "          success: false,\n"
    "          error:\n"
    '            "Applications can only be approved from Pending Final Approval. Move it through Initial Acceptance and Pending Final Approval first.",\n'
    "          currentStatus: application.status,\n"
    "        },\n"
    "        { status: 409 }\n"
    "      );\n"
    "    }",
    "decision route: per-decision status guard for the extended workflow",
)

c = r1(
    c,
    "    if (decision === \"REJECTED\") {\n"
    "      const updated = await prisma.admissionApplication.update({\n"
    "        where: { id },\n"
    '        data: { status: "REJECTED", declineReason },\n'
    "        include: { payment: true },\n"
    "      });\n"
    "\n"
    "      const emailResult = await sendAdmissionDeclinedEmail({",
    "    if (decision === \"REJECTED\") {\n"
    "      const fromStatus = application.status;\n"
    "\n"
    "      const updated = await prisma.admissionApplication.update({\n"
    "        where: { id },\n"
    '        data: { status: "REJECTED", declineReason },\n'
    "        include: { payment: true },\n"
    "      });\n"
    "\n"
    "      await logAdmissionEvent({\n"
    "        applicationId: id,\n"
    '        action: "DECLINED",\n'
    "        fromStatus,\n"
    '        toStatus: "REJECTED",\n'
    "        actorUserId: actor.id,\n"
    "        actorName: actor.name,\n"
    "        note: declineReason,\n"
    "      });\n"
    "\n"
    "      const emailResult = await sendAdmissionDeclinedEmail({",
    "decision route: audit log the decline",
)

c = r1(
    c,
    "    const emailResult = await sendAdmissionApprovedEmail({\n"
    "      to: result.application.email,",
    "    await logAdmissionEvent({\n"
    "      applicationId: id,\n"
    '      action: "APPROVED",\n'
    '      fromStatus: "PENDING_FINAL_APPROVAL",\n'
    '      toStatus: "APPROVED",\n'
    "      actorUserId: actor.id,\n"
    "      actorName: actor.name,\n"
    "    });\n"
    "\n"
    "    const emailResult = await sendAdmissionApprovedEmail({\n"
    "      to: result.application.email,",
    "decision route: audit log the approval",
)

c = r1(
    c,
    "  try {\n"
    "    await requireAdmissionsEdit();\n"
    "\n"
    "    const { id } = await params;",
    "  try {\n"
    "    const actor = await requireAdmissionsEdit();\n"
    "\n"
    "    const { id } = await params;",
    "decision route: capture actor for audit logging",
)

save(path, c)
print("app/api/admin/admissions/[id]/decision/route.ts: supports the extended workflow + audit trail.")
