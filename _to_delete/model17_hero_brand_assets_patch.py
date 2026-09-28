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
# app/api/admin/homepage/hero/route.js -- add a PATCH handler that
# updates ONLY logoUrl/heroImageUrl, independent of the PUT handler's
# required-field validation on the rest of the hero copy. This is what
# lets the admin save just the logo/banner without touching (or being
# blocked by) the headline/description/CTA fields.
#
# Safety: if no HomepageHero row exists yet, PATCH must not create a
# partial row with blank badge/title/subtitle -- /api/homepage-content
# uses a DB row wholesale once one exists (no merge with its own
# DEFAULT_HERO fallback), so a partial row would blank the live
# homepage. DEFAULT_HERO_TEXT below is copied verbatim from that
# route's DEFAULT_HERO so a first-time asset save still creates a
# complete, sane row -- the admin's later full "Save Hero Section"
# then simply overwrites the text fields as normal.
# =======================================================================
path = "app/api/admin/homepage/hero/route.js"
c = load(path)

c = r1(
    c,
    'const HERO_SETTINGS_ID = "default-homepage-hero";',
    'const HERO_SETTINGS_ID = "default-homepage-hero";\n'
    '\n'
    '// Mirrors DEFAULT_HERO in app/api/homepage-content/route.js exactly --\n'
    '// used only as the text content for a brand-new hero row created by\n'
    '// PATCH (logo/banner-only save) before the admin has ever run the\n'
    '// full "Save Hero Section" form.\n'
    'const DEFAULT_HERO_TEXT = {\n'
    '  badge: "A DIGITAL HOME FOR ISLAMIC KNOWLEDGE",\n'
    '  title: "Excellence in Islamic Studies & Qur\'anic Sciences",\n'
    '  subtitle:\n'
    '    "A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.",\n'
    '  primaryLabel: "Apply Now →",\n'
    '  primaryHref: "/admission",\n'
    '  secondaryLabel: "Explore Academics →",\n'
    '  secondaryHref: "/programs",\n'
    '  features: [\n'
    '    "Structured curriculum",\n'
    '    "Online learning",\n'
    '    "Academic resources",\n'
    '    "Global access",\n'
    '  ],\n'
    '  badgeAr: "",\n'
    '  titleAr: "",\n'
    '  subtitleAr: "",\n'
    '  primaryLabelAr: "",\n'
    '  secondaryLabelAr: "",\n'
    '  featuresAr: [],\n'
    '};',
    "hero route: add DEFAULT_HERO_TEXT fallback for a first-time asset-only save",
)

c = r1(
    c,
    '    console.error("PUT homepage hero error:", error);\n'
    '    return json({ success: false, error: "Failed to save hero content." }, 500);\n'
    '  }\n'
    '}',
    '    console.error("PUT homepage hero error:", error);\n'
    '    return json({ success: false, error: "Failed to save hero content." }, 500);\n'
    '  }\n'
    '}\n'
    '\n'
    '// Updates ONLY the brand assets (site logo, hero/site banner image) --\n'
    '// deliberately independent of PUT\'s required-field validation on the\n'
    '// rest of the hero copy, so the admin can swap a logo or banner\n'
    '// without also having to fill in (or resubmit) the headline,\n'
    '// description, CTA buttons or Arabic translation. Applies immediately:\n'
    '// this route has no caching/staging step, so the next page load\n'
    '// anywhere on the site (header, footer, homepage) already reflects it.\n'
    'export async function PATCH(request) {\n'
    '  try {\n'
    '    await requireAdmin();\n'
    '\n'
    '    const body = await request.json();\n'
    '\n'
    '    if (\n'
    '      typeof body.logoUrl !== "string" &&\n'
    '      typeof body.heroImageUrl !== "string"\n'
    '    ) {\n'
    '      return json(\n'
    '        { success: false, error: "logoUrl and/or heroImageUrl is required." },\n'
    '        400\n'
    '      );\n'
    '    }\n'
    '\n'
    '    const assetValues = {};\n'
    '    if (typeof body.logoUrl === "string") {\n'
    '      assetValues.logoUrl = body.logoUrl.trim();\n'
    '    }\n'
    '    if (typeof body.heroImageUrl === "string") {\n'
    '      assetValues.heroImageUrl = body.heroImageUrl.trim();\n'
    '    }\n'
    '\n'
    '    const existing = await prisma.homepageHero.findUnique({\n'
    '      where: { id: HERO_SETTINGS_ID },\n'
    '    });\n'
    '\n'
    '    const hero = existing\n'
    '      ? await prisma.homepageHero.update({\n'
    '          where: { id: HERO_SETTINGS_ID },\n'
    '          data: assetValues,\n'
    '        })\n'
    '      : await prisma.homepageHero.create({\n'
    '          data: {\n'
    '            id: HERO_SETTINGS_ID,\n'
    '            ...DEFAULT_HERO_TEXT,\n'
    '            logoUrl: "",\n'
    '            heroImageUrl: "",\n'
    '            ...assetValues,\n'
    '          },\n'
    '        });\n'
    '\n'
    '    return json({ success: true, data: serialize(hero) });\n'
    '  } catch (error) {\n'
    '    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);\n'
    '    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);\n'
    '\n'
    '    console.error("PATCH homepage hero error:", error);\n'
    '    return json({ success: false, error: "Failed to save brand assets." }, 500);\n'
    '  }\n'
    '}',
    "hero route: add PATCH handler for logo/banner-only saves",
)

save(path, c)
print("app/api/admin/homepage/hero/route.js: PATCH handler added for independent brand-asset saves.")
