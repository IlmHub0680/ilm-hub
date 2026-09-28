# -*- coding: utf-8 -*-
import io
import os

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:200])
    return content.replace(old, new)

# =======================================================================
# Model 23: the two smaller remaining items --
#  (A) the header's Dashboard/Student Portal button flash-and-delay
#      (#254) -- fixed by seeding auth state from the server, same
#      pattern already used for the logo/branding.
#  (B) the homepage "Beneficial Knowledge" bookstore box's image, made
#      admin-replaceable with a Save button, reusing the existing
#      SectionBanner system already used for Bookstore/Media/Library
#      banners rather than building a new one.
# =======================================================================

# -----------------------------------------------------------------------
# A1) New components/SiteAuthProvider.jsx -- mirrors SiteBrandingProvider
#     exactly: a context seeded once from the server, no client fetch.
# -----------------------------------------------------------------------
site_auth_provider = """'use client';

// Shares the current logged-in user across every client component that
// needs it (SiteHeader today) via React Context, seeded from a
// server-side session check in the root layout -- mirrors
// SiteBrandingProvider's pattern exactly, for the same reason.
//
// Before this, SiteHeader ran its own useEffect + fetch('/api/auth/me')
// on mount, on every single page load and every client-side
// navigation. Because that fetch takes a moment, SiteHeader always
// rendered its logged-out label ("Student Portal") FIRST and only
// flipped to "Dashboard" after the round trip resolved -- a visible
// flash/delay for every signed-in visitor, on every page, exactly the
// "dashboard delays before it comes to what it was set" symptom.
// Seeding this context from the root layout (which already reads the
// session cookie server-side, the same way app/dashboard/page.jsx
// does) means the correct label is present in the very first HTML
// response: no flash, no round trip, no delay.
import { createContext, useContext } from 'react';

const SiteAuthContext = createContext({ user: null });

export function SiteAuthProvider({ user, children }) {
  return (
    <SiteAuthContext.Provider value={{ user: user || null }}>
      {children}
    </SiteAuthContext.Provider>
  );
}

export function useSiteAuth() {
  return useContext(SiteAuthContext);
}
"""

save("components/SiteAuthProvider.jsx", site_auth_provider)
print("components/SiteAuthProvider.jsx: created -- server-seeded auth context, mirrors SiteBrandingProvider.")

# -----------------------------------------------------------------------
# A2) app/layout.jsx -- resolve the session once, server-side, and seed
#     the new provider. getBranding() and getCurrentUser() now run in
#     parallel (Promise.all), so this adds no extra sequential wait.
# -----------------------------------------------------------------------
path = "app/layout.jsx"
c = load(path)

c = r1(
    c,
    "import './globals.css'\n"
    "import AssistantWidget from '@/components/AssistantWidget'\n"
    "import { SiteBrandingProvider } from '@/components/SiteBrandingProvider'\n"
    "import { prisma } from '@/lib/prisma'",
    "import './globals.css'\n"
    "import AssistantWidget from '@/components/AssistantWidget'\n"
    "import { SiteBrandingProvider } from '@/components/SiteBrandingProvider'\n"
    "import { SiteAuthProvider } from '@/components/SiteAuthProvider'\n"
    "import { prisma } from '@/lib/prisma'\n"
    "import { getCurrentUser } from '@/lib/auth'",
    "app/layout.jsx imports",
)

c = r1(
    c,
    "export default async function RootLayout({ children }) {\n"
    "  const { logoUrl, heroImageUrl, logoSize } = await getBranding();",
    "export default async function RootLayout({ children }) {\n"
    "  // Same server-side session read app/dashboard/page.jsx already\n"
    "  // does -- run alongside the branding lookup so seeding auth state\n"
    "  // adds no extra sequential wait. Never throws: getCurrentUser()\n"
    "  // itself already returns null rather than throwing when there is\n"
    "  // no session.\n"
    "  const [{ logoUrl, heroImageUrl, logoSize }, user] = await Promise.all([\n"
    "    getBranding(),\n"
    "    getCurrentUser().catch(() => null),\n"
    "  ]);",
    "app/layout.jsx RootLayout body",
)

c = r1(
    c,
    "        <SiteBrandingProvider logoUrl={logoUrl} heroImageUrl={heroImageUrl} logoSize={logoSize}>\n"
    "          {children}\n"
    "        </SiteBrandingProvider>",
    "        <SiteBrandingProvider logoUrl={logoUrl} heroImageUrl={heroImageUrl} logoSize={logoSize}>\n"
    "          <SiteAuthProvider user={user}>\n"
    "            {children}\n"
    "          </SiteAuthProvider>\n"
    "        </SiteBrandingProvider>",
    "app/layout.jsx provider nesting",
)

save(path, c)
print("app/layout.jsx: now resolves the session server-side and seeds SiteAuthProvider (parallel with the existing branding lookup).")

