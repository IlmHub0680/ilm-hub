require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const slugs = ['academy-master-integration', 'academy-academic-regulations'];
  for (const slug of slugs) {
    const row = await prisma.legalPage.findUnique({ where: { slug } });
    if (!row) {
      console.log(`[${slug}] NO DB ROW -- served from code fallback (lib/legalContentDefaults.js)`);
    } else {
      const hasLeak = /Models?\s+\d+|explicit(ly)? (asked|instruction)/i.test(row.bodyHtml);
      console.log(`[${slug}] DB ROW EXISTS -- updatedAt=${row.updatedAt.toISOString()} bodyHtml length=${row.bodyHtml.length} containsLeakPattern=${hasLeak}`);
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
