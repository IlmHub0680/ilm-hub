# -*- coding: utf-8 -*-
import io

PATH = "prisma/seed.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

# --- Insert the new seed function, right before `async function main() {` ---
anchor_fn = "async function main() {"
assert content.count(anchor_fn) == 1

new_fn = '''const homepageHeroDefault = {
  id: "default-homepage-hero",
  badge: "A DIGITAL HOME FOR ISLAMIC KNOWLEDGE",
  title: "Excellence in Islamic Studies & Qur'anic Sciences",
  subtitle:
    "A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.",
  primaryLabel: "Apply for Admission →",
  primaryHref: "/admission",
  secondaryLabel: "Explore Academics →",
  secondaryHref: "/programs",
  features: [
    "Structured curriculum",
    "Online learning",
    "Academic resources",
    "Global access",
  ],
};

const socialLinksDefault = [
  { id: "social-facebook", name: "Facebook", icon: "f", url: "https://www.facebook.com/", order: 0 },
  { id: "social-youtube", name: "YouTube", icon: "▶", url: "https://www.youtube.com/", order: 1 },
  { id: "social-x", name: "X", icon: "𝕏", url: "https://x.com/", order: 2 },
  { id: "social-telegram", name: "Telegram", icon: "✈", url: "https://t.me/", order: 3 },
];

// The homepage footer has three kinds of link columns: these two
// CMS-managed groups (editable at /admin/homepage/footer-links without a
// code change), plus a "Resources" column that stays hardcoded in
// app/page.jsx because one of its entries opens a client-side modal
// rather than linking anywhere.
const footerLinkGroupsDefault = [
  {
    id: "footer-group-academics",
    title: "Academics",
    order: 0,
    links: [
      { id: "footer-link-academic-departments", label: "Academic Departments", href: "/programs", order: 0 },
      { id: "footer-link-admission-registration", label: "Admission & Registration", href: "/admission", order: 1 },
      { id: "footer-link-student-portal-login", label: "Student Portal Login", href: "/login", order: 2 },
    ],
  },
  {
    id: "footer-group-institute",
    title: "Institute",
    order: 1,
    links: [
      { id: "footer-link-about", label: "About Ulul Azm", href: "/about", order: 0 },
      { id: "footer-link-academy-foundation", label: "Academy Foundation", href: "/academy-foundation", order: 1 },
      { id: "footer-link-academy-governance", label: "Academy Governance", href: "/academy-governance", order: 2 },
      { id: "footer-link-academy-pathways", label: "Academy Pathways", href: "/academy-pathways", order: 3 },
      { id: "footer-link-academy-curriculum", label: "Academy Curriculum", href: "/academy-curriculum", order: 4 },
      { id: "footer-link-department-curriculum", label: "Department Curriculum", href: "/academy-department-curriculum", order: 5 },
      { id: "footer-link-course-catalogue", label: "Course Catalogue", href: "/academy-course-catalogue", order: 6 },
      { id: "footer-link-course-specifications", label: "Course Specifications", href: "/academy-course-specifications", order: 7 },
      { id: "footer-link-assessment-grading", label: "Assessment & Grading", href: "/academy-assessment-grading", order: 8 },
      { id: "footer-link-contact", label: "Contact", href: "/contact", order: 9 },
      { id: "footer-link-privacy", label: "Privacy Policy", href: "/privacy", order: 10 },
      { id: "footer-link-terms", label: "Terms of Use", href: "/terms", order: 11 },
      { id: "footer-link-refund", label: "Refund Policy", href: "/refund", order: 12 },
      { id: "footer-link-admin-portal", label: "Staff & Admin Portal", href: "/admin", order: 13 },
    ],
  },
];

async function seedHomepageContent() {
  console.log("Seeding homepage hero, social links and footer link groups...");

  await prisma.homepageHero.upsert({
    where: { id: homepageHeroDefault.id },
    update: {
      badge: homepageHeroDefault.badge,
      title: homepageHeroDefault.title,
      subtitle: homepageHeroDefault.subtitle,
      primaryLabel: homepageHeroDefault.primaryLabel,
      primaryHref: homepageHeroDefault.primaryHref,
      secondaryLabel: homepageHeroDefault.secondaryLabel,
      secondaryHref: homepageHeroDefault.secondaryHref,
      features: homepageHeroDefault.features,
    },
    create: homepageHeroDefault,
  });
  console.log("  ✓ Homepage hero");

  for (const link of socialLinksDefault) {
    await prisma.socialLink.upsert({
      where: { id: link.id },
      update: { name: link.name, icon: link.icon, url: link.url, order: link.order, isActive: true },
      create: { ...link, isActive: true },
    });
    console.log(`  ✓ Social link: ${link.name}`);
  }

  for (const group of footerLinkGroupsDefault) {
    await prisma.footerLinkGroup.upsert({
      where: { id: group.id },
      update: { title: group.title, order: group.order, isActive: true },
      create: { id: group.id, title: group.title, order: group.order, isActive: true },
    });

    for (const link of group.links) {
      await prisma.footerLink.upsert({
        where: { id: link.id },
        update: { label: link.label, href: link.href, order: link.order, groupId: group.id, isActive: true },
        create: { id: link.id, label: link.label, href: link.href, order: link.order, groupId: group.id, isActive: true },
      });
    }
    console.log(`  ✓ Footer link group: ${group.title} (${group.links.length} links)`);
  }
}

'''

content = content.replace(anchor_fn, new_fn + anchor_fn)

# --- Call the new function from main(), right after seedPositionPermissions ---
anchor_call = '''  await seedPositionPermissions(positionByName);
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");'''
assert content.count(anchor_call) == 1

new_call = '''  await seedPositionPermissions(positionByName);
  console.log("");

  await seedHomepageContent();
  console.log("");

  console.log("========================================");
  console.log("       SEED COMPLETED SUCCESSFULLY");'''

content = content.replace(anchor_call, new_call)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("prisma/seed.js updated")
