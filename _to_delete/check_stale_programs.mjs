import { prisma } from '../lib/prisma.js';

const STALE_CODES = ['JLP', 'FND', 'INT', 'CRT', 'DIP'];

for (const code of STALE_CODES) {
  const program = await prisma.program.findUnique({ where: { code } });
  if (!program) {
    console.log(`${code}: not found (already gone?)`);
    continue;
  }

  const [students, courses, admissions, graduationApps] = await Promise.all([
    prisma.studentProfile.count({ where: { programId: program.id } }),
    prisma.course.count({ where: { programId: program.id } }),
    prisma.admissionApplication.count({ where: { programId: program.id } }).catch(() => 'N/A (no such field)'),
    prisma.graduationApplication.count({ where: { programId: program.id } }),
  ]);

  console.log(`${code} (${program.nameEn}, id=${program.id}):`);
  console.log(`  students: ${students}, courses: ${courses}, admissionApplications: ${admissions}, graduationApplications: ${graduationApps}`);
}

await prisma.$disconnect();
