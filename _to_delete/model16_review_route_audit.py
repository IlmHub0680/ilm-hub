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

path = "app/api/admin/admissions/[id]/review/route.ts"
c = load(path)

c = r1(
    c,
    'import { requireAdmissionsEdit } from "@/lib/permissions";',
    'import { requireAdmissionsEdit } from "@/lib/permissions";\n'
    'import { logAdmissionEvent } from "@/lib/admissionAudit";',
    "review route: import audit logger",
)

c = r1(
    c,
    "    await requireAdmissionsEdit();",
    "    const actor = await requireAdmissionsEdit();",
    "review route: capture actor",
)

c = r1(
    c,
    "    const updated = await prisma.admissionApplication.update({\n"
    "      where: { id },\n"
    '      data: { status: "UNDER_REVIEW" },\n'
    "      include: { payment: true },\n"
    "    });\n"
    "\n"
    "    return NextResponse.json({\n"
    "      success: true,\n"
    '      message: "Admission application moved to review.",\n'
    "      data: updated,\n"
    "    });",
    "    const updated = await prisma.admissionApplication.update({\n"
    "      where: { id },\n"
    '      data: { status: "UNDER_REVIEW" },\n'
    "      include: { payment: true },\n"
    "    });\n"
    "\n"
    "    await logAdmissionEvent({\n"
    "      applicationId: id,\n"
    '      action: "MOVED_TO_REVIEW",\n'
    '      fromStatus: "PAID",\n'
    '      toStatus: "UNDER_REVIEW",\n'
    "      actorUserId: actor.id,\n"
    "      actorName: actor.name,\n"
    "    });\n"
    "\n"
    "    return NextResponse.json({\n"
    "      success: true,\n"
    '      message: "Admission application moved to review.",\n'
    "      data: updated,\n"
    "    });",
    "review route: audit log the transition",
)

save(path, c)
print("app/api/admin/admissions/[id]/review/route.ts: now writes an audit trail entry too.")
