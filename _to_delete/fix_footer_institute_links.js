// One-off data fix -- run ONCE against the real database:
//   node _to_delete/fix_footer_institute_links.js
//
// Adds the Alumni (Model 29) and Verify a Document (Model 30) links
// to the existing "Institute" footer link group in the live
// database. Both features were wired into the code-level footer
// defaults (components/SiteFooter.jsx, app/api/homepage-content/
// route.js) and prisma/seed.js, but this project's live database
// already has its own persisted FooterLinkGroup/FooterLink rows from
// an earlier seed run, and /api/homepage-content prefers those DB
// rows over the code defaults whenever any exist -- so the two new
// links never actually reached the live site. They would appear
// briefly on first paint (the component's own initial state, which
// does include them) and then disappear once the DB fetch resolved
// and overwrote that state with the stale persisted row. This is the
// same root-cause pattern as the earlier Academic Governance footer
// bug, just the mirror image: there, a stale DB row lingered with
// content that should have been removed; here, the DB is simply
// missing content that only exists in code so far.
//
// Safe to run more than once (upserts by fixed id, matching
// prisma/seed.js's own ids for these two links).
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

async function main() {
  const group = await prisma.footerLinkGroup.findUnique({
    where: { id: 'footer-group-institute' },
  });

  if (!group) {
    console.log('No "footer-group-institute" row found in the database -- nothing to fix (the code-level default will be used instead).');
    return;
  }

  const newLinks = [
    { id: 'footer-link-alumni', label: 'Alumni', href: '/alumni', order: 1 },
    { id: 'footer-link-verify', label: 'Verify a Document', href: '/verify', order: 2 },
  ];

  for (const link of newLinks) {
    await prisma.footerLink.upsert({
      where: { id: link.id },
      update: { label: link.label, href: link.href, order: link.order, groupId: group.id, isActive: true },
      create: { ...link, groupId: group.id, isActive: true },
    });
    console.log('  \u2713 Institute footer link:', link.label);
  }

  // Shift the existing links after "About Ulul Azm" down two places
  // so Alumni / Verify a Document land in the same order as the
  // code-level default (harmless no-op if a row doesn't exist).
  const shifts = [
    { id: 'footer-link-contact', order: 3 },
    { id: 'footer-link-privacy', order: 4 },
    { id: 'footer-link-terms', order: 5 },
    { id: 'footer-link-refund', order: 6 },
    { id: 'footer-link-admin-portal', order: 7 },
  ];

  for (const shift of shifts) {
    await prisma.footerLink.updateMany({
      where: { id: shift.id },
      data: { order: shift.order },
    });
  }

  console.log('');
  console.log('Done -- the Institute footer column now includes Alumni and Verify a Document, matching the code-level default, and will stop disappearing after the page\'s data fetch resolves.');
}

main()
  .catch((error) => {
    console.error('FAILED:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
