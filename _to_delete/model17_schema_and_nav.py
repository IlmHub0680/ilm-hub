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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

# =======================================================================
# prisma/schema.prisma -- 4 new models for the homepage sections the
# user asked to make editable: one singleton text row covering the
# Welcome/Academy/Our Approach headings plus the Bismillah banner (all
# just badge/title/subtitle-shaped, no repeating items of their own),
# and three small ordered lists for the feature cards, academy subject
# icons and approach steps. Same singleton + ordered-list convention as
# HomepageHero/AcademyHubHero + AcademyHubCard.
# =======================================================================
path = "prisma/schema.prisma"
c = load(path)

c = r1(
    c,
    "  logoUrl      String?\n"
    "  heroImageUrl String?\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n"
    "\n"
    "// A single uploaded banner image per public section (Model 17) -- the",
    "  logoUrl      String?\n"
    "  heroImageUrl String?\n"
    "  updatedAt      DateTime @updatedAt\n"
    "  createdAt      DateTime @default(now())\n"
    "}\n"
    "\n"
    "// Homepage \"Welcome\", \"Academy\" and \"Our Approach\" section text, plus\n"
    "// the closing \"Bismillah\" CTA banner (Model 17) -- one singleton row\n"
    "// covering all four, since each is just a badge/title/subtitle (or,\n"
    "// for the banner, an Arabic line/title/description) with no repeating\n"
    "// items of its own. Fixed id \"default-homepage-sections\", same\n"
    "// convention as HomepageHero. Admin-editable at /admin/homepage/sections.\n"
    "model HomepageSectionsText {\n"
    "  id               String   @id @default(cuid())\n"
    "  welcomeBadge     String\n"
    "  welcomeTitle     String\n"
    "  welcomeSubtitle  String   @db.Text\n"
    "  academyBadge     String\n"
    "  academyTitle     String\n"
    "  academySubtitle  String   @db.Text\n"
    "  approachBadge    String\n"
    "  approachTitle    String\n"
    "  approachSubtitle String   @db.Text\n"
    "  ctaArabicLine    String\n"
    "  ctaTitle         String\n"
    "  ctaDescription   String   @db.Text\n"
    "  updatedAt        DateTime @updatedAt\n"
    "  createdAt        DateTime @default(now())\n"
    "}\n"
    "\n"
    "// The four feature cards under the homepage's \"Welcome\" section\n"
    "// (icon + title + short text). Same ordered-list pattern as\n"
    "// AcademyHubCard.\n"
    "model HomepageFeatureCard {\n"
    "  id        String   @id @default(cuid())\n"
    "  icon      String\n"
    "  title     String\n"
    "  text      String   @db.Text\n"
    "  order     Int      @default(0)\n"
    "  isActive  Boolean  @default(true)\n"
    "  createdAt DateTime @default(now())\n"
    "  updatedAt DateTime @updatedAt\n"
    "\n"
    "  @@index([order])\n"
    "}\n"
    "\n"
    "// The homepage Academy section's grid of subject icons (icon + short\n"
    "// label) -- Qur'anic Sciences, Arabic Language, etc.\n"
    "model HomepageAcademyItem {\n"
    "  id        String   @id @default(cuid())\n"
    "  icon      String\n"
    "  text      String\n"
    "  order     Int      @default(0)\n"
    "  isActive  Boolean  @default(true)\n"
    "  createdAt DateTime @default(now())\n"
    "  updatedAt DateTime @updatedAt\n"
    "\n"
    "  @@index([order])\n"
    "}\n"
    "\n"
    "// The homepage's \"Our Approach\" section's three numbered steps.\n"
    "model HomepageApproachStep {\n"
    "  id        String   @id @default(cuid())\n"
    "  number    String\n"
    "  title     String\n"
    "  text      String   @db.Text\n"
    "  order     Int      @default(0)\n"
    "  isActive  Boolean  @default(true)\n"
    "  createdAt DateTime @default(now())\n"
    "  updatedAt DateTime @updatedAt\n"
    "\n"
    "  @@index([order])\n"
    "}\n"
    "\n"
    "// A single uploaded banner image per public section (Model 17) -- the",
    "schema.prisma: add HomepageSectionsText/HomepageFeatureCard/HomepageAcademyItem/HomepageApproachStep",
)

save(path, c)
print("prisma/schema.prisma: 4 new homepage-sections CMS models added.")

# =======================================================================
# app/admin/homepage/layout.jsx -- nav entry for the new sections page.
# =======================================================================
path = "app/admin/homepage/layout.jsx"
c = load(path)

c = r1(
    c,
    "const sections = [\n"
    "  { href: '/admin/homepage/hero', label: 'Hero Section', icon: '🎯' },\n"
    "  { href: '/admin/homepage/announcements', label: 'Announcements', icon: '📣' },\n",
    "const sections = [\n"
    "  { href: '/admin/homepage/hero', label: 'Hero Section', icon: '🎯' },\n"
    "  { href: '/admin/homepage/sections', label: 'Homepage Sections', icon: '🧱' },\n"
    "  { href: '/admin/homepage/announcements', label: 'Announcements', icon: '📣' },\n",
    "homepage admin layout: add Homepage Sections nav entry",
)

save(path, c)
print("app/admin/homepage/layout.jsx: nav entry added for the new Homepage Sections page.")
