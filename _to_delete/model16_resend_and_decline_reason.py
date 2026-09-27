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

# =======================================================================
# prisma/schema.prisma -- add declineReason so a REJECTED decision can
# carry an optional, respectful reason (Model 16: "Declined applications
# get a respectful message with an optional reason").
# =======================================================================
path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "  status                StudentAdmissionStatus @default(PENDING_PAYMENT)\n"
    "  createdAt             DateTime               @default(now())",
    "  status                StudentAdmissionStatus @default(PENDING_PAYMENT)\n"
    "  declineReason         String?                @db.Text\n"
    "  createdAt             DateTime               @default(now())",
    "schema: add declineReason to AdmissionApplication",
)

save(path, c)
print("prisma/schema.prisma: AdmissionApplication.declineReason added.")

# =======================================================================
# app/api/admin/admissions/[id]/decision/route.ts -- accept an optional
# reason on REJECTED, store it, and send the applicant a real email
# through the (previously unused) Resend client on both outcomes.
# =======================================================================
path = "app/api/admin/admissions/[id]/decision/route.ts"
c = load(path)

c = r1(
    c,
    'import { generateStudentNumber } from "@/lib/studentNumber";\n'
    "import crypto from \"crypto\";",
    'import { generateStudentNumber } from "@/lib/studentNumber";\n'
    'import {\n'
    '  sendAdmissionApprovedEmail,\n'
    '  sendAdmissionDeclinedEmail,\n'
    '} from "@/lib/admissionEmails";\n'
    "import crypto from \"crypto\";",
    "decision route: import admission email senders",
)

c = r1(
    c,
    "    const application = await prisma.admissionApplication.findUnique({\n"
    "      where: { id },\n"
    "      include: { payment: true, program: true },\n"
    "    });",
    "    const application = await prisma.admissionApplication.findUnique({\n"
    "      where: { id },\n"
    "      include: {\n"
    "        payment: true,\n"
    "        program: { include: { department: true } },\n"
    "      },\n"
    "    });",
    "decision route: include program.department for the approval email",
)

c = r1(
    c,
    "    const decision =\n"
    "      typeof body.decision === \"string\"\n"
    "        ? body.decision.trim().toUpperCase()\n"
    "        : \"\";",
    "    const decision =\n"
    "      typeof body.decision === \"string\"\n"
    "        ? body.decision.trim().toUpperCase()\n"
    "        : \"\";\n"
    "\n"
    "    // Optional, staff-authored, applicant-visible reason for a decline.\n"
    "    // No appeals process is implied or offered here -- this is purely a\n"
    "    // courtesy explanation, exactly as Model 16 asks for.\n"
    "    const declineReason =\n"
    "      typeof body.reason === \"string\" && body.reason.trim()\n"
    "        ? body.reason.trim().slice(0, 2000)\n"
    "        : null;",
    "decision route: parse optional decline reason",
)

c = r1(
    c,
    "    if (decision === \"REJECTED\") {\n"
    "      const updated = await prisma.admissionApplication.update({\n"
    "        where: { id },\n"
    '        data: { status: "REJECTED" },\n'
    "        include: { payment: true },\n"
    "      });\n"
    "\n"
    "      return NextResponse.json({\n"
    "        success: true,\n"
    '        message: "Student admission rejected successfully.",\n'
    "        data: updated,\n"
    "      });\n"
    "    }",
    "    if (decision === \"REJECTED\") {\n"
    "      const updated = await prisma.admissionApplication.update({\n"
    "        where: { id },\n"
    '        data: { status: "REJECTED", declineReason },\n'
    "        include: { payment: true },\n"
    "      });\n"
    "\n"
    "      const emailResult = await sendAdmissionDeclinedEmail({\n"
    "        to: updated.email,\n"
    "        applicantName: updated.fullName,\n"
    "        applicationNumber: updated.applicationNumber,\n"
    "        reason: declineReason,\n"
    "      });\n"
    "\n"
    "      return NextResponse.json({\n"
    "        success: true,\n"
    '        message: "Student admission rejected successfully.",\n'
    "        data: updated,\n"
    "        emailSent: emailResult.sent,\n"
    "      });\n"
    "    }",
    "decision route: store declineReason, send decline email",
)

c = r1(
    c,
    "    return NextResponse.json({\n"
    "      success: true,\n"
    "      message:\n"
    '        "Student admission approved and student account created successfully.",\n'
    "      data: {\n"
    "        application: result.application,\n"
    "        student: {\n"
    "          id: result.user.id,\n"
    "          name: result.user.name,\n"
    "          email: result.user.email,\n"
    "          role: result.user.role,\n"
    "        },\n"
    "        studentProfile: {\n"
    "          id: result.studentProfile.id,\n"
    "          studentNo: result.studentProfile.studentNo,\n"
    "          status: result.studentProfile.status,\n"
    "        },\n"
    "      },\n"
    "    });",
    "    const emailResult = await sendAdmissionApprovedEmail({\n"
    "      to: result.application.email,\n"
    "      applicantName: result.application.fullName,\n"
    "      applicationNumber: result.application.applicationNumber,\n"
    "      programName: application.program?.nameEn || null,\n"
    "      departmentName: application.program?.department?.nameEn || null,\n"
    "      studentNo: result.studentProfile.studentNo,\n"
    "    });\n"
    "\n"
    "    return NextResponse.json({\n"
    "      success: true,\n"
    "      message:\n"
    '        "Student admission approved and student account created successfully.",\n'
    "      data: {\n"
    "        application: result.application,\n"
    "        student: {\n"
    "          id: result.user.id,\n"
    "          name: result.user.name,\n"
    "          email: result.user.email,\n"
    "          role: result.user.role,\n"
    "        },\n"
    "        studentProfile: {\n"
    "          id: result.studentProfile.id,\n"
    "          studentNo: result.studentProfile.studentNo,\n"
    "          status: result.studentProfile.status,\n"
    "        },\n"
    "      },\n"
    "      emailSent: emailResult.sent,\n"
    "    });",
    "decision route: send dynamic congratulations email on approval",
)

save(path, c)
print("app/api/admin/admissions/[id]/decision/route.ts: sends real approval/decline emails via Resend.")
