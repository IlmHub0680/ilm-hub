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
# components/SiteFooter.jsx -- already fetches /api/homepage-content;
# just also capture logoUrl and render it in place of the "ع" text mark
# when an admin has uploaded one.
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n",
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n"
    "  const [logoUrl, setLogoUrl] = useState('');\n",
    "SiteFooter: add logoUrl state",
)

c = r1(
    c,
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "      })\n"
    "      .catch(() => {});\n",
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "        if (result.data.hero?.logoUrl) {\n"
    "          setLogoUrl(result.data.hero.logoUrl);\n"
    "        }\n"
    "      })\n"
    "      .catch(() => {});\n",
    "SiteFooter: capture logoUrl from CMS hero payload",
)

c = r1(
    c,
    "              <div style={footerBrand}>\n"
    "                <div style={footerLogo}>ع</div>\n",
    "              <div style={footerBrand}>\n"
    "                {logoUrl ? (\n"
    "                  <img src={logoUrl} alt=\"Ulul Azm Institute\" style={footerLogoImg} />\n"
    "                ) : (\n"
    "                  <div style={footerLogo}>ع</div>\n"
    "                )}\n",
    "SiteFooter: render uploaded logo when present",
)

c = r1(
    c,
    "const footerLogo = {\n"
    "  width: '42px',\n"
    "  height: '42px',\n"
    "  borderRadius: '10px',\n"
    "  background: 'var(--brand)',\n"
    "  border: '1px solid var(--gold)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  justifyContent: 'center',\n"
    "  color: 'var(--gold)',\n"
    "  fontWeight: '900',",
    "const footerLogoImg = {\n"
    "  width: '42px',\n"
    "  height: '42px',\n"
    "  borderRadius: '10px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};\n"
    "\n"
    "const footerLogo = {\n"
    "  width: '42px',\n"
    "  height: '42px',\n"
    "  borderRadius: '10px',\n"
    "  background: 'var(--brand)',\n"
    "  border: '1px solid var(--gold)',\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  justifyContent: 'center',\n"
    "  color: 'var(--gold)',\n"
    "  fontWeight: '900',",
    "SiteFooter: add footerLogoImg style",
)

save(path, c)
print("components/SiteFooter.jsx: renders uploaded logo when set.")

# =======================================================================
# components/SiteHeader.jsx -- no existing fetch of homepage-content;
# add a lightweight one just for the logo (the header doesn't need any
# other homepage CMS data).
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "export default function SiteHeader({ rightExtra, showSearch = true }) {\n"
    "  const pathname = usePathname();\n",
    "export default function SiteHeader({ rightExtra, showSearch = true }) {\n"
    "  const pathname = usePathname();\n"
    "  const [logoUrl, setLogoUrl] = useState('');\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/homepage-content')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.data?.hero?.logoUrl) return;\n"
    "        setLogoUrl(result.data.hero.logoUrl);\n"
    "      })\n"
    "      .catch(() => {});\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n",
    "SiteHeader: fetch logoUrl from CMS hero payload",
)

c = r1(
    c,
    "        <Link href=\"/\" style={brandStyle}>\n"
    "          <div style={logoStyle}>ع</div>\n",
    "        <Link href=\"/\" style={brandStyle}>\n"
    "          {logoUrl ? (\n"
    "            <img src={logoUrl} alt=\"Ulul Azm Institute\" style={logoImgStyle} />\n"
    "          ) : (\n"
    "            <div style={logoStyle}>ع</div>\n"
    "          )}\n",
    "SiteHeader: render uploaded logo when present",
)

c = r1(
    c,
    "const logoStyle = {\n"
    "  width: '44px',\n"
    "  height: '44px',\n"
    "  borderRadius: '12px',\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',",
    "const logoImgStyle = {\n"
    "  width: '44px',\n"
    "  height: '44px',\n"
    "  borderRadius: '12px',\n"
    "  objectFit: 'cover',\n"
    "  flexShrink: 0,\n"
    "};\n"
    "\n"
    "const logoStyle = {\n"
    "  width: '44px',\n"
    "  height: '44px',\n"
    "  borderRadius: '12px',\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-light))',",
    "SiteHeader: add logoImgStyle",
)

save(path, c)
print("components/SiteHeader.jsx: renders uploaded logo when set.")
