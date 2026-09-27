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
# app/registry-dashboard/page.tsx -- this is the REAL, RBAC-gated
# production portal for Registry/Admissions staff (confirmed via
# app/registry-dashboard/layout.jsx calling requireAdmissionsView(),
# and lib/permissions.ts routing ADMISSIONS-edit staff here on login).
# It is not a duplicate/legacy page -- it's a second, legitimate UI
# over the SAME backend API as /admin/admissions/[id] (the
# ADMIN/SUPER_ADMIN oversight view), exactly matching Model 16's
# requirement that Registry/Admissions staff get RBAC-scoped access
# distinct from generic Admin. But it still only knew about the old
# 5-state workflow, so its "Approve" button (fired at UNDER_REVIEW)
# now gets rejected by the decision route's updated guard, which
# requires PENDING_FINAL_APPROVAL. This brings it up to date with the
# 7-state workflow without duplicating the reason/notes UI already
# built on the admin detail page -- final Approve/Decline/Notes route
# there, where the full audit-aware UI already lives.
# =======================================================================
path = "app/registry-dashboard/page.tsx"
c = load(path)

c = r1(
    c,
    "const STATUS_BADGE: Record<string, string> = {\n"
    "    PENDING_PAYMENT: 'ih-b-warning',\n"
    "    PAID: 'ih-b-info',\n"
    "    UNDER_REVIEW: 'ih-b-warning',\n"
    "    APPROVED: 'ih-b-success',\n"
    "    REJECTED: 'ih-b-danger',\n"
    "};",
    "const STATUS_BADGE: Record<string, string> = {\n"
    "    PENDING_PAYMENT: 'ih-b-warning',\n"
    "    PAID: 'ih-b-info',\n"
    "    UNDER_REVIEW: 'ih-b-warning',\n"
    "    INITIAL_ACCEPTANCE: 'ih-b-warning',\n"
    "    PENDING_FINAL_APPROVAL: 'ih-b-warning',\n"
    "    APPROVED: 'ih-b-success',\n"
    "    REJECTED: 'ih-b-danger',\n"
    "};\n"
    "\n"
    "// Initial Acceptance / Pending Final Approval are intentionally NOT\n"
    "// final -- mirrors the labels already shown on /admin/admissions and\n"
    "// the applicant-facing tracker, so staff and applicants see the same\n"
    "// wording for the same status everywhere in the app.\n"
    "const STATUS_LABELS: Record<string, string> = {\n"
    "    PENDING_PAYMENT: 'Pending Payment',\n"
    "    PAID: 'Paid',\n"
    "    UNDER_REVIEW: 'Under Review',\n"
    "    INITIAL_ACCEPTANCE: 'Initial Acceptance',\n"
    "    PENDING_FINAL_APPROVAL: 'Pending Final Approval',\n"
    "    APPROVED: 'Approved',\n"
    "    REJECTED: 'Declined',\n"
    "};",
    "registry-dashboard: extend STATUS_BADGE + add STATUS_LABELS",
)

# Replace handleDecision (which could fire APPROVED/REJECTED straight
# from UNDER_REVIEW -- no longer valid) with two staff-facing stage
# handlers that mirror handleMoveToReview's existing fetch pattern.
c = r1(
    c,
    "    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {\n"
    "        if (decision === 'REJECTED' && !confirm('Reject this application? This cannot be undone.')) {\n"
    "            return;\n"
    "        }\n"
    "\n"
    "        setActioningId(id);\n"
    "        setMessage('');\n"
    "        try {\n"
    "            const res = await fetch(`/api/admin/admissions/${id}/decision`, {\n"
    "                method: 'POST',\n"
    "                credentials: 'include',\n"
    "                headers: { 'Content-Type': 'application/json' },\n"
    "                body: JSON.stringify({ decision }),\n"
    "            });\n"
    "            const data = await res.json();\n"
    "\n"
    "            if (data.success) {\n"
    "                setMessage(\n"
    "                    decision === 'APPROVED'\n"
    "                        ? 'Application approved. Student account created.'\n"
    "                        : 'Application rejected.'\n"
    "                );\n"
    "                fetchApplications();\n"
    "            } else {\n"
    "                setMessage(data.error || 'Failed to record decision.');\n"
    "            }\n"
    "        } catch (err) {\n"
    "            setMessage('An error occurred.');\n"
    "        } finally {\n"
    "            setActioningId(null);\n"
    "        }\n"
    "    };",
    "    const handleMoveToInitialAcceptance = async (id: string) => {\n"
    "        setActioningId(id);\n"
    "        setMessage('');\n"
    "        try {\n"
    "            const res = await fetch(`/api/admin/admissions/${id}/initial-acceptance`, {\n"
    "                method: 'POST',\n"
    "                credentials: 'include',\n"
    "            });\n"
    "            const data = await res.json();\n"
    "\n"
    "            if (data.success) {\n"
    "                setMessage('Application moved to Initial Acceptance (not yet final).');\n"
    "                fetchApplications();\n"
    "            } else {\n"
    "                setMessage(data.error || 'Failed to move to Initial Acceptance.');\n"
    "            }\n"
    "        } catch (err) {\n"
    "            setMessage('An error occurred.');\n"
    "        } finally {\n"
    "            setActioningId(null);\n"
    "        }\n"
    "    };\n"
    "\n"
    "    const handleMoveToPendingFinalApproval = async (id: string) => {\n"
    "        setActioningId(id);\n"
    "        setMessage('');\n"
    "        try {\n"
    "            const res = await fetch(`/api/admin/admissions/${id}/pending-final-approval`, {\n"
    "                method: 'POST',\n"
    "                credentials: 'include',\n"
    "            });\n"
    "            const data = await res.json();\n"
    "\n"
    "            if (data.success) {\n"
    "                setMessage('Application moved to Pending Final Approval (not yet final).');\n"
    "                fetchApplications();\n"
    "            } else {\n"
    "                setMessage(data.error || 'Failed to move to Pending Final Approval.');\n"
    "            }\n"
    "        } catch (err) {\n"
    "            setMessage('An error occurred.');\n"
    "        } finally {\n"
    "            setActioningId(null);\n"
    "        }\n"
    "    };",
    "registry-dashboard: replace handleDecision with per-stage handlers",
)

