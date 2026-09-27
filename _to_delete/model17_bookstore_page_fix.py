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
