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

// Public Faculty directory (Model 15, Section 10) -- real StaffProfile
// rows, restricted to active staff in an academic position. Never
// exposes email, phone, employee number, salary, or any other private
// staff data -- only what's appropriate for a public teaching profile.
export async function GET() {
  try {
    const staff = await prisma.staffProfile.findMany({
      where: {
        isActive: true,
        position: { isAcademic: true },
        // Model 21, Section 10/3 -- only profiles the staff member (or
        // an admin on their behalf) explicitly marked public. Having a
        // bio/photo on file is no longer enough by itself -- isPublic
        // is the actual publish flag.
        isPublic: true,
        OR: [{ bio: { not: null } }, { photoUrl: { not: null } }],
      },
      orderBy: { user: { name: 'asc' } },
      select: {
        id: true,
        title: true,
        specialization: true,
        yearsExperience: true,
        bio: true,
        photoUrl: true,
        user: { select: { name: true } },
        position: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
      },
    });

    return jsonResponse({
      success: true,
      data: staff.map((s) => ({
        id: s.id,
        name: s.user.name,
        title: s.title || s.position?.nameEn || null,
        position: s.position?.nameEn || null,
        department: s.department?.nameEn || null,
        faculty: s.faculty?.nameEn || null,
        specialization: s.specialization || null,
        yearsExperience: s.yearsExperience ?? null,
        bio: s.bio || null,
        photoUrl: s.photoUrl || null,
      })),
    });
  } catch (error) {
    console.error('Failed to load public faculty directory:', error);
    return jsonResponse(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}
