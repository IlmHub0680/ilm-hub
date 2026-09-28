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


# ---------------------------------------------------------------------
# 1. Ten sibling admin layouts (the nine from Model 10 plus the new
#    academy-faculty-portals layout itself) sharing the identical
#    `sections` array and inline active-href ternary list.
# ---------------------------------------------------------------------
SIBLING_LAYOUTS = [
    "app/admin/academy-foundation/layout.jsx",
    "app/admin/academy-governance/layout.jsx",
    "app/admin/academy-pathways/layout.jsx",
    "app/admin/academy-curriculum/layout.jsx",
    "app/admin/academy-department-curriculum/layout.jsx",
    "app/admin/academy-course-catalogue/layout.jsx",
    "app/admin/academy-course-specifications/layout.jsx",
    "app/admin/academy-assessment-grading/layout.jsx",
    "app/admin/academy-student-lifecycle/layout.jsx",
    "app/admin/academy-faculty-portals/layout.jsx",
]

OLD_SECTIONS_LINE = "  { href: '/admin/academy-faculty-portals', label: 'Faculty & Portals', icon: '\U0001F465' },\n"
NEW_SECTIONS_LINE = OLD_SECTIONS_LINE + "  { href: '/admin/academy-academic-regulations', label: 'Academic Regulations & QA', icon: '⚖️' },\n"

OLD_ACTIVE_LIST = "['/admin/academy-hub', '/admin/academy-foundation', '/admin/academy-governance', '/admin/academy-pathways', '/admin/academy-curriculum', '/admin/academy-department-curriculum', '/admin/academy-course-catalogue', '/admin/academy-course-specifications', '/admin/academy-assessment-grading', '/admin/academy-student-lifecycle', '/admin/academy-faculty-portals'].includes(item.href)"
NEW_ACTIVE_LIST = "['/admin/academy-hub', '/admin/academy-foundation', '/admin/academy-governance', '/admin/academy-pathways', '/admin/academy-curriculum', '/admin/academy-department-curriculum', '/admin/academy-course-catalogue', '/admin/academy-course-specifications', '/admin/academy-assessment-grading', '/admin/academy-student-lifecycle', '/admin/academy-faculty-portals', '/admin/academy-academic-regulations'].includes(item.href)"

for path in SIBLING_LAYOUTS:
    c = load(path)
    c = r1(c, OLD_SECTIONS_LINE, NEW_SECTIONS_LINE, path + " sections array")
    c = r1(c, OLD_ACTIVE_LIST, NEW_ACTIVE_LIST, path + " active href list")
    save(path, c)
    print("updated", path)

