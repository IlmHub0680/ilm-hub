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
# Punch-list batch following Model 19: footer/nav trims, sizing fixes,
# the CTA-banner/footer integration, the Amiri language-toggle fix, the
# Jumu'ah widget size bump, and swapping Library/Media onto the shared
# SiteHeader so their logo is real (matching Bookstore's existing
# pattern) instead of the hardcoded "ع" placeholder.
# =======================================================================

# -----------------------------------------------------------------------
# 1) components/IslamicDateWidget.jsx -- Jumu'ah/Hijri widget, size only.
#    Nothing here touches date calculation -- only the tab button and
#    card's own padding/font-size/width.
# -----------------------------------------------------------------------
path = "components/IslamicDateWidget.jsx"
c = load(path)

c = r1(
    c,
    "const tabBtn = {\n"
    "  display: 'inline-flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '8px',\n"
    "  padding: '10px 16px',\n"
    "  borderRadius: '999px',\n"
    "  border: '1px solid var(--border)',\n"
    "  background: 'var(--surface)',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: 700,\n"
    "  fontSize: '13px',\n"
    "  cursor: 'pointer',\n"
    "  boxShadow: '0 10px 26px rgba(15,23,42,.14)',\n"
    "};",
    "const tabBtn = {\n"
    "  display: 'inline-flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '9px',\n"
    "  padding: '12px 19px',\n"
    "  borderRadius: '999px',\n"
    "  border: '1px solid var(--border)',\n"
    "  background: 'var(--surface)',\n"
    "  color: 'var(--brand)',\n"
    "  fontWeight: 700,\n"
    "  fontSize: '14.5px',\n"
    "  cursor: 'pointer',\n"
    "  boxShadow: '0 10px 26px rgba(15,23,42,.14)',\n"
    "};",
    "IslamicDateWidget: tabBtn slightly larger",
)

c = r1(
    c,
    "  width: '260px',\n"
    "  maxWidth: 'calc(100vw - 44px)',\n"
    "  padding: '16px',",
    "  width: '278px',\n"
    "  maxWidth: 'calc(100vw - 44px)',\n"
    "  padding: '18px',",
    "IslamicDateWidget: card slightly larger",
)

c = r1(
    c,
    "        <span style={{ fontSize: '16px' }}>{tabIcon}</span>\n"
    "        {!open && <span>{tabLabel}</span>}",
    "        <span style={{ fontSize: '18px' }}>{tabIcon}</span>\n"
    "        {!open && <span>{tabLabel}</span>}",
    "IslamicDateWidget: tab icon slightly larger",
)

save(path, c)
print("components/IslamicDateWidget.jsx: Jumu'ah/Hijri widget bumped up a little (styling only).")

# -----------------------------------------------------------------------
# 2) components/SiteHeader.jsx
#    (a) trim ACADEMY_DROPDOWN_ITEMS -- keep only what's genuinely
#        public (departments, faculty, calendar, the two real
#        institutional documents), drop the raw internal governance/
#        curriculum/spec/build-tracking documents that were meant to
#        become real systems -- which, per the audit, they already
#        have (Model 19's own assessment/gradebook system, the HOD/
#        Dean/Instructor portals from Model 10, the QA + academic-
#        integrity + approval-workflow systems, the real Course/
#        Program records). Nothing needs to be rebuilt; this only
#        stops surfacing the planning documents as if they were
#        public reading.
#    (b) expand ADMISSION_DROPDOWN_ITEMS per Model 16's list.
#    (c) bump nav/wordmark font sizes further.
# -----------------------------------------------------------------------
path = "components/SiteHeader.jsx"
c = load(path)

c = r1(
    c,
    "const ACADEMY_DROPDOWN_ITEMS = [\n"
    "  { label: 'Academic Departments', href: '/departments' },\n"
    "  { label: 'Faculty', href: '/faculty' },\n"
    "  { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "  { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "  { label: 'Academy Governance', href: '/academy-governance' },\n"
    "  { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "  { label: 'Academy Curriculum', href: '/academy-curriculum' },\n"
    "  { label: 'Department Curriculum', href: '/academy-department-curriculum' },\n"
    "  { label: 'Course Catalogue', href: '/academy-course-catalogue' },\n"
    "  { label: 'Course Specifications', href: '/academy-course-specifications' },\n"
    "  { label: 'Assessment & Grading', href: '/academy-assessment-grading' },\n"
    "  { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n"
    "  { label: 'Faculty & Portals', href: '/academy-faculty-portals' },\n"
    "  { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },\n"
    "  { label: 'Website & Master Integration', href: '/academy-master-integration' },\n"
    "];\n"
    "\n"
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];",
    "// Public-facing only. The internal governance/curriculum/spec/\n"
    "// build-tracking documents that used to fill out this dropdown\n"
    "// (Academy Governance, Academy Curriculum, Department Curriculum,\n"
    "// Course Catalogue, Course Specifications, Assessment & Grading,\n"
    "// Student Lifecycle, Faculty & Portals, Academic Regulations & QA,\n"
    "// Website & Master Integration) were written to brief the real\n"
    "// build, not to stay published as a public sitemap -- and the real\n"
    "// systems they describe already exist in their own dashboards\n"
    "// (Coordinator/HOD/Dean/QA/Instructor/Records), so nothing here\n"
    "// was rebuilt, only un-surfaced from public nav. Academy Foundation\n"
    "// and Academy Pathways stay -- both are genuinely public-facing\n"
    "// (institutional identity, and the real pathway/qualification\n"
    "// framework a prospective learner needs).\n"
    "const ACADEMY_DROPDOWN_ITEMS = [\n"
    "  { label: 'Academic Departments', href: '/departments' },\n"
    "  { label: 'Faculty', href: '/faculty' },\n"
    "  { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "  { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "  { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "];\n"
    "\n"
    "// Per Model 16's Admissions & Registration public-navigation list:\n"
    "// Admission Requirements, How to Apply, Registration, Application/\n"
    "// Enrollment information, Apply Now. This system runs one unified\n"
    "// application flow (no separate \"registration\" page exists, or\n"
    "// should be invented, distinct from the application wizard itself)\n"
    "// so \"How to Apply\" and \"Registration & Enrollment\" both point\n"
    "// into that same real wizard rather than a fabricated extra page.\n"
    "const ADMISSION_DROPDOWN_ITEMS = [\n"
    "  { label: 'Admission Requirements', href: '/academy-pathways' },\n"
    "  { label: 'How to Apply', href: '/admission' },\n"
    "  { label: 'Registration & Enrollment', href: '/admission' },\n"
    "  { label: 'Apply Now', href: '/admission' },\n"
    "  { label: 'Track Your Application', href: '/admission/track' },\n"
    "];",
    "SiteHeader: trim Academy dropdown, expand Admission dropdown",
)

