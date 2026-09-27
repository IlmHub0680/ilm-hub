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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:100])
    return content.replace(old, new)

# =======================================================================
# 1. components/AcademicCalendarView.jsx -- stale "ILM Institute" branding
#    left over from the Ulul Azm rename (Model 12's audit, task #192,
#    missed this component). Fixing now since this component is about to
#    be mounted on a public page for the first time.
# =======================================================================
path = "components/AcademicCalendarView.jsx"
c = load(path)

c = r1(
    c,
    "            ILM Institute — Office of the Registrar",
    "            Ulul Azm Institute — Office of the Registrar",
    "AcademicCalendarView: fix stale ILM Institute branding",
)

save(path, c)
print("components/AcademicCalendarView.jsx: branding fixed to Ulul Azm Institute.")

# =======================================================================
# 2. app/programs/[id]/page.jsx -- this page was missing SiteHeader/
#    SiteFooter entirely (confirmed: no import of either, no layout.jsx
#    in app/programs/ to supply them) -- a real pre-existing gap found
#    while building the matching Department/Faculty detail pages, fixed
#    per the standing "improve what isn't polished when found" rule.
# =======================================================================
path = "app/programs/[id]/page.jsx"
c = load(path)

c = r1(
    c,
    "'use client';\n\nimport { useEffect, useState } from 'react';\nimport { useParams } from 'next/navigation';\nimport Link from 'next/link';\n",
    "'use client';\n\nimport { useEffect, useState } from 'react';\nimport { useParams } from 'next/navigation';\nimport Link from 'next/link';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "programs/[id]: import SiteHeader/SiteFooter",
)

c = r1(
    c,
    "  if (loading) {\n"
    "    return <main style={page}><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div></main>;\n"
    "  }\n"
    "\n"
    "  if (error || !programme) {\n"
    "    return (\n"
    "      <main style={page}>\n"
    "        <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>\n"
    "          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Programme not found.'}</p>\n"
    "          <Link href=\"/programs\" style={{ color: 'var(--brand)' }}>← Back to Academic Programmes</Link>\n"
    "        </div>\n"
    "      </main>\n"
    "    );\n"
    "  }\n",
    "  if (loading) {\n"
    "    return (\n"
    "      <>\n"
    "        <SiteHeader />\n"
    "        <main style={page}><div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div></main>\n"
    "        <SiteFooter />\n"
    "      </>\n"
    "    );\n"
    "  }\n"
    "\n"
    "  if (error || !programme) {\n"
    "    return (\n"
    "      <>\n"
    "        <SiteHeader />\n"
    "        <main style={page}>\n"
    "          <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>\n"
    "            <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error || 'Programme not found.'}</p>\n"
    "            <Link href=\"/programs\" style={{ color: 'var(--brand)' }}>← Back to Academic Programmes</Link>\n"
    "          </div>\n"
    "        </main>\n"
    "        <SiteFooter />\n"
    "      </>\n"
    "    );\n"
    "  }\n",
    "programs/[id]: wrap loading/error states with SiteHeader/SiteFooter",
)

c = r1(
    c,
    "  return (\n    <main style={page}>\n      <div style={container}>\n        <Link href=\"/programs\" style={backLink}>← Back to Academic Programmes</Link>",
    "  return (\n    <>\n      <SiteHeader />\n      <main style={page}>\n      <div style={container}>\n        <Link href=\"/programs\" style={backLink}>← Back to Academic Programmes</Link>",
    "programs/[id]: open SiteHeader wrapper on main return",
)

c = r1(
    c,
    "          <Link href={`/admission?program=${programme.id}`} style={ctaButton}>Start Your Application →</Link>\n        </section>\n      </div>\n    </main>\n  );\n}",
    "          <Link href={`/admission?program=${programme.id}`} style={ctaButton}>Start Your Application →</Link>\n        </section>\n      </div>\n    </main>\n      <SiteFooter />\n    </>\n  );\n}",
    "programs/[id]: close SiteHeader/SiteFooter wrapper on main return",
)

save(path, c)
print("app/programs/[id]/page.jsx: SiteHeader/SiteFooter now mounted (was missing entirely).")

# =======================================================================
# 3. components/SiteHeader.jsx -- surface the new real Departments,
#    Faculty and Academic Calendar pages in the Academy dropdown (top of
#    the list, ahead of the governance documents, since they're the live
#    data rather than institutional prose), and register the new search
#    result groups so the department/faculty search results added to
#    /api/search actually render somewhere.
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "const ACADEMY_DROPDOWN_ITEMS = [\n  { label: 'Academy Foundation', href: '/academy-foundation' },\n",
    "const ACADEMY_DROPDOWN_ITEMS = [\n"
    "  { label: 'Academic Departments', href: '/departments' },\n"
    "  { label: 'Faculty', href: '/faculty' },\n"
    "  { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "  { label: 'Academy Foundation', href: '/academy-foundation' },\n",
    "SiteHeader: add Departments/Faculty/Academic Calendar to Academy dropdown",
)

c = r1(
    c,
    "const RESULT_GROUPS = [\n"
    "  { key: 'academy', label: 'Academy' },\n"
    "  { key: 'programs', label: 'Programmes' },\n"
    "  { key: 'courses', label: 'Courses' },\n"
    "  { key: 'media', label: 'Media' },\n"
    "  { key: 'library', label: 'Library' },\n"
    "  { key: 'bookstore', label: 'Bookstore' },\n"
    "];",
    "const RESULT_GROUPS = [\n"
    "  { key: 'academy', label: 'Academy' },\n"
    "  { key: 'programs', label: 'Programmes' },\n"
    "  { key: 'courses', label: 'Courses' },\n"
    "  { key: 'departments', label: 'Departments' },\n"
    "  { key: 'faculty', label: 'Faculty' },\n"
    "  { key: 'media', label: 'Media' },\n"
    "  { key: 'library', label: 'Library' },\n"
    "  { key: 'bookstore', label: 'Bookstore' },\n"
    "];",
    "SiteHeader: add Departments/Faculty to search RESULT_GROUPS",
)

