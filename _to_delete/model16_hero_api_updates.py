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
# app/api/admin/homepage/hero/route.js -- accept/return the new Arabic
# fields and the two uploaded-asset URLs.
# =======================================================================
path = "app/api/admin/homepage/hero/route.js"
c = load(path)

c = r1(
    c,
    "function serialize(hero) {\n"
    "  return {\n"
    "    badge: hero.badge,\n"
    "    title: hero.title,\n"
    "    subtitle: hero.subtitle,\n"
    "    primaryLabel: hero.primaryLabel,\n"
    "    primaryHref: hero.primaryHref,\n"
    "    secondaryLabel: hero.secondaryLabel,\n"
    "    secondaryHref: hero.secondaryHref,\n"
    "    features: hero.features,\n"
    "  };\n"
    "}",
    "function serialize(hero) {\n"
    "  return {\n"
    "    badge: hero.badge,\n"
    "    title: hero.title,\n"
    "    subtitle: hero.subtitle,\n"
    "    primaryLabel: hero.primaryLabel,\n"
    "    primaryHref: hero.primaryHref,\n"
    "    secondaryLabel: hero.secondaryLabel,\n"
    "    secondaryHref: hero.secondaryHref,\n"
    "    features: hero.features,\n"
    "    badgeAr: hero.badgeAr || '',\n"
    "    titleAr: hero.titleAr || '',\n"
    "    subtitleAr: hero.subtitleAr || '',\n"
    "    primaryLabelAr: hero.primaryLabelAr || '',\n"
    "    secondaryLabelAr: hero.secondaryLabelAr || '',\n"
    "    featuresAr: hero.featuresAr || [],\n"
    "    logoUrl: hero.logoUrl || '',\n"
    "    heroImageUrl: hero.heroImageUrl || '',\n"
    "  };\n"
    "}",
    "admin hero route: serialize new fields",
)

c = r1(
    c,
    "    const stringFields = [\n"
    "      \"badge\",\n"
    "      \"title\",\n"
    "      \"subtitle\",\n"
    "      \"primaryLabel\",\n"
    "      \"primaryHref\",\n"
    "      \"secondaryLabel\",\n"
    "      \"secondaryHref\",\n"
    "    ];\n"
    "\n"
    "    const values = {};\n"
    "\n"
    "    for (const field of stringFields) {\n"
    "      const value = typeof body[field] === \"string\" ? body[field].trim() : \"\";\n"
    "\n"
    "      if (!value) {\n"
    "        return json({ success: false, error: `${field} is required.` }, 400);\n"
    "      }\n"
    "\n"
    "      values[field] = value;\n"
    "    }\n"
    "\n"
    "    const features = Array.isArray(body.features)\n"
    "      ? body.features\n"
    "          .map((f) => (typeof f === \"string\" ? f.trim() : \"\"))\n"
    "          .filter(Boolean)\n"
    "      : [];\n"
    "\n"
    "    values.features = features;\n",
    "    const stringFields = [\n"
    "      \"badge\",\n"
    "      \"title\",\n"
    "      \"subtitle\",\n"
    "      \"primaryLabel\",\n"
    "      \"primaryHref\",\n"
    "      \"secondaryLabel\",\n"
    "      \"secondaryHref\",\n"
    "    ];\n"
    "\n"
    "    const values = {};\n"
    "\n"
    "    for (const field of stringFields) {\n"
    "      const value = typeof body[field] === \"string\" ? body[field].trim() : \"\";\n"
    "\n"
    "      if (!value) {\n"
    "        return json({ success: false, error: `${field} is required.` }, 400);\n"
    "      }\n"
    "\n"
    "      values[field] = value;\n"
    "    }\n"
    "\n"
    "    const features = Array.isArray(body.features)\n"
    "      ? body.features\n"
    "          .map((f) => (typeof f === \"string\" ? f.trim() : \"\"))\n"
    "          .filter(Boolean)\n"
    "      : [];\n"
    "\n"
    "    values.features = features;\n"
    "\n"
    "    // Arabic translations and uploaded assets are all optional -- the\n"
    "    // public homepage falls back to English / the text-glyph mark when\n"
    "    // these are blank, so nothing here is required.\n"
    "    const optionalStringFields = [\n"
    "      \"badgeAr\",\n"
    "      \"titleAr\",\n"
    "      \"subtitleAr\",\n"
    "      \"primaryLabelAr\",\n"
    "      \"secondaryLabelAr\",\n"
    "      \"logoUrl\",\n"
    "      \"heroImageUrl\",\n"
    "    ];\n"
    "\n"
    "    for (const field of optionalStringFields) {\n"
    "      values[field] = typeof body[field] === \"string\" ? body[field].trim() : \"\";\n"
    "    }\n"
    "\n"
    "    values.featuresAr = Array.isArray(body.featuresAr)\n"
    "      ? body.featuresAr\n"
    "          .map((f) => (typeof f === \"string\" ? f.trim() : \"\"))\n"
    "          .filter(Boolean)\n"
    "      : [];\n",
    "admin hero route: accept new fields in PUT",
)

save(path, c)
print("app/api/admin/homepage/hero/route.js: Arabic fields + logo/hero image URLs wired through.")

# =======================================================================
# app/api/homepage-content/route.js -- public GET must also expose the
# new fields so the homepage's EN/AR toggle and logo/hero image actually
# have data to render.
# =======================================================================
path = "app/api/homepage-content/route.js"
c = load(path)

c = r1(
    c,
    "        hero: hero\n"
    "          ? {\n"
    "              badge: hero.badge,\n"
    "              title: hero.title,\n"
    "              subtitle: hero.subtitle,\n"
    "              primaryLabel: hero.primaryLabel,\n"
    "              primaryHref: hero.primaryHref,\n"
    "              secondaryLabel: hero.secondaryLabel,\n"
    "              secondaryHref: hero.secondaryHref,\n"
    "              features: hero.features,\n"
    "            }\n"
    "          : DEFAULT_HERO,",
    "        hero: hero\n"
    "          ? {\n"
    "              badge: hero.badge,\n"
    "              title: hero.title,\n"
    "              subtitle: hero.subtitle,\n"
    "              primaryLabel: hero.primaryLabel,\n"
    "              primaryHref: hero.primaryHref,\n"
    "              secondaryLabel: hero.secondaryLabel,\n"
    "              secondaryHref: hero.secondaryHref,\n"
    "              features: hero.features,\n"
    "              badgeAr: hero.badgeAr || '',\n"
    "              titleAr: hero.titleAr || '',\n"
    "              subtitleAr: hero.subtitleAr || '',\n"
    "              primaryLabelAr: hero.primaryLabelAr || '',\n"
    "              secondaryLabelAr: hero.secondaryLabelAr || '',\n"
    "              featuresAr: hero.featuresAr || [],\n"
    "              logoUrl: hero.logoUrl || '',\n"
    "              heroImageUrl: hero.heroImageUrl || '',\n"
    "            }\n"
    "          : DEFAULT_HERO,",
    "homepage-content route: expose new hero fields publicly",
)

save(path, c)
print("app/api/homepage-content/route.js: public hero payload now includes Arabic fields + asset URLs.")
