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

// Public Academic Departments list (Model 15, Section 5) -- real
// Department rows, the same authoritative table every dashboard and
// approval workflow already reads. No invented department-like
// categories: only rows that exist in the real academic structure.
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        code: true,
        description: true,
        faculty: { select: { nameEn: true, code: true } },
        head: { select: { user: { select: { name: true } }, title: true } },
        _count: {
          select: {
            programs: { where: { isActive: true, approvalStatus: 'APPROVED' } },
          },
        },
      },
    });

    return jsonResponse({
      success: true,
      data: departments.map((d) => ({
        id: d.id,
        name: d.nameEn,
        nameAr: d.nameAr,
        code: d.code,
        description: d.description || '',
        faculty: d.faculty?.nameEn || null,
        head: d.head?.user?.name || null,
        headTitle: d.head?.title || null,
        programCount: d._count.programs,
      })),
    });
  } catch (error) {
    console.error('Failed to load academic departments:', error);
    return jsonResponse(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