c = r1(
    c,
    "const brandName = {\n"
    "  fontSize: '24px',\n"
    "  fontWeight: '900',\n"
    "  color: 'var(--brand)',\n"
    "};\n"
    "\n"
    "const brandSubtitle = {\n"
    "  fontSize: '12px',",
    "const brandName = {\n"
    "  fontSize: '27px',\n"
    "  fontWeight: '900',\n"
    "  color: 'var(--brand)',\n"
    "};\n"
    "\n"
    "const brandSubtitle = {\n"
    "  fontSize: '13.5px',",
    "SiteHeader: wordmark size bump",
)

c = r1(
    c,
    "const navLink = {\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '15.5px',\n"
    "  fontWeight: '900',\n"
    "  padding: '10px 12px',\n"
    "  borderRadius: '7px',\n"
    "};",
    "const navLink = {\n"
    "  color: 'var(--ink-soft)',\n"
    "  textDecoration: 'none',\n"
    "  fontSize: '17px',\n"
    "  fontWeight: '900',\n"
    "  padding: '10px 12px',\n"
    "  borderRadius: '7px',\n"
    "};",
    "SiteHeader: nav link size bump",
)

save(path, c)
print("components/SiteHeader.jsx: Academy dropdown trimmed to public content, Admission dropdown expanded per Model 16, nav/wordmark sizes bumped further.")

# -----------------------------------------------------------------------
# 3) components/SiteFooter.jsx
#    (a) DEFAULT_FOOTER_LINK_GROUPS fallback -- drop Academic Governance,
#        fold the two genuinely public documents (Foundation, Pathways)
#        into Academy. This is only the client-side fallback shown
#        before the real fetch resolves; the actual DB-backed groups
#        are fixed by the one-off script in part 7 below.
#    (b) fetch + render the CTA banner as the footer's own masthead
#        strip instead of app/page.jsx's standalone section.
#    (c) Address split onto its own labeled lines.
#    (d) Footnote/copyright hover state.
#    (e) Technical Support + standalone Mobile App columns.
#    (f) Grid track math redone for the new column count.
# -----------------------------------------------------------------------
path = "components/SiteFooter.jsx"
c = load(path)

c = r1(
    c,
    "const DEFAULT_FOOTER_LINK_GROUPS = [\n"
    "  {\n"
    "    title: 'Academy',\n"
    "    links: [\n"
    "      { label: 'Academic Programmes', href: '/programs' },\n"
    "      { label: 'Academic Departments', href: '/departments' },\n"
    "      { label: 'Faculty', href: '/faculty' },\n"
    "      { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "      { label: 'Admission & Registration', href: '/admission' },\n"
    "      { label: 'Student Portal Login', href: '/login' },\n"
    "    ],\n"
    "  },\n"
    "  {\n"
    "    title: 'Academic Governance',\n"
    "    links: [\n"
    "      { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "      { label: 'Academy Governance', href: '/academy-governance' },\n"
    "      { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "      { label: 'Academy Curriculum', href: '/academy-curriculum' },\n"
    "      { label: 'Department Curriculum', href: '/academy-department-curriculum' },\n"
    "      { label: 'Course Catalogue', href: '/academy-course-catalogue' },\n"
    "      { label: 'Course Specifications', href: '/academy-course-specifications' },\n"
    "      { label: 'Assessment & Grading', href: '/academy-assessment-grading' },\n"
    "      { label: 'Student Lifecycle', href: '/academy-student-lifecycle' },\n"
    "      { label: 'Faculty & Portals', href: '/academy-faculty-portals' },\n"
    "      { label: 'Academic Regulations & QA', href: '/academy-academic-regulations' },\n"
    "      { label: 'Website & Master Integration', href: '/academy-master-integration' },\n"
    "    ],\n"
    "  },\n"
    "  {\n"
    "    title: 'Institute',\n"
    "    links: [\n"
    "      { label: 'About Ulul Azm', href: '/about' },\n"
    "      { label: 'Contact', href: '/contact' },\n"
    "      { label: 'Privacy Policy', href: '/privacy' },\n"
    "      { label: 'Terms of Use', href: '/terms' },\n"
    "      { label: 'Refund Policy', href: '/refund' },\n"
    "      { label: 'Staff & Admin Portal', href: '/admin' },\n"
    "    ],\n"
    "  },\n"
    "];",
    "// Only Academy and Institute now -- the old \"Academic Governance\"\n"
    "// group exposed 12 raw internal planning/spec documents as if they\n"
    "// were routine public reading. Those documents were written to\n"
    "// brief the real build, not to stay published as a public sitemap,\n"
    "// and the systems they describe already exist in their own\n"
    "// dashboards. The two genuinely public ones -- Academy Foundation\n"
    "// (institutional identity) and Academy Pathways (the real\n"
    "// qualification framework) -- move into Academy below.\n"
    "const DEFAULT_FOOTER_LINK_GROUPS = [\n"
    "  {\n"
    "    title: 'Academy',\n"
    "    links: [\n"
    "      { label: 'Academic Programmes', href: '/programs' },\n"
    "      { label: 'Academic Departments', href: '/departments' },\n"
    "      { label: 'Faculty', href: '/faculty' },\n"
    "      { label: 'Academic Calendar', href: '/academic-calendar' },\n"
    "      { label: 'Academy Foundation', href: '/academy-foundation' },\n"
    "      { label: 'Academy Pathways', href: '/academy-pathways' },\n"
    "      { label: 'Admission & Registration', href: '/admission' },\n"
    "      { label: 'Student Portal Login', href: '/login' },\n"
    "    ],\n"
    "  },\n"
    "  {\n"
    "    title: 'Institute',\n"
    "    links: [\n"
    "      { label: 'About Ulul Azm', href: '/about' },\n"
    "      { label: 'Contact', href: '/contact' },\n"
    "      { label: 'Privacy Policy', href: '/privacy' },\n"
    "      { label: 'Terms of Use', href: '/terms' },\n"
    "      { label: 'Refund Policy', href: '/refund' },\n"
    "      { label: 'Staff & Admin Portal', href: '/admin' },\n"
    "    ],\n"
    "  },\n"
    "];",
    "SiteFooter: DEFAULT_FOOTER_LINK_GROUPS drops Academic Governance",
)

save(path, c)
print("components/SiteFooter.jsx: fallback link groups no longer expose the raw governance/spec documents.")

