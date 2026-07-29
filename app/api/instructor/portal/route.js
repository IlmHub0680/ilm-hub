import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId') || 'INST-2026-01';

    const instructorData = {
      profile: {
        fullName: 'Ahmad Ibrahim',
        staffId: instructorId,
        position: 'Head of Department',
        department: 'Islamic Sciences',
        email: 'ahmad.ibrahim@ilmhub.edu',
        phone: '+233 24 111 2222'
      },
      assignedCourses: [
        { code: 'HAD-101', name: 'Hadith Studies', studentsCount: 45, semester: 'Semester 1' },
        { code: 'FIQ-101', name: 'Fiqh', studentsCount: 38, semester: 'Semester 1' }
      ],
      financials: {
        totalEarnings: 'GHS 4,500',
        pendingPayments: 'GHS 1,500',
        approvedPayments: 'GHS 3,000',
        status: 'Active'
      }
    };

    return NextResponse.json({ success: true, data: instructorData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
