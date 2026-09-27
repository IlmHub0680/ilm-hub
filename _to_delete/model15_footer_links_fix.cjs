// Model 15 follow-up: fixes the real "Academy" footer link group in the
// database. This is what's actually serving the public site's footer,
// which is why the new Faculty / Academic Calendar links Claude added
// to the code flashed briefly on page load and then disappeared -- the
// code-level default rendered first, then the fetch to
// /api/homepage-content resolved with the OLDER rows that were already
// in the database (seeded before these pages existed), overwriting it.
//
// This script brings the real "Academy" FooterLinkGroup row's links up
// to date: fixes "Academic Departments" (was pointing at /programs,
// now points at the real /departments page) and adds Academic
// Programmes, Faculty and Academic Calendar. Safe to re-run.
//
// Run from your own terminal (same one used for `npx prisma migrate
// deploy`), from the project root:
//   node _to_delete/model15_footer_links_fix.cjs

require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const GROUP_ID = "footer-group-academics";

const LINKS = [
  { id: "footer-link-academic-programmes", label: "Academic Programmes", href: "/programs", order: 0 },
  { id: "footer-link-academic-departments", label: "Academic Departments", href: "/departments", order: 1 },
  { id: "footer-link-faculty", label: "Faculty", href: "/faculty", order: 2 },
  { id: "footer-link-academic-calendar", label: "Academic Calendar", href: "/academic-calendar", order: 3 },
  { id: "footer-link-admission-registration", label: "Admission & Registration", href: "/admission", order: 4 },
  { id: "footer-link-student-portal-login", label: "Student Portal Login", href: "/login", order: 5 },
];

async function main() {
  const group = await prisma.footerLinkGroup.findUnique({ where: { id: GROUP_ID } });

  if (!group) {
    console.log(`No FooterLinkGroup with id "${GROUP_ID}" found -- nothing to fix (the code-level default will be used instead).`);
    return;
  }

  for (const link of LINKS) {
    await prisma.footerLink.upsert({
      where: { id: link.id },
      update: { label: link.label, href: link.href, order: link.order, groupId: GROUP_ID, isActive: true },
      create: { id: link.id, label: link.label, href: link.href, order: link.order, groupId: GROUP_ID, isActive: true },
    });
    console.log(`  ✓ ${link.label} -> ${link.href}`);
  }

  console.log("Done. The Academy footer group now has 6 links: Academic Programmes, Academic Departments, Faculty, Academic Calendar, Admission & Registration, Student Portal Login.");
}

main()
  .catch((error) => {
    console.error("Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