c = r1(
    c,
    "            {contact.address && (\n"
    "              <div style={footerContactItem}>\n"
    "                <MapPin size={14} strokeWidth={2.2} style={footerContactIcon} />\n"
    "                <span style={footerContactLabel}>Address</span>\n"
    "                <span style={footerContactValue}>{contact.address}</span>\n"
    "              </div>\n"
    "            )}",
    "            {contact.address && (\n"
    "              <div style={footerContactItemAddress}>\n"
    "                <MapPin size={14} strokeWidth={2.2} style={{ ...footerContactIcon, marginTop: '1px' }} />\n"
    "                <div>\n"
    "                  <span style={footerContactLabel}>Address</span>\n"
    "                  <div style={footerContactValue}>\n"
    "                    {contact.address.split(',').map((line) => line.trim()).filter(Boolean).map((line, i, arr) => (\n"
    "                      <div key={i}>{line}{i < arr.length - 1 ? ',' : ''}</div>\n"
    "                    ))}\n"
    "                  </div>\n"
    "                </div>\n"
    "              </div>\n"
    "            )}",
    "SiteFooter: address rendered as labeled, line-broken block",
)

c = r1(
    c,
    "          {/* FOOTER BOTTOM */}\n"
    "          <div style={footerBottom}>\n"
    "            <div>© {new Date().getFullYear()} Ulul Azm Institute. All rights reserved.</div>\n"
    "            <div>Knowledge is a trust. Character is its companion.</div>\n"
    "          </div>",
    "          {/* FOOTER BOTTOM */}\n"
    "          <div style={footerBottom}>\n"
    "            <div className=\"footer-footnote\">© {new Date().getFullYear()} Ulul Azm Institute. All rights reserved.</div>\n"
    "            <div className=\"footer-footnote\">Knowledge is a trust. Character is its companion.</div>\n"
    "          </div>",
    "SiteFooter: footnote gets a hover class",
)

c = r1(
    c,
    "            {/* RESOURCES */}\n"
    "            <FooterColumn title=\"Resources\">\n"
    "              <FooterButton onClick={() => setFooterModal('resources')}>Student Resources</FooterButton>\n"
    "              <FooterLink href=\"/bookstore\">Bookstore</FooterLink>\n"
    "              <FooterLink href=\"/media\">Media</FooterLink>\n"
    "              <FooterLink href=\"/library\">Library</FooterLink>\n"
    "              <FooterLink href=\"/faq\">Frequently Asked Questions</FooterLink>\n"
    "            </FooterColumn>",
    "            {/* RESOURCES */}\n"
    "            <FooterColumn title=\"Resources\">\n"
    "              <FooterButton onClick={() => setFooterModal('resources')}>Student Resources</FooterButton>\n"
    "              <FooterLink href=\"/bookstore\">Bookstore</FooterLink>\n"
    "              <FooterLink href=\"/media\">Media</FooterLink>\n"
    "              <FooterLink href=\"/library\">Library</FooterLink>\n"
    "              <FooterLink href=\"/faq\">Frequently Asked Questions</FooterLink>\n"
    "            </FooterColumn>\n"
    "\n"
    "            {/* TECHNICAL SUPPORT -- things a user may need but not on\n"
    "                every visit, so it belongs here rather than the top nav. */}\n"
    "            <FooterColumn title=\"Technical Support\">\n"
    "              <FooterLink href=\"/contact\">Contact Support</FooterLink>\n"
    "              <FooterLink href=\"/faq\">Help &amp; FAQ</FooterLink>\n"
    "            </FooterColumn>\n"
    "\n"
    "            {/* MOBILE APP -- deliberately its own standalone column, not\n"
    "                nested under Technical Support. No app exists yet, so\n"
    "                these are honestly-labeled placeholders (structure ready\n"
    "                for real store links once an app ships), not live links\n"
    "                to a listing that doesn't exist. */}\n"
    "            <div>\n"
    "              <h3 style={footerHeading}>Mobile App</h3>\n"
    "              <p style={footerTextSmall}>Coming soon for iOS and Android.</p>\n"
    "              <div style={appBadgeStack}>\n"
    "                <span style={appBadge} aria-disabled=\"true\">\n"
    "                  <span style={appBadgeIcon}>{'📱'}</span>\n"
    "                  <span>\n"
    "                    <span style={appBadgeEyebrow}>Coming soon on the</span>\n"
    "                    <span style={appBadgeName}>App Store</span>\n"
    "                  </span>\n"
    "                </span>\n"
    "                <span style={appBadge} aria-disabled=\"true\">\n"
    "                  <span style={appBadgeIcon}>{'▶'}</span>\n"
    "                  <span>\n"
    "                    <span style={appBadgeEyebrow}>Coming soon on</span>\n"
    "                    <span style={appBadgeName}>Google Play</span>\n"
    "                  </span>\n"
    "                </span>\n"
    "              </div>\n"
    "            </div>",
    "SiteFooter: add Technical Support column and standalone Mobile App column",
)

save(path, c)
print("components/SiteFooter.jsx: address is now a labeled block, footnote has a hover state, and Technical Support / Mobile App columns are added.")

# --- CTA banner fetch + masthead render -----------------------------
c = r1(
    c,
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n"
    "  const [footerModal, setFooterModal] = useState(null);",
    "  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);\n"
    "  const [footerLinkGroups, setFooterLinkGroups] = useState(DEFAULT_FOOTER_LINK_GROUPS);\n"
    "  const [contact, setContact] = useState(CONTACT_DEFAULTS);\n"
    "  const [footerModal, setFooterModal] = useState(null);\n"
    "  // The \"Begin Your Journey of Knowledge\" banner -- previously its\n"
    "  // own standalone section between page content and the footer on\n"
    "  // the homepage (and only the homepage). It's now the footer's own\n"
    "  // masthead strip, so every page that renders SiteFooter carries it\n"
    "  // consistently, sourced from the same CMS content\n"
    "  // (/admin/homepage/sections) as before -- nothing new to edit.\n"
    "  const [ctaBanner, setCtaBanner] = useState(DEFAULT_CTA_BANNER);",
    "SiteFooter: add ctaBanner state",
)

c = r1(
    c,
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "      })\n"
    "      .catch(() => {});",
    "        if (Array.isArray(result.data.footerLinkGroups) && result.data.footerLinkGroups.length > 0) {\n"
    "          setFooterLinkGroups(result.data.footerLinkGroups);\n"
    "        }\n"
    "        if (result.data.ctaBanner) setCtaBanner(result.data.ctaBanner);\n"
    "      })\n"
    "      .catch(() => {});",
    "SiteFooter: fetch ctaBanner alongside the other homepage content",
)

c = r1(
    c,
    "const CONTACT_DEFAULTS = {\n"
    "  address: null,\n"
    "  phone: null,\n"
    "  email: 'info@ululazm.org',\n"
    "  admissionsEmail: 'admissions@ululazm.org',\n"
    "};",
    "const CONTACT_DEFAULTS = {\n"
    "  address: null,\n"
    "  phone: null,\n"
    "  email: 'info@ululazm.org',\n"
    "  admissionsEmail: 'admissions@ululazm.org',\n"
    "};\n"
    "\n"
    "const DEFAULT_CTA_BANNER = {\n"
    "  arabicLine: 'BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE',\n"
    "  title: 'Begin Your Journey of Knowledge',\n"
    "  description: 'Explore academic programmes, educational resources, media library, and admissions opportunities.',\n"
    "};",
    "SiteFooter: DEFAULT_CTA_BANNER fallback",
)

