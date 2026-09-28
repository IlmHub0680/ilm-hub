import 'dotenv/config';
import { prisma } from './lib/prisma.js';
async function main() {
  for (const slug of ['academy-foundation', 'academy-pathways']) {
    const row = await prisma.legalPage.findUnique({ where: { slug } });
    console.log(slug, row ? `DB ROW EXISTS, updatedAt=${row.updatedAt.toISOString()}, length=${row.bodyHtml.length}` : 'NO DB ROW');
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
