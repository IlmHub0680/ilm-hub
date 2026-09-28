// One-off script: checks the LegalPage table for 'academy-master-integration'
// and 'academy-academic-regulations' and, ONLY if a saved database row
// contains the same leaked "Model N" / "explicit instruction" language just
// fixed in lib/legalContentDefaults.js, applies the identical corrections to
// that row so the live public page (which prefers the DB row over the code
// fallback) reflects the fix too.
//
// Safe to run any number of times: if no DB row exists for a slug, or the
// row has no leak text, nothing is changed and the script says so.
//
// Run from the project root on your own machine (this cannot be run through
// the cloud assistant's device shell -- it has no network route to the
// Prisma database):
//
//   node _to_delete/fix-legal-content-db-leak.cjs

require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

// [old, new] pairs -- identical text to the fixes already applied to
// lib/legalContentDefaults.js.
const REPLACEMENTS = [
  [
    "<p><strong>Website, Recognition Readiness &amp; Master Integration.</strong> " +
      "Using Models 1 through 11 — Institutional Foundation through Academic Regu" +
      "lations, Records &amp; Quality Assurance — as the complete Academy foundation, " +
      "this document integrates the institution into one coherent master model. " +
      "It does not redesign anything already settled;",
    "<p><strong>Website, Recognition Readiness &amp; Master Integration.</strong> " +
      "Using every prior framework — Institutional Foundation through Academic Regu" +
      "lations, Records &amp; Quality Assurance — as the complete Academy foundation, " +
      "this document integrates the institution into one coherent whole. " +
      "It does not redesign anything already settled;",
  ],
  [
    "reading real <code>Course.prerequisites</code> relationships that existed " +
      "in the schema since Model 9 but were empty for every course until this " +
      "document's companion seed work (§10)",
    "reading real <code>Course.prerequisites</code> relationships that existed " +
      "in the schema but were empty for every course until this " +
      "document's companion seed work (§10)",
  ],
  [
    "<code>isPrerequisiteFor</code> self-relation — defined in the schema " +
      "since Model 9, populated for every course as of this document (§10)",
    "<code>isPrerequisiteFor</code> self-relation — defined in the schema, " +
      "populated for every course as of this document (§10)",
  ],
  [
    "are now populated, where the schema relation existed since Model 9 but had " +
      "been empty for every course until now; and approval",
    "are now populated, where the schema relation existed but had " +
      "been empty for every course until now; and approval",
  ],
  [
    "<code>Course.prerequisites</code>, defined in the schema since Model 9 but " +
      "empty for every course until now, now reflects Course C",
    "<code>Course.prerequisites</code>, defined in the schema but " +
      "empty for every course until now, now reflects Course C",
  ],
  [
    "Prepared for Founder review. This document closes the series covered by " +
      "Models 1 through 12 by integrating them into one blueprint, correcti",
    "Prepared for Founder review. This document closes the series " +
      "by integrating every prior framework into one blueprint, correcti",
  ],
  [
    "approximating one now, from data that was never structured to support it, " +
      "would be exactly the kind of meaningless number this document was " +
      "explicitly asked not to produce (§9, §10).",
    "approximating one now, from data that was never structured to support it, " +
      "would be exactly the kind of meaningless number the Academy's standing " +
      "no-fabrication principle rules out (§9, §10).",
  ],
  [
    "Consistent with the explicit instruction not to create meaningless KPIs, " +
      "a metric is only included where the platform's actual data can support " +
      "computing it honestly;",
    "Consistent with the Academy's standing principle against meaningless KPIs, " +
      "a metric is only included where the platform's actual data can support " +
      "computing it honestly;",
  ],
];

async function fixSlug(slug) {
  const row = await prisma.legalPage.findUnique({ where: { slug } });
  if (!row) {
    console.log(`[${slug}] no saved database row -- the site is serving the (already fixed) code fallback. Nothing to do.`);
    return;
  }

  let body = row.bodyHtml;
  let changed = 0;
  for (const [oldText, newText] of REPLACEMENTS) {
    if (body.includes(oldText)) {
      body = body.split(oldText).join(newText);
      changed++;
    }
  }

  if (changed === 0) {
    console.log(`[${slug}] saved database row exists but contains none of the leaked phrases -- nothing to do.`);
    return;
  }

  await prisma.legalPage.update({ where: { slug }, data: { bodyHtml: body } });
  console.log(`[${slug}] saved database row updated -- ${changed} leaked passage(s) corrected.`);
}

async function main() {
  await fixSlug("academy-master-integration");
  await fixSlug("academy-academic-regulations");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
