import { prisma } from '../lib/prisma.js';

const programs = await prisma.program.findMany({
  select: { id: true, code: true, nameEn: true, level: true, isActive: true, approvalStatus: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});

console.log('Total Program rows:', programs.length);
console.log('');
for (const p of programs) {
  console.log(`- [${p.code}] ${p.nameEn}  (level: ${p.level}, active: ${p.isActive}, approval: ${p.approvalStatus}, created: ${p.createdAt.toISOString().slice(0,10)})`);
}

await prisma.$disconnect();
