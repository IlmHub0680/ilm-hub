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
# app/api/admin/admissions/route.ts -- the ?status= filter's allow-list
# was still the old 5 states; staff couldn't filter the list down to
# Initial Acceptance or Pending Final Approval applications.
# =======================================================================
path = "app/api/admin/admissions/route.ts"
c = load(path)

c = r1(
    c,
    "    const validStatuses = [\n"
    '      "PENDING_PAYMENT",\n'
    '      "PAID",\n'
    '      "UNDER_REVIEW",\n'
    '      "APPROVED",\n'
    '      "REJECTED",\n'
    "    ] as const;",
    "    const validStatuses = [\n"
    '      "PENDING_PAYMENT",\n'
    '      "PAID",\n'
    '      "UNDER_REVIEW",\n'
    '      "INITIAL_ACCEPTANCE",\n'
    '      "PENDING_FINAL_APPROVAL",\n'
    '      "APPROVED",\n'
    '      "REJECTED",\n'
    "    ] as const;",
    "admin admissions list route: extend validStatuses filter",
)

save(path, c)
print("app/api/admin/admissions/route.ts: ?status= filter now covers the full workflow.")

# =======================================================================
# app/api/admissions/bank-transfer/route.js -- the idempotency guard
# (don't regenerate a transfer reference for an application that has
# already moved past payment) only knew about PAID/UNDER_REVIEW/
# APPROVED. Extend it to the two new intermediate review states too.
# =======================================================================
path = "app/api/admissions/bank-transfer/route.js"
c = load(path)

c = r1(
    c,
    "    if (\n"
    '      application.status === "PAID" ||\n'
    '      application.status === "UNDER_REVIEW" ||\n'
    '      application.status === "APPROVED"\n'
    "    ) {",
    "    if (\n"
    '      application.status === "PAID" ||\n'
    '      application.status === "UNDER_REVIEW" ||\n'
    '      application.status === "INITIAL_ACCEPTANCE" ||\n'
    '      application.status === "PENDING_FINAL_APPROVAL" ||\n'
    '      application.status === "APPROVED"\n'
    "    ) {",
    "bank-transfer route: extend already-past-payment guard",
)

save(path, c)
print("app/api/admissions/bank-transfer/route.js: idempotency guard now covers the full workflow.")
