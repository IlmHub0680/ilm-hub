import { prisma } from '../lib/prisma.js';

const checks = [
  ['User', () => prisma.user.count()],
  ['StudentProfile', () => prisma.studentProfile.count()],
  ['StaffProfile', () => prisma.staffProfile.count()],
  ['Program', () => prisma.program.count()],
  ['Course', () => prisma.course.count()],
  ['Category', () => prisma.category.count()],
  ['Faculty', () => prisma.faculty.count()],
  ['Department', () => prisma.department.count()],
  ['AcademicSession', () => prisma.academicSession.count()],
  ['AcademicTerm', () => prisma.academicTerm.count()],
  ['Unit', () => prisma.unit.count()],
  ['HomepageHero', () => prisma.homepageHero.count()],
  ['HomepageHeroBanner', () => prisma.homepageHeroBanner.count()],
  ['SectionBanner', () => prisma.sectionBanner.count()],
  ['AdmissionApplication', () => prisma.admissionApplication.count()],
  ['Country', () => prisma.country.count()],
];

console.log('=== Row counts across key tables ===');
for (const [name, fn] of checks) {
  try {
    const count = await fn();
    console.log(`${name}: ${count}`);
  } catch (err) {
    console.log(`${name}: ERROR - ${err.message.split('\n')[0]}`);
  }
}

await prisma.$disconnect();
