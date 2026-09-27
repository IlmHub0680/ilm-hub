# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "lib/legalContentDefaults.js"
c = load(path)

# 1. academy-master-integration opening sentence.
c = r1(
    c,
    "<p><strong>Website, Recognition Readiness &amp; Master Integration.</strong> "
    "Using Models 1 through 11 — Institutional Foundation through Academic Regu"
    "lations, Records &amp; Quality Assurance — as the complete Academy foundation, "
    "this document integrates the institution into one coherent master model. "
    "It does not redesign anything already settled;",
    "<p><strong>Website, Recognition Readiness &amp; Master Integration.</strong> "
    "Using every prior framework — Institutional Foundation through Academic Regu"
    "lations, Records &amp; Quality Assurance — as the complete Academy foundation, "
    "this document integrates the institution into one coherent whole. "
    "It does not redesign anything already settled;",
    "master-integration: opening sentence",
)

# 2. Prerequisites relationships (programme page section, §4 table).
c = r1(
    c,
    "reading real <code>Course.prerequisites</code> relationships that existed "
    "in the schema since Model 9 but were empty for every course until this "
    "document's companion seed work (§10)",
    "reading real <code>Course.prerequisites</code> relationships that existed "
    "in the schema but were empty for every course until this "
    "document's companion seed work (§10)",
    "master-integration: prerequisites relationships (programme page table)",
)

# 3. isPrerequisiteFor self-relation (master data model table).
c = r1(
    c,
    "<code>isPrerequisiteFor</code> self-relation — defined in the schema "
    "since Model 9, populated for every course as of this document (§10)",
    "<code>isPrerequisiteFor</code> self-relation — defined in the schema, "
    "populated for every course as of this document (§10)",
    "master-integration: isPrerequisiteFor self-relation",
)

# 4. §10.1 major finding paragraph.
c = r1(
    c,
    "are now populated, where the schema relation existed since Model 9 but had "
    "been empty for every course until now; and approval",
    "are now populated, where the schema relation existed but had "
    "been empty for every course until now; and approval",
    "master-integration: 10.1 major finding paragraph",
)

# 5. Decision 82 (prerequisite relationships).
c = r1(
    c,
    "<code>Course.prerequisites</code>, defined in the schema since Model 9 but "
    "empty for every course until now, now reflects Course C",
    "<code>Course.prerequisites</code>, defined in the schema but "
    "empty for every course until now, now reflects Course C",
    "master-integration: decision 82 prerequisites",
)

# 6. Closing synthesis paragraph.
c = r1(
    c,
    "Prepared for Founder review. This document closes the series covered by "
    "Models 1 through 12 by integrating them into one blueprint, correcti",
    "Prepared for Founder review. This document closes the series "
    "by integrating every prior framework into one blueprint, correcti",
    "master-integration: closing synthesis paragraph",
)

# 7. academy-academic-regulations §7 PLO paragraph.
c = r1(
    c,
    "approximating one now, from data that was never structured to support it, "
    "would be exactly the kind of meaningless number this document was "
    "explicitly asked not to produce (§9, §10).",
    "approximating one now, from data that was never structured to support it, "
    "would be exactly the kind of meaningless number the Academy's standing "
    "no-fabrication principle rules out (§9, §10).",
    "academic-regulations: section 7 PLO paragraph",
)

# 8. academy-academic-regulations §9 KPIs intro.
c = r1(
    c,
    "Consistent with the explicit instruction not to create meaningless KPIs, "
    "a metric is only included where the platform's actual data can support "
    "computing it honestly;",
    "Consistent with the Academy's standing principle against meaningless KPIs, "
    "a metric is only included where the platform's actual data can support "
    "computing it honestly;",
    "academic-regulations: section 9 KPIs intro",
)

save(path, c)
print("lib/legalContentDefaults.js: all 8 leaked Model/instruction-language fixes applied.")
