# -*- coding: utf-8 -*-
import io
import os

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:200])
    return content.replace(old, new)

# =======================================================================
# Model 24:
#  (A) footer address -- shows the requested placeholder format now
#      (still clearly a placeholder pending the real street address,
#      editable at /admin/legal-pages/contact whenever you have it).
#  (B) footer Academy/Institute column crowding, fixed at its real
#      cause (a forced 2-column compact layout with no room left).
#  (C) new focused "Admission Requirements" document, split out of the
#      Academy Pathways document's own real Entry/Placement content
#      (not invented) -- and the Admission & Registration dropdown
#      updated so "Admission Requirements" and the fuller pathways
#      overview are both there, distinctly named.
# =======================================================================

# -----------------------------------------------------------------------
# A) components/SiteFooter.jsx -- CONTACT_DEFAULTS.address
# -----------------------------------------------------------------------
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "const CONTACT_DEFAULTS = {\n"
    "  address: null,\n"
    "  phone: null,\n"
    "  email: 'info@ululazm.org',\n"
    "  admissionsEmail: 'admissions@ululazm.org',\n"
    "};",
    "// address is a placeholder ('[Street / Building Name]') until the\n"
    "// real one is entered at /admin/legal-pages/contact -- shows the\n"
    "// requested Address / Ulul Azm Institute, / [Street], / Accra,\n"
    "// Ghana layout immediately rather than hiding the block entirely.\n"
    "const CONTACT_DEFAULTS = {\n"
    "  address: 'Ulul Azm Institute, [Street / Building Name], Accra, Ghana',\n"
    "  phone: null,\n"
    "  email: 'info@ululazm.org',\n"
    "  admissionsEmail: 'admissions@ululazm.org',\n"
    "};",
    "components/SiteFooter.jsx CONTACT_DEFAULTS.address",
)

# -----------------------------------------------------------------------
# B) components/SiteFooter.jsx -- footer column crowding. Academy has 8
#    links, over the old ">6" compact-2-column threshold, and at the
#    current ~140px column width that compact 2-column sub-grid left
#    each sub-column only ~60px wide -- every link wrapped onto 2-3
#    lines right next to the Institute column with almost no gap,
#    which is the "mixing together" you're seeing. Institute's 6 links
#    never triggered the compact mode and read fine as one column, so
#    the fix is letting Academy do the same (raise the threshold) and
#    a touch more breathing room between every column.
# -----------------------------------------------------------------------
c = r1(
    c,
    "function FooterColumn({ title, children }) {\n"
    "  // A column with a lot of links (e.g. a CMS-managed group covering\n"
    "  // every Academy governance page) packs into two short CSS columns\n"
    "  // instead of one long one -- same links, half the vertical height.\n"
    "  const isLong = Children.count(children) > 6;",
    "function FooterColumn({ title, children }) {\n"
    "  // A column with a lot of links packs into two short CSS columns\n"
    "  // instead of one long one -- same links, half the vertical height.\n"
    "  // Raised from >6 to >8 (2026-09): at the footer's current 6-column\n"
    "  // width, Academy's 8 links were tipping into this compact mode and\n"
    "  // getting squeezed into two ~60px-wide sub-columns right next to\n"
    "  // Institute with barely any gap -- every link wrapping 2-3 lines\n"
    "  // and visually running into the next column. One plain column,\n"
    "  // like Institute's own 6 links already use, reads cleanly instead.\n"
    "  const isLong = Children.count(children) > 8;",
    "components/SiteFooter.jsx FooterColumn isLong threshold",
)

c = r1(
    c,
    "  gridTemplateColumns: 'minmax(210px,1.2fr) repeat(auto-fit,minmax(120px,1fr))',\n"
    "  gap: '24px',",
    "  gridTemplateColumns: 'minmax(210px,1.2fr) repeat(auto-fit,minmax(120px,1fr))',\n"
    "  gap: '28px',",
    "components/SiteFooter.jsx footerGrid gap",
)

save(path, c)
print("components/SiteFooter.jsx: address placeholder now shows the requested format; Academy/Institute crowding fixed (Academy back to one clean column, wider column gap).")

# -----------------------------------------------------------------------
# C1) lib/legalContentDefaults.js -- new 'admission-requirements' entry.
#     Every fact here is drawn straight from academy-pathways' own real
#     §2 (per-pathway Entry requirements) and §8 (Entry and Placement,
#     RPL) -- reorganized into one requirements-only document, nothing
#     invented.
# -----------------------------------------------------------------------
path = "lib/legalContentDefaults.js"
c = load(path)

