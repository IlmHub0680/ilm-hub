import { prisma } from '@/lib/prisma';

// The one real source of admissible academic programmes for the
// Admissions & Application System (Model 16) -- backed directly by
// the Program model that Academy Data (Model 15) owns.
//
// Before this file existed, three admissions routes (Paystack
// initialize, Stripe initialize, and the fee-preview /register route)
// validated the applicant's chosen programme against a second,
// hardcoded list in lib/academic-programmes.js (six fake
// "prog-01".."prog-06" ids that had no relationship to any real
// Program row). The admission form itself already loaded its
// programme dropdown from the real Academy Data via
// GET /api/academic/programs, so a real programme id selected there
// could never match the fake list -- every payment initialization
// was failing with "Please select a valid academic programme."
// lib/academic-programmes.js has been removed; this is the only
// programme lookup admissions code should use from here on.
//
// "Admissible" means exactly what the public programme list at
// GET /api/academic/programs already requires before listing a
// programme to applicants: isActive AND approvalStatus === 'APPROVED'.
// There is currently no separate "open for new applications right
// now" flag on Program, distinct from the programme simply existing
// -- a programme is either live/approved and open, or it isn't
// listed at all. If a real enrollment-window concept (e.g. "Diploma
// intake closes March 1") is wanted later, that belongs as a new
// field on Program in Academy Data, not as something Admissions
// tracks on its own.
export async function getAdmissibleProgram(programId) {
  if (!programId || typeof programId !== 'string') {
    return null;
  }

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: {
      id: true,
      nameEn: true,
      nameAr: true,
      level: true,
      isActive: true,
      approvalStatus: true,
      departmentId: true,
      facultyId: true,
    },
  });

  if (!program || !program.isActive || program.approvalStatus !== 'APPROVED') {
    return null;
  }

  return {
    id: program.id,
    name: program.nameEn,
    nameAr: program.nameAr,
    level: program.level,
    departmentId: program.departmentId,
    facultyId: program.facultyId,
  };
}