# -----------------------------------------------------------------------
# A3) components/SiteHeader.jsx -- consume the seeded context instead of
#     its own client fetch. Every render site that reads `user` /
#     `authChecked` is left exactly as-is; authChecked is now always
#     true, since the value is already known on first paint.
# -----------------------------------------------------------------------
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';",
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';\n"
    "import { useSiteAuth } from '@/components/SiteAuthProvider';",
    "components/SiteHeader.jsx import useSiteAuth",
)

c = r1(
    c,
    "  const [user, setUser] = useState(null);\n"
    "  const [authChecked, setAuthChecked] = useState(false);\n"
    "\n"
    "  const [searchOpen, setSearchOpen] = useState(false);\n"
    "  const [query, setQuery] = useState('');\n"
    "  const [results, setResults] = useState(null);\n"
    "  const [searching, setSearching] = useState(false);\n"
    "  const searchBoxRef = useRef(null);\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/auth/me', { credentials: 'include' })\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((data) => {\n"
    "        if (cancelled) return;\n"
    "        if (data && data.success) setUser(data.user);\n"
    "      })\n"
    "      .catch(() => {})\n"
    "      .finally(() => {\n"
    "        if (!cancelled) setAuthChecked(true);\n"
    "      });\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);",
    "  // Seeded from the server via the root layout -- see\n"
    "  // components/SiteAuthProvider.jsx. No client fetch, no flash: the\n"
    "  // correct Dashboard/Student Portal label is already known on the\n"
    "  // very first paint, and authChecked is always true because of it.\n"
    "  const { user } = useSiteAuth();\n"
    "  const authChecked = true;\n"
    "\n"
    "  const [searchOpen, setSearchOpen] = useState(false);\n"
    "  const [query, setQuery] = useState('');\n"
    "  const [results, setResults] = useState(null);\n"
    "  const [searching, setSearching] = useState(false);\n"
    "  const searchBoxRef = useRef(null);",
    "components/SiteHeader.jsx remove client auth fetch",
)

save(path, c)
print("components/SiteHeader.jsx: Dashboard/Student Portal button no longer flashes -- reads the server-seeded auth context instead of fetching /api/auth/me on mount.")

# -----------------------------------------------------------------------
# B1) app/api/section-banners/[section]/route.js -- add the new section
#     id to the existing whitelist. Reuses the exact same public
#     GET / admin-only PATCH endpoint already serving Bookstore, Media
#     and Library's banners -- no new API route needed.
# -----------------------------------------------------------------------
path = "app/api/section-banners/[section]/route.js"
c = load(path)

c = r1(
    c,
    'const VALID_SECTIONS = ["bookstore", "media", "library"];',
    'const VALID_SECTIONS = ["bookstore", "media", "library", "homepage-beneficial-knowledge"];',
    "app/api/section-banners/[section]/route.js VALID_SECTIONS",
)

save(path, c)
print("app/api/section-banners/[section]/route.js: whitelisted 'homepage-beneficial-knowledge' -- reuses the existing SectionBanner system.")

# -----------------------------------------------------------------------
# B2) New app/admin/homepage/beneficial-knowledge/page.jsx -- reuses the
#     existing SectionBannerEditor component (same one Bookstore/Media/
#     Library's banner admin pages already use).
# -----------------------------------------------------------------------
beneficial_knowledge_admin_page = """'use client';

import SectionBannerEditor from '@/components/admin/SectionBannerEditor';

export default function BeneficialKnowledgeBannerPage() {
  return (
    <main style={{ padding: '40px 32px 80px', color: 'var(--ink)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Beneficial Knowledge Image</h1>
        <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 640 }}>
          The background image behind the \\u201cBeneficial Knowledge\\u201d box in the homepage's
          Bookstore section. A dark overlay is applied automatically so the heading and text
          stay readable over any photo. Leave empty and it keeps its plain green gradient
          background. You can replace this image again at any time -- each save takes effect
          immediately.
        </p>
      </div>

      <SectionBannerEditor
        section="homepage-beneficial-knowledge"
        title="Beneficial Knowledge Image"
        hint="Shown behind the 'Beneficial Knowledge' heading in the homepage's Bookstore section (PNG, JPEG, WebP or SVG, max 5MB)."
      />
    </main>
  );
}
"""

os.makedirs("app/admin/homepage/beneficial-knowledge", exist_ok=True)
save("app/admin/homepage/beneficial-knowledge/page.jsx", beneficial_knowledge_admin_page)
print("app/admin/homepage/beneficial-knowledge/page.jsx: created -- same editor component, upload + Save, as Bookstore/Media/Library's banners.")

# -----------------------------------------------------------------------
# B3) app/admin/homepage/layout.jsx -- add the nav entry so the new page
#     is actually reachable from the admin sidebar.
# -----------------------------------------------------------------------
path = "app/admin/homepage/layout.jsx"
c = load(path)

