import 'dotenv/config';
import { prisma } from './lib/prisma.js';

// Read-only diagnostic. Compares:
//   (a) every Department row actually in the live DB, against
//   (b) the 5 canonical departments named in the Academic Governance
//       content (prisma/seed.js's `academyDepartments`), and
//   (c) the exact program-count filter the public homepage API uses
//       (app/api/academic/departments/route.js: isActive:true AND
//       approvalStatus:'APPROVED', counted via department.programs).
//
// Run with:  node check_department_program_counts.mjs

const CANONICAL_DEPARTMENT_CODES = new Set([
  'DEPT-ISLAMIC-STUDIES',
  'DEPT-QURANIC-STUDIES',
  'DEPT-ARABIC-LANGUAGE',
  'DEPT-EDUCATION-TARBIYAH',
  'DEPT-CIVILIZATION-SOCIETY',
]);

async function main() {
  const departments = await prisma.department.findMany({
    orderBy: { nameEn: 'asc' },
    include: {
      faculty: { select: { nameEn: true, code: true } },
      _count: { select: { programs: true } },
    },
  });

  console.log(`Total Department rows in DB: ${departments.length}`);
  console.log('='.repeat(90));

  for (const d of departments) {
    const isCanonical = CANONICAL_DEPARTMENT_CODES.has(d.code);
    const flag = isCanonical
      ? ''
      : '   <-- NOT one of the 5 canonical Academic Governance departments (possible stale/demo row)';

    console.log(`\n[${d.code}] ${d.nameEn}${flag}`);
    console.log(`  id: ${d.id}`);
    console.log(`  isActive: ${d.isActive}`);
    console.log(`  faculty: ${d.faculty?.nameEn ?? '(none)'} (${d.faculty?.code ?? '-'})`);
    console.log(`  total linked Program rows (any status, any isActive): ${d._count.programs}`);

    const homepageCount = await prisma.program.count({
      where: { departmentId: d.id, isActive: true, approvalStatus: 'APPROVED' },
    });
    console.log(
      `  Programs matching the homepage's exact filter (isActive:true, approvalStatus:'APPROVED'): ${homepageCount}   <-- this is the number the homepage card actually shows`
    );

    const allPrograms = await prisma.program.findMany({
      where: { departmentId: d.id },
      select: { code: true, nameEn: true, level: true, isActive: true, approvalStatus: true },
      orderBy: { code: 'asc' },
    });

    if (allPrograms.length === 0) {
      console.log('      (no Program rows reference this department at all)');
    } else {
      for (const p of allPrograms) {
        console.log(
          `      - [${p.code}] ${p.nameEn} (${p.level})  isActive=${p.isActive}  approvalStatus=${p.approvalStatus}`
        );
      }
    }
  }

  console.log('\n' + '='.repeat(90));

  const dbCodes = new Set(departments.map((d) => d.code));
  const missingCanonical = [...CANONICAL_DEPARTMENT_CODES].filter((c) => !dbCodes.has(c));
  const extraNonCanonical = departments.filter((d) => !CANONICAL_DEPARTMENT_CODES.has(d.code));

  console.log(`\nCanonical (Academic Governance) codes missing from DB: ${missingCanonical.length ? missingCanonical.join(', ') : 'none'}`);
  console.log(
    `Non-canonical / extra Department rows found: ${extraNonCanonical.length ? extraNonCanonical.map((d) => `${d.code} (${d.nameEn}, isActive=${d.isActive})`).join('; ') : 'none'}`
  );

  const activeDepartments = departments.filter((d) => d.isActive);
  console.log(
    `\nDepartments with isActive=true -- this is the set + count the public /api/academic/departments route (and therefore the homepage) actually returns: ${activeDepartments.length}`
  );
  for (const d of activeDepartments) {
    console.log(`  - [${d.code}] ${d.nameEn}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
