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

path = "app/library/page.jsx"
c = load(path)

c = r1(
    c,
    "import { LIBRARY_CATEGORIES, categoryLabel } from '@/lib/library';",
    "import { LIBRARY_CATEGORIES, categoryLabel } from '@/lib/library';\n"
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
