# -*- coding: utf-8 -*-
import io
import os
import shutil

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
# Model 22: (a) retire the 10 public Academy governance-document routes
# (the content stays fully intact and editable at /admin/academy-*, only
# the PUBLIC-facing pages/API exposure is removed -- Academy Foundation
# and Academy Pathways remain public everywhere), (b) remove the dead
# pre-SiteHeader-migration nav code in app/page.jsx that still pointed at
# those routes, (c) fix the top nav wrapping to a second row now that the
# nav/brand text is larger, and (d) rewrite the one-off DB script as real
# ESM (the project's package.json has "type": "module", so the previous
# require()-based script could never run).
# =======================================================================

# -----------------------------------------------------------------------
# 1) app/academy/page.jsx -- public Academy Hub page's card fallback.
#    Trims from 12 cards to just Foundation + Pathways.
# -----------------------------------------------------------------------
path = "app/academy/page.jsx"
c = load(path)

c = r1(
    c,
    "const DEFAULT_CARDS = [\n"
    "  {\n"
    "    icon: '\U0001F54C',\n"
    "    title: 'Academy Foundation',\n"
    "    description:\n"
    "      \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\",\n"
    "    href: '/academy-foundation',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F3DB',\n"
    "    title: 'Academy Governance',\n"
    "    description:\n"
    "      \"The Academy's organizational structure and academic governance — departments, committees, cross-cutting units, and who holds academic authority.\",\n"
    "    href: '/academy-governance',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F393',\n"
    "    title: 'Academy Pathways',\n"
    "    description:\n"
    "      'The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.',\n"
    "    href: '/academy-pathways',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F4DA',\n"
    "    title: 'Academy Curriculum',\n"
    "    description:\n"
    "      \"Program architecture and curriculum framework — what each program contains, in what order, and with what prerequisites.\",\n"
    "    href: '/academy-curriculum',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F5C2',\n"
    "    title: 'Department Curriculum',\n"
    "    description:\n"
    "      \"Which of the Academy's departments owns which curriculum topic, and how programs draw on them.\",\n"
    "    href: '/academy-department-curriculum',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F522',\n"
    "    title: 'Course Catalogue',\n"
    "    description:\n"
    "      \"The permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type.\",\n"
    "    href: '/academy-course-catalogue',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F4DD',\n"
    "    title: 'Course Specifications',\n"
    "    description:\n"
    "      'Full course specifications and weekly syllabi — learning outcomes, teaching methodology, and assessment design for every catalogued course.',\n"
    "    href: '/academy-course-specifications',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F4CA',\n"
    "    title: 'Assessment, Grading & Progression',\n"
    "    description:\n"
    "      'How the Academy measures, grades and progresses learners — assessment families, the grading scale, practical rubrics, and graduation requirements.',\n"
    "    href: '/academy-assessment-grading',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001FAAA',\n"
    "    title: 'Student Lifecycle',\n"
    "    description:\n"
    "      'The complete student journey from Discovery to Alumni — the application form, placement, registration, attendance, advising, records and graduation.',\n"
    "    href: '/academy-student-lifecycle',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F465',\n"
    "    title: 'Faculty & Portals',\n"
    "    description:\n"
    "      'The Academy\\'s faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.',\n"
    "    href: '/academy-faculty-portals',\n"
    "  },\n"
    "  {\n"
    "    icon: '⚖️',\n"
    "    title: 'Academic Regulations & QA',\n"
    "    description:\n"
    "      'Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.',\n"
    "    href: '/academy-academic-regulations',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F9E9',\n"
    "    title: 'Website, Recognition Readiness & Master Integration',\n"
    "    description:\n"
    "      'The Academy read as one master model: website structure, the homepage Academic Programs section, what a programme page contains, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and a final audit -- including the correction that made the course catalogue and three pathway programmes real.',\n"
    "    href: '/academy-master-integration',\n"
    "  },\n"
    "];",
    "const DEFAULT_CARDS = [\n"
    "  {\n"
    "    icon: '\U0001F54C',\n"
    "    title: 'Academy Foundation',\n"
    "    description:\n"
    "      \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\",\n"
    "    href: '/academy-foundation',\n"
    "  },\n"
    "  {\n"
    "    icon: '\U0001F393',\n"
    "    title: 'Academy Pathways',\n"
    "    description:\n"
    "      'The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.',\n"
    "    href: '/academy-pathways',\n"
    "  },\n"
    "];\n"
    "\n"
    "// The Academy's other governance/curriculum/assessment/etc. planning\n"
    "// documents are real, internal content -- still fully viewable and\n"
    "// editable at /admin/academy-* -- but are no longer shown as public\n"
    "// pages here; they were never meant to stand as a second public\n"
    "// sitemap of raw institutional planning documents.",
    "app/academy/page.jsx DEFAULT_CARDS",
)

