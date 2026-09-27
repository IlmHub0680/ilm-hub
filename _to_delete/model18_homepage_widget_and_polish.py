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

path = "app/page.jsx"
c = load(path)

# =======================================================================
# 1) Import + mount the new Islamic-date/Jumu'ah widget. Fixed-position,
#    so where it sits in the tree doesn't affect layout -- placed right
#    after SiteFooter, last in the page. Does not touch the existing
#    top-bar Hijri/Gregorian date code at all (per standing instruction).
# =======================================================================
c = r1(
    c,
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';\n"
    "import { LanguageProvider, useLanguage } from './HomeLanguageContext';",
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';\n"
    "import IslamicDateWidget from '@/components/IslamicDateWidget';\n"
    "import { LanguageProvider, useLanguage } from './HomeLanguageContext';",
    "page: import IslamicDateWidget",
)

c = r1(
    c,
    "      <SiteFooter />\n"
    "\n"
    "      {/* =====================================================\n"
    "          FOOTER MODAL\n"
    "      ===================================================== */}",
    "      <SiteFooter />\n"
    "\n"
    "      <IslamicDateWidget />\n"
    "\n"
    "      {/* =====================================================\n"
    "          FOOTER MODAL\n"
    "      ===================================================== */}",
    "page: mount IslamicDateWidget",
)

# =======================================================================
# 2) General polish: a subtle hover-lift on the three repeating card
#    types (Feature, Mini, Info) and the gold CTA button, via the
#    existing scoped <style jsx> block (same technique already used for
#    SiteHeader's nav hover states) -- no structural changes.
# =======================================================================
c = r1(
    c,
    "function FeatureCard({ icon, title, text }) {\n"
    "  return (\n"
    "    <div style={featureCard}>",
    "function FeatureCard({ icon, title, text }) {\n"
    "  return (\n"
    "    <div style={featureCard} className=\"uai-lift-card\">",
    "page: FeatureCard hover class",
)

c = r1(
    c,
    "function MiniFeature({ icon, text }) {\n"
    "  return (\n"
    "    <div style={miniFeature}>",
    "function MiniFeature({ icon, text }) {\n"
    "  return (\n"
    "    <div style={miniFeature} className=\"uai-lift-card-dark\">",
    "page: MiniFeature hover class",
)

c = r1(
    c,
    "function InfoBox({ number, title, text }) {\n"
    "  return (\n"
    "    <div style={infoBox}>",
    "function InfoBox({ number, title, text }) {\n"
    "  return (\n"
    "    <div style={infoBox} className=\"uai-lift-card\">",
    "page: InfoBox hover class",
)

c = r1(
    c,
    "          <Link\n"
    "            href=\"/programs\"\n"
    "            style={goldButton}\n"
    "          >\n"
    "            {t('Explore Academic Departments →')}\n"
    "          </Link>",
    "          <Link\n"
    "            href=\"/programs\"\n"
    "            style={goldButton}\n"
    "            className=\"uai-gold-btn\"\n"
    "          >\n"
    "            {t('Explore Academic Departments →')}\n"
    "          </Link>",
    "page: gold CTA button hover class",
)

c = r1(
    c,
    "const featureCard = {\n"
    "  background: 'var(--surface)',\n"
    "  border: '1px solid var(--border)',\n"
    "  borderRadius: '15px',\n"
    "  padding: '27px',\n"
    "  boxShadow: '0 10px 30px rgba(15,23,42,.05)',\n"
    "};",
    "const featureCard = {\n"
    "  background: 'var(--surface)',\n"
    "  border: '1px solid var(--border)',\n"
    "  borderRadius: '15px',\n"
    "  padding: '27px',\n"
    "  boxShadow: '0 10px 30px rgba(15,23,42,.05)',\n"
    "  transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',\n"
    "};",
    "page: featureCard transition",
)

