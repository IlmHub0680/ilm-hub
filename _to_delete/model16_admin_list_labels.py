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

path = "app/admin/admissions/page.jsx"
c = load(path)

c = r1(
    c,
    "  const badgeClass = (status) =>\n"
    "    status === 'PENDING_PAYMENT' ? 'ih-b-warning'\n"
    "    : status === 'PAID' ? 'ih-b-info'\n"
    "    : status === 'UNDER_REVIEW' ? 'ih-b-warning'\n"
    "    : status === 'APPROVED' ? 'ih-b-success'\n"
    "    : status === 'REJECTED' ? 'ih-b-danger'\n"
    "    : 'ih-b-neutral';",
    "  const badgeClass = (status) =>\n"
    "    status === 'PENDING_PAYMENT' ? 'ih-b-warning'\n"
    "    : status === 'PAID' ? 'ih-b-info'\n"
    "    : status === 'UNDER_REVIEW' ? 'ih-b-warning'\n"
    "    : status === 'INITIAL_ACCEPTANCE' ? 'ih-b-warning'\n"
    "    : status === 'PENDING_FINAL_APPROVAL' ? 'ih-b-warning'\n"
    "    : status === 'APPROVED' ? 'ih-b-success'\n"
    "    : status === 'REJECTED' ? 'ih-b-danger'\n"
    "    : 'ih-b-neutral';\n"
    "\n"
    "  const STATUS_LABELS = {\n"
    "    PENDING_PAYMENT: 'Pending Payment',\n"
    "    PAID: 'Paid',\n"
    "    UNDER_REVIEW: 'Under Review',\n"
    "    INITIAL_ACCEPTANCE: 'Initial Acceptance',\n"
    "    PENDING_FINAL_APPROVAL: 'Pending Final Approval',\n"
    "    APPROVED: 'Approved',\n"
    "    REJECTED: 'Declined',\n"
    "  };",
    "admin admissions list: extend badge mapping + labels for the new states",
)

c = r1(
    c,
    "                        {app.status.replace(/_/g, ' ')}",
    "                        {STATUS_LABELS[app.status] || app.status.replace(/_/g, ' ')}",
    "admin admissions list: use STATUS_LABELS",
)

save(path, c)
print("app/admin/admissions/page.jsx: badge + label coverage extended to the new workflow states.")