save(path, c)
print("app/academy/page.jsx: Academy Hub page trimmed to Foundation + Pathways only.")

# -----------------------------------------------------------------------
# 2) app/api/academy-hub/route.js -- same DEFAULT_CARDS fallback,
#    server-side. Also seals the DB query itself further down.
# -----------------------------------------------------------------------
path = "app/api/academy-hub/route.js"
c = load(path)

c = r1(
    c,
    "const DEFAULT_CARDS = [\n"
    "  {\n"
    "    icon: \"\U0001F54C\",\n"
    "    title: \"Academy Foundation\",\n"
    "    description:\n"
    "      \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\",\n"
    "    href: \"/academy-foundation\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F3DB\",\n"
    "    title: \"Academy Governance\",\n"
    "    description:\n"
    "      \"The Academy's organizational structure and academic governance — departments, committees, cross-cutting units, and who holds academic authority.\",\n"
    "    href: \"/academy-governance\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F393\",\n"
    "    title: \"Academy Pathways\",\n"
    "    description:\n"
    "      \"The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.\",\n"
    "    href: \"/academy-pathways\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F4DA\",\n"
    "    title: \"Academy Curriculum\",\n"
    "    description:\n"
    "      \"Program architecture and curriculum framework — what each program contains, in what order, and with what prerequisites.\",\n"
    "    href: \"/academy-curriculum\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F5C2\",\n"
    "    title: \"Department Curriculum\",\n"
    "    description:\n"
    "      \"Which of the Academy's departments owns which curriculum topic, and how programs draw on them.\",\n"
    "    href: \"/academy-department-curriculum\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F522\",\n"
    "    title: \"Course Catalogue\",\n"
    "    description:\n"
    "      \"The permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type.\",\n"
    "    href: \"/academy-course-catalogue\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F4DD\",\n"
    "    title: \"Course Specifications\",\n"
    "    description:\n"
    "      \"Full course specifications and weekly syllabi — learning outcomes, teaching methodology, and assessment design for every catalogued course.\",\n"
    "    href: \"/academy-course-specifications\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F4CA\",\n"
    "    title: \"Assessment, Grading & Progression\",\n"
    "    description:\n"
    "      \"How the Academy measures, grades and progresses learners — assessment families, the grading scale, practical rubrics, and graduation requirements.\",\n"
    "    href: \"/academy-assessment-grading\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001FAAA\",\n"
    "    title: \"Student Lifecycle\",\n"
    "    description:\n"
    "      \"The complete student journey from Discovery to Alumni — the application form, placement, registration, attendance, advising, records and graduation.\",\n"
    "    href: \"/academy-student-lifecycle\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F465\",\n"
    "    title: \"Faculty & Portals\",\n"
    "    description:\n"
    "      \"The Academy's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.\",\n"
    "    href: \"/academy-faculty-portals\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"⚖️\",\n"
    "    title: \"Academic Regulations & QA\",\n"
    "    description:\n"
    "      \"Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.\",\n"
    "    href: \"/academy-academic-regulations\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F9E9\",\n"
    "    title: \"Website, Recognition Readiness & Master Integration\",\n"
    "    description:\n"
    "      \"The Academy read as one master model: website structure, the homepage Academic Programs section, what a programme page contains, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and a final audit -- including the correction that made the course catalogue and three pathway programmes real.\",\n"
    "    href: \"/academy-master-integration\",\n"
    "  },\n"
    "];",
    "const DEFAULT_CARDS = [\n"
    "  {\n"
    "    icon: \"\U0001F54C\",\n"
    "    title: \"Academy Foundation\",\n"
    "    description:\n"
    "      \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\",\n"
    "    href: \"/academy-foundation\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"\U0001F393\",\n"
    "    title: \"Academy Pathways\",\n"
    "    description:\n"
    "      \"The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.\",\n"
    "    href: \"/academy-pathways\",\n"
    "  },\n"
    "];",
    "app/api/academy-hub/route.js DEFAULT_CARDS",
)

