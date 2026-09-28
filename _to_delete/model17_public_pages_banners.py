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
# app/bookstore/page.jsx -- fetch the Bookstore SectionBanner and apply
# it as a background image behind the existing hero heading (same
# gradient-overlay technique as the homepage hero), plus a search-param
# read so /bookstore#collection still works exactly as before (no
# categories to wire here -- Bookstore's categories are admin-managed
# DB data with no fixed enum, unlike Media/Library, so they aren't
# added to the header dropdown as fixed links).
# =======================================================================
path = "app/bookstore/page.jsx"
c = load(path)

c = r1(
    c,
    "  const [cartOpen, setCartOpen] = useState(false);",
    "  const [cartOpen, setCartOpen] = useState(false);\n"
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
    "  }, []);",
    "bookstore page: fetch section banner",
)

c = r1(
    c,
    '      <section className="hero">\n'
    '        <div className="hero-pattern" />',
    "      <section\n"
    "        className=\"hero\"\n"
    "        style={\n"
    "          bannerUrl\n"
    "            ? {\n"
    "                backgroundImage: `linear-gradient(135deg, rgba(3,31,16,.82), rgba(20,83,45,.55)), url(${bannerUrl})`,\n"
    "                backgroundSize: 'cover',\n"
    "                backgroundPosition: 'center',\n"
    "              }\n"
    "            : undefined\n"
    "        }\n"
    "      >\n"
    '        <div className="hero-pattern" />',
    "bookstore page: apply banner as hero background image when set",
)

save(path, c)
print("app/bookstore/page.jsx: hero now shows the uploaded banner image when set.")

# =======================================================================
# app/media/page.jsx -- fetch the Media SectionBanner and apply it to
# the existing gradient hero (same technique). Also reads ?category=
# from the URL on mount AND whenever it changes, so the header
# dropdown's category links (and the existing category chips) both
# genuinely filter the page rather than only updating the URL.
# =======================================================================
path = "app/media/page.jsx"
c = load(path)

c = r1(
    c,
    "import { useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { MEDIA_CATEGORIES, categoryLabel, formatDuration } from '@/lib/media';\n"
    "\n"
    "export default function MediaPage() {",
    "import { useEffect, useState } from 'react';\n"
    "import { useSearchParams } from 'next/navigation';\n"
    "import Link from 'next/link';\n"
    "import { MEDIA_CATEGORIES, categoryLabel, formatDuration } from '@/lib/media';\n"
    "\n"
    "export default function MediaPage() {\n"
    "  const searchParams = useSearchParams();",
    "media page: import useSearchParams",
)

c = r1(
    c,
    "  const [categoryFilter, setCategoryFilter] = useState('ALL');\n"
    "  const [searchInput, setSearchInput] = useState('');\n"
    "  const [searchTerm, setSearchTerm] = useState('');\n"
    "  const [subscribingPlanId, setSubscribingPlanId] = useState(null);",
    "  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'ALL');\n"
    "  const [searchInput, setSearchInput] = useState('');\n"
    "  const [searchTerm, setSearchTerm] = useState('');\n"
    "  const [subscribingPlanId, setSubscribingPlanId] = useState(null);\n"
    "  const [bannerUrl, setBannerUrl] = useState('');\n"
    "\n"
    "  // Keeps the category filter in sync with the URL even when the user\n"
    "  // is already on /media and clicks a different category link from the\n"
    "  // header dropdown -- the component doesn't remount in that case, so\n"
    "  // the useState initializer above alone wouldn't pick up the change.\n"
    "  useEffect(() => {\n"
    "    const urlCategory = searchParams.get('category');\n"
    "    if (urlCategory) setCategoryFilter(urlCategory);\n"
    "  }, [searchParams]);\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
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
    "  }, []);",
    "media page: read ?category= from URL, fetch section banner",
)

c = r1(
    c,
    "      <section style={hero}>\n"
    "        <div style={heroInner}>\n"
    "          <div style={eyebrow}>Ulul Azm Media</div>",
    "      <section\n"
    "        style={\n"
    "          bannerUrl\n"
    "            ? {\n"
    "                ...hero,\n"
    "                backgroundImage: `linear-gradient(135deg, rgba(8,32,24,.78), rgba(8,32,24,.5)), url(${bannerUrl})`,\n"
    "                backgroundSize: 'cover',\n"
    "                backgroundPosition: 'center',\n"
    "              }\n"
    "            : hero\n"
    "        }\n"
    "      >\n"
    "        <div style={heroInner}>\n"
    "          <div style={eyebrow}>Ulul Azm Media</div>",
    "media page: apply banner as hero background image when set",
)

save(path, c)
print("app/media/page.jsx: hero now shows the uploaded banner image, and ?category= from the URL now filters the page.")

# =======================================================================
# app/library/page.jsx -- same two changes as Media: banner image, and
# ?category= read from the URL (initial mount + on change).
# =======================================================================
path = "app/library/page.jsx"
c = load(path)

c = r1(
    c,
    "import { useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { LIBRARY_CATEGORIES, categoryLabel } from '@/lib/library';\n"
    "\n"
    "export default function LibraryPage() {",
    "import { useEffect, useState } from 'react';\n"
    "import { useSearchParams } from 'next/navigation';\n"
    "import Link from 'next/link';\n"
    "import { LIBRARY_CATEGORIES, categoryLabel } from '@/lib/library';\n"
    "\n"
    "export default function LibraryPage() {\n"
    "  const searchParams = useSearchParams();",
    "library page: import useSearchParams",
)

c = r1(
    c,
    "  const [categoryFilter, setCategoryFilter] = useState('ALL');\n"
    "  const [searchInput, setSearchInput] = useState('');\n"
    "  const [searchTerm, setSearchTerm] = useState('');",
    "  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'ALL');\n"
    "  const [searchInput, setSearchInput] = useState('');\n"
    "  const [searchTerm, setSearchTerm] = useState('');\n"
    "  const [bannerUrl, setBannerUrl] = useState('');\n"
    "\n"
    "  useEffect(() => {\n"
    "    const urlCategory = searchParams.get('category');\n"
    "    if (urlCategory) setCategoryFilter(urlCategory);\n"
    "  }, [searchParams]);\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
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
    "  }, []);",
    "library page: read ?category= from URL, fetch section banner",
)

c = r1(
    c,
    "      <section style={hero}>\n"
    "        <div style={heroInner}>\n"
    "          <div style={eyebrow}>Ulul Azm Library</div>",
    "      <section\n"
    "        style={\n"
    "          bannerUrl\n"
    "            ? {\n"
    "                ...hero,\n"
    "                backgroundImage: `linear-gradient(135deg, rgba(8,32,24,.78), rgba(8,32,24,.5)), url(${bannerUrl})`,\n"
    "                backgroundSize: 'cover',\n"
    "                backgroundPosition: 'center',\n"
    "              }\n"
    "            : hero\n"
    "        }\n"
    "      >\n"
    "        <div style={heroInner}>\n"
    "          <div style={eyebrow}>Ulul Azm Library</div>",
    "library page: apply banner as hero background image when set",
)

save(path, c)
print("app/library/page.jsx: hero now shows the uploaded banner image, and ?category= from the URL now filters the page.")