# Status filter dropdown -- add the two new intermediate states.
c = r1(
    c,
    "                        <option value=\"UNDER_REVIEW\">Under Review</option>\n"
    "                        <option value=\"APPROVED\">Approved</option>\n"
    "                        <option value=\"REJECTED\">Rejected</option>",
    "                        <option value=\"UNDER_REVIEW\">Under Review</option>\n"
    "                        <option value=\"INITIAL_ACCEPTANCE\">Initial Acceptance</option>\n"
    "                        <option value=\"PENDING_FINAL_APPROVAL\">Pending Final Approval</option>\n"
    "                        <option value=\"APPROVED\">Approved</option>\n"
    "                        <option value=\"REJECTED\">Declined</option>",
    "registry-dashboard: extend status filter dropdown",
)

# Status badge text -- use STATUS_LABELS instead of a raw underscore
# replace, so REJECTED reads "Declined" here too (matches every other
# admissions-facing surface in the app).
c = r1(
    c,
    "                                                <span className={`ih-badge ${STATUS_BADGE[app.status] || 'ih-b-neutral'}`}>\n"
    "                                                    {app.status.replace(/_/g, ' ')}\n"
    "                                                </span>",
    "                                                <span className={`ih-badge ${STATUS_BADGE[app.status] || 'ih-b-neutral'}`}>\n"
    "                                                    {STATUS_LABELS[app.status] || app.status.replace(/_/g, ' ')}\n"
    "                                                </span>",
    "registry-dashboard: status badge uses STATUS_LABELS",
)

# Actions column -- replace the single UNDER_REVIEW Approve/Reject
# branch with per-stage quick actions, plus a link to the full
# review page (existing reason/notes/audit-trail UI) for the final
# Approve/Decline call so that UI is never duplicated in two places.
c = r1(
    c,
    "                                                    {app.status === 'UNDER_REVIEW' && (\n"
    "                                                        <>\n"
    "                                                            <button\n"
    "                                                                onClick={() => handleDecision(app.id, 'APPROVED')}\n"
    "                                                                disabled={actioningId === app.id}\n"
    "                                                                className=\"ih-btn ih-btn-primary\"\n"
    "                                                                style={{ padding: '6px 12px', fontSize: 12 }}\n"
    "                                                            >\n"
    "                                                                Approve\n"
    "                                                            </button>\n"
    "                                                            <button\n"
    "                                                                onClick={() => handleDecision(app.id, 'REJECTED')}\n"
    "                                                                disabled={actioningId === app.id}\n"
    "                                                                className=\"ih-btn ih-btn-danger\"\n"
    "                                                                style={{ padding: '6px 12px', fontSize: 12 }}\n"
    "                                                            >\n"
    "                                                                Reject\n"
    "                                                            </button>\n"
    "                                                        </>\n"
    "                                                    )}",
    "                                                    {app.status === 'UNDER_REVIEW' && (\n"
    "                                                        <button\n"
    "                                                            onClick={() => handleMoveToInitialAcceptance(app.id)}\n"
    "                                                            disabled={actioningId === app.id}\n"
    "                                                            className=\"ih-btn ih-btn-secondary\"\n"
    "                                                            style={{ padding: '6px 12px', fontSize: 12 }}\n"
    "                                                        >\n"
    "                                                            Move to Initial Acceptance\n"
    "                                                        </button>\n"
    "                                                    )}\n"
    "                                                    {app.status === 'INITIAL_ACCEPTANCE' && (\n"
    "                                                        <button\n"
    "                                                            onClick={() => handleMoveToPendingFinalApproval(app.id)}\n"
    "                                                            disabled={actioningId === app.id}\n"
    "                                                            className=\"ih-btn ih-btn-secondary\"\n"
    "                                                            style={{ padding: '6px 12px', fontSize: 12 }}\n"
    "                                                        >\n"
    "                                                            Move to Pending Final Approval\n"
    "                                                        </button>\n"
    "                                                    )}\n"
    "                                                    {['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'].includes(app.status) && (\n"
    "                                                        <a\n"
    "                                                            href={`/admin/admissions/${app.id}`}\n"
    "                                                            className=\"ih-btn ih-btn-primary\"\n"
    "                                                            style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}\n"
    "                                                        >\n"
    "                                                            Review &amp; Decide →\n"
    "                                                        </a>\n"
    "                                                    )}",
    "registry-dashboard: per-stage actions + link to full review page for Approve/Decline",
)

save(path, c)
print("app/registry-dashboard/page.tsx: workflow parity restored (7-state, quick stage-advance + link to full decision UI).")
