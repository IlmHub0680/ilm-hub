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

// Public Faculty profile detail (Model 15, Section 10) -- real
// StaffProfile plus the real, published courses actually assigned to
// this person via InstructorCourse. Never exposes email/phone/employee
// number. Only staff in an academic position are reachable here.
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        position: { select: { nameEn: true, isAcademic: true } },
        department: { select: { id: true, nameEn: true } },
        faculty: { select: { nameEn: true } },
      },
    });

    // Model 21, Section 10/3 -- isPublic is the actual publish flag; a
    // bio or photo being on file is necessary but no longer sufficient.
    const isPubliclyVisible = Boolean(staff?.isPublic) && (Boolean(staff?.bio) || Boolean(staff?.photoUrl));
    if (!staff || !staff.isActive || !staff.position?.isAcademic || !isPubliclyVisible) {
      return jsonResponse({ success: false, error: 'Faculty profile not found.' }, 404);
    }

    const teaching = await prisma.instructorCourse.findMany({
      where: {
        instructorId: staff.user.id,
        course: { isPublished: true, approvalStatus: 'APPROVED' },
      },
      select: {
        course: {
          select: {
            id: true,
            titleEn: true,
            courseCode: true,
            programId: true,
            program: { select: { nameEn: true } },
          },
        },
      },
    });

    return jsonResponse({
      success: true,
      data: {
        id: staff.id,
        name: staff.user.name,
        title: staff.title || staff.position?.nameEn || null,
        position: staff.position?.nameEn || null,
        department: staff.department ? { id: staff.department.id, name: staff.department.nameEn } : null,
        faculty: staff.faculty?.nameEn || null,
        specialization: staff.specialization || null,
        yearsExperience: staff.yearsExperience ?? null,
        languages: staff.languages || [],
        bio: staff.bio || null,
        photoUrl: staff.photoUrl || null,
        coursesTaught: teaching.map((t) => ({
          id: t.course.id,
          title: t.course.titleEn,
          code: t.course.courseCode,
          programId: t.course.programId,
          programName: t.course.program?.nameEn || null,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to load faculty profile detail:', error);
    return jsonResponse(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
