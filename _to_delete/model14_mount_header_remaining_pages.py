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
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

# ---------------------------------------------------------------------
# 1. app/academy/page.jsx
# ---------------------------------------------------------------------
path = "app/academy/page.jsx"
c = load(path)
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "academy: add imports",
)
c = r1(
    c,
    "  return (\n    <main style={page}>",
    "  return (\n    <>\n      <SiteHeader />\n      <main style={page}>",
    "academy: open Fragment + SiteHeader",
)
c = r1(
    c,
    '          <Link href="/" style={backToHomeLink}>← Back to Home</Link>\n',
    "",
    "academy: remove redundant Back to Home link",
)
c = r1(
    c,
    "    </main>\n  );\n}\n",
    "    </main>\n      <SiteFooter />\n    </>\n  );\n}\n",
    "academy: close SiteFooter + Fragment",
)
save(path, c)
print("app/academy/page.jsx: SiteHeader/SiteFooter mounted.")

# ---------------------------------------------------------------------
# 2. app/programs/page.jsx
# ---------------------------------------------------------------------
path = "app/programs/page.jsx"
c = load(path)
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "programs: add imports",
)
c = r1(
    c,
    "  return (\n    <main style={page}>",
    "  return (\n    <>\n      <SiteHeader />\n      <main style={page}>",
    "programs: open Fragment + SiteHeader",
)
c = r1(
    c,
    '          <Link href="/" style={backToHomeLink}>← Back to Home</Link>\n',
    "",
    "programs: remove redundant Back to Home link",
)
c = r1(
    c,
    "    </main>\n  );\n}\n",
    "    </main>\n      <SiteFooter />\n    </>\n  );\n}\n",
    "programs: close SiteFooter + Fragment",
)
save(path, c)
print("app/programs/page.jsx: SiteHeader/SiteFooter mounted.")

# ---------------------------------------------------------------------
# 3. app/contact/page.jsx
# ---------------------------------------------------------------------
path = "app/contact/page.jsx"
c = load(path)
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "contact: add imports",
)
c = r1(
    c,
    "  return (\n"
    "    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 780, margin: '0 auto' }}>\n"
    '        <Link href="/" style={{ display: \'inline-block\', marginBottom: 22, color: \'var(--brand)\', fontWeight: 700, fontSize: 13.5, textDecoration: \'none\' }}>\n'
    "          ← Back to Home\n"
    "        </Link>\n\n"
    "        <div style={{ background: 'var(--surface)',",
    "  return (\n"
    "    <>\n"
    "      <SiteHeader />\n"
    "      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 780, margin: '0 auto' }}>\n"
    "        <div style={{ background: 'var(--surface)',",
    "contact: open Fragment + SiteHeader, remove Back to Home",
)
c = r1(
    c,
    "      </div>\n    </div>\n  );\n}",
    "      </div>\n    </div>\n      <SiteFooter />\n    </>\n  );\n}",
    "contact: close SiteFooter + Fragment",
)
save(path, c)
print("app/contact/page.jsx: SiteHeader/SiteFooter mounted.")

# ---------------------------------------------------------------------
# 4. app/faq/page.jsx
# ---------------------------------------------------------------------
path = "app/faq/page.jsx"
c = load(path)
c = r1(
    c,
    "import Link from 'next/link';\n",
    "import Link from 'next/link';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "faq: add imports",
)
c = r1(
    c,
    "  return (\n"
    "    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 760, margin: '0 auto' }}>\n"
    '        <Link href="/" style={{ display: \'inline-block\', marginBottom: 22, color: \'var(--brand)\', fontWeight: 700, fontSize: 13.5, textDecoration: \'none\' }}>\n'
    "          ← Back to Home\n"
    "        </Link>\n\n"
    "        <div style={{ background: 'var(--surface)',",
    "  return (\n"
    "    <>\n"
    "      <SiteHeader />\n"
    "      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 760, margin: '0 auto' }}>\n"
    "        <div style={{ background: 'var(--surface)',",
    "faq: open Fragment + SiteHeader, remove Back to Home",
)
c = r1(
    c,
    "      </div>\n    </div>\n  );\n}",
    "      </div>\n    </div>\n      <SiteFooter />\n    </>\n  );\n}",
    "faq: close SiteFooter + Fragment",
)
save(path, c)
print("app/faq/page.jsx: SiteHeader/SiteFooter mounted.")

# ---------------------------------------------------------------------
# 5. app/admission/AdmissionChrome.jsx -- covers /admission and
#    /admission/track (and any future page under this layout) in one
#    edit, rather than touching the very large app/admission/page.js.
# ---------------------------------------------------------------------
path = "app/admission/AdmissionChrome.jsx"
c = load(path)
c = r1(
    c,
    "import { useLanguage } from './LanguageContext';\nimport LanguageSwitcher from './LanguageSwitcher';\n",
    "import { useLanguage } from './LanguageContext';\nimport LanguageSwitcher from './LanguageSwitcher';\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "admission chrome: add imports",
)
c = r1(
    c,
    "  return (\n"
    "    <div dir={dir} lang={lang}>\n"
    "      <LanguageSwitcher />\n"
    "      {children}\n"
    "    </div>\n"
    "  );",
    "  return (\n"
    "    <div dir={dir} lang={lang}>\n"
    "      <SiteHeader />\n"
    "      <LanguageSwitcher />\n"
    "      {children}\n"
    "      <SiteFooter />\n"
    "    </div>\n"
    "  );",
    "admission chrome: mount SiteHeader/SiteFooter",
)
save(path, c)
print("app/admission/AdmissionChrome.jsx: SiteHeader/SiteFooter mounted (covers /admission, /admission/track).")

# ---------------------------------------------------------------------
# 6. components/PublicLegalPageClient.jsx -- covers all 15 institutional
#    documents/legal pages (about, privacy, terms, refund, and every
#    academy-* document) in one edit.
# ---------------------------------------------------------------------
path = "components/PublicLegalPageClient.jsx"
c = load(path)
c = r1(
    c,
    "import Link from 'next/link';\nimport { useEffect, useState } from 'react';\n",
    "import { useEffect, useState } from 'react';\n\nimport SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "PublicLegalPageClient: swap Link import for SiteHeader/SiteFooter (Link was only used by the Back to Home link being removed)",
)
c = r1(
    c,
    "  return (\n"
    "    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 760, margin: '0 auto' }}>\n"
    "        <Link\n"
    '          href="/"\n'
    "          style={{\n"
    "            display: 'inline-block',\n"
    "            marginBottom: 22,\n"
    "            color: 'var(--brand)',\n"
    "            fontWeight: 700,\n"
    "            fontSize: 13.5,\n"
    "            textDecoration: 'none',\n"
    "          }}\n"
    "        >\n"
    "          ← Back to Home\n"
    "        </Link>\n\n"
    "        <div\n",
    "  return (\n"
    "    <>\n"
    "      <SiteHeader />\n"
    "      <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', padding: '48px 20px 80px' }}>\n"
    "      <div style={{ maxWidth: 760, margin: '0 auto' }}>\n"
    "        <div\n",
    "PublicLegalPageClient: open Fragment + SiteHeader, remove Back to Home",
)
c = r1(
    c,
    "      `}</style>\n    </div>\n  );\n}",
    "      `}</style>\n      </div>\n      <SiteFooter />\n    </>\n  );\n}",
    "PublicLegalPageClient: close SiteFooter + Fragment",
)
save(path, c)
print("components/PublicLegalPageClient.jsx: SiteHeader/SiteFooter mounted (covers 15 legal/academy-* pages).")
