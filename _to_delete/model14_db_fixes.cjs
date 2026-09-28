// Model 14: patches the live "Academics" footer link group title to
// "Academy" (matching the public-navigation terminology fix), IF that
// row already exists in the database. This cloud assistant's shell has
// no network route to the Prisma database, so -- same as the last
// leaked-content fix -- this runs from your own terminal:
//
//   node _to_delete/model14_db_fixes.cjs
//
// Safe to run any number of times: a no-op if the row doesn't exist yet
// or is already titled "Academy".

require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function fixFooterGroupTitle() {
  const row = await prisma.footerLinkGroup.findUnique({ where: { id: "footer-group-academics" } });

  if (!row) {
    console.log('[footer-group-academics] no saved database row -- the site is serving the (already fixed) code fallback. Nothing to do.');
    return;
  }

  if (row.title === "Academy") {
    console.log('[footer-group-academics] already titled "Academy". Nothing to do.');
    return;
  }

  await prisma.footerLinkGroup.update({ where: { id: "footer-group-academics" }, data: { title: "Academy" } });
  console.log(`[footer-group-academics] title updated: "${row.title}" -> "Academy".`);
}

async function main() {
  await fixFooterGroupTitle();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
