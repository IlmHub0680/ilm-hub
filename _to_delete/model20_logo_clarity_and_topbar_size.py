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
# components/SiteHeader.jsx -- the header logo was a fixed 54x54 square
# with object-fit: cover, which crops a non-square logo and can hide
# detail/text baked into the artwork. Switched to a height-led box with
# object-fit: contain (nothing cropped, whatever the logo's real aspect
# ratio) and sized it up further so it reads clearly -- this is the
# same SiteHeader used by Bookstore (sectionMode="bookstore"), Media and
# Library, so the fix applies there automatically, no separate edit
# needed for Bookstore's own top header.
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "const logoImgStyle = {\n"
    "  width: '54px',\n"
    "  height: '54px',\n"
    "  borderRadius: '13px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};",
    "const logoImgStyle = {\n"
    "  height: '60px',\n"
    "  width: 'auto',\n"
    "  maxWidth: '210px',\n"
    "  objectFit: 'contain',\n"
    "  flexShrink: 0,\n"
    "};",
    "SiteHeader: logoImgStyle -- height-led, contain fit, nothing cropped",
)

c = r1(
    c,
    "const logoStyle = {\n"
    "  width: '54px',\n"
    "  height: '54px',\n"
    "  borderRadius: '13px',\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',\n"
    "  color: 'var(--gold)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  justifyContent: 'center',\n"
    "  fontSize: '28px',\n"
    "  fontWeight: '900',\n"
    "  border: '1px solid rgba(197,157,95,.5)',\n"
    "};",
    "const logoStyle = {\n"
    "  width: '60px',\n"
    "  height: '60px',\n"
    "  borderRadius: '14px',\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',\n"
    "  color: 'var(--gold)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  justifyContent: 'center',\n"
    "  fontSize: '30px',\n"
    "  fontWeight: '900',\n"
    "  border: '1px solid rgba(197,157,95,.5)',\n"
    "  flexShrink: 0,\n"
    "};",
    "SiteHeader: logoStyle fallback size to match",
)

c = r1(
    c,
    "        @media (max-width: 700px) {\n"
    "          .site-header-logo {\n"
    "            width: 46px !important;\n"
    "            height: 46px !important;\n"
    "          }\n"
    "        }",
    "        @media (max-width: 700px) {\n"
    "          .site-header-logo {\n"
    "            height: 48px !important;\n"
    "            max-width: 150px !important;\n"
    "          }\n"
    "        }",
    "SiteHeader: mobile logo override matches new sizing model",
)

save(path, c)
print("components/SiteHeader.jsx: logo now height-led with contain fit (bigger, nothing cropped) -- applies to Bookstore/Media/Library too.")

# =======================================================================
# components/SiteFooter.jsx -- the footer logo should read clearly but
# stay visibly smaller than the header's. Same object-fit fix (contain,
# not cover) so nothing is cropped; no forced white background is added
# -- the logo renders as-is, whatever its own background looks like.
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "const footerLogoImg = {\n"
    "  width: '42px',\n"
    "  height: '42px',\n"
    "  borderRadius: '10px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};",
    "const footerLogoImg = {\n"
    "  height: '46px',\n"
    "  width: 'auto',\n"
    "  maxWidth: '130px',\n"
    "  objectFit: 'contain',\n"
    "  flexShrink: 0,\n"
    "};",
    "SiteFooter: footerLogoImg -- smaller than header, contain fit, not cropped",
)

c = r1(
    c,
    "const footerLogo = {\n"
    "  width: '42px',\n"
    "  height: '42px',\n"
    "  borderRadius: '10px',",
    "const footerLogo = {\n"
    "  width: '46px',\n"
    "  height: '46px',\n"
    "  borderRadius: '10px',",
    "SiteFooter: footerLogo fallback size to match",
)

save(path, c)
print("components/SiteFooter.jsx: footer logo now contain-fit, readable, still smaller than the header logo.")

# =======================================================================
# app/bookstore/page.jsx -- Bookstore's own hardcoded footer (kept
# separate from SiteFooter deliberately) had the identical crop-prone
# 42x42 cover logo. Same fix, same final size as SiteFooter's, so both
# footers now read consistently across the site.
# =======================================================================
path = "app/bookstore/page.jsx"
c = load(path)

c = r1(
    c,
    "        .footer-brand-logo {\n"
    "          width: 42px;\n"
    "          height: 42px;\n"
    "          border-radius: 10px;\n"
    "          object-fit: cover;\n"
    "          flex-shrink: 0;\n"
    "        }",
    "        .footer-brand-logo {\n"
    "          height: 46px;\n"
    "          width: auto;\n"
    "          max-width: 130px;\n"
    "          object-fit: contain;\n"
    "          flex-shrink: 0;\n"
    "        }",
    "Bookstore footer: footer-brand-logo -- contain fit, not cropped",
)

save(path, c)
print("app/bookstore/page.jsx: footer logo matches SiteFooter's fix.")

# =======================================================================
# app/page.jsx -- the top information bar (Gregorian date/time, Hijri
# date, EN/Arabic toggle) was too small to read comfortably. Sizing up
# the bar's type scale only -- the date/time VALUES and Hijri
# calculation are completely untouched, exactly as before.
# =======================================================================
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "const topBar = {\n"
    "  background:\n"
    "    'linear-gradient(90deg,var(--brand-deepest),var(--brand),var(--brand-deepest))',\n"
    "  color: 'var(--on-accent)',\n"
    "  padding: '9px 20px',\n"
    "  fontSize: '12px',\n"
    "};",
    "const topBar = {\n"
    "  background:\n"
    "    'linear-gradient(90deg,var(--brand-deepest),var(--brand),var(--brand-deepest))',\n"
    "  color: 'var(--on-accent)',\n"
    "  padding: '11px 20px',\n"
    "  fontSize: '13.5px',\n"
    "};",
    "page: topBar font size",
)

c = r1(
    c,
    "const langToggleBtn = {\n"
    "  background: 'transparent',\n"
    "  border: '1px solid rgba(255,255,255,.4)',\n"
    "  color: 'var(--on-accent)',\n"
    "  borderRadius: 999,\n"
    "  padding: '3px 11px',\n"
    "  fontSize: '11px',\n"
    "  fontWeight: 700,\n"
    "  cursor: 'pointer',\n"
    "  opacity: 0.75,\n"
    "};",
    "const langToggleBtn = {\n"
    "  background: 'transparent',\n"
    "  border: '1px solid rgba(255,255,255,.4)',\n"
    "  color: 'var(--on-accent)',\n"
    "  borderRadius: 999,\n"
    "  padding: '4px 13px',\n"
    "  fontSize: '12.5px',\n"
    "  fontWeight: 700,\n"
    "  cursor: 'pointer',\n"
    "  opacity: 0.75,\n"
    "};",
    "page: langToggleBtn font size",
)

c = r1(
    c,
    "            <span\n"
    "              style={{\n"
    "                marginLeft: '6px',\n"
    "                opacity: 0.65,\n"
    "                fontSize: '10px',\n"
    "              }}\n"
    "            >\n"
    "              {t('(Umm al-Qura)')}\n"
    "            </span>",
    "            <span\n"
    "              style={{\n"
    "                marginLeft: '6px',\n"
    "                opacity: 0.65,\n"
    "                fontSize: '11.5px',\n"
    "              }}\n"
    "            >\n"
    "              {t('(Umm al-Qura)')}\n"
    "            </span>",
    "page: '(Umm al-Qura)' note font size",
)

save(path, c)
print("app/page.jsx: top info bar text sized up -- date/Hijri calculation untouched, styling only.")
