import 'dotenv/config';
import { prisma } from './lib/prisma.js';

// Read-only diagnostic for the "Staff Portal" vs "Student Portal" header
// bug. Prints:
//   1. Total StudentProfile row count.
//   2. First 5 StudentProfile rows: id, userId, and the linked User's
//      role, plus whether that same User also has a StaffProfile row
//      (and its isActive flag) -- since getAccountDestination() gives
//      a real, active StaffProfile priority over student status.
//   3. For each of those users, exactly what getHeaderDestination()'s
//      own first-branch query would resolve to, so we can see what
//      the header would actually render for real accounts.
//
// Run with:  node check_student_portal_header.mjs

async function main() {
  const total = await prisma.studentProfile.count();
  console.log(`Total StudentProfile rows: ${total}`);

  const profiles = await prisma.studentProfile.findMany({
    take: 5,
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          staffProfile: {
            select: { id: true, isActive: true, status: true },
          },
        },
      },
    },
  });

  if (profiles.length === 0) {
    console.log('No StudentProfile rows found in the database at all.');
    return;
  }

  console.log('\nFirst up to 5 StudentProfile rows:');
  for (const p of profiles) {
    console.log('---');
    console.log(`StudentProfile.id:      ${p.id}`);
    console.log(`StudentProfile.userId:  ${p.userId}`);
    console.log(`User.id:                ${p.user?.id}`);
    console.log(`User.email:             ${p.user?.email}`);
    console.log(`User.role:              ${p.user?.role}`);
    if (p.user?.staffProfile) {
      console.log(
        `StaffProfile:           EXISTS (isActive=${p.user.staffProfile.isActive}, status=${p.user.staffProfile.status})`
      );
    } else {
      console.log('StaffProfile:           none');
    }

    const directHit = await prisma.studentProfile.findUnique({
      where: { userId: p.userId },
      select: { id: true },
    });
    console.log(
      `getHeaderDestination() first-branch lookup -> ${
        directHit ? 'FOUND (would return Student Portal)' : 'NULL (would fall through to getAccountDestination)'
      }`
    );
  }
}

main()
  .catch((error) => {
    console.error('Diagnostic script failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