c = r1(
    c,
    "      <footer style={footerStyle}>\n"
    "        <div style={footerInner}>",
    "      <footer style={footerStyle}>\n"
    "        <div style={footerCtaBanner}>\n"
    "          <div style={footerCtaInner}>\n"
    "            <div style={footerCtaArabic}>{ctaBanner.arabicLine}</div>\n"
    "            <h2 style={footerCtaTitle}>{ctaBanner.title}</h2>\n"
    "            <p style={footerCtaDescription}>{ctaBanner.description}</p>\n"
    "          </div>\n"
    "        </div>\n"
    "\n"
    "        <div style={footerInner}>",
    "SiteFooter: render the CTA masthead strip",
)

save(path, c)
print("components/SiteFooter.jsx: the 'Begin Your Journey of Knowledge' banner is now the footer's own masthead, shared across every page that has a footer.")

# --- grid math for the new column count (About + Academy + Institute +
#     Technical Support + Mobile App + Resources + Follow Us = 7
#     columns, 6 of them auto-fit) ------------------------------------
c = r1(
    c,
    "const footerGrid = {\n"
    "  display: 'grid',\n"
    "  // Narrow enough that Academy / Academic Governance / Institute /\n"
    "  // Resources / Follow Us all fit on one row alongside the About\n"
    "  // column at the footer's own 1200px max width, instead of\n"
    "  // auto-fit dropping the last column (Follow Us) to a row of its\n"
    "  // own for lack of space.\n"
    "  gridTemplateColumns: 'minmax(230px,1.3fr) repeat(auto-fit,minmax(138px,1fr))',\n"
    "  gap: '30px',\n"
    "};",
    "const footerGrid = {\n"
    "  display: 'grid',\n"
    "  // Recomputed for 7 total columns now that Technical Support and\n"
    "  // Mobile App were added (Academic Governance's removal freed one\n"
    "  // slot, these two need two): About + Academy + Institute +\n"
    "  // Technical Support + Mobile App + Resources + Follow Us, 6 of\n"
    "  // them auto-fit. At the footer's 1200px max width (minus its own\n"
    "  // padding), 6 tracks at the old 138px/30px gap floor didn't fit --\n"
    "  // narrowed the auto-fit floor and the gap so all 6 reliably share\n"
    "  // one row instead of the last one wrapping alone, same failure\n"
    "  // mode fixed once already for Follow Us.\n"
    "  gridTemplateColumns: 'minmax(210px,1.2fr) repeat(auto-fit,minmax(120px,1fr))',\n"
    "  gap: '24px',\n"
    "};",
    "SiteFooter: footerGrid recomputed for 7 columns",
)

# --- new style constants: footerContactItemAddress, app badges, the
#     CTA masthead block, and (for the footnote hover) nothing extra
#     is needed here since :hover is delivered via <style jsx> below.
c = r1(
    c,
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'center',\n"
    "  gap: '8px',\n"
    "};",
    "const footerContactItem = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'center',\n"
    "  gap: '8px',\n"
    "};\n"
    "\n"
    "// Same idea as footerContactItem, but the address has multiple\n"
    "// lines under its label rather than a single inline value, so it\n"
    "// needs the icon aligned to the top instead of the row centered.\n"
    "const footerContactItemAddress = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'row',\n"
    "  alignItems: 'flex-start',\n"
    "  gap: '8px',\n"
    "};",
    "SiteFooter: footerContactItemAddress style",
)

c = r1(
    c,
    "const footerBottom = {\n"
    "  marginTop: '30px',\n"
    "  paddingTop: '22px',\n"
    "  borderTop: '1px solid var(--on-dark-border)',\n"
    "  display: 'flex',\n"
    "  justifyContent: 'space-between',\n"
    "  gap: '15px',\n"
    "  flexWrap: 'wrap',\n"
    "  fontSize: '12px',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "};",
    "const footerBottom = {\n"
    "  marginTop: '30px',\n"
    "  paddingTop: '22px',\n"
    "  borderTop: '1px solid var(--on-dark-border)',\n"
    "  display: 'flex',\n"
    "  justifyContent: 'space-between',\n"
    "  gap: '15px',\n"
    "  flexWrap: 'wrap',\n"
    "  fontSize: '12px',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "};\n"
    "\n"
    "const footerCtaBanner = {\n"
    "  background: 'linear-gradient(135deg,var(--brand),var(--brand-deepest))',\n"
    "  borderBottom: '1px solid var(--on-dark-border)',\n"
    "};\n"
    "\n"
    "const footerCtaInner = {\n"
    "  maxWidth: '900px',\n"
    "  margin: '0 auto',\n"
    "  padding: '46px 24px',\n"
    "  textAlign: 'center',\n"
    "};\n"
    "\n"
    "const footerCtaArabic = {\n"
    "  fontFamily: 'var(--font-arabic-display)',\n"
    "  color: '#f4d58d',\n"
    "  fontSize: '21px',\n"
    "  fontWeight: '500',\n"
    "  letterSpacing: '0.8px',\n"
    "};\n"
    "\n"
    "const footerCtaTitle = {\n"
    "  color: 'var(--on-accent)',\n"
    "  fontSize: '28px',\n"
    "  margin: '12px 0 10px',\n"
    "};\n"
    "\n"
    "const footerCtaDescription = {\n"
    "  color: 'var(--on-accent)',\n"
    "  opacity: 0.9,\n"
    "  fontSize: '14.5px',\n"
    "  lineHeight: 1.6,\n"
    "  margin: 0,\n"
    "};\n"
    "\n"
    "const appBadgeStack = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  gap: '8px',\n"
    "  marginTop: '6px',\n"
    "};\n"
    "\n"
    "// Deliberately not a real store link yet -- see the JSX comment\n"
    "// above where these render. aria-disabled communicates that to\n"
    "// assistive tech since there's no real href to disable natively.\n"
    "const appBadge = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '9px',\n"
    "  padding: '8px 12px',\n"
    "  borderRadius: '8px',\n"
    "  border: '1px solid var(--on-dark-border)',\n"
    "  background: 'rgba(255,255,255,.04)',\n"
    "  color: 'var(--on-dark-soft)',\n"
    "  cursor: 'default',\n"
    "  userSelect: 'none',\n"
    "};\n"
    "\n"
    "const appBadgeIcon = {\n"
    "  fontSize: '18px',\n"
    "  lineHeight: 1,\n"
    "};\n"
    "\n"
    "const appBadgeEyebrow = {\n"
    "  display: 'block',\n"
    "  fontSize: '9px',\n"
    "  letterSpacing: '0.4px',\n"
    "  opacity: 0.8,\n"
    "};\n"
    "\n"
    "const appBadgeName = {\n"
    "  display: 'block',\n"
    "  fontSize: '13px',\n"
    "  fontWeight: '700',\n"
    "  color: 'var(--on-dark-strong, #fff)',\n"
    "};",
    "SiteFooter: new style constants for the CTA masthead and app badges",
)

