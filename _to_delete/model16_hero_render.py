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

path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "      <section style={heroStyle}>\n"
    "\n"
    "        <div style={heroOverlay} />\n"
    "\n"
    "        <div style={heroInner}>\n"
    "\n"
    "          <div style={heroBadge}>\n"
    "            {hero.badge}\n"
    "          </div>\n"
    "\n"
    "          <h1 style={heroTitle}>\n"
    "            {hero.title}\n"
    "          </h1>\n"
    "\n"
    "          <p style={heroText}>\n"
    "            {hero.subtitle}\n"
    "          </p>\n"
    "\n"
    "          <div style={heroButtonRow}>\n"
    "\n"
    "            <Link\n"
    "              href={hero.primaryHref}\n"
    "              style={heroPrimaryButton}\n"
    "            >\n"
    "              {hero.primaryLabel}\n"
    "            </Link>\n"
    "\n"
    "            <Link\n"
    "              href={hero.secondaryHref}\n"
    "              style={heroSecondaryButton}\n"
    "            >\n"
    "              {hero.secondaryLabel}\n"
    "            </Link>\n"
    "\n"
    "          </div>\n"
    "\n"
    "          <div style={heroFeatures}>\n"
    "\n"
    "            {hero.features.map((feature) => (\n"
    "              <span key={feature}>✓ {feature}</span>\n"
    "            ))}\n"
    "\n"
    "          </div>\n"
    "\n"
    "        </div>\n"
    "      </section>",
    "      <section\n"
    "        style={\n"
    "          hero.heroImageUrl\n"
    "            ? {\n"
    "                ...heroStyle,\n"
    "                backgroundImage: `linear-gradient(135deg, rgba(8,32,24,.78), rgba(8,32,24,.5)), url(${hero.heroImageUrl})`,\n"
    "                backgroundSize: 'cover',\n"
    "                backgroundPosition: 'center',\n"
    "              }\n"
    "            : heroStyle\n"
    "        }\n"
    "        dir={dir}\n"
    "      >\n"
    "\n"
    "        <div style={heroOverlay} />\n"
    "\n"
    "        <div style={heroInner}>\n"
    "\n"
    "          {hero.logoUrl && (\n"
    "            <img src={hero.logoUrl} alt={lang === 'ar' && hero.titleAr ? hero.titleAr : hero.title} style={heroLogo} />\n"
    "          )}\n"
    "\n"
    "          <div style={heroBadge}>\n"
    "            {lang === 'ar' && hero.badgeAr ? hero.badgeAr : hero.badge}\n"
    "          </div>\n"
    "\n"
    "          <h1 style={heroTitle}>\n"
    "            {lang === 'ar' && hero.titleAr ? hero.titleAr : hero.title}\n"
    "          </h1>\n"
    "\n"
    "          <p style={heroText}>\n"
    "            {lang === 'ar' && hero.subtitleAr ? hero.subtitleAr : hero.subtitle}\n"
    "          </p>\n"
    "\n"
    "          <div style={heroButtonRow}>\n"
    "\n"
    "            <Link\n"
    "              href={hero.primaryHref}\n"
    "              style={heroPrimaryButton}\n"
    "            >\n"
    "              {lang === 'ar' && hero.primaryLabelAr ? hero.primaryLabelAr : hero.primaryLabel}\n"
    "            </Link>\n"
    "\n"
    "            <Link\n"
    "              href={hero.secondaryHref}\n"
    "              style={heroSecondaryButton}\n"
    "            >\n"
    "              {lang === 'ar' && hero.secondaryLabelAr ? hero.secondaryLabelAr : hero.secondaryLabel}\n"
    "            </Link>\n"
    "\n"
    "          </div>\n"
    "\n"
    "          <div style={heroFeatures}>\n"
    "\n"
    "            {hero.features.map((feature, i) => (\n"
    "              <span key={feature}>✓ {lang === 'ar' && hero.featuresAr?.[i] ? hero.featuresAr[i] : feature}</span>\n"
    "            ))}\n"
    "\n"
    "          </div>\n"
    "\n"
    "        </div>\n"
    "      </section>",
    "page: Hero section -- logo, hero image, bilingual text",
)

c = r1(
    c,
    "const heroBadge = {\n"
    "  display: 'inline-block',",
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
    "page: add heroLogo style",
)

save(path, c)
print("app/page.jsx: Hero section now renders uploaded logo/hero image and bilingual CMS text.")
