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
# 1. Admission page heading -- "Apply for Admission" is the right label
#    for a button/link that TAKES you to this page, but as the page's
#    own h1 (you're already here, filling it out) it reads oddly.
#    Renamed to "Admission Application" -- a noun phrase naming the
#    page, matching the site's existing vocabulary (Application Fee,
#    Application Number, Track Admission Progress already use
#    "Application" as the noun).
# =======================================================================
path = "app/admission/page.js"
c = load(path)

c = r1(
    c,
    "<h1 style={{ fontSize: '32px', color: 'var(--brand)', margin: '0 0 8px 0' }}>{t('Apply for Admission')}</h1>",
    "<h1 style={{ fontSize: '32px', color: 'var(--brand)', margin: '0 0 8px 0' }}>{t('Admission Application')}</h1>",
    "admission page: rename h1 to Admission Application",
)

save(path, c)
print("app/admission/page.js: heading renamed to 'Admission Application'.")

path = "app/admission/i18n.js"
c = load(path)

c = r1(
    c,
    "  'Apply for Admission': 'التقديم للقبول',",
    "  'Apply for Admission': 'التقديم للقبول',\n  'Admission Application': 'طلب القبول',",
    "admission i18n: add Admission Application translation",
)

save(path, c)
print("app/admission/i18n.js: 'Admission Application' -> 'طلب القبول' added.")

# =======================================================================
# 2. Footer link code defaults -- three places define an "Academy"
#    footer group; components/SiteFooter.jsx was already fixed earlier
#    this session. These two are the code-level fallbacks (used only if
#    the database has zero rows / a reseed) -- fixed for consistency,
#    but NOT what's actually serving the live site (that's the real DB
#    rows, fixed separately by a .cjs script the user runs).
# =======================================================================
path = "app/api/homepage-content/route.js"
c = load(path)

c = r1(
    c,
    "const DEFAULT_FOOTER_LINK_GROUPS = [\n"
    "  {\n"
    "    title: \"Academy\",\n"
    "    links: [\n"
    "      { label: \"Academic Departments\", href: \"/programs\" },\n"
    "      { label: \"Admission & Registration\", href: \"/admission\" },\n"
    "      { label: \"Student Portal Login\", href: \"/login\" },\n"
    "    ],\n"
    "  },\n",
    "const DEFAULT_FOOTER_LINK_GROUPS = [\n"
    "  {\n"
    "    title: \"Academy\",\n"
    "    links: [\n"
    "      { label: \"Academic Programmes\", href: \"/programs\" },\n"
    "      { label: \"Academic Departments\", href: \"/departments\" },\n"
    "      { label: \"Faculty\", href: \"/faculty\" },\n"
    "      { label: \"Academic Calendar\", href: \"/academic-calendar\" },\n"
    "      { label: \"Admission & Registration\", href: \"/admission\" },\n"
    "      { label: \"Student Portal Login\", href: \"/login\" },\n"
    "    ],\n"
    "  },\n",
    "homepage-content route: fix Academy footer group default",
)

save(path, c)
print("app/api/homepage-content/route.js: Academy footer group default fixed.")

path = "prisma/seed.js"
c = load(path)

c = r1(
    c,
    "  {\n"
    "    id: \"footer-group-academics\",\n"
    "    title: \"Academy\",\n"
    "    order: 0,\n"
    "    links: [\n"
    "      { id: \"footer-link-academic-departments\", label: \"Academic Departments\", href: \"/programs\", order: 0 },\n"
    "      { id: \"footer-link-admission-registration\", label: \"Admission & Registration\", href: \"/admission\", order: 1 },\n"
    "      { id: \"footer-link-student-portal-login\", label: \"Student Portal Login\", href: \"/login\", order: 2 },\n"
    "    ],\n"
    "  },\n",
    "  {\n"
    "    id: \"footer-group-academics\",\n"
    "    title: \"Academy\",\n"
    "    order: 0,\n"
    "    links: [\n"
    "      { id: \"footer-link-academic-programmes\", label: \"Academic Programmes\", href: \"/programs\", order: 0 },\n"
    "      { id: \"footer-link-academic-departments\", label: \"Academic Departments\", href: \"/departments\", order: 1 },\n"
    "      { id: \"footer-link-faculty\", label: \"Faculty\", href: \"/faculty\", order: 2 },\n"
    "      { id: \"footer-link-academic-calendar\", label: \"Academic Calendar\", href: \"/academic-calendar\", order: 3 },\n"
    "      { id: \"footer-link-admission-registration\", label: \"Admission & Registration\", href: \"/admission\", order: 4 },\n"
    "      { id: \"footer-link-student-portal-login\", label: \"Student Portal Login\", href: \"/login\", order: 5 },\n"
    "    ],\n"
    "  },\n",
    "seed.js: fix Academy footer group default (adds new ids, keeps old ones' ids intact)",
)

save(path, c)
print("prisma/seed.js: Academy footer group default fixed (future reseeds will match).")
