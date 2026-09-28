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

// Public Department detail (Model 15, Section 5) -- real Department row
// plus its real, approved programmes. Courses are reached through each
// programme's own detail page rather than duplicated here.
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        faculty: { select: { nameEn: true, nameAr: true, code: true } },
        head: { select: { user: { select: { name: true } }, title: true } },
        programs: {
          where: { isActive: true, approvalStatus: 'APPROVED' },
          orderBy: { nameEn: 'asc' },
          select: { id: true, nameEn: true, nameAr: true, code: true, level: true, durationYears: true },
        },
      },
    });

    if (!department || !department.isActive) {
      return jsonResponse({ success: false, error: 'Department not found.' }, 404);
    }

    return jsonResponse({
      success: true,
      data: {
        id: department.id,
        name: department.nameEn,
        nameAr: department.nameAr,
        code: department.code,
        description: department.description || '',
        faculty: department.faculty
          ? { name: department.faculty.nameEn, nameAr: department.faculty.nameAr, code: department.faculty.code }
          : null,
        head: department.head?.user?.name || null,
        headTitle: department.head?.title || null,
        programs: department.programs.map((p) => ({
          id: p.id,
          name: p.nameEn,
          nameAr: p.nameAr,
          code: p.code,
          level: p.level,
          duration: p.durationYears ? `${p.durationYears} Year${p.durationYears === 1 ? '' : 's'}` : 'Flexible',
        })),
      },
    });
  } catch (error) {
    console.error('Failed to load department detail:', error);
    return jsonResponse(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
