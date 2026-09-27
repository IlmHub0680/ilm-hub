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

path = "app/layout.jsx"
c = load(path)

OLD = (
    "import './globals.css'\n"
    "import AssistantWidget from '@/components/AssistantWidget'\n"
    "\n"
    "export const metadata = {\n"
    "  title: 'Ulul Azm Institute - Islamic Educational Platform',\n"
    "  description: 'Access Islamic knowledge, books, courses, and lectures',\n"
    "}\n"
    "\n"
    "export default function RootLayout({ children }) {\n"
    "  return (\n"
    "    <html lang=\"en\">\n"
    "      <head>\n"
    "        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n"
    "        <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n"
    "        <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossOrigin=\"anonymous\" />\n"
    "        <link\n"
    "          href=\"https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap\"\n"
    "          rel=\"stylesheet\"\n"
    "        />\n"
    "      </head>\n"
    "      <body>\n"
    "        {children}\n"
    "        <AssistantWidget />\n"
    "      </body>\n"
    "    </html>\n"
    "  )\n"
    "}\n"
)

NEW = (
    "import './globals.css'\n"
    "import AssistantWidget from '@/components/AssistantWidget'\n"
    "import { SiteBrandingProvider } from '@/components/SiteBrandingProvider'\n"
    "import { prisma } from '@/lib/prisma'\n"
    "\n"
    "export const metadata = {\n"
    "  title: 'Ulul Azm Institute - Islamic Educational Platform',\n"
    "  description: 'Access Islamic knowledge, books, courses, and lectures',\n"
    "}\n"
    "\n"
    "// Fetched once, server-side, on every request -- this is what lets\n"
    "// SiteBrandingProvider hand the logo and hero banner image to\n"
    "// SiteHeader/SiteFooter/the homepage already resolved, instead of each\n"
    "// of them fetching it client-side and showing nothing until it\n"
    "// resolves. Never throws: the site must render its default branding\n"
    "// rather than break if this lookup fails for any reason.\n"
    "async function getBranding() {\n"
    "  try {\n"
    "    const hero = await prisma.homepageHero.findUnique({\n"
    "      where: { id: 'default-homepage-hero' },\n"
    "      select: { logoUrl: true, heroImageUrl: true },\n"
    "    });\n"
    "\n"
    "    return { logoUrl: hero?.logoUrl || '', heroImageUrl: hero?.heroImageUrl || '' };\n"
    "  } catch (error) {\n"
    "    console.error('Root layout branding lookup failed:', error);\n"
    "    return { logoUrl: '', heroImageUrl: '' };\n"
    "  }\n"
    "}\n"
    "\n"
    "export default async function RootLayout({ children }) {\n"
    "  const { logoUrl, heroImageUrl } = await getBranding();\n"
    "\n"
    "  return (\n"
    "    <html lang=\"en\">\n"
    "      <head>\n"
    "        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n"
    "        <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n"
    "        <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossOrigin=\"anonymous\" />\n"
    "        <link\n"
    "          href=\"https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap\"\n"
    "          rel=\"stylesheet\"\n"
    "        />\n"
    "      </head>\n"
    "      <body>\n"
    "        <SiteBrandingProvider logoUrl={logoUrl} heroImageUrl={heroImageUrl}>\n"
    "          {children}\n"
    "        </SiteBrandingProvider>\n"
    "        <AssistantWidget />\n"
    "      </body>\n"
    "    </html>\n"
    "  )\n"
    "}\n"
)

c = r1(c, OLD, NEW, "root layout: server-fetch branding, wrap children in SiteBrandingProvider")
save(path, c)
print("app/layout.jsx: now fetches logo/hero banner server-side and provides it via context -- no more client-side fetch flash.")
