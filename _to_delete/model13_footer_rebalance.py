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

GOV_LABELS_HREFS = [
    ("Academy Foundation", "/academy-foundation"),
    ("Academy Governance", "/academy-governance"),
    ("Academy Pathways", "/academy-pathways"),
    ("Academy Curriculum", "/academy-curriculum"),
    ("Department Curriculum", "/academy-department-curriculum"),
    ("Course Catalogue", "/academy-course-catalogue"),
    ("Course Specifications", "/academy-course-specifications"),
    ("Assessment & Grading", "/academy-assessment-grading"),
    ("Student Lifecycle", "/academy-student-lifecycle"),
    ("Faculty & Portals", "/academy-faculty-portals"),
    ("Academic Regulations & QA", "/academy-academic-regulations"),
    ("Website & Master Integration", "/academy-master-integration"),
]

# ---------------------------------------------------------------------
# 1. app/page.jsx -- client-side default state
# ---------------------------------------------------------------------
path = "app/page.jsx"
c = load(path)

OLD_INSTITUTE = """    {
      title: 'Institute',
      links: [
        { label: 'About Ulul Azm', href: '/about' },
        { label: 'Academy Foundation', href: '/academy-foundation' },
        { label: 'Academy Governance', href: '/academy-governance' },
        { label: 'Academy Pathways', href: '/academy-pathways' },
        { label: 'Academy Curriculum', href: '/academy-curriculum' },
        { label: 'Department Curriculum', href: '/academy-department-curriculum' },
        { label: 'Course Catalogue', href: '/academy-course-catalogue' },
        { label: 'Course Specifications', href: '/academy-course-specifications' },
        { label: 'Assessment & Grading', href: '/academy-assessment-grading' },
        { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },
        { label: 'Faculty & Portals', href: '/academy-faculty-portals' },
        { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },
        { label: 'Website & Master Integration', href: '/academy-master-integration' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Refund Policy', href: '/refund' },
        { label: 'Staff & Admin Portal', href: '/admin' },
      ],
    },
  ]);"""

gov_links_jsx = "\n".join(
    "        { label: '%s', href: '%s' }," % (label, href) for label, href in GOV_LABELS_HREFS
)

NEW_GROUPS = """    {
      title: 'Academic Governance',
      links: [
%s
      ],
    },
    {
      title: 'Institute',
      links: [
        { label: 'About Ulul Azm', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Use', href: '/terms' },
        { label: 'Refund Policy', href: '/refund' },
        { label: 'Staff & Admin Portal', href: '/admin' },
      ],
    },
  ]);""" % gov_links_jsx

c = r1(c, OLD_INSTITUTE, NEW_GROUPS, "page.jsx: footerLinkGroups Institute -> split")
save(path, c)
print("Updated app/page.jsx footer default state.")

# ---------------------------------------------------------------------
# 2. app/api/homepage-content/route.js -- API fallback defaults (double-quoted)
# ---------------------------------------------------------------------
path = "app/api/homepage-content/route.js"
c = load(path)

OLD_INSTITUTE_API = """  // Mirrors the "Institute" footer column that used to be hardcoded in
  // app/page.jsx — now editable at /admin/homepage/footer-links, and
  // seeded as real rows by prisma/seed.js. This code default only
  // renders if the database has zero footer link groups.
  {
    title: "Institute",
    links: [
      { label: "About Ulul Azm", href: "/about" },
      { label: "Academy Foundation", href: "/academy-foundation" },
      { label: "Academy Governance", href: "/academy-governance" },
      { label: "Academy Pathways", href: "/academy-pathways" },
      { label: "Academy Curriculum", href: "/academy-curriculum" },
      { label: "Department Curriculum", href: "/academy-department-curriculum" },
      { label: "Course Catalogue", href: "/academy-course-catalogue" },
      { label: "Course Specifications", href: "/academy-course-specifications" },
      { label: "Assessment & Grading", href: "/academy-assessment-grading" },
      { label: "Student Lifecycle", href: "/academy-student-lifecycle" },
      { label: "Faculty & Portals", href: "/academy-faculty-portals" },
      { label: "Academic Regulations & QA", href: "/academy-academic-regulations" },
      { label: "Website & Master Integration", href: "/academy-master-integration" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Staff & Admin Portal", href: "/admin" },
    ],
  },
];"""

gov_links_api = "\n".join(
    "      { label: \"%s\", href: \"%s\" }," % (label, href) for label, href in GOV_LABELS_HREFS
)