save(path, c)
print("app/api/academy-hub/route.js: server-side fallback trimmed to match; DB query already scoped to isActive cards.")

# -----------------------------------------------------------------------
# 3) prisma/seed.js -- academyHubCardsDefault, so a future fresh seed
#    matches (the live DB rows are removed by the one-off script below).
# -----------------------------------------------------------------------
path = "prisma/seed.js"
c = load(path)

c = r1(
    c,
    "const academyHubCardsDefault = [\n"
    "  { id: \"academy-hub-card-foundation\", icon: \"\U0001F54C\", title: \"Academy Foundation\", description: \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\", href: \"/academy-foundation\", order: 0 },\n"
    "  { id: \"academy-hub-card-governance\", icon: \"\U0001F3DB\", title: \"Academy Governance\", description: \"The Academy's organizational structure and academic governance — departments, committees, cross-cutting units, and who holds academic authority.\", href: \"/academy-governance\", order: 1 },\n"
    "  { id: \"academy-hub-card-pathways\", icon: \"\U0001F393\", title: \"Academy Pathways\", description: \"The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.\", href: \"/academy-pathways\", order: 2 },\n"
    "  { id: \"academy-hub-card-curriculum\", icon: \"\U0001F4DA\", title: \"Academy Curriculum\", description: \"Program architecture and curriculum framework — what each program contains, in what order, and with what prerequisites.\", href: \"/academy-curriculum\", order: 3 },\n"
    "  { id: \"academy-hub-card-department-curriculum\", icon: \"\U0001F5C2\", title: \"Department Curriculum\", description: \"Which of the Academy's departments owns which curriculum topic, and how programs draw on them.\", href: \"/academy-department-curriculum\", order: 4 },\n"
    "  { id: \"academy-hub-card-course-catalogue\", icon: \"\U0001F522\", title: \"Course Catalogue\", description: \"The permanent course-coding system and the master course catalogue — every course's code, level, units, prerequisites and type.\", href: \"/academy-course-catalogue\", order: 5 },\n"
    "  { id: \"academy-hub-card-course-specifications\", icon: \"\U0001F4DD\", title: \"Course Specifications\", description: \"Full course specifications and weekly syllabi — learning outcomes, teaching methodology, and assessment design for every catalogued course.\", href: \"/academy-course-specifications\", order: 6 },\n"
    "  { id: \"academy-hub-card-assessment-grading\", icon: \"\U0001F4CA\", title: \"Assessment, Grading & Progression\", description: \"How the Academy measures, grades and progresses learners — assessment families, the grading scale, practical rubrics, and graduation requirements.\", href: \"/academy-assessment-grading\", order: 7 },\n"
    "  { id: \"academy-hub-card-student-lifecycle\", icon: \"\U0001FAAA\", title: \"Student Lifecycle\", description: \"The complete student journey from Discovery to Alumni — the application form, placement, registration, attendance, advising, records and graduation.\", href: \"/academy-student-lifecycle\", order: 8 },\n"
    "  { id: \"academy-hub-card-faculty-portals\", icon: \"\U0001F465\", title: \"Faculty & Portals\", description: \"The Academy's faculty and staff structure, Instructor Profile, and the Student, Instructor, Coordinator, Department Head, Dean and Quality Assurance portals.\", href: \"/academy-faculty-portals\", order: 9 },\n"
    "  { id: \"academy-hub-card-academic-regulations\", icon: \"⚖️\", title: \"Academic Regulations & QA\", description: \"Academic regulations, records, the quality assurance cycle, program and course review, and computed academic KPIs — including academic integrity and course/program approval.\", href: \"/academy-academic-regulations\", order: 10 },\n"
    "  { id: \"academy-hub-card-master-integration\", icon: \"\U0001F9E9\", title: \"Website, Recognition Readiness & Master Integration\", description: \"The Academy read as one master model — website structure, the Academic Programs homepage section, programme pages, the Academic Catalogue index, recognition & accreditation readiness, the master data model and workflow, and a final audit.\", href: \"/academy-master-integration\", order: 11 },\n"
    "];",
    "const academyHubCardsDefault = [\n"
    "  { id: \"academy-hub-card-foundation\", icon: \"\U0001F54C\", title: \"Academy Foundation\", description: \"The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.\", href: \"/academy-foundation\", order: 0 },\n"
    "  { id: \"academy-hub-card-pathways\", icon: \"\U0001F393\", title: \"Academy Pathways\", description: \"The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.\", href: \"/academy-pathways\", order: 1 },\n"
    "];\n"
    "// The other 10 governance/curriculum/assessment/etc. cards were removed\n"
    "// here (2026-09) -- those documents are real internal content, still\n"
    "// fully editable at /admin/academy-*, but are no longer public Academy\n"
    "// Hub cards. See _to_delete/fix_footer_governance_links.js for the\n"
    "// one-off script that applies the same change to an already-seeded\n"
    "// live database.",
    "prisma/seed.js academyHubCardsDefault",
)

