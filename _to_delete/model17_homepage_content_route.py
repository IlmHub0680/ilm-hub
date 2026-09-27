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
# app/api/homepage-content/route.js -- serve the new Welcome/Academy/
# Our Approach/Bismillah section text and their three ordered lists
# alongside the existing hero/socialLinks/footerLinkGroups payload (one
# fetch, same as before). Defaults below are transcribed verbatim from
# what app/page.jsx has always hardcoded, so nothing on the live site
# changes until an admin actually edits something at
# /admin/homepage/sections.
# =======================================================================
path = "app/api/homepage-content/route.js"
c = load(path)

c = r1(
    c,
    "const HERO_SETTINGS_ID = \"default-homepage-hero\";",
    "const HERO_SETTINGS_ID = \"default-homepage-hero\";\nconst SECTIONS_TEXT_ID = \"default-homepage-sections\";",
    "homepage-content route: add sections-text id constant",
)

c = r1(
    c,
    "export async function GET() {\n"
    "  try {\n"
    "    const [hero, socialLinks, footerLinkGroups] = await Promise.all([\n"
    "      prisma.homepageHero.findUnique({ where: { id: HERO_SETTINGS_ID } }),\n"
    "      prisma.socialLink.findMany({\n"
    "        where: { isActive: true },\n"
    "        orderBy: { order: \"asc\" },\n"
    "      }),\n"
    "      prisma.footerLinkGroup.findMany({\n"
    "        where: { isActive: true },\n"
    "        include: {\n"
    "          links: {\n"
    "            where: { isActive: true },\n"
    "            orderBy: { order: \"asc\" },\n"
    "          },\n"
    "        },\n"
    "        orderBy: { order: \"asc\" },\n"
    "      }),\n"
    "    ]);",
    "export async function GET() {\n"
    "  try {\n"
    "    const [hero, socialLinks, footerLinkGroups, sectionsText, featureCards, academyItems, approachSteps] = await Promise.all([\n"
    "      prisma.homepageHero.findUnique({ where: { id: HERO_SETTINGS_ID } }),\n"
    "      prisma.socialLink.findMany({\n"
    "        where: { isActive: true },\n"
    "        orderBy: { order: \"asc\" },\n"
    "      }),\n"
    "      prisma.footerLinkGroup.findMany({\n"
    "        where: { isActive: true },\n"
    "        include: {\n"
    "          links: {\n"
    "            where: { isActive: true },\n"
    "            orderBy: { order: \"asc\" },\n"
    "          },\n"
    "        },\n"
    "        orderBy: { order: \"asc\" },\n"
    "      }),\n"
    "      prisma.homepageSectionsText.findUnique({ where: { id: SECTIONS_TEXT_ID } }),\n"
    "      prisma.homepageFeatureCard.findMany({ where: { isActive: true }, orderBy: { order: \"asc\" } }),\n"
    "      prisma.homepageAcademyItem.findMany({ where: { isActive: true }, orderBy: { order: \"asc\" } }),\n"
    "      prisma.homepageApproachStep.findMany({ where: { isActive: true }, orderBy: { order: \"asc\" } }),\n"
    "    ]);",
    "homepage-content route: fetch the new sections alongside hero/social/footer",
)

c = r1(
    c,
    "        footerLinkGroups:\n"
    "          footerLinkGroups.length > 0\n"
    "            ? footerLinkGroups.map((group) => ({\n"
    "                title: group.title,\n"
    "                links: group.links.map((link) => ({\n"
    "                  label: link.label,\n"
    "                  href: link.href,\n"
    "                })),\n"
    "              }))\n"
    "            : DEFAULT_FOOTER_LINK_GROUPS,\n"
    "      },\n"
    "    });\n"
    "  } catch (error) {\n"
    "    console.error(\"GET homepage content error:\", error);\n"
    "\n"
    "    // Even on an unexpected error, the public homepage should still\n"
    "    // render with its known-good defaults rather than break.\n"
    "    return Response.json({\n"
    "      success: true,\n"
    "      data: {\n"
    "        hero: DEFAULT_HERO,\n"
    "        socialLinks: DEFAULT_SOCIAL_LINKS,\n"
    "        footerLinkGroups: DEFAULT_FOOTER_LINK_GROUPS,\n"
    "      },\n"
    "    });",
    "        footerLinkGroups:\n"
    "          footerLinkGroups.length > 0\n"
    "            ? footerLinkGroups.map((group) => ({\n"
    "                title: group.title,\n"
    "                links: group.links.map((link) => ({\n"
    "                  label: link.label,\n"
    "                  href: link.href,\n"
    "                })),\n"
    "              }))\n"
    "            : DEFAULT_FOOTER_LINK_GROUPS,\n"
    "        welcome: sectionsText\n"
    "          ? { badge: sectionsText.welcomeBadge, title: sectionsText.welcomeTitle, subtitle: sectionsText.welcomeSubtitle }\n"
    "          : DEFAULT_WELCOME,\n"
    "        featureCards:\n"
    "          featureCards.length > 0\n"
    "            ? featureCards.map((card) => ({ icon: card.icon, title: card.title, text: card.text }))\n"
    "            : DEFAULT_FEATURE_CARDS,\n"
    "        academySection: sectionsText\n"
    "          ? { badge: sectionsText.academyBadge, title: sectionsText.academyTitle, subtitle: sectionsText.academySubtitle }\n"
    "          : DEFAULT_ACADEMY_SECTION,\n"
    "        academyItems:\n"
    "          academyItems.length > 0\n"
    "            ? academyItems.map((item) => ({ icon: item.icon, text: item.text }))\n"
    "            : DEFAULT_ACADEMY_ITEMS,\n"
    "        approachSection: sectionsText\n"
    "          ? { badge: sectionsText.approachBadge, title: sectionsText.approachTitle, subtitle: sectionsText.approachSubtitle }\n"
    "          : DEFAULT_APPROACH_SECTION,\n"
    "        approachSteps:\n"
    "          approachSteps.length > 0\n"
    "            ? approachSteps.map((step) => ({ number: step.number, title: step.title, text: step.text }))\n"
    "            : DEFAULT_APPROACH_STEPS,\n"
    "        ctaBanner: sectionsText\n"
    "          ? { arabicLine: sectionsText.ctaArabicLine, title: sectionsText.ctaTitle, description: sectionsText.ctaDescription }\n"
    "          : DEFAULT_CTA_BANNER,\n"
    "      },\n"
    "    });\n"
    "  } catch (error) {\n"
    "    console.error(\"GET homepage content error:\", error);\n"
    "\n"
    "    // Even on an unexpected error, the public homepage should still\n"
    "    // render with its known-good defaults rather than break.\n"
    "    return Response.json({\n"
    "      success: true,\n"
    "      data: {\n"
    "        hero: DEFAULT_HERO,\n"
    "        socialLinks: DEFAULT_SOCIAL_LINKS,\n"
    "        footerLinkGroups: DEFAULT_FOOTER_LINK_GROUPS,\n"
    "        welcome: DEFAULT_WELCOME,\n"
    "        featureCards: DEFAULT_FEATURE_CARDS,\n"
    "        academySection: DEFAULT_ACADEMY_SECTION,\n"
    "        academyItems: DEFAULT_ACADEMY_ITEMS,\n"
    "        approachSection: DEFAULT_APPROACH_SECTION,\n"
    "        approachSteps: DEFAULT_APPROACH_STEPS,\n"
    "        ctaBanner: DEFAULT_CTA_BANNER,\n"
    "      },\n"
    "    });",
    "homepage-content route: return the new sections in both the success and fallback payloads",
)

