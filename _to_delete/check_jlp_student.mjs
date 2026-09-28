import { prisma } from '../lib/prisma.js';

const program = await prisma.program.findUnique({ where: { code: 'JLP' } });
const students = await prisma.studentProfile.findMany({
  where: { programId: program.id },
  include: { user: { select: { name: true, email: true, createdAt: true } } },
});

for (const s of students) {
  console.log(`Student: ${s.user.name} <${s.user.email}>  studentNo=${s.studentNo}  status=${s.status}  created=${s.user.createdAt.toISOString().slice(0,10)}`);
}

await prisma.$disconnect();