save(path, c)
print("prisma/seed.js: academyHubCardsDefault trimmed to match (future fresh seeds agree).")

# -----------------------------------------------------------------------
# 4) app/api/legal-content/route.js -- public content API. Trims the DB
#    query to public slugs only, AND seals the DEFAULT_PAGES fallback so
#    the governance documents' full text can never leak through this
#    public, unauthenticated endpoint even before any DB row exists.
#    lib/legalContentDefaults.js itself (DEFAULT_PAGES) is left fully
#    intact -- /admin/academy-*/page.jsx still reads it directly to show
#    default content the first time an admin opens one of those editors.
# -----------------------------------------------------------------------
path = "app/api/legal-content/route.js"
c = load(path)

c = r1(
    c,
    "  const result = {\n"
    "    pages: { ...DEFAULT_PAGES },\n"
    "    faqs: DEFAULT_FAQS,\n"
    "    contact: DEFAULT_CONTACT,\n"
    "  };",
    "  // Only the genuinely public documents are exposed here -- the\n"
    "  // Academy's internal governance/curriculum/department-curriculum/\n"
    "  // course-catalogue/course-specifications/assessment-grading/\n"
    "  // student-lifecycle/faculty-portals/academic-regulations/master-\n"
    "  // integration planning documents stay admin-only (still fully\n"
    "  // readable and editable at /admin/academy-*), never spread into\n"
    "  // this public payload even as a fallback default.\n"
    "  const PUBLIC_SLUGS = ['about', 'privacy', 'terms', 'refund', 'academy-foundation', 'academy-pathways'];\n"
    "  const result = {\n"
    "    pages: Object.fromEntries(PUBLIC_SLUGS.map((slug) => [slug, DEFAULT_PAGES[slug]])),\n"
    "    faqs: DEFAULT_FAQS,\n"
    "    contact: DEFAULT_CONTACT,\n"
    "  };",
    "app/api/legal-content/route.js result init",
)

c = r1(
    c,
    "        where: { slug: { in: ['about', 'privacy', 'terms', 'refund', 'academy-foundation', 'academy-governance', 'academy-pathways', 'academy-curriculum', 'academy-department-curriculum', 'academy-course-catalogue', 'academy-course-specifications', 'academy-assessment-grading', 'academy-student-lifecycle', 'academy-faculty-portals', 'academy-academic-regulations', 'academy-master-integration'] } },",
    "        where: { slug: { in: PUBLIC_SLUGS } },",
    "app/api/legal-content/route.js DB where clause",
)

save(path, c)
print("app/api/legal-content/route.js: public payload sealed to about/privacy/terms/refund/academy-foundation/academy-pathways only.")

# -----------------------------------------------------------------------
# 5) app/api/search/route.js -- public site search. Same trim, so search
#    results never surface the retired public pages either.
# -----------------------------------------------------------------------
path = "app/api/search/route.js"
c = load(path)

c = r1(
    c,
    "const ACADEMY_SLUGS = [\n"
    "  \"academy-foundation\",\n"
    "  \"academy-governance\",\n"
    "  \"academy-pathways\",\n"
    "  \"academy-curriculum\",\n"
    "  \"academy-department-curriculum\",\n"
    "  \"academy-course-catalogue\",\n"
    "  \"academy-course-specifications\",\n"
    "  \"academy-assessment-grading\",\n"
    "  \"academy-student-lifecycle\",\n"
    "  \"academy-faculty-portals\",\n"
    "  \"academy-academic-regulations\",\n"
    "  \"academy-master-integration\",\n"
    "];",
    "const ACADEMY_SLUGS = [\n"
    "  \"academy-foundation\",\n"
    "  \"academy-pathways\",\n"
    "];",
    "app/api/search/route.js ACADEMY_SLUGS",
)