c = r1(
    c,
    "const miniFeature = {\n"
    "  padding: '17px',\n"
    "  borderRadius: '12px',\n"
    "  background: 'rgba(255,255,255,.07)',\n"
    "  border: '1px solid rgba(255,255,255,.12)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '10px',\n"
    "  textAlign: 'left',\n"
    "};",
    "const miniFeature = {\n"
    "  padding: '17px',\n"
    "  borderRadius: '12px',\n"
    "  background: 'rgba(255,255,255,.07)',\n"
    "  border: '1px solid rgba(255,255,255,.12)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '10px',\n"
    "  textAlign: 'left',\n"
    "  transition: 'transform .22s ease, background .22s ease, border-color .22s ease',\n"
    "};",
    "page: miniFeature transition",
)

c = r1(
    c,
    "const infoBox = {\n"
    "  padding: '30px',\n"
    "  borderRadius: '15px',\n"
    "  border: '1px solid var(--border)',\n"
    "  background: 'var(--surface)',\n"
    "};",
    "const infoBox = {\n"
    "  padding: '30px',\n"
    "  borderRadius: '15px',\n"
    "  border: '1px solid var(--border)',\n"
    "  background: 'var(--surface)',\n"
    "  transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',\n"
    "};",
    "page: infoBox transition",
)

c = r1(
    c,
    "const goldButton = {\n"
    "  display: 'inline-block',\n"
    "  padding: '13px 23px',\n"
    "  borderRadius: '8px',\n"
    "  background: 'var(--gold)',\n"
    "  color: 'var(--brand-deepest)',\n"
    "  textDecoration: 'none',\n"
    "  fontWeight: '900',\n"
    "};",
    "const goldButton = {\n"
    "  display: 'inline-block',\n"
    "  padding: '13px 23px',\n"
    "  borderRadius: '8px',\n"
    "  background: 'var(--gold)',\n"
    "  color: 'var(--brand-deepest)',\n"
    "  textDecoration: 'none',\n"
    "  fontWeight: '900',\n"
    "  transition: 'transform .2s ease, box-shadow .2s ease, filter .2s ease',\n"
    "};",
    "page: goldButton transition",
)

# Extend the existing scoped <style jsx> block with the hover rules
# (same file already has one, used for the mobile nav breakpoints).
c = r1(
    c,
    "      <style jsx>{`\n"
    "\n"
    "        .mobile-menu-button-container {\n"
    "          display: none;\n"
    "          padding: 0 24px 15px;\n"
    "        }",
    "      <style jsx>{`\n"
    "\n"
    "        .uai-lift-card:hover {\n"
    "          transform: translateY(-4px);\n"
    "          box-shadow: 0 18px 40px rgba(15,23,42,.12);\n"
    "          border-color: var(--gold);\n"
    "        }\n"
    "\n"
    "        .uai-lift-card-dark:hover {\n"
    "          transform: translateY(-3px);\n"
    "          background: rgba(255,255,255,.12);\n"
    "          border-color: rgba(255,255,255,.25);\n"
    "        }\n"
    "\n"
    "        .uai-gold-btn:hover {\n"
    "          transform: translateY(-2px);\n"
    "          filter: brightness(1.06);\n"
    "          box-shadow: 0 12px 26px rgba(197,157,95,.35);\n"
    "        }\n"
    "\n"
    "        @media (prefers-reduced-motion: reduce) {\n"
    "          .uai-lift-card,\n"
    "          .uai-lift-card-dark,\n"
    "          .uai-gold-btn {\n"
    "            transition: none !important;\n"
    "          }\n"
    "        }\n"
    "\n"
    "        .mobile-menu-button-container {\n"
    "          display: none;\n"
    "          padding: 0 24px 15px;\n"
    "        }",
    "page: hover CSS + reduced-motion guard",
)

save(path, c)
print("app/page.jsx: IslamicDateWidget mounted + card/button hover polish applied.")
