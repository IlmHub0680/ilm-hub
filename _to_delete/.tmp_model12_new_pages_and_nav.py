# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def r_all(content, old, new, label, expected):
    c = content.count(old)
    assert c == expected, "%s: expected %d matches, found %d" % (label, expected, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

# ---------------------------------------------------------------------
# 1. New public page: app/academy-master-integration/page.jsx
# ---------------------------------------------------------------------
PUBLIC_PAGE = """'use client';

import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export default function AcademyMasterIntegrationPage() {
  return (
    <PublicLegalPageClient
      slug="academy-master-integration"
      fallbackTitle="Website, Recognition Readiness & Master Integration"
    />
  );
}
"""
save("app/academy-master-integration/page.jsx", PUBLIC_PAGE)

# ---------------------------------------------------------------------
# 2. New admin editor page: app/admin/academy-master-integration/page.jsx
# ---------------------------------------------------------------------
ADMIN_PAGE = """'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AcademyMasterIntegrationEditor() {
  return (
    <LegalPageEditorClient
      slug="academy-master-integration"
      heading="Website, Recognition Readiness & Master Integration"
      hint="The Academy read as one master model: website structure, the homepage Academic Programs section, what a programme page contains, the Academic Catalogue index, recognition & accreditation readiness (no accreditation claimed), the master data model and workflow, master academic alignment, and a final audit -- including the correction that made the course catalogue and three pathway programmes real. Shown publicly at /academy-master-integration. Builds on every prior framework from Academy Foundation through Academic Regulations & QA, consolidating what each already governs rather than restating it."
    />
  );
}
"""
save("app/admin/academy-master-integration/page.jsx", ADMIN_PAGE)

# ---------------------------------------------------------------------
# 3. New admin layout: app/admin/academy-master-integration/layout.jsx
#    (copy of the academy-academic-regulations layout pattern, with the
#    sections list extended and the new item appended)
# ---------------------------------------------------------------------
old_layout = load("app/admin/academy-academic-regulations/layout.jsx")

new_layout = old_layout.replace(
    "export default function AcademyAcademicRegulationsLayout({ children }) {",
    "export default function AcademyMasterIntegrationLayout({ children }) {",
)
new_layout = new_layout.replace(
    "          The Academy's academic regulations, records framework, quality\n"
    "          assurance cycle, program and course review, and computed\n"
    "          academic KPIs live here, admin-editable like the Legal &amp;\n"
    "          Info Pages — grouped with every other Academy governance\n"
    "          document since together they shape how the Institute presents\n"
    "          and governs itself.",
    "          The Academy read as one master model lives here, admin-editable\n"
    "          like the Legal &amp; Info Pages — website structure, the\n"
    "          Academic Programs homepage section, programme pages, the\n"
    "          Academic Catalogue index, recognition &amp; accreditation\n"
    "          readiness, the master data model and workflow, and a final\n"
    "          audit — grouped with every other Academy governance document\n"
    "          since it closes the series they belong to.",
)
assert new_layout != old_layout, "admin layout: heading text replace failed"
save("app/admin/academy-master-integration/layout.jsx", new_layout)

print("New pages written: public page, admin editor page, admin layout.")

# ---------------------------------------------------------------------
# 4. Extend the `sections` nav array (and the pathname `.includes()`
#    array) in every admin layout.jsx that carries it -- 13 files,
#    identical array text in each.
# ---------------------------------------------------------------------
OLD_SECTIONS_ROW = "  { href: '/admin/academy-academic-regulations', label: 'Academic Regulations & QA', icon: '⚖️' },\n"
NEW_SECTIONS_ROW = (
    OLD_SECTIONS_ROW
    + "  { href: '/admin/academy-master-integration', label: 'Website & Master Integration', icon: '\U0001F9E9' },\n"
)

OLD_INCLUDES = "'/admin/academy-faculty-portals', '/admin/academy-academic-regulations'].includes(item.href)"
NEW_INCLUDES = "'/admin/academy-faculty-portals', '/admin/academy-academic-regulations', '/admin/academy-master-integration'].includes(item.href)"

layout_files = [
    "app/admin/academy-academic-regulations/layout.jsx",
    "app/admin/academy-assessment-grading/layout.jsx",
    "app/admin/academy-course-catalogue/layout.jsx",
    "app/admin/academy-course-specifications/layout.jsx",
    "app/admin/academy-curriculum/layout.jsx",
    "app/admin/academy-department-curriculum/layout.jsx",
    "app/admin/academy-faculty-portals/layout.jsx",
    "app/admin/academy-foundation/layout.jsx",
    "app/admin/academy-governance/layout.jsx",
    "app/admin/academy-hub/layout.jsx",
    "app/admin/academy-pathways/layout.jsx",
    "app/admin/academy-student-lifecycle/layout.jsx",
    "app/admin/academy-master-integration/layout.jsx",
]

for path in layout_files:
    c = load(path)
    c = r1(c, OLD_SECTIONS_ROW, NEW_SECTIONS_ROW, "%s: sections row" % path)
    c = r1(c, OLD_INCLUDES, NEW_INCLUDES, "%s: includes array" % path)
    save(path, c)

print("Updated nav `sections` array in %d admin layout.jsx files." % len(layout_files))

# ---------------------------------------------------------------------
# 5. app/admin/(overview)/layout.jsx -- adminOwnedSections array
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
