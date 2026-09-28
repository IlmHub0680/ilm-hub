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

OLD_SECTIONS_ROW = "  { href: '/admin/academy-academic-regulations', label: 'Academic Regulations & QA', icon: '⚖️' },\n"
NEW_SECTIONS_ROW = (
    OLD_SECTIONS_ROW
    + "  { href: '/admin/academy-master-integration', label: 'Website & Master Integration', icon: '\U0001F9E9' },\n"
)

OLD_INCLUDES = "'/admin/academy-faculty-portals', '/admin/academy-academic-regulations'].includes(item.href)"
NEW_INCLUDES = "'/admin/academy-faculty-portals', '/admin/academy-academic-regulations', '/admin/academy-master-integration'].includes(item.href)"

# Remaining files not yet touched: academy-pathways, academy-student-lifecycle,
# and the brand-new academy-master-integration layout itself (which was
# copied from academy-academic-regulations and therefore carries the same
# un-extended sections/includes it had before being copied).
layout_files = [
    "app/admin/academy-pathways/layout.jsx",
    "app/admin/academy-student-lifecycle/layout.jsx",
    "app/admin/academy-master-integration/layout.jsx",
]

for path in layout_files:
    c = load(path)
    c = r1(c, OLD_SECTIONS_ROW, NEW_SECTIONS_ROW, "%s: sections row" % path)
    c = r1(c, OLD_INCLUDES, NEW_INCLUDES, "%s: includes array" % path)
    save(path, c)

print("Updated nav `sections` array in %d remaining admin layout.jsx files." % len(layout_files))

# ---------------------------------------------------------------------
# app/admin/(overview)/layout.jsx -- adminOwnedSections array
# ---------------------------------------------------------------------
path = "app/admin/(overview)/layout.jsx"
c = load(path)
c = r1(
    c,
    """    { title: 'Academic Regulations & QA', href: '/admin/academy-academic-regulations', icon: '⚖️', description: "Manage the Academy's academic regulations, records framework, quality assurance cycle, program and course review, and computed academic KPIs — including the real academic integrity case-tracking and course/program approval workflow." },
    { title: 'Legal & Info Pages', href: '/admin/legal-pages', icon: '📜', description: 'Manage the public About, Contact, FAQ, Privacy Policy, Terms of Use and Refund Policy pages — no code changes needed.' },""",
    """    { title: 'Academic Regulations & QA', href: '/admin/academy-academic-regulations', icon: '⚖️', description: "Manage the Academy's academic regulations, records framework, quality assurance cycle, program and course review, and computed academic KPIs — including the real academic integrity case-tracking and course/program approval workflow." },
    { title: 'Website & Master Integration', href: '/admin/academy-master-integration', icon: '\U0001F9E9', description: 'Manage the Academy read as one master model — website structure, the Academic Programs homepage section, programme pages, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and the final audit.' },
    { title: 'Legal & Info Pages', href: '/admin/legal-pages', icon: '📜', description: 'Manage the public About, Contact, FAQ, Privacy Policy, Terms of Use and Refund Policy pages — no code changes needed.' },""",
    "(overview)/layout.jsx: adminOwnedSections",
)
save(path, c)
print("Updated app/admin/(overview)/layout.jsx adminOwnedSections.")