NEW_GROUPS_API = """  // Mirrors the "Academic Governance" and "Institute" footer columns that
  // used to be a single overloaded "Institute" column — split so academic
  // governance documents sit with Academics rather than crowding the
  // institute/legal column. Now editable at /admin/homepage/footer-links,
  // and seeded as real rows by prisma/seed.js. This code default only
  // renders if the database has zero footer link groups.
  {
    title: "Academic Governance",
    links: [
%s
    ],
  },
  {
    title: "Institute",
    links: [
      { label: "About Ulul Azm", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Staff & Admin Portal", href: "/admin" },
    ],
  },
];""" % gov_links_api

c = r1(c, OLD_INSTITUTE_API, NEW_GROUPS_API, "homepage-content route.js: footer Institute -> split")
save(path, c)
print("Updated app/api/homepage-content/route.js footer fallback defaults.")

# ---------------------------------------------------------------------
# 3. prisma/seed.js -- real DB rows via upsert (id-stable, so existing
#    FooterLink rows are simply re-parented to the new group on reseed)
# ---------------------------------------------------------------------
path = "prisma/seed.js"
c = load(path)

OLD_SEED_GROUPS = """  {
    id: "footer-group-institute",
    title: "Institute",
    order: 1,
    links: [
      { id: "footer-link-about", label: "About Ulul Azm", href: "/about", order: 0 },
      { id: "footer-link-academy-foundation", label: "Academy Foundation", href: "/academy-foundation", order: 1 },
      { id: "footer-link-academy-governance", label: "Academy Governance", href: "/academy-governance", order: 2 },
      { id: "footer-link-academy-pathways", label: "Academy Pathways", href: "/academy-pathways", order: 3 },
      { id: "footer-link-academy-curriculum", label: "Academy Curriculum", href: "/academy-curriculum", order: 4 },
      { id: "footer-link-department-curriculum", label: "Department Curriculum", href: "/academy-department-curriculum", order: 5 },
      { id: "footer-link-course-catalogue", label: "Course Catalogue", href: "/academy-course-catalogue", order: 6 },
      { id: "footer-link-course-specifications", label: "Course Specifications", href: "/academy-course-specifications", order: 7 },
      { id: "footer-link-assessment-grading", label: "Assessment & Grading", href: "/academy-assessment-grading", order: 8 },
      { id: "footer-link-student-lifecycle", label: "Student Lifecycle", href: "/academy-student-lifecycle", order: 9 },
      { id: "footer-link-faculty-portals", label: "Faculty & Portals", href: "/academy-faculty-portals", order: 10 },
      { id: "footer-link-academic-regulations", label: "Academic Regulations & QA", href: "/academy-academic-regulations", order: 11 },
      { id: "footer-link-master-integration", label: "Website & Master Integration", href: "/academy-master-integration", order: 12 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 13 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 14 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 15 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 16 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 17 },
    ],
  },
];"""

# Same stable link ids, just re-grouped -- upsert() re-parents (groupId)
# each existing row rather than creating duplicates.
seed_gov_ids = [
    "footer-link-academy-foundation",
    "footer-link-academy-governance",
    "footer-link-academy-pathways",
    "footer-link-academy-curriculum",
    "footer-link-department-curriculum",
    "footer-link-course-catalogue",
    "footer-link-course-specifications",
    "footer-link-assessment-grading",
    "footer-link-student-lifecycle",
    "footer-link-faculty-portals",
    "footer-link-academic-regulations",
    "footer-link-master-integration",
]
seed_gov_lines = "\n".join(
    "      { id: \"%s\", label: \"%s\", href: \"%s\", order: %d }," % (lid, label, href, i)
    for i, (lid, (label, href)) in enumerate(zip(seed_gov_ids, GOV_LABELS_HREFS))
)

NEW_SEED_GROUPS = """  {
    id: "footer-group-academic-governance",
    title: "Academic Governance",
    order: 1,
    links: [
%s
    ],
  },
  {
    id: "footer-group-institute",
    title: "Institute",
    order: 2,
    links: [
      { id: "footer-link-about", label: "About Ulul Azm", href: "/about", order: 0 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 1 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 2 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 3 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 4 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 5 },
    ],
  },
];""" % seed_gov_lines

c = r1(c, OLD_SEED_GROUPS, NEW_SEED_GROUPS, "seed.js: footerLinkGroupsDefault Institute -> split")
save(path, c)
print("Updated prisma/seed.js footerLinkGroupsDefault (same link ids, re-grouped).")