admission_requirements_entry = (
    "  'admission-requirements': {\n"
    "    title: 'Admission Requirements',\n"
    "    bodyHtml: `\n"
    "      <p><strong>Admission Requirements.</strong> This page covers only what it takes to enter each Ulul Azm Academy pathway. For the full pathway descriptions, qualification framework and course structure, see <a href=\"/academy-pathways\">Academic Pathways &amp; Qualifications</a>.</p>\n"
    "\n"
    "      <h2>1. How Placement Works</h2>\n"
    "      <p>Every applicant is placed by evidence, never by age or self-report alone. Placement draws on seven inputs:</p>\n"
    "      <ul>\n"
    "      <li>Previous education (Islamic and general)</li>\n"
    "      <li>Existing Islamic Studies knowledge</li>\n"
    "      <li>Qur'an reading ability</li>\n"
    "      <li>Tajweed level</li>\n"
    "      <li>Hifz (memorization) progress, where relevant</li>\n"
    "      <li>Arabic proficiency</li>\n"
    "      <li>General learning readiness</li>\n"
    "      </ul>\n"
    "\n"
    "      <h2>2. Entry Requirements by Pathway</h2>\n"
    "\n"
    "      <h3>Foundation Studies</h3>\n"
    "      <p>None beyond basic literacy and willingness to be placed by a short readiness assessment — deliberately the pathway with no prerequisite, and the default entry point for anyone with no prior structured Islamic education. Leads to a Certificate of Foundation Studies.</p>\n"
    "\n"
    "      <h3>Intermediate Islamic Studies</h3>\n"
    "      <p>Completed Foundation Studies, or a placement assessment demonstrating equivalent competence. Leads to a Certificate of Intermediate Islamic Studies.</p>\n"
    "\n"
    "      <h3>Advanced Islamic Studies</h3>\n"
    "      <p>Completed Intermediate Islamic Studies, or a placement assessment demonstrating equivalent competence. Leads to a Certificate of Advanced Islamic Studies.</p>\n"
    "\n"
    "      <h3>Diploma in Islamic Studies</h3>\n"
    "      <p>Completed Advanced Islamic Studies, or a comprehensive placement assessment demonstrating equivalent competence across all prior tiers — held to a higher evidentiary bar than lower-tier placement, given the weight of the credential it leads to. Leads to the Diploma in Islamic Studies.</p>\n"
    "\n"
    "      <h3>Specialized Certificate Programs</h3>\n"
    "      <p>Completing Advanced Islamic Studies or the Diploma is the baseline, plus that certificate's own specific prerequisite once approved.</p>\n"
    "      <blockquote>No Specialized Certificate has an approved course list yet — see <a href=\"/academy-pathways\">Academic Pathways &amp; Qualifications</a> §7 for the approval criteria this framework requires before one is offered.</blockquote>\n"
    "\n"
    "      <h2>3. Recognition of Prior Learning (RPL)</h2>\n"
    "      <p>A learner's own account of their prior learning is never sufficient by itself. Recognition happens only through the same placement assessment every other entrant goes through — evidence-based, administered by Academic Advising or the relevant Department, and documented in the learner's record.</p>\n"
    "\n"
    "      <h2>4. How to Apply</h2>\n"
    "      <p>Ready to apply? Start your application, track an existing one, or review the registration process:</p>\n"
    "      <ul>\n"
    "      <li><a href=\"/admission\">Apply Now</a></li>\n"
    "      <li><a href=\"/admission/track\">Track Your Application</a></li>\n"
    "      </ul>\n"
    "    `,\n"
    "  },\n"
)

c = r1(
    c,
    "  'academy-foundation': {",
    admission_requirements_entry + "  'academy-foundation': {",
    "lib/legalContentDefaults.js DEFAULT_PAGES insert admission-requirements",
)

save(path, c)
print("lib/legalContentDefaults.js: added 'admission-requirements' -- real content drawn from academy-pathways' own Entry Requirements/Placement sections.")

# -----------------------------------------------------------------------
# C2) New public page app/admission-requirements/page.jsx -- identical
#     pattern to app/academy-foundation/page.jsx.
# -----------------------------------------------------------------------
admission_requirements_public_page = """'use client';

import PublicLegalPageClient from '@/components/PublicLegalPageClient';

export default function AdmissionRequirementsPage() {
  return (
    <PublicLegalPageClient
      slug="admission-requirements"
      fallbackTitle="Admission Requirements"
    />
  );
}
"""

os.makedirs("app/admission-requirements", exist_ok=True)
save("app/admission-requirements/page.jsx", admission_requirements_public_page)
print("app/admission-requirements/page.jsx: created.")

# -----------------------------------------------------------------------
# C3) New admin editor app/admin/legal-pages/admission-requirements/page.jsx
#     -- nests under the existing Legal & Info Pages admin layout so it
#     gets that family's cross-nav for free.
# -----------------------------------------------------------------------
admission_requirements_admin_page = """'use client';

import LegalPageEditorClient from '@/components/LegalPageEditorClient';

export default function AdmissionRequirementsEditor() {
  return (
    <LegalPageEditorClient
      slug="admission-requirements"
      heading="Admission Requirements"
      hint="Entry/placement criteria only, split out from Academic Pathways & Qualifications so applicants see just what they need. Shown publicly at /admission-requirements and linked from the Admission & Registration menu."
    />
  );
}
"""

