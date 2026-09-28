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
# lib/admissionEmails.ts -- add sendAdmissionLetterAvailableEmail,
# sent once staff finalize a Letter of Admission (Model 17 Section 23:
# "Your Letter of Admission is now available"). Same best-effort
# pattern (never throws) as the two existing admission emails.
# =======================================================================
path = "lib/admissionEmails.ts"
c = load(path)

c = r1(
    c,
    "    return { sent: true };\n"
    "  } catch (error) {\n"
    "    console.error('[admissionEmails] Failed to send approval email:', error);\n"
    "    return { sent: false, error };\n"
    "  }\n"
    "}\n"
    "\n"
    "export async function sendAdmissionDeclinedEmail(params: {",
    "    return { sent: true };\n"
    "  } catch (error) {\n"
    "    console.error('[admissionEmails] Failed to send approval email:', error);\n"
    "    return { sent: false, error };\n"
    "  }\n"
    "}\n"
    "\n"
    "export async function sendAdmissionLetterAvailableEmail(params: {\n"
    "  to: string;\n"
    "  applicantName: string;\n"
    "  applicationNumber: string;\n"
    "}): Promise<{ sent: boolean; error?: unknown }> {\n"
    "  if (!canSend()) return { sent: false };\n"
    "\n"
    "  const { to, applicantName, applicationNumber } = params;\n"
    "\n"
    "  try {\n"
    "    await resend.emails.send({\n"
    "      from: FROM_ADDRESS as string,\n"
    "      to,\n"
    "      subject: 'Your Letter of Admission Is Now Available',\n"
    "      html: `\n"
    "        <div style=\"font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;\">\n"
    "          <p>Dear ${escapeHtml(applicantName)},</p>\n"
    "          <p>\n"
    "            Your official Letter of Admission for application\n"
    "            <strong>${escapeHtml(applicationNumber)}</strong> has been finalized and is now\n"
    "            available to download from your admission tracking page.\n"
    "          </p>\n"
    "          <p>With warm regards,<br />Admissions &amp; Registration<br />Ulul Azm Institute</p>\n"
    "        </div>\n"
    "      `,\n"
    "    });\n"
    "\n"
    "    return { sent: true };\n"
    "  } catch (error) {\n"
    "    console.error('[admissionEmails] Failed to send letter-available email:', error);\n"
    "    return { sent: false, error };\n"
    "  }\n"
    "}\n"
    "\n"
    "export async function sendAdmissionDeclinedEmail(params: {",
    "admissionEmails: add sendAdmissionLetterAvailableEmail",
)

save(path, c)
print("lib/admissionEmails.ts: sendAdmissionLetterAvailableEmail added.")

# =======================================================================
# app/api/admin/admissions/[id]/route.ts -- was gated on requireAdmin()
# (ADMIN/SUPER_ADMIN role only), which silently blocked exactly the
# Registry staff (ADMISSIONS.edit permission, not necessarily the ADMIN
# role) this whole detail page exists for -- they could act on an
# application via review/notes/decision but couldn't load the page
# itself. Switched to requireAdmissionsView() to match every other
# route under this same [id] path (Model 17 Section 31/32 RBAC fix).
# =======================================================================
path = "app/api/admin/admissions/[id]/route.ts"
c = load(path)

c = r1(
    c,
    'import { requireAdmin } from "@/lib/auth";',
    'import { requireAdmissionsView } from "@/lib/permissions";',
    "admissions [id] route: import requireAdmissionsView",
)

c = r1(
    c,
    "  try {\n"
    "    await requireAdmin();\n"
    "\n"
    "    const { id } = await params;",
    "  try {\n"
    "    await requireAdmissionsView();\n"
    "\n"
    "    const { id } = await params;",
    "admissions [id] route: use requireAdmissionsView",
)

