import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || 'HAD-101';

    const lmsCourseData = {
      courseCode: courseId,
      title: 'Hadith Studies',
      instructor: 'Ahmad Ibrahim',
      progress: '65%',
      nextLesson: 'Introduction to Forty Hadith',
      upcomingSession: {
        topic: 'Explanation of Hadith 1',
        date: 'Monday',
        time: '9:00 AM',
        meetingUrl: 'https://meet.google.com/abc-defg-hij'
      },
      materials: [
        { id: 'MAT-01', title: 'Hadith 1 Text & Translation (PDF)', type: 'document' },
        { id: 'MAT-02', title: 'Audio Commentary - Session 1', type: 'audio' }
      ],
      assignments: [
        { id: 'ASG-01', title: 'Memorization Test: First 10 Hadith', deadline: '2026-08-05', status: 'Pending Submission' }
      ]
    };

    return NextResponse.json({ success: true, data: lmsCourseData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, courseTitle, courseCode, instructorId, category } = body;

    if (action === 'create_course') {
      return NextResponse.json({
        success: true,
        message: 'Course created successfully and submitted for review.',
        data: {
          courseCode: courseCode || 'CRS-' + Math.floor(1000 + Math.random() * 9000),
          courseTitle,
          instructorId,
          category,
          status: 'Pending Approval'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
