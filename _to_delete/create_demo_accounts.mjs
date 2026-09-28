import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Demo accounts for confirming role-based functionality while building.
// These are throwaway credentials the user already told me exist in their
// own notes -- I'm just materializing the missing User/StaffProfile/
// StudentProfile rows for them, matching the real Position codes already
// seeded by prisma/seed.js (seedPositions), and the real Faculty/
// Department/Program rows already in the database. Every password here
// should be changed before the site goes live -- this script only exists
// to unblock functional testing.

const STAFF_DEMOS = [
  { email: 'demo.coordinator@ilmhub.edu', password: 'DemoCoordinator123!', name: 'Demo Programme Coordinator', positionCode: 'PC' },
  { email: 'demo.registry@ilmhub.edu', password: 'DemoRegistry123!', name: 'Demo Registrar', positionCode: 'REGISTRAR_OFFICER' },
  { email: 'demo.ict@ilmhub.edu', password: 'DemoICT123!', name: 'Demo ICT Officer', positionCode: 'ICT_OFFICER' },
  { email: 'demo.librarian@ilmhub.edu', password: 'DemoLibrarian123!', name: 'Demo Librarian', positionCode: 'LIBRARIAN' },
  { email: 'demo.finance@ilmhub.edu', password: 'DemoFinance123!', name: 'Demo Finance Officer', positionCode: 'FINANCE_OFFICER' },
  { email: 'demo.instructor@ilmhub.edu', password: 'DemoInstructor123!', name: 'Demo Instructor', positionCode: 'INST' },
  { email: 'demo.qa@ilmhub.edu', password: 'DemoQA123!', name: 'Demo QA Officer', positionCode: 'QA_OFFICER' },
  { email: 'demo.studentaffairs@ilmhub.edu', password: 'DemoStudentAffairs123!', name: 'Demo Student Affairs Officer', positionCode: 'STUDENT_AFFAIRS_OFFICER' },
  { email: 'demo.dean@ilmhub.edu', password: 'DemoDean123!', name: 'Demo Dean', positionCode: 'DEAN' },
  { email: 'demo.hod@ilmhub.edu', password: 'DemoHOD123!', name: 'Demo Head of Department', positionCode: 'HOD' },
  { email: 'demo.academydirector@ilmhub.edu', password: 'DemoAcademyDirector123!', name: 'Demo Academy Director', positionCode: 'ACADEMY_DIRECTOR' },
];

const STUDENT_DEMO = {
  email: 'demo.student@ilmhub.edu',
  password: 'DemoStudent123!',
  name: 'Demo Student',
};

let employeeCounter = 1;

async function ensureUser(email, name, password, role) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    console.log(`  - ${normalizedEmail} already exists, skipping user creation`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      authorStatus: 'PENDING',
      updatedAt: now,
    },
  });

  console.log(`  + created User ${normalizedEmail}`);
  return user;
}

async function ensureStaff(demo, faculty, department) {
  const user = await ensureUser(demo.email, demo.name, demo.password, 'INSTRUCTOR');

  const existingProfile = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  if (existingProfile) {
    console.log(`    (StaffProfile already exists for ${demo.email})`);
    return;
  }

  const position = await prisma.position.findUnique({ where: { code: demo.positionCode } });
  if (!position) {
    console.warn(`    WARNING: Position code "${demo.positionCode}" not found -- run prisma/seed.js first. Skipping StaffProfile for ${demo.email}.`);
    return;
  }

  const employeeNo = `DEMO-${String(employeeCounter).padStart(3, '0')}`;
  employeeCounter += 1;

  await prisma.staffProfile.create({
    data: {
      userId: user.id,
      facultyId: faculty?.id || null,
      departmentId: department?.id || null,
      positionId: position.id,
      employeeNo,
      title: demo.name,
      isActive: true,
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });

  console.log(`    + created StaffProfile (${demo.positionCode}, ${employeeNo})`);
}

async function ensureStudent(demo, faculty, department, program) {
  const user = await ensureUser(demo.email, demo.name, demo.password, 'STUDENT');

  const existingProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (existingProfile) {
    console.log(`    (StudentProfile already exists for ${demo.email})`);
    return;
  }

  await prisma.studentProfile.create({
    data: {
      userId: user.id,
      studentNo: 'DEMO-STU-001',
      facultyId: faculty?.id || null,
      departmentId: department?.id || null,
      programId: program?.id || null,
      level: 1,
      admissionYear: new Date().getFullYear(),
      status: 'ACTIVE',
    },
  });

  console.log(`    + created StudentProfile`);
}

async function main() {
  const faculty = await prisma.faculty.findFirst();
  const department = await prisma.department.findFirst();
  const program = await prisma.program.findFirst();

  if (!faculty || !department) {
    console.warn('WARNING: No Faculty/Department found -- run prisma/seed.js first for full staff profiles.');
  }

  console.log('=== Staff demo accounts ===');
  for (const demo of STAFF_DEMOS) {
    console.log(`${demo.email}:`);
    await ensureStaff(demo, faculty, department);
  }

  console.log('');
  console.log('=== Student demo account ===');
  console.log(`${STUDENT_DEMO.email}:`);
  await ensureStudent(STUDENT_DEMO, faculty, department, program);

  console.log('');
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