save(path, c)
print("components/SiteFooter.jsx: grid recomputed for the new column count, and the CTA masthead/app-badge styles added.")

c = r1(
    c,
    "        </div>\n"
    "      </footer>\n"
    "\n"
    "      {/* FOOTER MODAL */}",
    "        </div>\n"
    "      </footer>\n"
    "\n"
    "      <style jsx>{`\n"
    "        .footer-footnote {\n"
    "          transition: color 0.15s ease;\n"
    "        }\n"
    "        .footer-footnote:hover {\n"
    "          color: var(--gold);\n"
    "        }\n"
    "      `}</style>\n"
    "\n"
    "      {/* FOOTER MODAL */}",
    "SiteFooter: footnote hover CSS",
)

save(path, c)
print("components/SiteFooter.jsx: footnote now shows a gold hover state.")

# -----------------------------------------------------------------------
# 4) app/page.jsx
#    (a) language toggler's Arabic label gets the Amiri font (it's a
#        plain <button>, not a heading, so it never picked up the
#        [dir=rtl] h1/h2/h3 rule -- same class of bug as the earlier
#        inline-style-override fix, just a different element this time:
#        here nothing was overriding it, the font was simply never set).
#    (b) Pathway tier badges -- Tier 3's badge text was free to wrap
#        ("Tier" / "3") because the badge had no whiteSpace:nowrap and
#        the flex header could squeeze it once the adjacent <h3> title
#        needed room; add nowrap + flexShrink:0 on the badge and
#        minWidth:0 on the title so the badge always wins the line,
#        for all five tiers, not just the four that happened not to
#        hit it. Also gives every tier card and badge a glossier,
#        less flat-rectangle look, as asked.
#    (c) Remove the standalone CTA section -- now the footer's own
#        masthead (see SiteFooter.jsx above) -- and its now-orphaned
#        state/styles.
# -----------------------------------------------------------------------
path = "app/page.jsx"
c = load(path)

c = r1(
    c,
    "const langToggleBtn = {\n"
    "  background: 'transparent',\n"
    "  border: '1px solid rgba(255,255,255,.4)',\n"
    "  color: 'var(--on-accent)',\n"
    "  borderRadius: 999,\n"
    "  padding: '4px 13px',\n"
    "  fontSize: '12.5px',\n"
    "  fontWeight: 700,\n"
    "  cursor: 'pointer',\n"
    "  opacity: 0.75,\n"
    "};\n"
    "\n"
    "const langToggleBtnActive = {\n"
    "  ...langToggleBtn,\n"
    "  background: 'rgba(255,255,255,.2)',\n"
    "  opacity: 1,\n"
    "};",
    "const langToggleBtn = {\n"
    "  background: 'transparent',\n"
    "  border: '1px solid rgba(255,255,255,.4)',\n"
    "  color: 'var(--on-accent)',\n"
    "  borderRadius: 999,\n"
    "  padding: '4px 13px',\n"
    "  fontSize: '12.5px',\n"
    "  fontWeight: 700,\n"
    "  cursor: 'pointer',\n"
    "  opacity: 0.75,\n"
    "};\n"
    "\n"
    "const langToggleBtnActive = {\n"
    "  ...langToggleBtn,\n"
    "  background: 'rgba(255,255,255,.2)',\n"
    "  opacity: 1,\n"
    "};\n"
    "\n"
    "// The Arabic toggle label is always Arabic script regardless of the\n"
    "// current language, and it's a plain <button>, not an h1/h2/h3, so\n"
    "// it never picks up the [dir=rtl] heading rule -- it needs its own\n"
    "// explicit Amiri font, same as the CTA banner's arabic div did.\n"
    "const langToggleBtnAr = {\n"
    "  ...langToggleBtn,\n"
    "  fontFamily: 'var(--font-arabic-display)',\n"
    "  fontSize: '14px',\n"
    "};\n"
    "\n"
    "const langToggleBtnActiveAr = {\n"
    "  ...langToggleBtnAr,\n"
    "  background: 'rgba(255,255,255,.2)',\n"
    "  opacity: 1,\n"
    "};",
    "app/page.jsx: langToggleBtnAr styles",
)

c = r1(
    c,
    "            <button\n"
    "              type=\"button\"\n"
    "              onClick={() => setLang('ar')}\n"
    "              style={lang === 'ar' ? langToggleBtnActive : langToggleBtn}\n"
    "            >\n"
    "              العربية\n"
    "            </button>",
    "            <button\n"
    "              type=\"button\"\n"
    "              onClick={() => setLang('ar')}\n"
    "              style={lang === 'ar' ? langToggleBtnActiveAr : langToggleBtnAr}\n"
    "            >\n"
    "              العربية\n"
    "            </button>",
    "app/page.jsx: language toggler uses the Amiri style",
)

save(path, c)
print("app/page.jsx: the Arabic language-toggle label now renders in Amiri.")

