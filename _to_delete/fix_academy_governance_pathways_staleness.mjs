// One-off data-correction script -- run ONCE against the real database:
//   node fix_academy_governance_pathways_staleness.mjs
//
// Follows the same pattern as _to_delete/fix_footer_governance_links.js
// and _to_delete/check_legalpage_rows.cjs.
//
// Context: lib/legalContentDefaults.js's 'academy-pathways' and
// 'academy-governance' entries have already been corrected in code to
// fix two stale factual claims found while aligning Academic
// Governance against the Academy Foundation, Academy Pathways and
// Internal Guidance documents (2026-09-27 session):
//
//  1) academy-pathways §12 decision 20 said "open, and needs a
//     migration" for making Foundation/Intermediate/Advanced real
//     Program records. That migration
//     (20260917170000_add_pathway_program_levels) already ran and all
//     five pathways already exist as real seeded Program rows --
//     confirmed directly against the live schema and prisma/seed.js,
//     not assumed. The item is corrected to "done, not open."
//
//  2) academy-governance §7 said professional development had "no
//     dedicated tracking... in the system." A StaffDevelopmentRecord
//     model exists in the schema, but nothing in the app reads or
//     writes it yet -- corrected to describe that precisely (schema
//     exists, feature does not), rather than either overclaiming or
//     leaving the stale "nothing exists" claim in place.
//
// If a LegalPage database row already exists for either slug (e.g.
// because someone opened the admin editor and clicked Save at some
// point), that row -- not the code default -- is what the admin
// editor and any consumer actually shows, and it will still contain
// the stale text unless corrected here. This script finds and fixes
// ONLY the specific stale phrases below, leaving every other word of
// whatever is actually saved untouched. If a phrase isn't found
// (rewritten differently, or already fixed), it is reported and
// skipped -- nothing is guessed or overwritten wholesale.
//
// Safe to run more than once (each replacement only fires if the
// exact old text is still present).
import 'dotenv/config';
import { prisma } from './lib/prisma.js';

const FIXES = [
  {
    slug: 'academy-pathways',
    replacements: [
      {
        label: 'decision 20 (Program records) status',
        old: `<li><strong>Making Foundation, Intermediate and Advanced real, distinct Program records — open, and needs a migration.</strong> The Diploma and Specialized Certificate pathways fit the system's existing <code>ProgramLevel</code> values (<code>DIPLOMA</code>, <code>CERTIFICATE</code>) and can be created as real Programs now. Foundation, Intermediate and Advanced do not have a matching value yet — representing them as their own real, distinct Programs (rather than description only) needs three new <code>ProgramLevel</code> values added to the schema, which needs a migration you would run. Confirm if and when you want this built.</li>`,
        new: `<li><strong>Making Foundation, Intermediate and Advanced real, distinct Program records — done, not open.</strong> <code>ProgramLevel</code> now includes <code>FOUNDATION</code>, <code>INTERMEDIATE</code> and <code>ADVANCED</code> alongside the existing <code>DIPLOMA</code> and <code>CERTIFICATE</code> values (migration applied), and all five pathways — Foundation Studies, Intermediate Islamic Studies, Advanced Islamic Studies, the Diploma in Islamic Studies, and Specialized Certificate Programs — exist as real, distinct <code>Program</code> records, each under its correct owning department. This item is closed; it is left here, marked done, only so this document's decision numbering stays continuous with Institutional Foundation and Academic Governance.</li>`,
      },
      {
        label: 'closing summary line',
        old: `<p><em>Ulul Azm Academy — Academic Pathways &amp; Qualification Framework. Prepared for Founder review. The Diploma in Islamic Studies is being created as a real Program record alongside this document; Foundation, Intermediate and Advanced remain framework-only until decision 20 above is resolved.</em></p>`,
        new: `<p><em>Ulul Azm Academy — Academic Pathways &amp; Qualification Framework. Prepared for Founder review. All five pathways — Foundation Studies, Intermediate Islamic Studies, Advanced Islamic Studies, the Diploma in Islamic Studies, and Specialized Certificate Programs — now exist as real Program records (decision 20 resolved).</em></p>`,
      },
    ],
  },
  {
    slug: 'academy-governance',
    replacements: [
      {
        label: 'professional development tracking claim',
        old: `<li><strong>Professional development.</strong> Coordinated by the Head of Department; no dedicated tracking exists yet in the system.</li>`,
        new: `<li><strong>Professional development.</strong> Coordinated by the Head of Department. A <code>StaffDevelopmentRecord</code> model exists in the schema (training title, provider, completion date, hours, certificate) but no admin or dashboard screen reads or writes it yet — the data shape is there; the working feature is not.</li>`,
      },
    ],
  },
];

async function main() {
  for (const { slug, replacements } of FIXES) {
    const row = await prisma.legalPage.findUnique({ where: { slug } });

    if (!row) {
      console.log(`[${slug}] NO DB ROW -- already served from the corrected code fallback. Nothing to do.`);
      continue;
    }

    let bodyHtml = row.bodyHtml;
    let changed = false;

    for (const { label, old, new: replacement } of replacements) {
      if (bodyHtml.includes(old)) {
        bodyHtml = bodyHtml.replace(old, replacement);
        changed = true;
        console.log(`[${slug}] fixed: ${label}`);
      } else {
        console.log(`[${slug}] skipped (exact old text not found -- may already be fixed, or edited differently): ${label}`);
      }
    }

    if (changed) {
      await prisma.legalPage.update({ where: { slug }, data: { bodyHtml } });
      console.log(`[${slug}] saved.`);
    } else {
      console.log(`[${slug}] no changes made.`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