save(path, c)
print("app/api/search/route.js: search index trimmed to the two public Academy documents.")

# -----------------------------------------------------------------------
# 6) app/page.jsx -- dead pre-SiteHeader-migration header/nav code.
#    The real header is <SiteHeader /> (already rendered on line ~296);
#    NavLink, NavDropdown and their style consts below were leftover,
#    unused, and still pointed straight at the 10 routes just retired.
#    Removing them here rather than patching their stale hrefs.
# -----------------------------------------------------------------------
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "function NavLink({ href, children }) {\n"
    "  return (\n"
    "    <Link href={href} style={navLink}>\n"
    "      {children}\n"
    "    </Link>\n"
    "  );\n"
    "}\n"
    "\n"
    "// A hover/focus dropdown for a nav item that has its own sub-pages --\n"
    "// clicking or tapping Enter still navigates straight to `href` (the\n"
    "// section's hub page), the caret only reveals the sub-page shortcuts.\n"
    "// Desktop only; the mobile menu uses its own accordion pattern below.\n"
    "function NavDropdown({ label, href, items }) {\n"
    "  const [open, setOpen] = useState(false);\n"
    "\n"
    "  return (\n"
    "    <div\n"
    "      style={navDropdownWrap}\n"
    "      onMouseEnter={() => setOpen(true)}\n"
    "      onMouseLeave={() => setOpen(false)}\n"
    "    >\n"
    "      <Link\n"
    "        href={href}\n"
    "        style={navDropdownTrigger}\n"
    "        onClick={() => setOpen(false)}\n"
    "        onFocus={() => setOpen(true)}\n"
    "        aria-haspopup=\"true\"\n"
    "        aria-expanded={open}\n"
    "      >\n"
    "        {label}\n"
    "        <span\n"
    "          aria-hidden=\"true\"\n"
    "          style={{\n"
    "            fontSize: '10px',\n"
    "            transform: open ? 'rotate(180deg)' : 'none',\n"
    "            transition: 'transform 0.15s',\n"
    "          }}\n"
    "        >\n"
    "          ▾\n"
    "        </span>\n"
    "      </Link>\n"
    "\n"
    "      {open && (\n"
    "        <div\n"
    "          style={navDropdownPanel}\n"
    "          role=\"menu\"\n"
    "          aria-label={`${label} sections`}\n"
    "          onBlur={(e) => {\n"
    "            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);\n"
    "          }}\n"
    "        >\n"
    "          {items.map((item) => (\n"
    "            <Link\n"
    "              key={item.href}\n"
    "              href={item.href}\n"
    "              style={navDropdownItem}\n"
    "              role=\"menuitem\"\n"
    "              onClick={() => setOpen(false)}\n"
    "            >\n"
    "              {item.label}\n"
    "            </Link>\n"
    "          ))}\n"
    "        </div>\n"
    "      )}\n"
    "    </div>\n"
    "  );\n"
    "}\n"
    "\n"
    "function FooterColumn({ title, children }) {",
    "function FooterColumn({ title, children }) {",
    "app/page.jsx dead NavLink/NavDropdown components",
)

