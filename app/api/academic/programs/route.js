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

function formatProgramme(program) {
  return {
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
    status: program.isActive ? 'Active' : 'Inactive',
    coordinator: program.coordinator?.user?.name || 'Unassigned',
    faculty: program.faculty?.nameEn || null,
    department: program.department?.nameEn || null,
    departmentId: program.department?.id || null,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'programs';

    if (type !== 'programs') {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid resource type requested',
        },
        400
      );
    }

    const programmes = await prisma.program.findMany({
      where: {
        isActive: true,
        // A programme sitting at DRAFT/UNDER_REVIEW/RETURNED_FOR_REVISION
        // must never be publicly listed, even if left isActive -- backend
        // permissions stay authoritative rather than relying on the UI to
        // hide it (Model 15 Section 28).
        approvalStatus: 'APPROVED',
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        code: true,
        level: true,
        durationYears: true,
        descriptionEn: true,
        descriptionAr: true,
        isActive: true,
        faculty: { select: { nameEn: true } },
        department: { select: { id: true, nameEn: true } },
        coordinator: { select: { user: { select: { name: true } } } },
      },
    });

    return jsonResponse({
      success: true,
      data: programmes.map(formatProgramme),
    });
  } catch (error) {
    console.error('Failed to load academic programmes:', error);

    return jsonResponse(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      500
    );
  }
}

