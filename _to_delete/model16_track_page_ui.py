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

path = "app/admission/track/page.jsx"
c = load(path)

c = r1(
    c,
    "const STATUS_LABELS = {\n"
    "  PENDING_PAYMENT: 'Pending Payment',\n"
    "  PAID: 'Paid — Awaiting Submission',\n"
    "  UNDER_REVIEW: 'Under Review',\n"
    "  APPROVED: 'Approved',\n"
    "  REJECTED: 'Not Approved',\n"
    "};\n"
    "\n"
    "const STATUS_COLORS = {\n"
    "  PENDING_PAYMENT: 'var(--warning)',\n"
    "  PAID: 'var(--info)',\n"
    "  UNDER_REVIEW: 'var(--gold-dark)',\n"
    "  APPROVED: 'var(--success)',\n"
    "  REJECTED: 'var(--danger)',\n"
    "};",
    "const STATUS_LABELS = {\n"
    "  PENDING_PAYMENT: 'Pending Payment',\n"
    "  PAID: 'Paid — Awaiting Submission',\n"
    "  UNDER_REVIEW: 'Under Review',\n"
    "  INITIAL_ACCEPTANCE: 'Initial Acceptance',\n"
    "  PENDING_FINAL_APPROVAL: 'Pending Final Approval',\n"
    "  APPROVED: 'Approved',\n"
    "  REJECTED: 'Declined',\n"
    "};\n"
    "\n"
    "const STATUS_COLORS = {\n"
    "  PENDING_PAYMENT: 'var(--warning)',\n"
    "  PAID: 'var(--info)',\n"
    "  UNDER_REVIEW: 'var(--gold-dark)',\n"
    "  INITIAL_ACCEPTANCE: 'var(--gold-dark)',\n"
    "  PENDING_FINAL_APPROVAL: 'var(--gold-dark)',\n"
    "  APPROVED: 'var(--success)',\n"
    "  REJECTED: 'var(--danger)',\n"
    "};\n"
    "\n"
    "// Model 16: Initial Acceptance and Pending Final Approval are real\n"
    "// progress, but neither is final admission -- this must never look\n"
    "// or read like an offer of admission.\n"
    "const NOT_FINAL_STATUSES = ['INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'];",
    "track page: extend status labels/colors + not-final marker",
)

c = r1(
    c,
    "              <div\n"
    "                style={{\n"
    "                  ...statusPill,\n"
    "                  color: STATUS_COLORS[result.status] || 'var(--ink)',\n"
    "                  borderColor: STATUS_COLORS[result.status] || 'var(--border)',\n"
    "                }}\n"
    "              >\n"
    "                {t(STATUS_LABELS[result.status]) || result.status}\n"
    "              </div>\n"
    "            </div>",
    "              <div\n"
    "                style={{\n"
    "                  ...statusPill,\n"
    "                  color: STATUS_COLORS[result.status] || 'var(--ink)',\n"
    "                  borderColor: STATUS_COLORS[result.status] || 'var(--border)',\n"
    "                }}\n"
    "              >\n"
    "                {t(STATUS_LABELS[result.status]) || result.status}\n"
    "              </div>\n"
    "            </div>\n"
    "\n"
    "            {NOT_FINAL_STATUSES.includes(result.status) && (\n"
    "              <div style={notFinalBanner}>\n"
    "                {t('This is progress, but it is not yet a final admission decision. We will let you know as soon as a final decision is made.')}\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {result.status === 'APPROVED' && result.congratulationsMessage && (\n"
    "              <div style={approvedBanner}>{result.congratulationsMessage}</div>\n"
    "            )}\n"
    "\n"
    "            {result.status === 'REJECTED' && (\n"
    "              <div style={declinedBanner}>\n"
    "                <p style={{ margin: 0 }}>\n"
    "                  {t('We are unable to offer you admission at this time. We appreciate your interest and wish you every success.')}\n"
    "                </p>\n"
    "                {result.declineReason && (\n"
    "                  <p style={{ margin: '8px 0 0', fontWeight: 700 }}>{result.declineReason}</p>\n"
    "                )}\n"
    "              </div>\n"
    "            )}\n"
    "\n"
    "            {Array.isArray(result.notes) && result.notes.length > 0 && (\n"
    "              <>\n"
    "                <div style={sectionDivider} />\n"
    "                <h3 style={sectionTitle}>{t('Updates from Admissions & Registration')}</h3>\n"
    "                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>\n"
    "                  {result.notes.map((n, i) => (\n"
    "                    <div key={i} style={noteCard}>\n"
    "                      <p style={{ margin: 0 }}>{n.note}</p>\n"
    "                      <span style={noteDate}>\n"
    "                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}\n"
    "                      </span>\n"
    "                    </div>\n"
    "                  ))}\n"
    "                </div>\n"
    "              </>\n"
    "            )}",
    "track page: not-final banner, congratulations, decline reason, notes",
)

c = r1(
    c,
    "const docCheck = { fontSize: 16, fontWeight: 700 };",
    "const docCheck = { fontSize: 16, fontWeight: 700 };\n"
    "\n"
    "const notFinalBanner = {\n"
    "  padding: '10px 14px',\n"
    "  borderRadius: 9,\n"
    "  background: 'var(--warning-tint, rgba(200,150,20,0.12))',\n"
    "  color: 'var(--ink)',\n"
    "  fontSize: 13,\n"
    "  marginBottom: 18,\n"
    "};\n"
    "\n"
    "const approvedBanner = {\n"
    "  padding: '14px 16px',\n"
    "  borderRadius: 9,\n"
    "  background: 'var(--success-tint, rgba(30,140,80,0.1))',\n"
    "  color: 'var(--ink)',\n"
    "  fontSize: 14,\n"
    "  fontWeight: 600,\n"
    "  marginBottom: 18,\n"
    "};\n"
    "\n"
    "const declinedBanner = {\n"
    "  padding: '14px 16px',\n"
    "  borderRadius: 9,\n"
    "  background: 'var(--danger-tint)',\n"
    "  color: 'var(--ink)',\n"
    "  fontSize: 13.5,\n"
    "  marginBottom: 18,\n"
    "};\n"
    "\n"
    "const noteCard = {\n"
    "  padding: '10px 14px',\n"
    "  borderRadius: 9,\n"
    "  border: '1px solid var(--border)',\n"
    "  background: 'var(--paper)',\n"
    "  fontSize: 13.5,\n"
    "};\n"
    "\n"
    "const noteDate = {\n"
    "  display: 'block',\n"
    "  marginTop: 4,\n"
    "  fontSize: 11,\n"
    "  color: 'var(--ink-soft)',\n"
    "};",
    "track page: add banner/note styles",
)

save(path, c)
print("app/admission/track/page.jsx: shows the extended workflow, not-final notice, dynamic congratulations, decline reason, and applicant-visible notes.")
