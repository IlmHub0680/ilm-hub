# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def cut_between(content, start_marker, end_marker, replacement, label, search_from=0):
    start = content.index(start_marker, search_from)
    end = content.index(end_marker, start) + len(end_marker)
    return content[:start] + replacement + content[end:]

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/page.jsx"
c = load(path)

# 1. Import the shared header/footer components.
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n"
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import SiteFooter from '@/components/SiteFooter';\n",
    "add SiteHeader/SiteFooter imports",
)

# 2. Replace the inline header block with the shared component.
c = cut_between(
    c,
    "      <header style={headerStyle}>",
    "      </header>",
    "      <SiteHeader />",
    "replace inline header with <SiteHeader />",
)

# 3. Replace the inline footer block with the shared component.
c = cut_between(
    c,
    "      <footer style={footerStyle}>",
    "      </footer>",
    "      <SiteFooter />",
    "replace inline footer with <SiteFooter />",
)

# 4. Remove the footer modal render block -- it now lives inside
#    SiteFooter itself (self-contained, own state). Keep the
#    "RESPONSIVE STYLES" <style jsx> block right after it untouched.
c = cut_between(
    c,
    "      {footerModal && footerContent[footerModal] && (",
    "      {/* =====================================================\n          RESPONSIVE STYLES",
    "      {/* =====================================================\n          RESPONSIVE STYLES",
    "remove footer modal render block",
)

# 5. Remove now-unused state: mobileMenuOpen / academyMobileOpen (only
#    ever used inside the inline header block just removed).
c = r1(
    c,
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n"
    "  const [academyMobileOpen, setAcademyMobileOpen] = useState(false);\n",
    "",
    "remove mobileMenuOpen/academyMobileOpen state",
)

# 6. Remove now-unused state: footerModal (the modal it toggled moved
#    into SiteFooter, which owns its own footerModal state).
c = r1(
    c,
    "  const [footerModal, setFooterModal] = useState(null);\n",
    "",
    "remove footerModal state",
)

# 7. Fix the "ACADEMICS" section eyebrow -> "ACADEMY", matching the
#    Model 14 public-navigation-terminology correction already applied
#    to the main nav dropdown and the footer link group title.
c = r1(
    c,
    "          <span style={goldLabel}>\n"
    "            ACADEMICS\n"
    "          </span>",
    "          <span style={goldLabel}>\n"
    "            ACADEMY\n"
    "          </span>",
    "fix ACADEMICS eyebrow label",
)

save(path, c)
print("app/page.jsx: header/footer extracted to SiteHeader/SiteFooter, ACADEMICS label fixed.")
