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

NEW_ICON = "\U0001F9E9"  # puzzle piece
NEW_TITLE = "Website, Recognition Readiness & Master Integration"
NEW_DESC = (
    "The Academy read as one master model: website structure, the homepage "
    "Academic Programs section, what a programme page contains, the Academic "
    "Catalogue index, recognition & accreditation readiness, the master data "
    "model and workflow, and a final audit -- including the correction that "
    "made the course catalogue and three pathway programmes real."
)
NEW_HREF = "/academy-master-integration"

results = []

# ---------------------------------------------------------------------
# 1. app/academy/page.jsx -- DEFAULT_CARDS
# ---------------------------------------------------------------------
path = "app/academy/page.jsx"
c = load(path)
c = r1(
    c,
    """  {
    icon: '⚖️',
    title: 'Academic Regulations & QA',
    description:
      'Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.',
    href: '/academy-academic-regulations',
  },
];""",
    """  {
    icon: '⚖️',
    title: 'Academic Regulations & QA',
    description:
      'Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.',
    href: '/academy-academic-regulations',
  },
  {
    icon: '%s',
    title: '%s',
    description:
      '%s',
    href: '%s',
  },
];""" % (NEW_ICON, NEW_TITLE, NEW_DESC, NEW_HREF),
    "app/academy/page.jsx: add master-integration card",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 2. app/api/academy-hub/route.js -- DEFAULT_CARDS (mirrored, double-quoted)
# ---------------------------------------------------------------------
path = "app/api/academy-hub/route.js"
c = load(path)
c = r1(
    c,
    """  {
    icon: "⚖️",
    title: "Academic Regulations & QA",
    description:
      "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.",
    href: "/academy-academic-regulations",
  },
];""",
    """  {
    icon: "⚖️",
    title: "Academic Regulations & QA",
    description:
      "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.",
    href: "/academy-academic-regulations",
  },
  {
    icon: "%s",
    title: "%s",
    description:
      "%s",
    href: "%s",
  },
];""" % (NEW_ICON, NEW_TITLE, NEW_DESC, NEW_HREF),
    "app/api/academy-hub/route.js: add master-integration card",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 3. app/page.jsx -- footer link group ("Institute")
# ---------------------------------------------------------------------
path = "app/page.jsx"
c = load(path)
c = r1(
    c,
    """        { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },
        { label: 'Contact', href: '/contact' },""",
    """        { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },
        { label: 'Website & Master Integration', href: '/academy-master-integration' },
        { label: 'Contact', href: '/contact' },""",
    "app/page.jsx: add footer link",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 4. app/api/homepage-content/route.js -- footer default links (mirrored)
# ---------------------------------------------------------------------
path = "app/api/homepage-content/route.js"
c = load(path)
c = r1(
    c,
    """      { label: "Academic Regulations & QA", href: "/academy-academic-regulations" },
      { label: "Contact", href: "/contact" },""",
    """      { label: "Academic Regulations & QA", href: "/academy-academic-regulations" },
      { label: "Website & Master Integration", href: "/academy-master-integration" },
      { label: "Contact", href: "/contact" },""",
    "app/api/homepage-content/route.js: add footer link",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 5. app/api/admin/legal-pages/[slug]/route.js -- VALID_SLUGS
# ---------------------------------------------------------------------
path = "app/api/admin/legal-pages/[slug]/route.js"
c = load(path)
c = r1(
    c,
    "'academy-faculty-portals', 'academy-academic-regulations'];",
    "'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'];",
    "legal-pages/[slug]/route.js: VALID_SLUGS",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 6. app/api/legal-content/route.js -- VALID_SLUGS (inline array)
# ---------------------------------------------------------------------
path = "app/api/legal-content/route.js"
c = load(path)
c = r1(
    c,
    "'academy-faculty-portals', 'academy-academic-regulations'] } },",
    "'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'] } },",
    "legal-content/route.js: VALID_SLUGS",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 7. prisma/schema.prisma -- LegalPage slug comment
# ---------------------------------------------------------------------
path = "prisma/schema.prisma"
c = load(path)
c = r1(
    c,
    """  // academy-student-lifecycle, academy-faculty-portals,
  // academy-academic-regulations — enforced at the API layer, not
  // the DB, so no migration is needed to add another page later.""",
    """  // academy-student-lifecycle, academy-faculty-portals,
  // academy-academic-regulations, academy-master-integration —
  // enforced at the API layer, not the DB, so no migration is
  // needed to add another page later.""",
    "schema.prisma: LegalPage comment",
)
save(path, c)
results.append(path)

# ---------------------------------------------------------------------
# 8. prisma/seed.js -- footer link group (Institute) + renumber, and
#    academyHubCardsDefault + comment.
# ---------------------------------------------------------------------
path = "prisma/seed.js"
c = load(path)
c = r1(
    c,
    """      { id: "footer-link-academic-regulations", label: "Academic Regulations & QA", href: "/academy-academic-regulations", order: 11 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 12 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 13 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 14 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 15 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 16 },""",
    """      { id: "footer-link-academic-regulations", label: "Academic Regulations & QA", href: "/academy-academic-regulations", order: 11 },
      { id: "footer-link-master-integration", label: "Website & Master Integration", href: "/academy-master-integration", order: 12 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 13 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 14 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 15 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 16 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 17 },""",
    "seed.js: footer link group -- add + renumber",
)
c = r1(
    c,
    '  { id: "academy-hub-card-academic-regulations", icon: "⚖️", title: "Academic Regulations & QA", description: "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.", href: "/academy-academic-regulations", order: 10 },\n];',
    '  { id: "academy-hub-card-academic-regulations", icon: "⚖️", title: "Academic Regulations & QA", description: "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.", href: "/academy-academic-regulations", order: 10 },\n'
    '  { id: "academy-hub-card-master-integration", icon: "\U0001F9E9", title: "Website, Recognition Readiness & Master Integration", description: "The Academy read as one master model — website structure, the Academic Programs homepage section, programme pages, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and a final audit.", href: "/academy-master-integration", order: 11 },\n];',
    "seed.js: academyHubCardsDefault -- add card",
)
save(path, c)
results.append(path)

print("CMS wiring complete. Touched files:")
for r in results:
    print(" -", r)
