import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 'EP2026001';

    const studentData = {
      profile: {
        fullName: 'Khalid Muhammad',
        studentId: studentId,
        programme: 'Foundation Programme',
        currentSemester: 'Semester 1',
        session: 'Morning',
        status: 'Active Student',
        email: 'khalid@student.ilmhub.edu',
        phone: '+233 24 000 0000'
      },
      finances: {
        totalFees: 1000,
        paid: 700,
        balance: 300,
        status: 'Partially Paid'
      },
      nextClass: {
        course: 'Hadith Studies',
        instructor: 'Ahmad Ibrahim',
        time: 'Monday 9:00 AM',
        meetingUrl: 'https://meet.google.com/abc-defg-hij'
      },
      courses: [
        { code: 'HAD-101', title: 'Quarter of 40 Hadith', status: 'Enrolled' },
        { code: 'FIQ-101', title: 'Quarter of Al-Akhdari', status: 'Enrolled' },
        { code: 'QUR-101', title: "Juz'u Naba'", status: 'Enrolled' }
      ]
    };

    return NextResponse.json({ success: true, data: studentData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
