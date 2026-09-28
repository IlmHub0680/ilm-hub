import { prisma } from '../lib/prisma.js';

const admins = await prisma.user.findMany({
  where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
  select: { id: true, email: true, name: true, role: true, createdAt: true },
  orderBy: { createdAt: 'asc' },
});

console.log('Total ADMIN/SUPER_ADMIN accounts:', admins.length);
for (const a of admins) {
  console.log(`- ${a.email}  (${a.role}, ${a.name}, created ${a.createdAt.toISOString().slice(0,10)})`);
}

const totalUsers = await prisma.user.count();
console.log('');
console.log('Total User rows in database:', totalUsers);

await prisma.$disconnect();
