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
# app/media/layout.jsx / app/library/layout.jsx -- fetch each section's
# banner server-side (same fix as the new app/bookstore/layout.jsx) and
# hand it down via SectionBannerProvider, alongside the existing
# server-resolved user/nav.
# =======================================================================
path = "app/media/layout.jsx"
c = load(path)

c = r1(
    c,
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import MediaNav from '@/components/MediaNav';",
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import { prisma } from '@/lib/prisma';\n"
    "import MediaNav from '@/components/MediaNav';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';",
    "media layout: import prisma + SectionBannerProvider",
)

c = r1(
    c,
    "export default async function MediaLayout({ children }) {\n"
    "  const user = await getCurrentUser();\n"
    "\n"
    "  return (\n"
    "    <>\n"
    "      <MediaNav user={user ? { id: user.id, name: user.name, email: user.email } : null} />\n"
    "      {children}\n"
    "    </>\n"
    "  );\n"
    "}",
    "// See app/bookstore/layout.jsx for why this fetches server-side\n"
    "// instead of leaving it to the page's own client fetch.\n"
    "async function getMediaBanner() {\n"
    "  try {\n"
    "    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'media' } });\n"
    "    return banner?.imageUrl || '';\n"
    "  } catch (error) {\n"
    "    console.error('Media layout banner lookup failed:', error);\n"
    "    return '';\n"
    "  }\n"
    "}\n"
    "\n"
    "export default async function MediaLayout({ children }) {\n"
    "  const [user, bannerUrl] = await Promise.all([getCurrentUser(), getMediaBanner()]);\n"
    "\n"
    "  return (\n"
    "    <SectionBannerProvider bannerUrl={bannerUrl}>\n"
    "      <MediaNav user={user ? { id: user.id, name: user.name, email: user.email } : null} />\n"
    "      {children}\n"
    "    </SectionBannerProvider>\n"
    "  );\n"
    "}",
    "media layout: fetch banner server-side and wrap children in SectionBannerProvider",
)

save(path, c)
print("app/media/layout.jsx: media banner now fetched server-side, no client flash.")

path = "app/library/layout.jsx"
c = load(path)

c = r1(
    c,
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import LibraryNav from '@/components/LibraryNav';",
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import { prisma } from '@/lib/prisma';\n"
    "import LibraryNav from '@/components/LibraryNav';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';",
    "library layout: import prisma + SectionBannerProvider",
)

c = r1(
    c,
    "export default async function LibraryLayout({ children }) {\n"
    "  const user = await getCurrentUser();\n"
    "\n"
    "  return (\n"
    "    <>\n"
    "      <LibraryNav user={user ? { id: user.id, name: user.name, email: user.email } : null} />\n"
    "      {children}\n"
    "    </>\n"
    "  );\n"
    "}",
    "// See app/bookstore/layout.jsx for why this fetches server-side\n"
    "// instead of leaving it to the page's own client fetch.\n"
    "async function getLibraryBanner() {\n"
    "  try {\n"
    "    const banner = await prisma.sectionBanner.findUnique({ where: { id: 'library' } });\n"
    "    return banner?.imageUrl || '';\n"
    "  } catch (error) {\n"
    "    console.error('Library layout banner lookup failed:', error);\n"
    "    return '';\n"
    "  }\n"
    "}\n"
    "\n"
    "export default async function LibraryLayout({ children }) {\n"
    "  const [user, bannerUrl] = await Promise.all([getCurrentUser(), getLibraryBanner()]);\n"
    "\n"
    "  return (\n"
    "    <SectionBannerProvider bannerUrl={bannerUrl}>\n"
    "      <LibraryNav user={user ? { id: user.id, name: user.name, email: user.email } : null} />\n"
    "      {children}\n"
    "    </SectionBannerProvider>\n"
    "  );\n"
    "}",
    "library layout: fetch banner server-side and wrap children in SectionBannerProvider",
)

save(path, c)
print("app/library/layout.jsx: library banner now fetched server-side, no client flash.")

# =======================================================================
# app/media/page.jsx / app/library/page.jsx -- read the banner from
# context instead of fetching it themselves.
# =======================================================================
path = "app/media/page.jsx"
c = load(path)

c = r1(
    c,
    "import { MEDIA_CATEGORIES, categoryLabel, formatDuration } from '@/lib/media';",
    "import { MEDIA_CATEGORIES, categoryLabel, formatDuration } from '@/lib/media';\n"
    "import { useSectionBanner } from '@/components/SectionBannerProvider';",
    "media page: import useSectionBanner",
)

c = r1(
    c,
    "  const [bannerUrl, setBannerUrl] = useState('');",
    "  const bannerUrl = useSectionBanner();",
    "media page: read banner from context instead of local state",
)

c = r1(
    c,
    "    fetch('/api/section-banners/media')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "        setBannerUrl(result.data.imageUrl || '');\n"
    "      })\n"
    "      .catch(() => {});\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n"
    "\n",
    "",
    "media page: drop the now-unused client-side banner fetch",
)

