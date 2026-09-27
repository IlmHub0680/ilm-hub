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
    "const DOCUMENT_FIELDS = [",
    "const STATUS_LABELS = {\n"
    "  PENDING_PAYMENT: 'Pending Payment',\n"
    "  PAID: 'Paid',\n"
    "  UNDER_REVIEW: 'Under Review',\n"
    "  INITIAL_ACCEPTANCE: 'Initial Acceptance',\n"
    "  PENDING_FINAL_APPROVAL: 'Pending Final Approval',\n"
    "  APPROVED: 'Approved',\n"
    "  REJECTED: 'Declined',\n"
    "};\n"
    "\n"
    "const DOCUMENT_FIELDS = [",
    "admin admissions detail: add STATUS_LABELS",
)

c = r1(
    c,
    "  const [declineReason, setDeclineReason] = useState('');",
    "  const [declineReason, setDeclineReason] = useState('');\n"
    "  const [notes, setNotes] = useState([]);\n"
    "  const [notesLoading, setNotesLoading] = useState(false);\n"
    "  const [noteText, setNoteText] = useState('');\n"
    "  const [noteVisibility, setNoteVisibility] = useState('INTERNAL');\n"
    "  const [notePending, setNotePending] = useState(false);",
    "admin admissions detail: notes state",
)

c = r1(
    c,
    "  useEffect(() => {\n"
    "    load();\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [id]);",
    "  const loadNotes = () => {\n"
    "    setNotesLoading(true);\n"
    "    fetch(`/api/admin/admissions/${id}/notes`, { credentials: 'include' })\n"
    "      .then(async (res) => {\n"
    "        const result = await res.json();\n"
    "        if (res.ok && result.success) setNotes(result.data);\n"
    "      })\n"
    "      .finally(() => setNotesLoading(false));\n"
    "  };\n"
    "\n"
    "  useEffect(() => {\n"
    "    load();\n"
    "    loadNotes();\n"
    "    // eslint-disable-next-line react-hooks/exhaustive-deps\n"
    "  }, [id]);\n"
    "\n"
    "  const addNote = async () => {\n"
    "    if (!noteText.trim()) return;\n"
    "    setNotePending(true);\n"
    "    try {\n"
    "      const res = await fetch(`/api/admin/admissions/${id}/notes`, {\n"
    "        method: 'POST',\n"
    "        credentials: 'include',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ note: noteText.trim(), visibility: noteVisibility }),\n"
    "      });\n"
    "      const result = await res.json();\n"
    "      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to add note.');\n"
    "      setNoteText('');\n"
    "      loadNotes();\n"
    "    } catch (err) {\n"
    "      setActionMessage(err.message);\n"
    "    } finally {\n"
    "      setNotePending(false);\n"
    "    }\n"
    "  };",
    "admin admissions detail: loadNotes + addNote",
)

# -----------------------------------------------------------------------
# The action bar: what a reviewer can do next depends on exactly which
# of the three review stages the application is in. Approve is only
# ever available from Pending Final Approval (matching the backend
# guard); Decline is available from any of the three, always with the
# optional reason field.
# -----------------------------------------------------------------------
c = r1(
    c,
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
    "          {['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'].includes(a.status) && (\n"
    "            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>\n"
    "              {(a.status === 'INITIAL_ACCEPTANCE' || a.status === 'PENDING_FINAL_APPROVAL') && (\n"
    "                <div style={notFinalNotice}>\n"
    "                  This application is in progress but has not received a final admission decision yet.\n"
    "                </div>\n"
    "              )}\n"
    "              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>\n"
    "                {a.status === 'UNDER_REVIEW' && (\n"
    "                  <button className=\"ih-btn ih-btn-primary\" disabled={actionPending} onClick={() => runAction('initial-acceptance')}>\n"
    "                    Move to Initial Acceptance\n"
    "                  </button>\n"
    "                )}\n"
    "                {a.status === 'INITIAL_ACCEPTANCE' && (\n"
    "                  <button className=\"ih-btn ih-btn-primary\" disabled={actionPending} onClick={() => runAction('pending-final-approval')}>\n"
    "                    Move to Pending Final Approval\n"
    "                  </button>\n"
    "                )}\n"
    "                {a.status === 'PENDING_FINAL_APPROVAL' && (\n"
    "                  <button className=\"ih-btn ih-btn-primary\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'APPROVED' })}>\n"
    "                    Approve &amp; Create Student Record\n"
    "                  </button>\n"
    "                )}\n"
    "                <button className=\"ih-btn ih-btn-danger\" disabled={actionPending} onClick={() => runAction('decision', { decision: 'REJECTED', reason: declineReason })}>\n"
    "                  Decline\n"
    "                </button>\n"
    "              </div>\n"
    "              <div>\n"
    "                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 4 }}>\n"
    "                  Reason for declining (optional -- shown to the applicant)\n"
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
    "admin admissions detail: per-stage action bar",
)