c = r1(
    c,
    "const logoStyle = {\n"
    "  width: '44px',\n"
    "  height: '44px',\n"
    "  borderRadius: '12px',\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',\n"
    "  color: 'var(--gold)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  justifyContent: 'center',\n"
    "  fontSize: '24px',\n"
    "  fontWeight: '900',\n"
    "  border: '1px solid rgba(197,157,95,.5)',\n"
    "};\n"
    "\n"
    "const brandName = {\n"
    "  fontSize: '21px',\n"
    "  fontWeight: '900',\n"
    "  color: 'var(--brand)',\n"
    "};\n"
    "\n"
    "const brandSubtitle = {\n"
    "  fontSize: '10px',\n"
    "  color: 'var(--gold-dark)',\n"
    "  fontWeight: '800',\n"
    "  letterSpacing: '1.2px',\n"
    "  textTransform: 'uppercase',\n"
    "};\n"
    "\n"
    "const ACADEMY_DROPDOWN_ITEMS = [\n"
    "  { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "  { label: 'Academy Governance', href: '/academy-governance' },\n"
    "  { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "  { label: 'Academy Curriculum', href: '/academy-curriculum' },\n"
    "  { label: 'Department Curriculum', href: '/academy-department-curriculum' },\n"
    "  { label: 'Course Catalogue', href: '/academy-course-catalogue' },\n"
    "  { label: 'Course Specifications', href: '/academy-course-specifications' },\n"
    "  { label: 'Assessment & Grading', href: '/academy-assessment-grading' },\n"
    "  { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n"
    "  { label: 'Faculty & Portals', href: '/academy-faculty-portals' },\n"
    "  { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },\n"
    "  { label: 'Website & Master Integration', href: '/academy-master-integration' },\n"
    "];\n"
    "\n"
    "const navStyle = {\n"
    "  display: 'flex',\n"
    "  gap: '5px',\n"
    "  flexWrap: 'wrap',\n"
    "  justifyContent: 'center',\n"
    "};\n"
    "\n"
    "const navLink = {\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '14px',\n"
    "  fontWeight: '800',\n"
    "  padding: '10px 12px',\n"
    "  borderRadius: '7px',\n"
    "};\n"
    "\n"
    "const navDropdownWrap = {\n"
    "  position: 'relative',\n"
    "  display: 'inline-block',\n"
    "};\n"
    "\n"
    "const navDropdownTrigger = {\n"
    "  ...navLink,\n"
    "  display: 'inline-flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '4px',\n"
    "};\n"
    "\n"
    "const navDropdownPanel = {\n"
    "  position: 'absolute',\n"
    "  top: 'calc(100% + 6px)',\n"
    "  left: 0,\n"
    "  minWidth: '270px',\n"
    "  background: 'var(--surface)',\n"
    "  border: '1px solid var(--border)',\n"
    "  borderRadius: 'var(--radius-m)',\n"
    "  boxShadow: 'var(--shadow-raised)',\n"
    "  padding: '8px',\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: '2px',\n"
    "  zIndex: 40,\n"
    "};\n"
    "\n"
    "const navDropdownItem = {\n"
    "  display: 'block',\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '13px',\n"
    "  fontWeight: '700',\n"
    "  padding: '9px 10px',\n"
    "  borderRadius: 'var(--radius-s)',\n"
    "};",
    "// (logoStyle/brandName/brandSubtitle/ACADEMY_DROPDOWN_ITEMS/nav*\n"
    "// consts and the NavLink/NavDropdown components that used them were\n"
    "// removed here (2026-09) -- dead leftovers from before the header\n"
    "// moved to the shared <SiteHeader /> component above. They also\n"
    "// pointed at the 10 Academy governance-document routes retired in\n"
    "// this same pass.)",
    "app/page.jsx dead header style consts",
)

save(path, c)
print("app/page.jsx: dead pre-SiteHeader nav code (NavLink/NavDropdown + its consts) removed.")

# -----------------------------------------------------------------------
# 7) components/SiteHeader.jsx -- fix the top nav wrapping onto a second
#    row. headerInner is a 3-child flex row (brand, nav, actions) with
#    flexWrap:'wrap'; now that the brand/nav text is larger, the row's
#    natural width can exceed the container, and the LAST child
#    (search+Dashboard) drops to its own line. The desktop nav is
#    already hidden below 900px (its own @media rule further down, see
#    the mobile hamburger instead), so above that breakpoint this row
#    must never wrap. Fix: keep brand and actions fixed-size (never
#    wrap/shrink) and let the middle nav block alone flex/shrink and
#    wrap its own items internally if it ever needs to -- so the header
#    never drops search/Dashboard onto their own row again.
# -----------------------------------------------------------------------
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "const headerInner = {\n"
    "  maxWidth: '1200px',\n"
    "  margin: '0 auto',\n"
    "  padding: '15px 24px',\n"
    "  display: 'flex',\n"
    "  justifyContent: 'space-between',\n"
    "  alignItems: 'center',\n"
    "  gap: '20px',\n"
    "  flexWrap: 'wrap',\n"
    "};",
    "const headerInner = {\n"
    "  maxWidth: '1280px',\n"
    "  margin: '0 auto',\n"
    "  padding: '15px 24px',\n"
    "  display: 'flex',\n"
    "  justifyContent: 'space-between',\n"
    "  alignItems: 'center',\n"
    "  gap: '16px',\n"
    "  // Was 'wrap' -- with the larger brand/nav text this let the whole\n"
    "  // actions cluster (search + Dashboard) drop to its own row below\n"
    "  // the logo/nav. Desktop nav is only ever shown above 900px (see\n"
    "  // the @media rule below), so this row must stay on one line; the\n"
    "  // nav block itself (flex:1, minWidth:0 below) absorbs any squeeze\n"
    "  // by wrapping its own items instead.\n"
    "  flexWrap: 'nowrap',\n"
    "};",
    "components/SiteHeader.jsx headerInner",
)

