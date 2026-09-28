// One-off data fix -- run ONCE against the real database:
//   node _to_delete/fix_footer_governance_links.js
//
// Rewritten as ES modules (this project's package.json has
// "type": "module", so a require()-based script can never run here).
//
// Combines two related cleanups, both matching prisma/seed.js's
// updated defaults so this and a future fresh seed agree:
//
//  1) Footer: removes the "Academic Governance" footer link group (12
//     raw internal planning/spec documents that were never meant to
//     stay published as a public footer sitemap) and adds Academy
//     Foundation + Academy Pathways -- the two genuinely public ones
//     -- to the existing "Academy" footer group.
//
//  2) Academy Hub (/academy page): removes the same 10 governance
//     document cards from the public Academy Hub page, keeping only
//     Academy Foundation and Academy Pathways there too.
//
// Safe to run more than once (upserts + guarded/idempotent deletes).
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

async function main() {
  // --- 1) Footer ---
  const academyLinksToAdd = [
    { id: 'footer-link-academy-foundation', label: 'Academy Foundation', href: '/academy-foundation', order: 4 },
    { id: 'footer-link-academy-pathways', label: 'Academy Pathways', href: '/academy-pathways', order: 5 },
  ];

  for (const link of academyLinksToAdd) {
    await prisma.footerLink.upsert({
      where: { id: link.id },
      update: { label: link.label, href: link.href, order: link.order, groupId: 'footer-group-academics', isActive: true },
      create: { ...link, groupId: 'footer-group-academics', isActive: true },
    });
    console.log('  \u2713 Academy footer link:', link.label);
  }

  await prisma.footerLink.updateMany({
    where: { id: 'footer-link-admission-registration' },
    data: { order: 6 },
  });
  await prisma.footerLink.updateMany({
    where: { id: 'footer-link-student-portal-login' },
    data: { order: 7 },
  });

  const governanceGroup = await prisma.footerLinkGroup.findUnique({
    where: { id: 'footer-group-academic-governance' },
  });

  if (governanceGroup) {
    await prisma.footerLink.deleteMany({ where: { groupId: 'footer-group-academic-governance' } });
    await prisma.footerLinkGroup.delete({ where: { id: 'footer-group-academic-governance' } });
    console.log('  \u2713 Removed the Academic Governance footer group and its 12 links');
  } else {
    console.log('  \u2713 Academic Governance footer group already removed');
  }

  // --- 2) Academy Hub cards ---
  const governanceCardIds = [
    'academy-hub-card-governance',
    'academy-hub-card-curriculum',
    'academy-hub-card-department-curriculum',
    'academy-hub-card-course-catalogue',
    'academy-hub-card-course-specifications',
    'academy-hub-card-assessment-grading',
    'academy-hub-card-student-lifecycle',
    'academy-hub-card-faculty-portals',
    'academy-hub-card-academic-regulations',
    'academy-hub-card-master-integration',
  ];

  const { count } = await prisma.academyHubCard.deleteMany({
    where: { id: { in: governanceCardIds } },
  });
  console.log(`  \u2713 Removed ${count} Academy Hub governance-document card(s) (Foundation and Pathways stay)`);

  await prisma.academyHubCard.updateMany({
    where: { id: 'academy-hub-card-pathways' },
    data: { order: 1 },
  });

  console.log('');
  console.log('Done -- the footer and the /academy Hub page now show only Academy Foundation and Academy Pathways for what used to be the governance-document links/cards. Nothing else was touched, and all of that content is still there and editable at /admin/academy-*.');
}

main()
  .catch((error) => {
    console.error('FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
