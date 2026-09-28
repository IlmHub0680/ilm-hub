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
# components/SiteHeader.jsx -- the site logo was small (44x44) relative
# to the header's own padding; sized it up to 54x54 (a clear, visible
# increase without dominating the header) and added a mobile-width
# override so it doesn't crowd the header on small screens.
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "          {logoUrl ? (\n"
    "            <img src={logoUrl} alt=\"Ulul Azm Institute\" style={logoImgStyle} />\n"
    "          ) : (\n"
    "            <div style={logoStyle}>ع</div>\n"
    "          )}",
    "          {logoUrl ? (\n"
    "            <img src={logoUrl} alt=\"Ulul Azm Institute\" style={logoImgStyle} className=\"site-header-logo\" />\n"
    "          ) : (\n"
    "            <div style={logoStyle} className=\"site-header-logo\">ع</div>\n"
    "          )}",
    "SiteHeader: logo className for responsive sizing",
)

c = r1(
    c,
    "const logoImgStyle = {\n"
    "  width: '44px',\n"
    "  height: '44px',\n"
    "  borderRadius: '12px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};",
    "const logoImgStyle = {\n"
    "  width: '54px',\n"
    "  height: '54px',\n"
    "  borderRadius: '13px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};",
    "SiteHeader: logoImgStyle size",
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
    "};",
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
    "SiteHeader: logoStyle size",
)

c = r1(
    c,
    "      <style jsx>{`\n"
    "        .mobile-menu-button-container {\n"
    "          display: none;\n"
    "          padding: 0 24px 15px;\n"
    "        }\n"
    "\n"
    "        @media (max-width: 900px) {",
    "      <style jsx>{`\n"
    "        .mobile-menu-button-container {\n"
    "          display: none;\n"
    "          padding: 0 24px 15px;\n"
    "        }\n"
    "\n"
    "        @media (max-width: 700px) {\n"
    "          .site-header-logo {\n"
    "            width: 46px !important;\n"
    "            height: 46px !important;\n"
    "          }\n"
    "        }\n"
    "\n"
    "        @media (max-width: 900px) {",
    "SiteHeader: mobile logo size override",
)

save(path, c)
print("components/SiteHeader.jsx: logo sized up to 54px (46px on small screens).")