c = r1(
    c,
    "const pathwayCard = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  background: 'var(--surface)',\n"
    "  border: '1px solid var(--border)',\n"
    "  borderRadius: '15px',\n"
    "  padding: '26px',\n"
    "  boxShadow: '0 10px 30px rgba(15,23,42,.05)',\n"
    "  textAlign: 'left',\n"
    "};\n"
    "\n"
    "const pathwayCardHeader = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '10px',\n"
    "  marginBottom: '10px',\n"
    "};\n"
    "\n"
    "const pathwayTierBadge = {\n"
    "  display: 'inline-block',\n"
    "  padding: '4px 10px',\n"
    "  borderRadius: '999px',\n"
    "  background: 'var(--gold)',\n"
    "  color: 'var(--brand-deepest)',\n"
    "  fontWeight: '900',\n"
    "  fontSize: '11px',\n"
    "  letterSpacing: '0.06em',\n"
    "  textTransform: 'uppercase',\n"
    "};\n"
    "\n"
    "const pathwayCardTitle = {\n"
    "  color: 'var(--brand)',\n"
    "  fontSize: '18px',\n"
    "  margin: 0,\n"
    "};",
    "// Glossy/classical rather than a flat rectangle: a soft top-to-\n"
    "// bottom gradient instead of a flat fill, a gold-tinted hairline\n"
    "// border instead of the plain neutral one, and a two-layer shadow\n"
    "// (a soft drop shadow plus an inset top highlight) for the glossy\n"
    "// part.\n"
    "const pathwayCard = {\n"
    "  display: 'flex',\n"
    "  flexDirection: 'column',\n"
    "  background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2, #f7f3ea) 100%)',\n"
    "  border: '1px solid var(--gold-soft, rgba(191,161,74,.28))',\n"
    "  borderRadius: '15px',\n"
    "  padding: '26px',\n"
    "  boxShadow: '0 14px 34px rgba(15,23,42,.08), inset 0 1px 0 rgba(255,255,255,.55)',\n"
    "  textAlign: 'left',\n"
    "};\n"
    "\n"
    "const pathwayCardHeader = {\n"
    "  display: 'flex',\n"
    "  alignItems: 'center',\n"
    "  gap: '10px',\n"
    "  marginBottom: '10px',\n"
    "};\n"
    "\n"
    "// whiteSpace:nowrap + flexShrink:0 so the badge text ('Tier 3', etc)\n"
    "// can never wrap onto two lines when the flex header gets squeezed\n"
    "// by a longer adjacent title -- paired with pathwayCardTitle's own\n"
    "// minWidth:0 below, which is the flexbox half of this fix (without\n"
    "// it, an h3 with no minWidth refuses to shrink and it's a sibling\n"
    "// that gets squeezed instead). Gradient + inset highlight for the\n"
    "// same glossy, not-flat look as the card.\n"
    "const pathwayTierBadge = {\n"
    "  display: 'inline-block',\n"
    "  whiteSpace: 'nowrap',\n"
    "  flexShrink: 0,\n"
    "  padding: '5px 12px',\n"
    "  borderRadius: '999px',\n"
    "  background: 'linear-gradient(135deg, var(--gold-light, #f3dfa0) 0%, var(--gold) 55%, var(--gold-dark) 100%)',\n"
    "  border: '1px solid rgba(255,255,255,.5)',\n"
    "  boxShadow: '0 1px 3px rgba(15,23,42,.18), inset 0 1px 0 rgba(255,255,255,.6)',\n"
    "  color: 'var(--brand-deepest)',\n"
    "  fontWeight: '900',\n"
    "  fontSize: '11px',\n"
    "  letterSpacing: '0.06em',\n"
    "  textTransform: 'uppercase',\n"
    "};\n"
    "\n"
    "const pathwayCardTitle = {\n"
    "  color: 'var(--brand)',\n"
    "  fontSize: '18px',\n"
    "  margin: 0,\n"
    "  minWidth: 0,\n"
    "};",
    "app/page.jsx: pathway card/badge glossy styling + badge nowrap fix",
)

save(path, c)
print("app/page.jsx: all five pathway tier badges now stay on one line, and the tier cards/badges have a glossier, less flat-rectangle look.")

c = r1(
    c,
    "  const [ctaBanner, setCtaBanner] = useState({\n"
    "    arabicLine: 'BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE',\n"
    "    title: 'Begin Your Journey of Knowledge',\n"
    "    description: 'Explore academic programmes, educational resources, media library, and admissions opportunities.',\n"
    "  });\n"
    "\n"
    "  useEffect(() => {",
    "  useEffect(() => {",
    "app/page.jsx: remove ctaBanner state (now owned by SiteFooter)",
)

c = r1(
    c,
    "        if (Array.isArray(result.data.approachSteps) && result.data.approachSteps.length > 0) {\n"
    "          setApproachSteps(result.data.approachSteps);\n"
    "        }\n"
    "        if (result.data.ctaBanner) setCtaBanner(result.data.ctaBanner);\n"
    "      })",
    "        if (Array.isArray(result.data.approachSteps) && result.data.approachSteps.length > 0) {\n"
    "          setApproachSteps(result.data.approachSteps);\n"
    "        }\n"
    "      })",
    "app/page.jsx: remove ctaBanner fetch line",
)

c = r1(
    c,
    "      {/* =====================================================\n"
    "          CTA\n"
    "      ===================================================== */}\n"
    "\n"
    "      <section style={ctaSection} dir={dir}>\n"
    "\n"
    "        <div style={ctaInner}>\n"
    "\n"
    "          <div style={arabic}>\n"
    "            {t(ctaBanner.arabicLine)}\n"
    "          </div>\n"
    "\n"
    "          <h2 style={ctaTitle}>\n"
    "            {t(ctaBanner.title)}\n"
    "          </h2>\n"
    "\n"
    "          <p style={whiteDescription}>\n"
    "            {t(ctaBanner.description)}\n"
    "          </p>\n"
    "\n"
    "        </div>\n"
    "      </section>\n"
    "\n"
    "      {/* =====================================================\n"
    "          FOOTER\n"
    "      ===================================================== */}",
    "      {/* The \"Begin Your Journey of Knowledge\" banner that used to\n"
    "          render here as its own standalone section now lives in\n"
    "          SiteFooter as that shared component's own masthead strip,\n"
    "          so it renders consistently on every page that has a\n"
    "          footer, not only this one -- see components/SiteFooter.jsx. */}\n"
    "\n"
    "      {/* =====================================================\n"
    "          FOOTER\n"
    "      ===================================================== */}",
    "app/page.jsx: remove the standalone CTA section",
)

c = r1(
    c,
    "const ctaSection = {\n"
    "  background:\n"
    "    'linear-gradient(135deg,var(--brand),var(--brand-deepest))',\n"
    "  color: 'var(--on-accent)',\n"
    "};\n"
    "\n"
    "const ctaInner = {\n"
    "  maxWidth: '900px',\n"
    "  margin: '0 auto',\n"
    "  padding: '85px 24px',\n"
    "  textAlign: 'center',\n"
    "};\n"
    "\n"
    "const arabic = {\n"
    "  // Always real Arabic script (the CTA banner's arabicLine, e.g.\n"
    "  // \"BISMILLAH...\") regardless of the language toggle, and this is a\n"
    "  // <div> rather than a heading tag, so it needs its own explicit\n"
    "  // Amiri-led font rather than relying on the [dir=rtl] h1/h2/h3 rule.\n"
    "  fontFamily: 'var(--font-arabic-display)',\n"
    "  color: '#f4d58d',\n"
    "  fontSize: '25px',\n"
    "  fontWeight: '500',\n"
    "  letterSpacing: '0.8px',\n"
    "};\n"
    "\n"
    "const ctaTitle = {\n"
    "  fontSize: '38px',\n"
    "  margin: '15px 0',\n"
    "};\n"
    "\n"
    "const footerStyle = {",
    "const footerStyle = {",
    "app/page.jsx: remove now-orphaned CTA style constants",
)

save(path, c)
print("app/page.jsx: standalone CTA section and its orphaned state/styles removed (now the footer's masthead).")

