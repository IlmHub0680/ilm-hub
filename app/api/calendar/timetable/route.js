import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionType = searchParams.get('session') || 'Morning';

    const timetableData = {
      academicYear: '2026 Academic Year',
      currentSemester: 'Semester 1',
      sessionType: sessionType,
      schedule: [
        { day: 'Monday', time: '9:00 AM - 10:30 AM', course: 'Hadith Studies', instructor: 'Ahmad Ibrahim', location: 'Online (Google Meet)', link: 'https://meet.google.com/abc-defg-hij' },
        { day: 'Monday', time: '11:00 AM - 12:30 PM', course: "Quarter of Al-Akhdari", instructor: 'Mahmud Hassan', location: 'Hall A', link: null },
        { day: 'Tuesday', time: '9:00 AM - 10:30 AM', course: "Juz'u Naba'", instructor: 'Umar Faruq', location: 'Online (Google Meet)', link: 'https://meet.google.com/xyz-uvwx-rst' }
      ],
      vacationPeriods: [
        { name: 'Inter-Semester Break', startDate: '2026-04-01', endDate: '2026-04-30', resumptionDate: '2026-05-01' }
      ]
    };

    return NextResponse.json({ success: true, data: timetableData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, courseCode, day, startTime, endTime, instructorId, session } = body;

    if (action === 'create_timetable') {
      return NextResponse.json({
        success: true,
        message: 'Timetable entry created and submitted for review.',
        data: {
          timetableId: 'TBL-' + Math.floor(1000 + Math.random() * 9000),
          courseCode,
          day,
          startTime,
          endTime,
          instructorId,
          session,
          status: 'Pending Approval'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