c = r1(
    c,
    "const sections = [\n"
    "  { href: '/admin/homepage/hero', label: 'Hero Section', icon: '\U0001F3AF' },\n"
    "  { href: '/admin/homepage/sections', label: 'Homepage Sections', icon: '\U0001F9F1' },\n"
    "  { href: '/admin/homepage/announcements', label: 'Announcements', icon: '\U0001F4E3' },\n"
    "  { href: '/admin/homepage/social-links', label: 'Social Links', icon: '\U0001F517' },\n"
    "  { href: '/admin/homepage/footer-links', label: 'Footer Links', icon: '\U0001F9B6' },\n"
    "  { href: '/admin', label: 'Back to Admin', icon: '◂' },\n"
    "];",
    "const sections = [\n"
    "  { href: '/admin/homepage/hero', label: 'Hero Section', icon: '\U0001F3AF' },\n"
    "  { href: '/admin/homepage/sections', label: 'Homepage Sections', icon: '\U0001F9F1' },\n"
    "  { href: '/admin/homepage/beneficial-knowledge', label: 'Beneficial Knowledge Image', icon: '\U0001F4DA' },\n"
    "  { href: '/admin/homepage/announcements', label: 'Announcements', icon: '\U0001F4E3' },\n"
    "  { href: '/admin/homepage/social-links', label: 'Social Links', icon: '\U0001F517' },\n"
    "  { href: '/admin/homepage/footer-links', label: 'Footer Links', icon: '\U0001F9B6' },\n"
    "  { href: '/admin', label: 'Back to Admin', icon: '◂' },\n"
    "];",
    "app/admin/homepage/layout.jsx sections nav",
)

save(path, c)
print("app/admin/homepage/layout.jsx: added 'Beneficial Knowledge Image' to the Homepage admin sidebar.")

# -----------------------------------------------------------------------
# B4) app/page.jsx -- fetch the saved image and render it behind the
#     Beneficial Knowledge box, with a dark scrim so the white heading/
#     text stay readable over any photo. Falls back to the exact same
#     plain gradient as today whenever no image has been set.
# -----------------------------------------------------------------------
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/homepage-content')",
    "  const [beneficialKnowledgeImage, setBeneficialKnowledgeImage] = useState('');\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/section-banners/homepage-beneficial-knowledge')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "        setBeneficialKnowledgeImage(result.data.imageUrl || '');\n"
    "      })\n"
    "      .catch(() => {\n"
    "        // Keep the plain gradient background -- the homepage must\n"
    "        // never break because this optional image couldn't be fetched.\n"
    "      });\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/homepage-content')",
    "app/page.jsx beneficialKnowledgeImage state + fetch",
)

c = r1(
    c,
    "          <div style={bookstoreFeature}>\n"
    "\n"
    "            <div style={{ fontSize: '50px' }}>\n"
    "              \U0001F4DA\n"
    "            </div>\n"
    "\n"
    "            <h3 style={featureDarkTitle}>\n"
    "              {t('Beneficial Knowledge')}\n"
    "            </h3>\n"
    "\n"
    "            <p style={featureDarkText}>\n"
    "              {t('Quality books are companions for the serious student. Explore our dedicated bookstore for academic and Islamic publications.')}\n"
    "            </p>\n"
    "\n"
    "          </div>",
    "          <div\n"
    "            style={\n"
    "              beneficialKnowledgeImage\n"
    "                ? {\n"
    "                    ...bookstoreFeature,\n"
    "                    // A dark scrim over the admin-uploaded photo, same\n"
    "                    // brand colors as the plain gradient below, so the\n"
    "                    // white heading/text stay readable over any image.\n"
    "                    background: `linear-gradient(135deg, rgba(20,40,32,.82), rgba(20,83,45,.78)), url(${beneficialKnowledgeImage})`,\n"
    "                    backgroundSize: 'cover',\n"
    "                    backgroundPosition: 'center',\n"
    "                  }\n"
    "                : bookstoreFeature\n"
    "            }\n"
    "          >\n"
    "\n"
    "            <div style={{ fontSize: '50px' }}>\n"
    "              \U0001F4DA\n"
    "            </div>\n"
    "\n"
    "            <h3 style={featureDarkTitle}>\n"
    "              {t('Beneficial Knowledge')}\n"
    "            </h3>\n"
    "\n"
    "            <p style={featureDarkText}>\n"
    "              {t('Quality books are companions for the serious student. Explore our dedicated bookstore for academic and Islamic publications.')}\n"
    "            </p>\n"
    "\n"
    "          </div>",
    "app/page.jsx bookstoreFeature JSX with image",
)

save(path, c)
print("app/page.jsx: 'Beneficial Knowledge' box now shows the admin-uploaded image (with a readable dark scrim) when one is set, otherwise the same plain gradient as before.")
