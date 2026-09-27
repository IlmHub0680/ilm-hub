import { prisma } from "@/lib/prisma";

// 2026-09: the live database already has persisted FooterLinkGroup /
// FooterLink rows from an earlier seed. footerLinkGroups.length > 0
// below means the response is built ENTIRELY from those DB rows --
// any link that only exists in DEFAULT_FOOTER_LINK_GROUPS (added here
// in code after that DB data was seeded, e.g. Alumni/Verify a
// Document) never reaches the public footer no matter how long the
// code default has had it, because the DB branch never looks at the
// code default at all. SiteFooter.jsx's own initial React state
// starts from its local default (so the link flashes in on first
// paint), then this endpoint's DB-only response overwrites it a
// moment later -- the exact "appears, then disappears" bug. Merging
// the DB groups with the code defaults here, rather than replacing
// wholesale, fixes it regardless of whatever the live database
// currently has, without depending on a one-off script being run
// against it first.
function mergeFooterGroups(defaultGroups, dbGroups) {
  const dbByTitle = new Map(dbGroups.map((group) => [group.title, group]));

  const merged = defaultGroups.map((defaultGroup) => {
    const dbGroup = dbByTitle.get(defaultGroup.title);
    if (!dbGroup) return defaultGroup;

    const existingHrefs = new Set(dbGroup.links.map((link) => link.href));
    const missingLinks = defaultGroup.links.filter((link) => !existingHrefs.has(link.href));
    if (missingLinks.length === 0) return dbGroup;

    return { ...dbGroup, links: [...dbGroup.links, ...missingLinks] };
  });

  // Any DB group with no matching code default (an admin-created
  // group with a custom title) is kept as-is, appended after the
  // known ones.
  for (const dbGroup of dbGroups) {
    if (!defaultGroups.some((defaultGroup) => defaultGroup.title === dbGroup.title)) {
      merged.push(dbGroup);
    }
  }

  return merged;
}

// Public, unauthenticated read of the homepage's CMS-managed content
// (Hero section, social links, footer navigation link columns). Falls
// back to the same content that was previously hardcoded in
// app/page.jsx whenever the corresponding admin content hasn't been
// configured yet, so the public page never regresses to an empty or
// broken state.
export const dynamic = "force-dynamic";

const HERO_SETTINGS_ID = "default-homepage-hero";
const SECTIONS_TEXT_ID = "default-homepage-sections";

const DEFAULT_HERO = {
  logoSize: 100,
  badge: "A DIGITAL HOME FOR ISLAMIC KNOWLEDGE",
  title: "Excellence in Islamic Studies & Qur'anic Sciences",
  subtitle:
    "A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.",
  primaryLabel: "Apply Now →",
  primaryHref: "/admission",
  // Must match app/page.jsx's own client-side initial useState default
  // exactly -- when no HomepageHero row is saved yet (hero is null
  // below), this is what the page ends up showing after this fetch
  // resolves. A mismatch between the two defaults is a visible "flash
  // of one label, then replaced by the other" bug on every load/
  // refresh until an admin explicitly saves a hero row. (2026-09:
  // previously "Explore Academics →" / "/programs", which duplicated
  // the ACADEMICS section's own link a few screens down -- see
  // app/page.jsx's hero default for the full explanation.)
  secondaryLabel: "How the Academy Works →",
  secondaryHref: "/academy-pathways",
  features: [
    "Structured curriculum",
    "Online learning",
    "Academic resources",
    "Global access",
  ],
  loginBackgroundUrl: "",
};

const DEFAULT_SOCIAL_LINKS = [
  { name: "Facebook", icon: "f", url: "https://www.facebook.com/" },
  { name: "YouTube", icon: "▶", url: "https://www.youtube.com/" },
  { name: "X", icon: "𝕏", url: "https://x.com/" },
  { name: "Telegram", icon: "✈", url: "https://t.me/" },
];

