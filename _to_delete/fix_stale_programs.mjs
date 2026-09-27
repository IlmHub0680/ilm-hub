import { prisma } from '../lib/prisma.js';

const STALE_CODES = ['JLP', 'FND', 'INT', 'CRT', 'DIP'];
const REAL_DIPLOMA_CODE = 'DIPLOMA-ISLAMIC-STUDIES';

async function main() {
  // 1. Move the demo student off the stale JLP programme onto the real
  //    Diploma in Islamic Studies programme (that student only ended up
  //    on JLP because my own demo-account script picked "the first
  //    Program row it found", which happened to be this old leftover one).
  const realDiploma = await prisma.program.findUnique({ where: { code: REAL_DIPLOMA_CODE } });
  if (!realDiploma) {
    console.error(`Real programme "${REAL_DIPLOMA_CODE}" not found -- aborting, nothing changed.`);
    process.exit(1);
  }

  const demoStudent = await prisma.studentProfile.findFirst({
    where: { user: { email: 'demo.student@ilmhub.edu' } },
  });

  if (demoStudent) {
    await prisma.studentProfile.update({
      where: { id: demoStudent.id },
      data: {
        programId: realDiploma.id,
        facultyId: realDiploma.facultyId,
        departmentId: realDiploma.departmentId,
      },
    });
    console.log(`Moved demo.student@ilmhub.edu onto ${REAL_DIPLOMA_CODE}.`);
  } else {
    console.log('No demo student found to move (already moved or missing).');
  }

  // 2. Deactivate (not delete) all 5 stale programme rows -- isActive:
  //    false immediately removes them from the public admission picker
  //    (app/api/academic/programs already filters on isActive: true),
  //    while keeping the rows themselves intact in case anything still
  //    references them by id.
  for (const code of STALE_CODES) {
    const program = await prisma.program.findUnique({ where: { code } });
    if (!program) {
      console.log(`${code}: not found, skipping.`);
      continue;
    }
    await prisma.program.update({
      where: { code },
      data: { isActive: false },
    });
    console.log(`${code} (${program.nameEn}): deactivated.`);
  }

  console.log('');
  console.log('Done. The admission programme picker should now show only your real 5 programmes.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
