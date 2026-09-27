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

path = "app/admin/admissions/[id]/page.jsx"
c = load(path)

c = r1(
    c,
    "  const [actionPending, setActionPending] = useState(false);\n"
    "  const [actionMessage, setActionMessage] = useState('');",
    "  const [actionPending, setActionPending] = useState(false);\n"
    "  const [actionMessage, setActionMessage] = useState('');\n"
    "  const [declineReason, setDeclineReason] = useState('');",
    "admin admissions detail: add declineReason state",
)

c = r1(
    c,
    "      if (!res.ok || !result.success) throw new Error(result.error || 'Action failed.');\n"
    "      setActionMessage(result.message || 'Done.');\n"
    "      load();",
    "      if (!res.ok || !result.success) throw new Error(result.error || 'Action failed.');\n"
    "      const emailNote =\n"
    "        typeof result.emailSent === 'boolean'\n"
    "          ? result.emailSent\n"
    "            ? ' The applicant has been emailed.'\n"
    "            : ' (The applicant was not emailed -- admissions email is not configured yet.)'\n"
    "          : '';\n"
    "      setActionMessage((result.message || 'Done.') + emailNote);\n"
    "      setDeclineReason('');\n"
    "      load();",
    "admin admissions detail: surface emailSent + reset reason on success",
)

c = r1(
    c,
    "          {a.status === 'UNDER_REVIEW' && (\n"
    "            <>\n"
    "              <button className=\"ih-btn ih-btn-primary\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'APPROVED' })}>\n"
    "                Approve &amp; Create Student Record\n"
    "              </button>\n"
    "              <button className=\"ih-btn ih-btn-danger\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'REJECTED' })}>\n"
    "                Reject\n"
    "              </button>\n"
    "            </>\n"
    "          )}",
    "          {a.status === 'UNDER_REVIEW' && (\n"
    "            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>\n"
    "              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>\n"
    "                <button className=\"ih-btn ih-btn-primary\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'APPROVED' })}>\n"
    "                  Approve &amp; Create Student Record\n"
    "                </button>\n"
    "                <button className=\"ih-btn ih-btn-danger\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'REJECTED', reason: declineReason })}>\n"
    "                  Reject\n"
    "                </button>\n"
    "              </div>\n"
    "              <div>\n"
    "                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 4 }}>\n"
    "                  Reason for rejection (optional -- shown to the applicant)\n"
    "                </label>\n"
    "                <textarea\n"
    "                  value={declineReason}\n"
    "                  onChange={(e) => setDeclineReason(e.target.value)}\n"
    "                  placeholder=\"e.g. Programme intake for this session is full, or eligibility requirements not met.\"\n"
    "                  rows={2}\n"
    "                  maxLength={2000}\n"
    "                  style={{ width: '100%', maxWidth: 520, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontFamily: 'inherit', fontSize: 13.5, resize: 'vertical' }}\n"
    "                />\n"
    "              </div>\n"
    "            </div>\n"
    "          )}",
    "admin admissions detail: optional reject-reason textarea",
)

c = r1(
    c,
    "        <Section title=\"Declaration\">",
    "        {a.status === 'REJECTED' && a.declineReason && (\n"
    "          <Section title=\"Decision\">\n"
    "            <Field label=\"Reason Given to Applicant\" value={a.declineReason} />\n"
    "          </Section>\n"
    "        )}\n"
    "\n"
    "        <Section title=\"Declaration\">",
    "admin admissions detail: show recorded decline reason",
)

save(path, c)
print("app/admin/admissions/[id]/page.jsx: staff can now record an optional reject reason, and it's shown once recorded.")