os.makedirs("app/admin/legal-pages/admission-requirements", exist_ok=True)
save("app/admin/legal-pages/admission-requirements/page.jsx", admission_requirements_admin_page)
print("app/admin/legal-pages/admission-requirements/page.jsx: created.")

# -----------------------------------------------------------------------
# C4) app/admin/legal-pages/layout.jsx -- nav entry for the new editor.
# -----------------------------------------------------------------------
path = "app/admin/legal-pages/layout.jsx"
c = load(path)

c = r1(
    c,
    "const sections = [\n"
    "  { href: '/admin/legal-pages/about', label: 'About', icon: '\U0001F54C' },\n"
    "  { href: '/admin/legal-pages/contact', label: 'Contact', icon: '☎️' },\n"
    "  { href: '/admin/legal-pages/faq', label: 'FAQ', icon: '❓' },",
    "const sections = [\n"
    "  { href: '/admin/legal-pages/about', label: 'About', icon: '\U0001F54C' },\n"
    "  { href: '/admin/legal-pages/admission-requirements', label: 'Admission Requirements', icon: '\U0001F4CB' },\n"
    "  { href: '/admin/legal-pages/contact', label: 'Contact', icon: '☎️' },\n"
    "  { href: '/admin/legal-pages/faq', label: 'FAQ', icon: '❓' },",
    "app/admin/legal-pages/layout.jsx sections nav",
)

save(path, c)
print("app/admin/legal-pages/layout.jsx: added 'Admission Requirements' to the Legal & Info Pages admin sidebar.")

# -----------------------------------------------------------------------
# C5) app/api/admin/legal-pages/[slug]/route.js -- VALID_SLUGS whitelist.
# -----------------------------------------------------------------------
path = "app/api/admin/legal-pages/[slug]/route.js"
c = load(path)

c = r1(
    c,
    "const VALID_SLUGS = ['about', 'privacy', 'terms', 'refund', 'academy-foundation', 'academy-governance', 'academy-pathways', 'academy-curriculum', 'academy-department-curriculum', 'academy-course-catalogue', 'academy-course-specifications', 'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'];",
    "const VALID_SLUGS = ['about', 'privacy', 'terms', 'refund', 'admission-requirements', 'academy-foundation', 'academy-governance', 'academy-pathways', 'academy-curriculum', 'academy-department-curriculum', 'academy-course-catalogue', 'academy-course-specifications', 'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'];",
    "app/api/admin/legal-pages/[slug]/route.js VALID_SLUGS",
)

save(path, c)
print("app/api/admin/legal-pages/[slug]/route.js: whitelisted 'admission-requirements'.")

# -----------------------------------------------------------------------
# C6) app/api/legal-content/route.js -- public payload whitelist (the
#     one Model 22 sealed to just the genuinely public slugs).
# -----------------------------------------------------------------------
path = "app/api/legal-content/route.js"
c = load(path)

c = r1(
    c,
    "  const PUBLIC_SLUGS = ['about', 'privacy', 'terms', 'refund', 'academy-foundation', 'academy-pathways'];",
    "  const PUBLIC_SLUGS = ['about', 'privacy', 'terms', 'refund', 'admission-requirements', 'academy-foundation', 'academy-pathways'];",
    "app/api/legal-content/route.js PUBLIC_SLUGS",
)

save(path, c)
print("app/api/legal-content/route.js: 'admission-requirements' added to the public whitelist.")

# -----------------------------------------------------------------------
# C7) app/api/search/route.js -- searchable too.
# -----------------------------------------------------------------------
path = "app/api/search/route.js"
c = load(path)

c = r1(
    c,
    "const ACADEMY_SLUGS = [\n"
    "  \"academy-foundation\",\n"
    "  \"academy-pathways\",\n"
    "];",
    "const ACADEMY_SLUGS = [\n"
    "  \"academy-foundation\",\n"
    "  \"academy-pathways\",\n"
    "  \"admission-requirements\",\n"
    "];",
    "app/api/search/route.js ACADEMY_SLUGS",
)

save(path, c)
print("app/api/search/route.js: 'admission-requirements' now searchable.")

# -----------------------------------------------------------------------
# C8) components/SiteHeader.jsx -- Admission & Registration dropdown:
#     "Admission Requirements" now points to the new focused document;
#     the fuller pathways/qualification content gets its own, distinct
#     label rather than sharing the "Admission Requirements" label for
#     content that was never just requirements.
# -----------------------------------------------------------------------
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'How to Apply', href: '/admission' },\n"
    "  { label: 'Registration & Enrollment', href: '/admission' },\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];",
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Admission Requirements', href: '/admission-requirements' },\n"
    "  { label: 'Academic Pathways & Qualifications', href: '/academy-pathways' },\n"
    "  { label: 'How to Apply', href: '/admission' },\n"
    "  { label: 'Registration & Enrollment', href: '/admission' },\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];",
    "components/SiteHeader.jsx ADMISSION_DROPDOWN_ITEMS",
)

save(path, c)
print("components/SiteHeader.jsx: Admission & Registration now lists Admission Requirements (focused) and Academic Pathways & Qualifications (the fuller document) separately.")