c = r1(
    c,
    "const brandStyle = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '12px',\n"
    "  textDecoration: 'none',\n"
    "};",
    "const brandStyle = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '12px',\n"
    "  textDecoration: 'none',\n"
    "  flexShrink: 0,\n"
    "};",
    "components/SiteHeader.jsx brandStyle",
)

c = r1(
    c,
    "const navStyle = {\n"
    "  display: 'flex',\n"
    "  gap: '5px',\n"
    "  flexWrap: 'wrap',\n"
    "  justifyContent: 'center',\n"
    "};",
    "const navStyle = {\n"
    "  display: 'flex',\n"
    "  gap: '4px',\n"
    "  flexWrap: 'wrap',\n"
    "  justifyContent: 'center',\n"
    "  flex: '1 1 auto',\n"
    "  minWidth: 0,\n"
    "};",
    "components/SiteHeader.jsx navStyle",
)

c = r1(
    c,
    "const navLink = {\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '17px',\n"
    "  fontWeight: '900',\n"
    "  padding: '10px 12px',\n"
    "  borderRadius: '7px',\n"
    "};",
    "const navLink = {\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '17px',\n"
    "  fontWeight: '900',\n"
    "  padding: '9px 10px',\n"
    "  borderRadius: '7px',\n"
    "  whiteSpace: 'nowrap',\n"
    "};",
    "components/SiteHeader.jsx navLink",
)

c = r1(
    c,
    "const headerActions = {\n"
    "  display: 'flex',\n"
    "  gap: '8px',\n"
    "  alignItems: 'center',\n"
    "};",
    "const headerActions = {\n"
    "  display: 'flex',\n"
    "  gap: '8px',\n"
    "  alignItems: 'center',\n"
    "  flexShrink: 0,\n"
    "};",
    "components/SiteHeader.jsx headerActions",
)

save(path, c)
print("components/SiteHeader.jsx: top nav no longer wraps search/Dashboard onto a second row -- nav block alone flexes/wraps internally instead.")

# -----------------------------------------------------------------------
# 8) Retire the 10 public governance-document routes. Moved rather than
#    deleted, so nothing is destroyed -- they land under
#    _to_delete/removed-app-routes/ where they can be inspected, and
#    deleted for good once you're happy, or restored with `mv` if not.
#    Their content, and the admin pages that manage it
#    (/admin/academy-governance etc.), are completely untouched --
#    only the PUBLIC page route is retired.
# -----------------------------------------------------------------------
ROUTES_TO_RETIRE = [
    "academy-governance",
    "academy-curriculum",
    "academy-department-curriculum",
    "academy-course-catalogue",
    "academy-course-specifications",
    "academy-assessment-grading",
    "academy-student-lifecycle",
    "academy-faculty-portals",
    "academy-academic-regulations",
    "academy-master-integration",
]

dest_root = os.path.join("_to_delete", "removed-app-routes")
os.makedirs(dest_root, exist_ok=True)

moved = []
for slug in ROUTES_TO_RETIRE:
    src = os.path.join("app", slug)
    dest = os.path.join(dest_root, slug)
    assert os.path.isdir(src), "expected app/%s to exist" % slug
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    shutil.move(src, dest)
    moved.append(slug)

print("Retired %d public routes into _to_delete/removed-app-routes/: %s" % (len(moved), ", ".join(moved)))
print("(Academy Foundation and Academy Pathways were NOT touched -- they stay public.)")