# -----------------------------------------------------------------------
# 5) app/library/layout.jsx and app/media/layout.jsx -- swap the old,
#    separate LibraryNav/MediaNav (each with its own hardcoded "ع"
#    placeholder logo, never wired to the real uploaded logo) for the
#    shared SiteHeader component, exactly the way app/bookstore/page.jsx
#    already does (sectionMode="bookstore"). SiteHeader already has
#    sectionMode support for 'media' and 'library' -- this migration
#    was just never finished for these two areas. SiteHeader does its
#    own client-side auth check, so the server-side getCurrentUser()
#    call (which existed only to hand a user prop to the old nav) is no
#    longer needed here.
# -----------------------------------------------------------------------
path = "app/library/layout.jsx"
c = load(path)
c = r1(
    c,
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import { prisma } from '@/lib/prisma';\n"
    "import LibraryNav from '@/components/LibraryNav';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';\n"
    "\n"
    "/*\n"
    " * Shared layout for the whole Library area (/library and\n"
    " * /library/[slug]) — written/reference content, separate from Media.\n"
    " * Server component: getCurrentUser() reads the real session cookie\n"
    " * server-side, matching app/media/layout.jsx's pattern.\n"
    " */\n"
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
    "import { prisma } from '@/lib/prisma';\n"
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';\n"
    "\n"
    "/*\n"
    " * Shared layout for the whole Library area (/library and\n"
    " * /library/[slug]) — written/reference content, separate from Media.\n"
    " * Uses the same shared SiteHeader as the rest of the public site\n"
    " * (sectionMode=\"library\"), matching app/bookstore/page.jsx's\n"
    " * pattern -- previously a separate LibraryNav component with its\n"
    " * own hardcoded \"ع\" placeholder that never picked up the real\n"
    " * uploaded logo. SiteHeader checks auth itself client-side, so\n"
    " * this layout no longer needs to resolve the session server-side.\n"
    " */\n"
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
    "  const bannerUrl = await getLibraryBanner();\n"
    "\n"
    "  return (\n"
    "    <SectionBannerProvider bannerUrl={bannerUrl}>\n"
    "      <SiteHeader sectionMode=\"library\" />\n"
    "      {children}\n"
    "    </SectionBannerProvider>\n"
    "  );\n"
    "}",
    "app/library/layout.jsx: swap LibraryNav for the shared SiteHeader",
)
save(path, c)
print("app/library/layout.jsx: now uses the shared SiteHeader (real logo) instead of the old LibraryNav placeholder.")

path = "app/media/layout.jsx"
c = load(path)
c = r1(
    c,
    "import { getCurrentUser } from '@/lib/auth';\n"
    "import { prisma } from '@/lib/prisma';\n"
    "import MediaNav from '@/components/MediaNav';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';\n"
    "\n"
    "/*\n"
    " * Shared layout for the whole Media area (/media and\n"
    " * /media/[slug]).\n"
    " *\n"
    " * This is a server component: getCurrentUser() reads the real session\n"
    " * cookie server-side, so the nav's Sign In/Register vs. My Media\n"
    " * Dashboard/Sign Out state is never guessed on the client — it reflects\n"
    " * actual authentication on every request.\n"
    " */\n"
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
    "import { prisma } from '@/lib/prisma';\n"
    "import SiteHeader from '@/components/SiteHeader';\n"
    "import { SectionBannerProvider } from '@/components/SectionBannerProvider';\n"
    "\n"
    "/*\n"
    " * Shared layout for the whole Media area (/media and\n"
    " * /media/[slug]).\n"
    " *\n"
    " * Uses the same shared SiteHeader as the rest of the public site\n"
    " * (sectionMode=\"media\"), matching app/bookstore/page.jsx's pattern\n"
    " * -- previously a separate MediaNav component with its own\n"
    " * hardcoded \"ع\" placeholder that never picked up the real uploaded\n"
    " * logo. SiteHeader checks auth itself client-side, so this layout\n"
    " * no longer needs to resolve the session server-side.\n"
    " */\n"
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
    "  const bannerUrl = await getMediaBanner();\n"
    "\n"
    "  return (\n"
    "    <SectionBannerProvider bannerUrl={bannerUrl}>\n"
    "      <SiteHeader sectionMode=\"media\" />\n"
    "      {children}\n"
    "    </SectionBannerProvider>\n"
    "  );\n"
    "}",
    "app/media/layout.jsx: swap MediaNav for the shared SiteHeader",
)
save(path, c)
print("app/media/layout.jsx: now uses the shared SiteHeader (real logo) instead of the old MediaNav placeholder.")

# -----------------------------------------------------------------------
# 6) prisma/seed.js -- footerLinkGroupsDefault updated to match, so a
#    future fresh seed reflects the correct content. This does NOT
#    touch the live database (this sandbox can't reach it -- same
#    network restriction as the Prisma engine download); the one-off
#    script in part 7 is what the user runs once to fix the live rows.
# -----------------------------------------------------------------------
path = "prisma/seed.js"
c = load(path)

