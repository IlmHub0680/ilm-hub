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
# app/admin/(overview)/layout.jsx -- the "Admissions Under Review" tile
# on the main admin dashboard only counted status === 'UNDER_REVIEW',
# so it would now undercount applications that have moved on to the
# two new intermediate review states (still genuinely "in review",
# not yet a final decision).
# =======================================================================
path = "app/admin/(overview)/layout.jsx"
c = load(path)

c = r1(
    c,
    "    prisma.admissionApplication.count({ where: { status: 'UNDER_REVIEW' } }),",
    "    prisma.admissionApplication.count({\n"
    "      where: { status: { in: ['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'] } },\n"
    "    }),",
    "overview dashboard: widen Admissions Under Review count",
)

c = r1(
    c,
    "    { label: 'Admissions Under Review', value: pendingAdmissions },",
    "    { label: 'Admissions In Review', value: pendingAdmissions },",
    "overview dashboard: relabel tile to cover the full review span",
)

save(path, c)
print("app/admin/(overview)/layout.jsx: dashboard count now covers the full review span.")

# =======================================================================
# app/admin/analytics/page.tsx -- same undercount in the institution-
# wide analytics tile ("Under Review").
# =======================================================================
path = "app/admin/analytics/page.tsx"
c = load(path)

c = r1(
    c,
    "    prisma.admissionApplication.count({ where: { status: 'UNDER_REVIEW' } }),",
    "    prisma.admissionApplication.count({\n"
    "      where: { status: { in: ['UNDER_REVIEW', 'INITIAL_ACCEPTANCE', 'PENDING_FINAL_APPROVAL'] } },\n"
    "    }),",
    "analytics: widen underReviewApplicationCount query",
)

c = r1(
    c,
    "        { label: 'Under Review', value: String(underReviewApplicationCount) },",
    "        { label: 'In Review (Under Review + Initial Acceptance + Pending Final Approval)', value: String(underReviewApplicationCount) },",
    "analytics: relabel tile to reflect the widened count",
)

save(path, c)
print("app/admin/analytics/page.tsx: dashboard count now covers the full review span.")

# =======================================================================
# app/api/coordinator/overview/route.js -- a Programme Coordinator's
# overview of pending applicants for their own programmes only knew
# about PAID/UNDER_REVIEW, so an application that had progressed to
# Initial Acceptance or Pending Final Approval would silently drop
# out of the coordinator's applicant list.
# =======================================================================
path = "app/api/coordinator/overview/route.js"
c = load(path)

c = r1(
    c,
    '        where: { programId: { in: programIds }, status: { in: ["PAID", "UNDER_REVIEW"] } },',
    '        where: {\n'
    '          programId: { in: programIds },\n'
    '          status: { in: ["PAID", "UNDER_REVIEW", "INITIAL_ACCEPTANCE", "PENDING_FINAL_APPROVAL"] },\n'
    '        },',
    "coordinator overview: widen applicant status filter",
)

save(path, c)
print("app/api/coordinator/overview/route.js: applicant list now covers the full review span.")
