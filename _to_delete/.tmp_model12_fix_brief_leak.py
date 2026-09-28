# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "lib/legalContentDefaults.js"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

# Table header fixes (each full row is unique via its second column)
c = r1(
    c,
    "<thead><tr><th>Brief element</th><th>Where it actually lives</th></tr></thead>",
    "<thead><tr><th>Website element</th><th>Where it actually lives</th></tr></thead>",
    "table header: Website Structure",
)
c = r1(
    c,
    "<thead><tr><th>Brief element</th><th>Status &amp; source</th></tr></thead>",
    "<thead><tr><th>Programme page element</th><th>Status &amp; source</th></tr></thead>",
    "table header: Programme Page",
)
c = r1(
    c,
    "<thead><tr><th>Brief link</th><th>Real model(s)</th></tr></thead>",
    "<thead><tr><th>Chain link</th><th>Real model(s)</th></tr></thead>",
    "table header: Master Data Model",
)
c = r1(
    c,
    "<thead><tr><th>Brief stage</th><th>Student Lifecycle §2 stage(s)</th></tr></thead>",
    "<thead><tr><th>Workflow stage</th><th>Student Lifecycle §2 stage(s)</th></tr></thead>",
    "table header: Master Workflow",
)
c = r1(
    c,
    "<thead><tr><th>Brief link</th><th>Real source</th></tr></thead>",
    "<thead><tr><th>Chain link</th><th>Real source</th></tr></thead>",
    "table header: Master Academic Alignment",
)

# Prose fixes -- exact text as it landed in the file (straight apostrophes,
# literal em dash / section-sign characters, not HTML entities).
c = r1(
    c,
    "was extended this document to include every element the brief asks for, either already present or newly added.",
    "was extended by this document to include every element listed below, either already present or newly added.",
    "prose: Programme Page intro",
)
c = r1(
    c,
    "The brief's Academic Catalogue elements — institutional information,",
    "The Academic Catalogue elements this document covers — institutional information,",
    "prose: Academic Catalogue intro",
)
c = r1(
    c,
    "The chain the brief asks for — Academy",
    "The chain this section states — Academy",
    "prose: Master Data Model intro",
)
c = r1(
    c,
    "this document does not restate that table, only confirms it against the brief's own naming and notes the one place it already names an honest gap.",
    "this document does not restate that table, only confirms it against the workflow's own naming below and notes the one place it already names an honest gap.",
    "prose: Master Workflow intro",
)
c = r1(
    c,
    "The brief's naming and the platform's own naming match stage for stage.",
    "The workflow's stage naming and the platform's own naming match stage for stage.",
    "prose: Master Workflow closing",
)
c = r1(
    c,
    "This audit was carried out against the brief's own checklist.",
    "This audit was carried out against a standard institutional audit checklist.",
    "prose: Final Audit intro",
)
c = r1(
    c,
    "(including this document's own brief) to mean the combined set of academic documents,",
    "in informal use to mean the combined set of academic documents,",
    "prose: audit table terminology row",
)
c = r1(
    c,
    'that "Academic Catalogue" in the brief means the combined index of existing documents',
    'that "Academic Catalogue," as referenced in Academy-wide planning, means the combined index of existing documents',
    "prose: assumptions paragraph",
)
c = r1(
    c,
    "Flagged at the end of Academic Regulations, Records &amp; Quality Assurance and named directly in this Model's brief:",
    "Flagged at the end of Academic Regulations, Records &amp; Quality Assurance as the platform's one remaining static placeholder page:",
    "prose: decision 88 (Student Enrollees page) -- remove Model/brief leak",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("lib/legalContentDefaults.js: 'the brief' / 'this Model's brief' leak phrases removed from the new document.")