# ---------------------------------------------------------------------
# 2. academy-hub layout: sections array + ACADEMY_SECTION_HREFS array
# ---------------------------------------------------------------------
path = "app/admin/academy-hub/layout.jsx"
c = load(path)
c = r1(c, OLD_SECTIONS_LINE, NEW_SECTIONS_LINE, path + " sections array")
c = r1(
    c,
    "  '/admin/academy-student-lifecycle',\n  '/admin/academy-faculty-portals',\n];",
    "  '/admin/academy-student-lifecycle',\n  '/admin/academy-faculty-portals',\n  '/admin/academy-academic-regulations',\n];",
    path + " ACADEMY_SECTION_HREFS",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 3. admin/(overview)/layout.jsx: adminOwnedSections entry
# ---------------------------------------------------------------------
path = "app/admin/(overview)/layout.jsx"
c = load(path)
c = r1(
    c,
    '    { title: \'Faculty & Portals\', href: \'/admin/academy-faculty-portals\', icon: \'\U0001F465\', description: "Manage the Academy\'s faculty and staff structure, Instructor Profile, and academic portals framework — roles, the role/permission matrix, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals." },',
    '    { title: \'Faculty & Portals\', href: \'/admin/academy-faculty-portals\', icon: \'\U0001F465\', description: "Manage the Academy\'s faculty and staff structure, Instructor Profile, and academic portals framework — roles, the role/permission matrix, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals." },\n    { title: \'Academic Regulations & QA\', href: \'/admin/academy-academic-regulations\', icon: \'⚖️\', description: "Manage the Academy\'s academic regulations, records framework, quality assurance cycle, program and course review, and computed academic KPIs — including the real academic integrity case-tracking and course/program approval workflow." },',
    "overview layout adminOwnedSections",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 4. VALID_SLUGS in the two API slug-list files
# ---------------------------------------------------------------------
for path in [
    "app/api/admin/legal-pages/[slug]/route.js",
    "app/api/legal-content/route.js",
]:
    c = load(path)
    c = r1(
        c,
        "'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals']",
        "'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals', 'academy-academic-regulations']",
        path + " slug list",
    )
    save(path, c)
    print("updated", path)

# ---------------------------------------------------------------------
# 5. app/academy/page.jsx — DEFAULT_CARDS
# ---------------------------------------------------------------------
path = "app/academy/page.jsx"
c = load(path)
c = r1(
    c,
    """  {
    icon: '\U0001F465',
    title: 'Faculty & Portals',
    description:
      'The Academy\\'s faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.',
    href: '/academy-faculty-portals',
  },
];""",
    """  {
    icon: '\U0001F465',
    title: 'Faculty & Portals',
    description:
      'The Academy\\'s faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.',
    href: '/academy-faculty-portals',
  },
  {
    icon: '⚖️',
    title: 'Academic Regulations & QA',
    description:
      'Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.',
    href: '/academy-academic-regulations',
  },
];""",
    "academy hub page DEFAULT_CARDS",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 6. app/api/academy-hub/route.js — DEFAULT_CARDS (double-quote style)
# ---------------------------------------------------------------------
path = "app/api/academy-hub/route.js"
c = load(path)
c = r1(
    c,
    """  {
    icon: "\U0001F465",
    title: "Faculty & Portals",
    description:
      "The Academy's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.",
    href: "/academy-faculty-portals",
  },
];""",
    """  {
    icon: "\U0001F465",
    title: "Faculty & Portals",
    description:
      "The Academy's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.",
    href: "/academy-faculty-portals",
  },
  {
    icon: "⚖️",
    title: "Academic Regulations & QA",
    description:
      "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.",
    href: "/academy-academic-regulations",
  },
];""",
    "api academy-hub route DEFAULT_CARDS",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 7. Footer links: app/api/homepage-content/route.js, app/page.jsx
# ---------------------------------------------------------------------
path = "app/api/homepage-content/route.js"
c = load(path)
c = r1(
    c,
    '      { label: "Student Lifecycle", href: "/academy-student-lifecycle" },\n      { label: "Faculty & Portals", href: "/academy-faculty-portals" },',
    '      { label: "Student Lifecycle", href: "/academy-student-lifecycle" },\n      { label: "Faculty & Portals", href: "/academy-faculty-portals" },\n      { label: "Academic Regulations & QA", href: "/academy-academic-regulations" },',
    "homepage-content route footer links",
)
save(path, c)
print("updated", path)

path = "app/page.jsx"
c = load(path)
c = r1(
    c,
    "        { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n        { label: 'Faculty & Portals', href: '/academy-faculty-portals' },",
    "        { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n        { label: 'Faculty & Portals', href: '/academy-faculty-portals' },\n        { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },",
    "app/page.jsx footer links",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 8. prisma/seed.js — footer group (insert + renumber) and academy hub
#    cards default list.
# ---------------------------------------------------------------------
path = "prisma/seed.js"
c = load(path)
c = r1(
    c,
    """      { id: "footer-link-faculty-portals", label: "Faculty & Portals", href: "/academy-faculty-portals", order: 10 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 11 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 12 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 13 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 14 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 15 },""",
    """      { id: "footer-link-faculty-portals", label: "Faculty & Portals", href: "/academy-faculty-portals", order: 10 },
      { id: "footer-link-academic-regulations", label: "Academic Regulations & QA", href: "/academy-academic-regulations", order: 11 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 12 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 13 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 14 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 15 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 16 },""",
    "seed.js footer links insert + renumber",
)
OLD_HUB_CARD_LINE = (
    '  { id: "academy-hub-card-faculty-portals", icon: "\U0001F465", title: "Faculty & Portals", description: "The Academy'
    + "'"
    + 's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.", href: "/academy-faculty-portals", order: 9 },\n];'
)
NEW_HUB_CARD_LINE = (
    '  { id: "academy-hub-card-faculty-portals", icon: "\U0001F465", title: "Faculty & Portals", description: "The Academy'
    + "'"
    + 's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.", href: "/academy-faculty-portals", order: 9 },\n'
    + '  { id: "academy-hub-card-academic-regulations", icon: "⚖️", title: "Academic Regulations & QA", description: "Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.", href: "/academy-academic-regulations", order: 10 },\n];'
)
c = r1(
    c,
    OLD_HUB_CARD_LINE,
    NEW_HUB_CARD_LINE,
    "seed.js academyHubCardsDefault",
)
save(path, c)
print("updated", path)

# ---------------------------------------------------------------------
# 9. prisma/schema.prisma — LegalPage slug comment
# ---------------------------------------------------------------------
path = "prisma/schema.prisma"
c = load(path)
c = r1(
    c,
    "  // academy-student-lifecycle, academy-faculty-portals — enforced at\n  // the API layer, not the DB, so no migration is needed to add\n  // another page later.",
    "  // academy-student-lifecycle, academy-faculty-portals,\n  // academy-academic-regulations — enforced at the API layer, not\n  // the DB, so no migration is needed to add another page later.",
    "schema.prisma LegalPage comment",
)
save(path, c)
print("updated", path)

print("\nAll Model 11 CMS wiring edits applied.")