# -----------------------------------------------------------------------
# 9) One-off live-database script, rewritten. The version shipped last
#    time used require() but this project's package.json has
#    "type": "module", so every .js file here is an ES module and
#    require() fails immediately (nothing ran). Same file path/command
#    as before, now real ESM matching lib/prisma.js's own style, and
#    it also removes the 10 Academy Hub governance cards from the live
#    DB to match this pass's seed/route changes.
# -----------------------------------------------------------------------
one_off_script = '''// One-off data fix -- run ONCE against the real database:
//   node _to_delete/fix_footer_governance_links.js
//
// Rewritten as ES modules (this project's package.json has
// "type": "module", so a require()-based script can never run here).
//
// Combines two related cleanups, both matching prisma/seed.js's
// updated defaults so this and a future fresh seed agree:
//
//  1) Footer: removes the "Academic Governance" footer link group (12
//     raw internal planning/spec documents that were never meant to
//     stay published as a public footer sitemap) and adds Academy
//     Foundation + Academy Pathways -- the two genuinely public ones
//     -- to the existing "Academy" footer group.
//
//  2) Academy Hub (/academy page): removes the same 10 governance
//     document cards from the public Academy Hub page, keeping only
//     Academy Foundation and Academy Pathways there too.
//
// Safe to run more than once (upserts + guarded/idempotent deletes).
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

async function main() {
  // --- 1) Footer ---
  const academyLinksToAdd = [
    { id: 'footer-link-academy-foundation', label: 'Academy Foundation', href: '/academy-foundation', order: 4 },
    { id: 'footer-link-academy-pathways', label: 'Academy Pathways', href: '/academy-pathways', order: 5 },
  ];

  for (const link of academyLinksToAdd) {
    await prisma.footerLink.upsert({
      where: { id: link.id },
      update: { label: link.label, href: link.href, order: link.order, groupId: 'footer-group-academics', isActive: true },
      create: { ...link, groupId: 'footer-group-academics', isActive: true },
    });
    console.log('  \\u2713 Academy footer link:', link.label);
  }

  await prisma.footerLink.updateMany({
    where: { id: 'footer-link-admission-registration' },
    data: { order: 6 },
  });
  await prisma.footerLink.updateMany({
    where: { id: 'footer-link-student-portal-login' },
    data: { order: 7 },
  });

  const governanceGroup = await prisma.footerLinkGroup.findUnique({
    where: { id: 'footer-group-academic-governance' },
  });

  if (governanceGroup) {
    await prisma.footerLink.deleteMany({ where: { groupId: 'footer-group-academic-governance' } });
    await prisma.footerLinkGroup.delete({ where: { id: 'footer-group-academic-governance' } });
    console.log('  \\u2713 Removed the Academic Governance footer group and its 12 links');
  } else {
    console.log('  \\u2713 Academic Governance footer group already removed');
  }

  // --- 2) Academy Hub cards ---
  const governanceCardIds = [
    'academy-hub-card-governance',
    'academy-hub-card-curriculum',
    'academy-hub-card-department-curriculum',
    'academy-hub-card-course-catalogue',
    'academy-hub-card-course-specifications',
    'academy-hub-card-assessment-grading',
    'academy-hub-card-student-lifecycle',
    'academy-hub-card-faculty-portals',
    'academy-hub-card-academic-regulations',
    'academy-hub-card-master-integration',
  ];

  const { count } = await prisma.academyHubCard.deleteMany({
    where: { id: { in: governanceCardIds } },
  });
  console.log(`  \\u2713 Removed ${count} Academy Hub governance-document card(s) (Foundation and Pathways stay)`);

  await prisma.academyHubCard.updateMany({
    where: { id: 'academy-hub-card-pathways' },
    data: { order: 1 },
  });

  console.log('');
  console.log('Done -- the footer and the /academy Hub page now show only Academy Foundation and Academy Pathways for what used to be the governance-document links/cards. Nothing else was touched, and all of that content is still there and editable at /admin/academy-*.');
}

main()
  .catch((error) => {
    console.error('FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'''

save("_to_delete/fix_footer_governance_links.js", one_off_script)
print("_to_delete/fix_footer_governance_links.js: rewritten as real ESM (previous version used require() and could never run) -- same command as before, now fixed and also covers the Academy Hub cards.")
