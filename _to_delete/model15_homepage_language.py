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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:120])
    return content.replace(old, new)

path = "app/page.jsx"
c = load(path)

# 1. Import the new homepage-scoped language context.
c = r1(
    c,
    "import SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\n",
    "import SiteHeader from '@/components/SiteHeader';\nimport SiteFooter from '@/components/SiteFooter';\nimport { LanguageProvider, useLanguage } from './HomeLanguageContext';\n",
    "page: import LanguageProvider/useLanguage",
)

# 2. Rename the default export to an internal HomeContent component --
#    the real default export (added at the very end of this script)
#    wraps it in <LanguageProvider>, mirroring the Admission flow's own
#    LanguageProvider + page split.
c = r1(
    c,
    "export default function Home() {\n  /* =========================================================\n     DATE / TIME\n  ========================================================= */",
    "function HomeContent() {\n  const { t, dir, lang, setLang } = useLanguage();\n\n  /* =========================================================\n     DATE / TIME\n  ========================================================= */",
    "page: rename Home -> HomeContent, pull in useLanguage",
)

# 3. Remove the dead socialLinks/footerLinkGroups state -- confirmed via
#    grep to have zero readers anywhere in this file (SiteFooter is a
#    separate component that fetches and renders its own footer data;
#    this local state is a leftover from before that extraction). The
#    homepage's own footerContent object (Student Resources modal copy)
#    is likewise unreferenced. Removing all three -- not part of the
#    language toggle, but directly adjacent dead code found while
#    tracing the footer-link bug this same session.
c = r1(
    c,
    "  const [socialLinks, setSocialLinks] = useState([\n"
    "    { name: 'Facebook', icon: 'f', url: 'https://www.facebook.com/' },\n"
    "    { name: 'YouTube', icon: '▶', url: 'https://www.youtube.com/' },\n"
    "    { name: 'X', icon: '𝕏', url: 'https://x.com/' },\n"
    "    { name: 'Telegram', icon: '✈', url: 'https://t.me/' },\n"
    "  ]);\n"
    "\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState([\n"
    "    {\n"
    "      title: 'Academics',\n"
    "      links: [\n"
    "        { label: 'Academic Departments', href: '/programs' },\n"
    "        { label: 'Admission & Registration', href: '/admission' },\n"
    "        { label: 'Student Portal Login', href: '/login' },\n"
    "      ],\n"
    "    },\n"
    "    {\n"
    "      title: 'Academic Governance',\n"
    "      links: [\n"
    "        { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "        { label: 'Academy Governance', href: '/academy-governance' },\n"
    "        { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "        { label: 'Academy Curriculum', href: '/academy-curriculum' },\n"
    "        { label: 'Department Curriculum', href: '/academy-department-curriculum' },\n"
    "        { label: 'Course Catalogue', href: '/academy-course-catalogue' },\n"
    "        { label: 'Course Specifications', href: '/academy-course-specifications' },\n"
    "        { label: 'Assessment & Grading', href: '/academy-assessment-grading' },\n"
    "        { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n"
    "        { label: 'Faculty & Portals', href: '/academy-faculty-portals' },\n"
    "        { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },\n"
    "        { label: 'Website & Master Integration', href: '/academy-master-integration' },\n"
    "      ],\n"
    "    },\n"
    "    {\n"
    "      title: 'Institute',\n"
    "      links: [\n"
    "        { label: 'About Ulul Azm', href: '/about' },\n"
    "        { label: 'Contact', href: '/contact' },\n"
    "        { label: 'Privacy Policy', href: '/privacy' },\n"
    "        { label: 'Terms of Use', href: '/terms' },\n"
    "        { label: 'Refund Policy', href: '/refund' },\n"
    "        { label: 'Staff & Admin Portal', href: '/admin' },\n"
    "      ],\n"
    "    },\n"
    "  ]);\n"
    "\n",
    "",
    "page: remove dead socialLinks/footerLinkGroups state",
)

c = r1(
    c,
    "        if (result.data.hero) setHero(result.data.hero);\n"
    "        if (Array.isArray(result.data.socialLinks)) setSocialLinks(result.data.socialLinks);\n"
    "        if (Array.isArray(result.data.footerLinkGroups)) setFooterLinkGroups(result.data.footerLinkGroups);\n",
    "        if (result.data.hero) setHero(result.data.hero);\n",
    "page: drop dead setSocialLinks/setFooterLinkGroups calls",
)

c = r1(
    c,
    "  const footerContent = {\n"
    "    resources: {\n"
    "      title: 'Student Resources',\n"
    "      content: (\n"
    "        <>\n"
    "          <p>\n"
    "            Ulul Azm provides resources designed to help students remain\n"
    "            organized, consistent and purposeful in their pursuit of\n"
    "            knowledge.\n"
    "          </p>\n"
    "\n"
    "          <div style={resourceGridStyle}>\n"
    "            <ResourceCard\n"
    "              icon=\"📚\"\n"
    "              title=\"Course Materials\"\n"
    "              text=\"Access recommended texts, course information and learning materials through your programme.\"\n"
    "            />\n"
    "\n"
    "            <ResourceCard\n"
    "              icon=\"📖\"\n"
    "              title=\"Digital Library\"\n"
    "              text=\"Explore books and educational publications available through the Ulul Azm Bookstore.\"\n"
    "              link=\"/bookstore\"\n"
    "            />\n"
    "\n"
    "            <ResourceCard\n"
    "              icon=\"🎓\"\n"
    "              title=\"Student Guidance\"\n"
    "              text=\"Develop a regular study routine, attend lessons consistently and maintain good academic discipline.\"\n"
    "            />\n"
    "\n"
    "            <ResourceCard\n"
    "              icon=\"📚\"\n"
    "              title=\"Academic Support\"\n"
    "              text=\"Contact the institute for questions relating to programmes, admissions or academic matters.\"\n"
    "              link=\"/contact\"\n"
    "            />\n"
    "          </div>\n"
    "        </>\n"
    "      ),\n"
    "    },\n"
    "  };\n"
    "\n",
    "",
    "page: remove dead footerContent object",
)

save(path, c)
print("app/page.jsx: pass 1 (imports, HomeContent rename, dead-code removal) done.")