c = r1(
    c,
    "  {\n"
    "    id: \"footer-group-academics\",\n"
    "    title: \"Academy\",\n"
    "    order: 0,\n"
    "    links: [\n"
    "      { id: \"footer-link-academic-programmes\", label: \"Academic Programmes\", href: \"/programs\", order: 0 },\n"
    "      { id: \"footer-link-academic-departments\", label: \"Academic Departments\", href: \"/departments\", order: 1 },\n"
    "      { id: \"footer-link-faculty\", label: \"Faculty\", href: \"/faculty\", order: 2 },\n"
    "      { id: \"footer-link-academic-calendar\", label: \"Academic Calendar\", href: \"/academic-calendar\", order: 3 },\n"
    "      { id: \"footer-link-admission-registration\", label: \"Admission & Registration\", href: \"/admission\", order: 4 },\n"
    "      { id: \"footer-link-student-portal-login\", label: \"Student Portal Login\", href: \"/login\", order: 5 },\n"
    "    ],\n"
    "  },\n"
    "  {\n"
    "    id: \"footer-group-academic-governance\",\n"
    "    title: \"Academic Governance\",\n"
    "    order: 1,\n"
    "    links: [\n"
    "      { id: \"footer-link-academy-foundation\", label: \"Academy Foundation\", href: \"/academy-foundation\", order: 0 },\n"
    "      { id: \"footer-link-academy-governance\", label: \"Academy Governance\", href: \"/academy-governance\", order: 1 },\n"
    "      { id: \"footer-link-academy-pathways\", label: \"Academy Pathways\", href: \"/academy-pathways\", order: 2 },\n"
    "      { id: \"footer-link-academy-curriculum\", label: \"Academy Curriculum\", href: \"/academy-curriculum\", order: 3 },\n"
    "      { id: \"footer-link-department-curriculum\", label: \"Department Curriculum\", href: \"/academy-department-curriculum\", order: 4 },\n"
    "      { id: \"footer-link-course-catalogue\", label: \"Course Catalogue\", href: \"/academy-course-catalogue\", order: 5 },\n"
    "      { id: \"footer-link-course-specifications\", label: \"Course Specifications\", href: \"/academy-course-specifications\", order: 6 },\n"
    "      { id: \"footer-link-assessment-grading\", label: \"Assessment & Grading\", href: \"/academy-assessment-grading\", order: 7 },\n"
    "      { id: \"footer-link-student-lifecycle\", label: \"Student Lifecycle\", href: \"/academy-student-lifecycle\", order: 8 },\n"
    "      { id: \"footer-link-faculty-portals\", label: \"Faculty & Portals\", href: \"/academy-faculty-portals\", order: 9 },\n"
    "      { id: \"footer-link-academic-regulations\", label: \"Academic Regulations & QA\", href: \"/academy-academic-regulations\", order: 10 },\n"
    "      { id: \"footer-link-master-integration\", label: \"Website & Master Integration\", href: \"/academy-master-integration\", order: 11 },\n"
    "    ],\n"
    "  },\n"
    "  {\n"
    "    id: \"footer-group-institute\",",
    "  {\n"
    "    id: \"footer-group-academics\",\n"
    "    title: \"Academy\",\n"
    "    order: 0,\n"
    "    links: [\n"
    "      { id: \"footer-link-academic-programmes\", label: \"Academic Programmes\", href: \"/programs\", order: 0 },\n"
    "      { id: \"footer-link-academic-departments\", label: \"Academic Departments\", href: \"/departments\", order: 1 },\n"
    "      { id: \"footer-link-faculty\", label: \"Faculty\", href: \"/faculty\", order: 2 },\n"
    "      { id: \"footer-link-academic-calendar\", label: \"Academic Calendar\", href: \"/academic-calendar\", order: 3 },\n"
    "      { id: \"footer-link-academy-foundation\", label: \"Academy Foundation\", href: \"/academy-foundation\", order: 4 },\n"
    "      { id: \"footer-link-academy-pathways\", label: \"Academy Pathways\", href: \"/academy-pathways\", order: 5 },\n"
    "      { id: \"footer-link-admission-registration\", label: \"Admission & Registration\", href: \"/admission\", order: 6 },\n"
    "      { id: \"footer-link-student-portal-login\", label: \"Student Portal Login\", href: \"/login\", order: 7 },\n"
    "    ],\n"
    "  },\n"
    "  // \"Academic Governance\" (12 raw internal governance/curriculum/\n"
    "  // spec/build-tracking documents) deliberately removed -- those\n"
    "  // documents were written to brief the real build, not to stay\n"
    "  // published as a public footer sitemap, and the systems they\n"
    "  // describe already exist in their own dashboards. Academy\n"
    "  // Foundation and Academy Pathways (genuinely public) moved into\n"
    "  // the Academy group above.\n"
    "  {\n"
    "    id: \"footer-group-institute\",",
    "seed.js: footerLinkGroupsDefault drops Academic Governance, folds Foundation/Pathways into Academy",
)

save(path, c)
print("prisma/seed.js: footerLinkGroupsDefault updated (future fresh seeds match the new footer). The live database still needs the one-off script below.")

# -----------------------------------------------------------------------
# 7) One-off script the user runs ONCE, on their own machine, to apply
#    this same footer-link change to the LIVE database (this sandbox
#    cannot reach db.prisma.io -- confirmed: DNS resolution fails here,
#    same network restriction as the blocked Prisma engine download).
#    Written in the same lib/prisma.js driver-adapter style as the rest
#    of the app, not the CLI, so it runs with plain `node`.
# -----------------------------------------------------------------------
os.makedirs("_to_delete", exist_ok=True)
save(
    "_to_delete/fix_footer_governance_links.js",
    "// One-off data fix -- run ONCE against the real database:\n"
    "//   node _to_delete/fix_footer_governance_links.js\n"
    "//\n"
    "// Removes the \"Academic Governance\" footer link group (12 raw\n"
    "// internal planning/spec documents that were never meant to stay\n"
    "// published as a public footer sitemap) and adds Academy Foundation\n"
    "// + Academy Pathways -- the two genuinely public ones -- to the\n"
    "// existing \"Academy\" group. Matches prisma/seed.js's updated\n"
    "// footerLinkGroupsDefault exactly, so this and a future fresh seed\n"
    "// agree. Safe to run more than once (upserts + a guarded delete).\n"
    "require('dotenv/config');\n"
    "const { prisma } = require('../lib/prisma.js');\n"
    "\n"
    "async function main() {\n"
    "  const academyLinksToAdd = [\n"
    "    { id: 'footer-link-academy-foundation', label: 'Academy Foundation', href: '/academy-foundation', order: 4 },\n"
    "    { id: 'footer-link-academy-pathways', label: 'Academy Pathways', href: '/academy-pathways', order: 5 },\n"
    "  ];\n"
    "\n"
    "  for (const link of academyLinksToAdd) {\n"
    "    await prisma.footerLink.upsert({\n"
    "      where: { id: link.id },\n"
    "      update: { label: link.label, href: link.href, order: link.order, groupId: 'footer-group-academics', isActive: true },\n"
    "      create: { ...link, groupId: 'footer-group-academics', isActive: true },\n"
    "    });\n"
    "    console.log('  \\u2713 Academy footer link:', link.label);\n"
    "  }\n"
    "\n"
    "  // Bump the two links that came after Admission/Student Portal so\n"
    "  // the order stays 0..7 with the two new ones inserted at 4-5.\n"
    "  await prisma.footerLink.updateMany({\n"
    "    where: { id: 'footer-link-admission-registration' },\n"
    "    data: { order: 6 },\n"
    "  });\n"
    "  await prisma.footerLink.updateMany({\n"
    "    where: { id: 'footer-link-student-portal-login' },\n"
    "    data: { order: 7 },\n"
    "  });\n"
    "\n"
    "  const governanceGroup = await prisma.footerLinkGroup.findUnique({\n"
    "    where: { id: 'footer-group-academic-governance' },\n"
    "  });\n"
    "\n"
    "  if (governanceGroup) {\n"
    "    await prisma.footerLink.deleteMany({ where: { groupId: 'footer-group-academic-governance' } });\n"
    "    await prisma.footerLinkGroup.delete({ where: { id: 'footer-group-academic-governance' } });\n"
    "    console.log('  \\u2713 Removed the Academic Governance footer group and its 12 links');\n"
    "  } else {\n"
    "    console.log('  \\u2713 Academic Governance footer group already removed');\n"
    "  }\n"
    "\n"
    "  console.log('');\n"
    "  console.log('Done -- footer now shows Academy (including Foundation/Pathways) and Institute only.');\n"
    "}\n"
    "\n"
    "main()\n"
    "  .catch((error) => {\n"
    "    console.error('FAILED:', error);\n"
    "    process.exit(1);\n"
    "  })\n"
    "  .finally(async () => {\n"
    "    await prisma.$disconnect();\n"
    "  });\n",
)
print("_to_delete/fix_footer_governance_links.js: created -- run this once on your machine to apply the footer change to the live database.")