c = r1(
    c,
    "export async function GET() {",
    "const DEFAULT_WELCOME = {\n"
    "  badge: \"WELCOME TO ULUL AZM\",\n"
    "  title: \"A place to seek knowledge with sincerity\",\n"
    "  subtitle:\n"
    "    \"Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.\",\n"
    "};\n"
    "\n"
    "const DEFAULT_FEATURE_CARDS = [\n"
    "  {\n"
    "    icon: \"📚\",\n"
    "    title: \"Structured Learning\",\n"
    "    text: \"Progress through carefully organized academic programmes and courses designed to build knowledge systematically.\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"🕌\",\n"
    "    title: \"Islamic Scholarship\",\n"
    "    text: \"Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"🎓\",\n"
    "    title: \"Student Development\",\n"
    "    text: \"Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.\",\n"
    "  },\n"
    "  {\n"
    "    icon: \"🌐\",\n"
    "    title: \"Learning Without Borders\",\n"
    "    text: \"Access educational opportunities and digital resources designed to support students wherever they are.\",\n"
    "  },\n"
    "];\n"
    "\n"
    "const DEFAULT_ACADEMY_SECTION = {\n"
    "  badge: \"ACADEMY\",\n"
    "  title: \"Explore Our Academic Programmes\",\n"
    "  subtitle:\n"
    "    \"Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.\",\n"
    "};\n"
    "\n"
    "const DEFAULT_ACADEMY_ITEMS = [\n"
    "  { icon: \"📖\", text: \"Qur'anic Sciences\" },\n"
    "  { icon: \"🗣️\", text: \"Arabic Language\" },\n"
    "  { icon: \"📚\", text: \"Hadith Studies\" },\n"
    "  { icon: \"⚖️\", text: \"Fiqh & Usul\" },\n"
    "  { icon: \"☪️\", text: \"Aqidah\" },\n"
    "  { icon: \"🎙️\", text: \"Tajwid & Recitation\" },\n"
    "  { icon: \"☪️\", text: \"Tauheed (Monotheism)\" },\n"
    "  { icon: \"🌱\", text: \"Tarbiyah (Education)\" },\n"
    "];\n"
    "\n"
    "const DEFAULT_APPROACH_SECTION = {\n"
    "  badge: \"OUR APPROACH\",\n"
    "  title: \"More than a website — a learning environment\",\n"
    "  subtitle: \"We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.\",\n"
    "};\n"
    "\n"
    "const DEFAULT_APPROACH_STEPS = [\n"
    "  {\n"
    "    number: \"01\",\n"
    "    title: \"Authentic Foundations\",\n"
    "    text: \"Begin with foundational disciplines before progressing into advanced studies.\",\n"
    "  },\n"
    "  {\n"
    "    number: \"02\",\n"
    "    title: \"Structured Programmes\",\n"
    "    text: \"Study through clearly defined academic areas rather than disconnected lessons.\",\n"
    "  },\n"
    "  {\n"
    "    number: \"03\",\n"
    "    title: \"Responsible Scholarship\",\n"
    "    text: \"Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.\",\n"
    "  },\n"
    "];\n"
    "\n"
    "const DEFAULT_CTA_BANNER = {\n"
    "  arabicLine: \"BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE\",\n"
    "  title: \"Begin Your Journey of Knowledge\",\n"
    "  description: \"Explore academic programmes, educational resources, media library, and admissions opportunities.\",\n"
    "};\n"
    "\n"
    "export async function GET() {",
    "homepage-content route: add DEFAULT_ constants for the new sections",
)

save(path, c)
print("app/api/homepage-content/route.js: now also serves the Welcome/Academy/Our Approach/Bismillah section text and their three lists, defaulting to the site's existing copy.")
