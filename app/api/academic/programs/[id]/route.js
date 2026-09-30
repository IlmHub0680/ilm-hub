import { prisma } from '@/lib/prisma';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// Public programme detail page's data source — real Program +
// Faculty/Department + Course curriculum, no mock content. Only active
// programmes are exposed (matches the public list endpoint's isActive
// filter in ../route.js).
//
// Model 12 additions: each course now also carries its real
// prerequisites (Course.prerequisites was always in the schema but was
// never populated until Model 12's seed) and its real approvalStatus,
// and the programme now carries a real, deduplicated list of the
// instructors actually assigned to its published courses (InstructorCourse
// joined through to each instructor's own Instructor Profile) — not
// invented "faculty" copy.
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        faculty: { select: { nameEn: true, nameAr: true, code: true } },
        department: { select: { nameEn: true, nameAr: true, code: true } },
        category: { select: { nameEn: true, nameAr: true } },
        coordinator: { select: { user: { select: { name: true } } } },
        // Goals tab -- real ProgramLearningOutcome rows, ordered by
        // their own code (e.g. PLO1, PLO2, ...). An empty array is the
        // honest, fully-supported state for a programme whose outcomes
        // haven't been published yet -- the page shows that plainly
        // rather than inventing goals text.
        learningOutcomes: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
          select: { id: true, code: true, statementEn: true, statementAr: true },
        },
        courses: {
          // A course at DRAFT/UNDER_REVIEW/RETURNED_FOR_REVISION never
          // appears on a public programme page, even if left isPublished
          // true -- confirmed live on real seed data (IS-304, IE-402,
          // IE-405, IC-301, IC-402 are all isPublished but UNDER_REVIEW).
          where: { isPublished: true, approvalStatus: 'APPROVED' },
          orderBy: [{ semesterLevel: 'asc' }, { courseCode: 'asc' }],
          select: {
            id: true,
            titleEn: true,
            courseCode: true,
            creditHours: true,
            semesterLevel: true,
            approvalStatus: true,
            // Course Description tab -- Course.descriptionEn is a
            // required field on every course (never null), so this is
            // always real, department-authored text, never a fallback.
            descriptionEn: true,
            prerequisites: {
              select: { id: true, courseCode: true, titleEn: true },
              orderBy: { courseCode: 'asc' },
            },
            instructors: {
              select: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    staffProfile: {
                      select: {
                        title: true,
                        specialization: true,
                        yearsExperience: true,
                        position: { select: { nameEn: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program || !program.isActive || program.approvalStatus !== 'APPROVED') {
      return jsonResponse({ success: false, error: 'Programme not found.' }, 404);
    }

    const totalCreditHours = program.courses.reduce((sum, c) => sum + (c.creditHours || 0), 0);

    // "Levels" stat tile -- the real, distinct semesterLevel values
    // this programme's own published courses actually use, not a
    // guessed or hardcoded count. A course with no semesterLevel set
    // contributes nothing here, same honesty rule as totalCreditHours
    // above (a missing value is left out, never coerced into a 0).
    const levelCount = new Set(
      program.courses.map((c) => c.semesterLevel).filter((lvl) => lvl != null)
    ).size;

    // Real, deduplicated instructor roster across every course this
    // programme actually has assigned — never a placeholder "faculty"
    // list. A brand-new course (or one with no InstructorCourse row
    // yet) simply contributes nothing here; the page shows that as an
    // honest empty state rather than inventing names.
    const instructorMap = new Map();
    for (const course of program.courses) {
      for (const ic of course.instructors) {
        const inst = ic.instructor;
        if (!inst || instructorMap.has(inst.id)) continue;
        instructorMap.set(inst.id, {
          id: inst.id,
          name: inst.name,
          title: inst.staffProfile?.title || null,
          position: inst.staffProfile?.position?.nameEn || null,
          specialization: inst.staffProfile?.specialization || null,
          yearsExperience: inst.staffProfile?.yearsExperience ?? null,
        });
      }
    }

    return jsonResponse({
      success: true,
      data: {
        id: program.id,
        name: program.nameEn,
        nameAr: program.nameAr,
        code: program.code,
        level: program.level,
        duration: program.durationYears
          ? `${program.durationYears} Year${program.durationYears === 1 ? '' : 's'}`
          : 'Flexible',
        description: program.descriptionEn || '',
        descriptionAr: program.descriptionAr || '',
        faculty: program.faculty ? { name: program.faculty.nameEn, code: program.faculty.code } : null,
        department: program.department ? { name: program.department.nameEn, code: program.department.code } : null,
        specialization: program.category ? program.category.nameEn : null,
        coordinator: program.coordinator?.user?.name || null,
        approvalStatus: program.approvalStatus,
        totalCreditHours,
        levelCount,
        weeksPerLevel: program.weeksPerLevel ?? null,
        studyMode: program.studyMode || null,
        learningOutcomes: program.learningOutcomes.map((lo) => ({
          id: lo.id,
          code: lo.code,
          statement: lo.statementEn,
          statementAr: lo.statementAr || null,
        })),
        courses: program.courses.map((c) => ({
          id: c.id,
          title: c.titleEn,
          code: c.courseCode,
          creditHours: c.creditHours,
          semesterLevel: c.semesterLevel,
          approvalStatus: c.approvalStatus,
          description: c.descriptionEn || '',
          prerequisites: c.prerequisites.map((p) => ({ id: p.id, code: p.courseCode, title: p.titleEn })),
        })),
        instructors: Array.from(instructorMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      },
    });
  } catch (error) {
    console.error('Failed to load programme detail:', error);
    return jsonResponse(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