save(path, c)
print("components/SiteHeader.jsx: Departments/Faculty/Academic Calendar wired into nav + search groups.")

# =======================================================================
# 4. components/SiteFooter.jsx -- the existing "Academic Departments"
#    footer link pointed at /programs (there was no real Departments page
#    yet when it was written). Fixed to point at the real page, and the
#    new Faculty and Academic Calendar pages added alongside it.
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "    title: 'Academy',\n"
    "    links: [\n"
    "      { label: 'Academic Departments', href: '/programs' },\n"
    "      { label: 'Admission & Registration', href: '/admission' },\n"
    "      { label: 'Student Portal Login', href: '/login' },\n"
    "    ],\n",
    "    title: 'Academy',\n"
    "    links: [\n"
    "      { label: 'Academic Programmes', href: '/programs' },\n"
    "      { label: 'Academic Departments', href: '/departments' },\n"
    "      { label: 'Faculty', href: '/faculty' },\n"
    "      { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "      { label: 'Admission & Registration', href: '/admission' },\n"
    "      { label: 'Student Portal Login', href: '/login' },\n"
    "    ],\n",
    "SiteFooter: fix Academic Departments link + add Faculty/Academic Calendar",
)

save(path, c)
print("components/SiteFooter.jsx: Academic Departments link fixed, Faculty + Academic Calendar added.")

# =======================================================================
# 5. app/academy/page.jsx -- add a real-data quick-link row (Departments,
#    Faculty, Academic Calendar) alongside the existing "Browse Academic
#    Programmes" card, visually distinct from the 11 governance-document
#    cards below since these lead to live, browsable data rather than
#    institutional prose.
# =======================================================================
path = "app/academy/page.jsx"
c = load(path)

c = r1(
    c,
    "      <section style={programmesSection}>\n"
    "        <Link href=\"/programs\" style={programmesCard}>\n"
    "          <div style={programmesCardText}>\n"
    "            <div style={programmesEyebrow}>Start Here</div>\n"
    "            <div style={programmesTitle}>Browse Academic Programmes</div>\n"
    "            <p style={programmesDesc}>\n"
    "              Explore every active programme offered across the Academy's\n"
    "              departments — certificate, diploma and advanced pathways alike.\n"
    "            </p>\n"
    "          </div>\n"
    "          <span style={programmesCta}>View Programmes →</span>\n"
    "        </Link>\n"
    "      </section>",
    "      <section style={programmesSection}>\n"
    "        <Link href=\"/programs\" style={programmesCard}>\n"
    "          <div style={programmesCardText}>\n"
    "            <div style={programmesEyebrow}>Start Here</div>\n"
    "            <div style={programmesTitle}>Browse Academic Programmes</div>\n"
    "            <p style={programmesDesc}>\n"
    "              Explore every active programme offered across the Academy's\n"
    "              departments — certificate, diploma and advanced pathways alike.\n"
    "            </p>\n"
    "          </div>\n"
    "          <span style={programmesCta}>View Programmes →</span>\n"
    "        </Link>\n"
    "\n"
    "        <div style={quickLinkRow}>\n"
    "          <Link href=\"/departments\" style={quickLinkCard}>\n"
    "            <span style={quickLinkIcon}>🏢</span>\n"
    "            <span style={quickLinkTitle}>Departments</span>\n"
    "            <span style={quickLinkDesc}>The Academy's real academic departments.</span>\n"
    "          </Link>\n"
    "          <Link href=\"/faculty\" style={quickLinkCard}>\n"
    "            <span style={quickLinkIcon}>👥</span>\n"
    "            <span style={quickLinkTitle}>Faculty</span>\n"
    "            <span style={quickLinkDesc}>Meet the teaching staff, by department.</span>\n"
    "          </Link>\n"
    "          <Link href=\"/academic-calendar\" style={quickLinkCard}>\n"
    "            <span style={quickLinkIcon}>📅</span>\n"
    "            <span style={quickLinkTitle}>Academic Calendar</span>\n"
    "            <span style={quickLinkDesc}>The official Gregorian &amp; Hijri calendar.</span>\n"
    "          </Link>\n"
    "        </div>\n"
    "      </section>",
    "academy hub: add Departments/Faculty/Academic Calendar quick-link row",
)

c = r1(
    c,
    "const programmesCardText = { maxWidth: 640 };",
    "const programmesCardText = { maxWidth: 640 };\n\n"
    "const quickLinkRow = {\n"
    "  display: 'grid',\n"
    "  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',\n"
    "  gap: 14,\n"
    "  marginTop: 16,\n"
    "};\n\n"
    "const quickLinkCard = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: 4,\n"
    "  textDecoration: 'none',\n"
    "  color: 'inherit',\n"
    "  background: 'var(--surface)',\n"
    "  border: '1px solid var(--border)',\n"
    "  borderRadius: 12,\n"
    "  padding: '16px 18px',\n"
    "};\n\n"
    "const quickLinkIcon = { fontSize: 20 };\n"
    "const quickLinkTitle = { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' };\n"
    "const quickLinkDesc = { fontSize: 12.5, color: 'var(--ink-soft)' };",
    "academy hub: add quick-link row style constants",
)

save(path, c)
print("app/academy/page.jsx: Departments/Faculty/Academic Calendar quick-link row added.")
