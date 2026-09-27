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
# components/SiteHeader.jsx -- stop fetching the logo itself. It's now
# handed down already-resolved from the root layout's server-side fetch
# via SiteBrandingProvider, so the header never has a moment with no
# logo while its own fetch is in flight.
# =======================================================================
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "import { CircleUserRound, Search, Menu, X } from 'lucide-react';\n"
    "import { MEDIA_CATEGORIES } from '@/lib/media';\n"
    "import { LIBRARY_CATEGORIES } from '@/lib/library';",
    "import { CircleUserRound, Search, Menu, X } from 'lucide-react';\n"
    "import { MEDIA_CATEGORIES } from '@/lib/media';\n"
    "import { LIBRARY_CATEGORIES } from '@/lib/library';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';",
    "SiteHeader: import useSiteBranding",
)

c = r1(
    c,
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
    "  }, []);\n"
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);",
    "  const pathname = usePathname();\n"
    "  const { logoUrl } = useSiteBranding();\n"
    "  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);",
    "SiteHeader: replace client-side logo fetch with useSiteBranding()",
)

save(path, c)
print("components/SiteHeader.jsx: logo now comes from SiteBrandingProvider, no client fetch/flash.")

# =======================================================================
# components/SiteFooter.jsx -- same fix: drop the footer's own copy of
# the logo fetch, read it from context instead. The footer keeps its
# own fetch for socialLinks/footerLinkGroups (those aren't in the
# branding context -- only logo/hero-image are).
# =======================================================================
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "import { useEffect, useState } from 'react';\n"
    "import Link from 'next/link';",
    "import { useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';",
    "SiteFooter: import useSiteBranding",
)

c = r1(
    c,
    "export default function SiteFooter() {\n"
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n"
    "  const [logoUrl, setLogoUrl] = useState('');\n"
    "  const [footerModal, setFooterModal] = useState(null);",
    "export default function SiteFooter() {\n"
    "  const { logoUrl } = useSiteBranding();\n"
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n"
    "  const [footerModal, setFooterModal] = useState(null);",
    "SiteFooter: replace logoUrl state with useSiteBranding()",
)

c = r1(
    c,
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "        if (result.data.hero?.logoUrl) {\n"
    "          setLogoUrl(result.data.hero.logoUrl);\n"
    "        }\n"
    "      })\n"
    "      .catch(() => {});",
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "      })\n"
    "      .catch(() => {});",
    "SiteFooter: drop logoUrl branch from the homepage-content fetch handler",
)

save(path, c)
print("components/SiteFooter.jsx: logo now comes from SiteBrandingProvider, no client fetch/flash.")

# =======================================================================
# app/page.jsx -- seed hero.heroImageUrl from the same server-resolved
# context, so the hero background image is present on first paint
# instead of appearing only once this page's own /api/homepage-content
# fetch resolves a moment later. The page's own fetch still runs and
# will overwrite `hero` (including heroImageUrl) with the freshest
# content once it resolves, same as before -- this only fixes the
# *first* render.
# =======================================================================
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import SiteFooter from '@/components/SiteFooter';\n"
    "import { LanguageProvider, useLanguage } from './HomeLanguageContext';",
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import SiteFooter from '@/components/SiteFooter';\n"
    "import { useSiteBranding } from '@/components/SiteBrandingProvider';\n"
    "import { LanguageProvider, useLanguage } from './HomeLanguageContext';",
    "app/page.jsx: import useSiteBranding",
)

c = r1(
    c,
    "function HomeContent() {\n"
    "  const { t, dir, lang, setLang } = useLanguage();",
    "function HomeContent() {\n"
    "  const { t, dir, lang, setLang } = useLanguage();\n"
    "  const { heroImageUrl: brandedHeroImageUrl } = useSiteBranding();",
    "app/page.jsx: read heroImageUrl from branding context",
)

c = r1(
    c,
    "  const [hero, setHero] = useState({\n"
    "    badge: 'A DIGITAL HOME FOR ISLAMIC KNOWLEDGE',\n"
    "    title: \"Excellence in Islamic Studies & Qur'anic Sciences\",\n"
    "    subtitle:\n"
    "      'A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.',\n"
    "    primaryLabel: 'Apply Now →',\n"
    "    primaryHref: '/admission',\n"
    "    secondaryLabel: 'Explore Academics →',\n"
    "    secondaryHref: '/programs',\n"
    "    features: [\n"
    "      'Structured curriculum',\n"
    "      'Online learning',\n"
    "      'Academic resources',\n"
    "      'Global access',\n"
    "    ],\n"
    "  });",
    "  const [hero, setHero] = useState({\n"
    "    badge: 'A DIGITAL HOME FOR ISLAMIC KNOWLEDGE',\n"
    "    title: \"Excellence in Islamic Studies & Qur'anic Sciences\",\n"
    "    subtitle:\n"
    "      'A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.',\n"
    "    primaryLabel: 'Apply Now →',\n"
    "    primaryHref: '/admission',\n"
    "    secondaryLabel: 'Explore Academics →',\n"
    "    secondaryHref: '/programs',\n"
    "    features: [\n"
    "      'Structured curriculum',\n"
    "      'Online learning',\n"
    "      'Academic resources',\n"
    "      'Global access',\n"
    "    ],\n"
    "    // Seeded from the root layout's server-side fetch (SiteBrandingProvider)\n"
    "    // so the hero background image is already there on first paint; the\n"
    "    // fetch below still overwrites this with the freshest CMS content.\n"
    "    heroImageUrl: brandedHeroImageUrl,\n"
    "  });",
    "app/page.jsx: seed initial hero.heroImageUrl from branding context",
)

save(path, c)
print("app/page.jsx: hero background image now seeded from SiteBrandingProvider on first paint.")
