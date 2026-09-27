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
# app/page.jsx -- the uploaded site logo already renders correctly in
# the header and footer (both fetch /api/homepage-content on their own
# and place hero.logoUrl in the nav bar / footer, per the admin Brand
# Assets field's own description: "Shown in the header and footer in
# place of the text mark"). The homepage hero section ALSO rendered it
# a third time, floating at the top-left of the hero banner rather
# than inline with the centered badge/title/text below it -- a stray,
# redundant repeat the user circled and asked to have removed. Header
# and footer are untouched; they read the same hero.logoUrl
# independently and keep working exactly as before.
# =======================================================================
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "        <div style={heroInner}>\n"
    "\n"
    "          {hero.logoUrl && (\n"
    "            <img src={hero.logoUrl} alt={lang === 'ar' && hero.titleAr ? hero.titleAr : hero.title} style={heroLogo} />\n"
    "          )}\n"
    "\n"
    "          <div style={heroBadge}>",
    "        <div style={heroInner}>\n"
    "\n"
    "          <div style={heroBadge}>",
    "page: remove the redundant hero-banner logo image",
)

c = r1(
    c,
    "const heroLogo = {\n"
    "  height: 56,\n"
    "  width: 'auto',\n"
    "  maxWidth: 180,\n"
    "  objectFit: 'contain',\n"
    "  marginBottom: 18,\n"
    "};\n"
    "\n"
    "const heroBadge = {\n"
    "  display: 'inline-block',",
    "const heroBadge = {\n"
    "  display: 'inline-block',",
    "page: remove now-unused heroLogo style",
)

save(path, c)
print("app/page.jsx: removed the duplicate hero-banner logo -- header and footer logos are untouched.")