c = r1(
    c,
    "      if (error.message === \"FORBIDDEN\") {\n"
    "        return NextResponse.json(\n"
    "          {\n"
    "            success: false,\n"
    "            error: \"Administrator access required.\",\n"
    "          },\n"
    "          { status: 403 }\n"
    "        );\n"
    "      }\n"
    "    }\n"
    "\n"
    "    console.error(\"Admin admission detail error:\", error);",
    "      if (error.message === \"FORBIDDEN\") {\n"
    "        return NextResponse.json(\n"
    "          {\n"
    "            success: false,\n"
    "            error: \"Admissions access required.\",\n"
    "          },\n"
    "          { status: 403 }\n"
    "        );\n"
    "      }\n"
    "    }\n"
    "\n"
    "    console.error(\"Admin admission detail error:\", error);",
    "admissions [id] route: forbidden message wording",
)

save(path, c)
print("app/api/admin/admissions/[id]/route.ts: now uses requireAdmissionsView (Registry staff can load it).")

# =======================================================================
# app/api/admin/admissions/[id]/document/route.ts -- same RBAC gap:
# Registry staff (ADMISSIONS.view) couldn't open an applicant's
# supporting documents from the review page. Switched to
# requireAdmissionsView() for the same reason as above.
# =======================================================================
path = "app/api/admin/admissions/[id]/document/route.ts"
c = load(path)

c = r1(
    c,
    'import { requireAdmin } from "@/lib/auth";',
    'import { requireAdmissionsView } from "@/lib/permissions";',
    "admission document route: import requireAdmissionsView",
)

c = r1(
    c,
    "  try {\n"
    "    await requireAdmin();\n"
    "\n"
    "    const { id } = await params;",
    "  try {\n"
    "    await requireAdmissionsView();\n"
    "\n"
    "    const { id } = await params;",
    "admission document route: use requireAdmissionsView",
)

c = r1(
    c,
    "      if (error.message === \"FORBIDDEN\") {\n"
    "        return NextResponse.json(\n"
    "          {\n"
    "            success: false,\n"
    "            error: \"Administrator access required.\",\n"
    "          },\n"
    "          { status: 403 }\n"
    "        );\n"
    "      }\n"
    "    }\n"
    "\n"
    "    console.error(\n"
    "      \"Admin admission document error:\",\n"
    "      error\n"
    "    );",
    "      if (error.message === \"FORBIDDEN\") {\n"
    "        return NextResponse.json(\n"
    "          {\n"
    "            success: false,\n"
    "            error: \"Admissions access required.\",\n"
    "          },\n"
    "          { status: 403 }\n"
    "        );\n"
    "      }\n"
    "    }\n"
    "\n"
    "    console.error(\n"
    "      \"Admin admission document error:\",\n"
    "      error\n"
    "    );",
    "admission document route: forbidden message wording",
)

save(path, c)
print("app/api/admin/admissions/[id]/document/route.ts: now uses requireAdmissionsView (Registry staff can view documents).")

# =======================================================================
# app/api/admissions/track/route.js -- surface whether a finalized
# Letter of Admission is available, so the applicant tracking page can
# show a download link once staff have issued it (Model 17 Section 24).
# =======================================================================
path = "app/api/admissions/track/route.js"
c = load(path)

c = r1(
    c,
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
    "        },",
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
    "          // Only its FINALIZED status/existence is ever exposed here --\n"
    "          // never the row's editable draft fields.\n"
    "          admissionLetter: {\n"
    "            select: { status: true },\n"
    "          },\n"
    "        },",
    "track route: include admissionLetter status",
)

c = r1(
    c,
    "        paymentStatus:\n"
    "          application.payment?.status || 'PENDING',",
    "        admissionLetterAvailable: application.admissionLetter?.status === 'FINALIZED',\n"
    "\n"
    "        paymentStatus:\n"
    "          application.payment?.status || 'PENDING',",
    "track route: expose admissionLetterAvailable flag",
)

save(path, c)
print("app/api/admissions/track/route.js: exposes admissionLetterAvailable.")