// Matches SiteFooter.jsx's own local default and prisma/seed.js
// exactly (2026-09 correction): the old "Academic Governance" group
// exposed 12 raw internal planning/spec documents that were never
// meant to stay published as a public footer sitemap. Academy
// Foundation and Academy Pathways -- the two genuinely public ones
// -- moved into Academy below. This code default only renders if the
// database has zero footer link groups; editable at
// /admin/homepage/footer-links.
const DEFAULT_FOOTER_LINK_GROUPS = [
  {
    title: "Academy",
    links: [
      { label: "Academic Programmes", href: "/programs" },
      { label: "Academic Departments", href: "/departments" },
      { label: "Faculty", href: "/faculty" },
      { label: "Academic Calendar", href: "/academic-calendar" },
      { label: "Academy Foundation", href: "/academy-foundation" },
      { label: "Academy Pathways", href: "/academy-pathways" },
      { label: "Admission & Registration", href: "/admission" },
      { label: "Student Portal Login", href: "/login" },
      { label: "Events", href: "/events" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Institute",
    links: [
      { label: "About Ulul Azm", href: "/about" },
      { label: "Alumni", href: "/alumni" },
      { label: "Verify a Document", href: "/verify" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Academic Policies", href: "/academic-policies" },
      { label: "Student Resources", href: "/student-resources" },
      { label: "Staff & Admin Portal", href: "/admin" },
    ],
  },
];

const DEFAULT_WELCOME = {
  badge: "WELCOME TO ULUL AZM",
  title: "A place to seek knowledge with sincerity",
  subtitle:
    "Ulul Azm Institute brings together structured academic learning, classical Islamic scholarship, digital resources, and a community committed to beneficial knowledge, upright character, and lifelong learning.",
};

const DEFAULT_FEATURE_CARDS = [
  {
    icon: "📚",
    title: "Structured Learning",
    text: "Progress through carefully organized academic programmes and courses designed to build knowledge systematically.",
  },
  {
    icon: "🕌",
    title: "Islamic Scholarship",
    text: "Engage with the Qur'an, Sunnah, classical texts, and established Islamic disciplines through sound scholarly tradition.",
  },
  {
    icon: "🎓",
    title: "Student Development",
    text: "Develop sound knowledge, disciplined study habits, research ability, humility, and beneficial character.",
  },
  {
    icon: "🌐",
    title: "Learning Without Borders",
    text: "Access educational opportunities and digital resources designed to support students wherever they are.",
  },
];

const DEFAULT_ACADEMY_SECTION = {
  badge: "ACADEMY",
  title: "Explore Our Academic Programmes",
  subtitle:
    "Explore our academic departments, programmes, courses, and areas of Islamic study, rooted in the Qur'an and Sunnah and presented through structured and disciplined learning.",
};

const DEFAULT_ACADEMY_ITEMS = [
  { icon: "📖", text: "Qur'anic Sciences" },
  { icon: "🗣️", text: "Arabic Language" },
  { icon: "📚", text: "Hadith Studies" },
  { icon: "⚖️", text: "Fiqh & Usul" },
  { icon: "☪️", text: "Aqidah" },
  { icon: "🎙️", text: "Tajwid & Recitation" },
  { icon: "☪️", text: "Tauheed (Monotheism)" },
  { icon: "🌱", text: "Tarbiyah (Education)" },
];

const DEFAULT_APPROACH_SECTION = {
  badge: "OUR APPROACH",
  title: "More than a website — a learning environment",
  subtitle: "We aim to make the pursuit of Islamic knowledge organized, accessible, responsible and beneficial.",
};

const DEFAULT_APPROACH_STEPS = [
  {
    number: "01",
    title: "Authentic Foundations",
    text: "Begin with foundational disciplines before progressing into advanced studies.",
  },
  {
    number: "02",
    title: "Structured Programmes",
    text: "Study through clearly defined academic areas rather than disconnected lessons.",
  },
  {
    number: "03",
    title: "Responsible Scholarship",
    text: "Approach Islamic knowledge with sincerity, humility, discipline and respect for scholarship.",
  },
];

const DEFAULT_CTA_BANNER = {
  arabicLine: "BISMILLAH • SEEK KNOWLEDGE • SERVE WITH EXCELLENCE",
  title: "Begin Your Journey of Knowledge",
  description: "Explore academic programmes, educational resources, media library, and admissions opportunities.",
};

export async function GET() {
  try {
    const [hero, heroBanners, socialLinks, footerLinkGroups, sectionsText, featureCards, academyItems, approachSteps] = await Promise.all([
      prisma.homepageHero.findUnique({ where: { id: HERO_SETTINGS_ID } }),
      prisma.homepageHeroBanner.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.socialLink.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.footerLinkGroup.findMany({
        where: { isActive: true },
        include: {
          links: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.homepageSectionsText.findUnique({ where: { id: SECTIONS_TEXT_ID } }),
      prisma.homepageFeatureCard.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.homepageAcademyItem.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.homepageApproachStep.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    ]);

    return Response.json({
      success: true,
      data: {
        hero: hero
          ? {
              badge: hero.badge,
              title: hero.title,
              subtitle: hero.subtitle,
              primaryLabel: hero.primaryLabel,
              primaryHref: hero.primaryHref,
              secondaryLabel: hero.secondaryLabel,
              secondaryHref: hero.secondaryHref,
              features: hero.features,
              badgeAr: hero.badgeAr || '',
              titleAr: hero.titleAr || '',
              subtitleAr: hero.subtitleAr || '',
              primaryLabelAr: hero.primaryLabelAr || '',
              secondaryLabelAr: hero.secondaryLabelAr || '',
              featuresAr: hero.featuresAr || [],
              logoUrl: hero.logoUrl || '',
              heroImageUrl: hero.heroImageUrl || '',
              logoSize: hero.logoSize || 100,
              loginBackgroundUrl: hero.loginBackgroundUrl || '',
            }
          : DEFAULT_HERO,
        // Up to 5 admin-managed rotating banner images for the hero
        // slider (Model 25). Empty array is a normal, fully supported
        // state -- the public homepage then falls back to hero.heroImageUrl
        // (and, below that, the plain gradient background) exactly as it
        // always has.
        heroBanners: heroBanners.map((banner) => ({ id: banner.id, imageUrl: banner.imageUrl })),
        socialLinks:
          socialLinks.length > 0
            ? socialLinks.map((link) => ({
                name: link.name,
                icon: link.icon,
                url: link.url,
              }))
            : DEFAULT_SOCIAL_LINKS,
        footerLinkGroups:
          footerLinkGroups.length > 0
            ? mergeFooterGroups(
                DEFAULT_FOOTER_LINK_GROUPS,
                footerLinkGroups.map((group) => ({
                  title: group.title,
                  links: group.links.map((link) => ({
                    label: link.label,
                    href: link.href,
                  })),
                }))
              )
            : DEFAULT_FOOTER_LINK_GROUPS,
        welcome: sectionsText
          ? { badge: sectionsText.welcomeBadge, title: sectionsText.welcomeTitle, subtitle: sectionsText.welcomeSubtitle }
          : DEFAULT_WELCOME,
        featureCards:
          featureCards.length > 0
            ? featureCards.map((card) => ({ icon: card.icon, title: card.title, text: card.text }))
            : DEFAULT_FEATURE_CARDS,
        academySection: sectionsText
          ? { badge: sectionsText.academyBadge, title: sectionsText.academyTitle, subtitle: sectionsText.academySubtitle }
          : DEFAULT_ACADEMY_SECTION,
        academyItems:
          academyItems.length > 0
            ? academyItems.map((item) => ({ icon: item.icon, text: item.text }))
            : DEFAULT_ACADEMY_ITEMS,
        approachSection: sectionsText
          ? { badge: sectionsText.approachBadge, title: sectionsText.approachTitle, subtitle: sectionsText.approachSubtitle }
          : DEFAULT_APPROACH_SECTION,
        approachSteps:
          approachSteps.length > 0
            ? approachSteps.map((step) => ({ number: step.number, title: step.title, text: step.text }))
            : DEFAULT_APPROACH_STEPS,
        ctaBanner: sectionsText
          ? { arabicLine: sectionsText.ctaArabicLine, title: sectionsText.ctaTitle, description: sectionsText.ctaDescription }
          : DEFAULT_CTA_BANNER,
      },
    });
  } catch (error) {
    console.error("GET homepage content error:", error);

    // Even on an unexpected error, the public homepage should still
    // render with its known-good defaults rather than break.
    return Response.json({
      success: true,
      data: {
        hero: DEFAULT_HERO,
        heroBanners: [],
        socialLinks: DEFAULT_SOCIAL_LINKS,
        footerLinkGroups: DEFAULT_FOOTER_LINK_GROUPS,
        welcome: DEFAULT_WELCOME,
        featureCards: DEFAULT_FEATURE_CARDS,
        academySection: DEFAULT_ACADEMY_SECTION,
        academyItems: DEFAULT_ACADEMY_ITEMS,
        approachSection: DEFAULT_APPROACH_SECTION,
        approachSteps: DEFAULT_APPROACH_STEPS,
        ctaBanner: DEFAULT_CTA_BANNER,
      },
    });
  }
}
