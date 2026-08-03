import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || 'c1';

    // Mock data for your courses and students
    const courses = [
      {
        id: 'c1',
        title: 'Quranic Arabic',
        code: 'ARB101',
        quiz1Weight: 15,
        quiz2Weight: 15,
        assignWeight: 10,
        midtermWeight: 20,
        finalWeight: 40,
      },
      {
        id: 'c2',
        title: 'Hadith Terminology',
        code: 'HDT201',
        quiz1Weight: 20,
        quiz2Weight: 20,
        assignWeight: 10,
        midtermWeight: 20,
        finalWeight: 30,
      },
    ];

    const activeCourse = courses.find((c) => c.id === courseId) || courses[0];

    const students = [
      {
        studentId: 's1',
        studentName: 'Tariq ibn Ziyad',
        quiz1: 85,
        quiz2: 90,
        assignment: 88,
        midterm: 92,
        final: 95,
      },
      {
        studentId: 's2',
        studentName: 'Aisha bint Abi Bakr',
        quiz1: 92,
        quiz2: 88,
        assignment: 90,
        midterm: 85,
        final: 90,
      },
    ];

    return NextResponse.json({
      courses,
      activeCourseId: activeCourse.id,
      weights: {
        quiz1: activeCourse.quiz1Weight,
        quiz2: activeCourse.quiz2Weight,
        assignment: activeCourse.assignWeight,
        midterm: activeCourse.midtermWeight,
        final: activeCourse.finalWeight,
      },
      students,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch grades data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { courseId, grades } = body;

    // Here you would typically save 'grades' to your database for the given 'courseId'
    console.log(`Saved grades for course ${courseId}:`, grades);

    return NextResponse.json({ success: true, message: 'Grades saved successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save grades' }, { status: 500 });
  }
}