save(path, c)
print("app/media/page.jsx: banner now comes from SectionBannerProvider, no client fetch/flash.")

path = "app/library/page.jsx"
c = load(path)

c = r1(
    c,
    "import { LIBRARY_CATEGORIES } from '@/lib/library';",
    "import { LIBRARY_CATEGORIES } from '@/lib/library';\n"
    "import { useSectionBanner } from '@/components/SectionBannerProvider';",
    "library page: import useSectionBanner",
)

c = r1(
    c,
    "  const [bannerUrl, setBannerUrl] = useState('');",
    "  const bannerUrl = useSectionBanner();",
    "library page: read banner from context instead of local state",
)

c = r1(
    c,
    "    fetch('/api/section-banners/library')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "        setBannerUrl(result.data.imageUrl || '');\n"
    "      })\n"
    "      .catch(() => {});\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n"
    "\n",
    "",
    "library page: drop the now-unused client-side banner fetch",
)

save(path, c)
print("app/library/page.jsx: banner now comes from SectionBannerProvider, no client fetch/flash.")

# =======================================================================
# app/bookstore/page.jsx
#   1. Same banner fix as media/library, now backed by the new
#      app/bookstore/layout.jsx.
#   2. The page's own hardcoded footer (kept separate from SiteFooter
#      deliberately -- it's genuinely bookstore-specific content) shows
#      the plain "ع" glyph instead of the real uploaded site logo. Wires
#      it to SiteBrandingProvider, same as the header/footer/homepage.
# =======================================================================
path = "app/bookstore/page.jsx"
c = load(path)

c = r1(
    c,
    "import SiteHeader from '@/components/SiteHeader';\n"
    "\n"
    "import BookCard from '@/components/bookstore/BookCard';",
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';\n"
    "import { useSectionBanner } from '@/components/SectionBannerProvider';\n"
    "\n"
    "import BookCard from '@/components/bookstore/BookCard';",
    "bookstore page: import useSiteBranding + useSectionBanner",
)

c = r1(
    c,
    "export default function BookstorePage() {\n"
    "  const [books, setBooks] = useState([]);",
    "export default function BookstorePage() {\n"
    "  const { logoUrl } = useSiteBranding();\n"
    "  const [books, setBooks] = useState([]);",
    "bookstore page: read site logo from context",
)

c = r1(
    c,
    "  const [bannerUrl, setBannerUrl] = useState('');\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "    fetch('/api/section-banners/bookstore')\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((result) => {\n"
    "        if (cancelled || !result?.success) return;\n"
    "        setBannerUrl(result.data.imageUrl || '');\n"
    "      })\n"
    "      .catch(() => {});\n"
    "\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n",
    "  const bannerUrl = useSectionBanner();\n",
    "bookstore page: read banner from context instead of local state",
)

c = r1(
    c,
    "              <div className=\"footer-brand\">\n"
    "                <div>ع</div>\n"
    "\n"
    "                <strong>\n"
    "                  Ulul Azm\n"
    "\n"
    "                  <small>\n"
    "                    Bookstore\n"
    "                  </small>\n"
    "                </strong>\n"
    "              </div>",
    "              <div className=\"footer-brand\">\n"
    "                {logoUrl ? (\n"
    "                  <img src={logoUrl} alt=\"Ulul Azm Institute\" className=\"footer-brand-logo\" />\n"
    "                ) : (\n"
    "                  <div>ع</div>\n"
    "                )}\n"
    "\n"
    "                <strong>\n"
    "                  Ulul Azm\n"
    "\n"
    "                  <small>\n"
    "                    Bookstore\n"
    "                  </small>\n"
    "                </strong>\n"
    "              </div>",
    "bookstore page: footer shows the real logo when one is uploaded",
)

c = r1(
    c,
    "        .footer-brand > div {\n"
    "          width: 42px;\n"
    "          height: 42px;\n"
    "          display: grid;\n"
    "          place-items: center;\n"
    "          border: 1px solid #c59d5f;\n"
    "          border-radius: 10px;\n"
    "          color: #d7b76d;\n"
    "          font:\n"
    "            bold 22px\n"
    "            Georgia,\n"
    "            serif;\n"
    "        }",
    "        .footer-brand > div {\n"
    "          width: 42px;\n"
    "          height: 42px;\n"
    "          display: grid;\n"
    "          place-items: center;\n"
    "          border: 1px solid #c59d5f;\n"
    "          border-radius: 10px;\n"
    "          color: #d7b76d;\n"
    "          font:\n"
    "            bold 22px\n"
    "            Georgia,\n"
    "            serif;\n"
    "        }\n"
    "\n"
    "        .footer-brand-logo {\n"
    "          width: 42px;\n"
    "          height: 42px;\n"
    "          border-radius: 10px;\n"
    "          object-fit: cover;\n"
    "          flex-shrink: 0;\n"
    "        }",
    "bookstore page: add footer-brand-logo CSS",
)

save(path, c)
print("app/bookstore/page.jsx: banner now comes from context (no client flash), and the footer shows the real uploaded logo when one exists.")