c = r1(
    c,
    "            {a.status.replace(/_/g, ' ')}",
    "            {STATUS_LABELS[a.status] || a.status.replace(/_/g, ' ')}",
    "admin admissions detail: use STATUS_LABELS for the badge",
)

# -----------------------------------------------------------------------
# Notes panel -- Internal (staff-only) vs Applicant-Visible, clearly
# labeled, with an add form. Placed right after the action bar so it's
# part of the same working area a reviewer uses to make a decision.
# -----------------------------------------------------------------------
c = r1(
    c,
    "        <Section title=\"Applicant\">",
    "        <section className=\"ih-card\" style={{ padding: 20, marginBottom: 18 }}>\n"
    "          <h2 style={{ margin: '0 0 14px', fontSize: 16, color: 'var(--brand)' }}>Notes</h2>\n"
    "          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>\n"
    "            {notesLoading && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Loading notes…</p>}\n"
    "            {!notesLoading && notes.length === 0 && (\n"
    "              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>No notes yet.</p>\n"
    "            )}\n"
    "            {notes.map((n) => (\n"
    "              <div key={n.id} style={noteRow}>\n"
    "                <span\n"
    "                  className={`ih-badge ${n.visibility === 'APPLICANT_VISIBLE' ? 'ih-b-success' : 'ih-b-warning'}`}\n"
    "                  style={{ fontSize: 11, alignSelf: 'flex-start' }}\n"
    "                >\n"
    "                  {n.visibility === 'APPLICANT_VISIBLE' ? 'Applicant-Visible' : 'Internal'}\n"
    "                </span>\n"
    "                <p style={{ margin: '6px 0 4px', fontSize: 13.5 }}>{n.note}</p>\n"
    "                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>\n"
    "                  {n.authorName} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}\n"
    "                </span>\n"
    "              </div>\n"
    "            ))}\n"
    "          </div>\n"
    "          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>\n"
    "            <textarea\n"
    "              value={noteText}\n"
    "              onChange={(e) => setNoteText(e.target.value)}\n"
    "              placeholder=\"Add a note about this application…\"\n"
    "              rows={2}\n"
    "              maxLength={4000}\n"
    "              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontFamily: 'inherit', fontSize: 13.5, resize: 'vertical' }}\n"
    "            />\n"
    "            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>\n"
    "              <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border, #d8d8d8)', fontSize: 13 }}>\n"
    "                <option value=\"INTERNAL\">Internal (staff only)</option>\n"
    "                <option value=\"APPLICANT_VISIBLE\">Applicant-Visible (shown on tracking page)</option>\n"
    "              </select>\n"
    "              <button className=\"ih-btn ih-btn-secondary\" disabled={notePending || !noteText.trim()} onClick={addNote}>\n"
    "                Add Note\n"
    "              </button>\n"
    "            </div>\n"
    "          </div>\n"
    "        </section>\n"
    "\n"
    "        <Section title=\"Applicant\">",
    "admin admissions detail: Notes panel",
)

c = r1(
    c,
    "const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 };",
    "const heading = { color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 };\n"
    "const notFinalNotice = { padding: '8px 12px', borderRadius: 8, background: 'var(--warning-tint, rgba(200,150,20,0.12))', fontSize: 12.5, color: 'var(--ink)' };\n"
    "const noteRow = { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border, #e2e2e2)' };",
    "admin admissions detail: add notFinalNotice + noteRow styles",
)

save(path, c)
print("app/admin/admissions/[id]/page.jsx: per-stage action bar + Internal/Applicant-Visible notes panel.")
