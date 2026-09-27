import { NextResponse } from 'next/server';

// In-memory or database handler placeholder for Ilm Hub Institute Academic Management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'programs';

    if (type === 'programs') {
      const defaultPrograms = [
        { id: 'prog-01', name: 'Junior Learners Programme', level: 'Junior', duration: '1 Year', status: 'Active', coordinator: 'Unassigned' },
        { id: 'prog-02', name: 'Foundation Programme', level: 'Foundation', duration: '1 Year', status: 'Active', coordinator: 'Unassigned' },
        { id: 'prog-03', name: 'Intermediate Programme', level: 'Intermediate', duration: '1 Year', status: 'Active', coordinator: 'Unassigned' },
        { id: 'prog-04', name: 'Certificate Programme (Specialised Studies)', level: 'Certificate', duration: 'Flexible (Max 6 courses)', status: 'Active', coordinator: 'Unassigned' },
        { id: 'prog-05', name: 'Diploma in Islamic Sciences', level: 'Diploma', duration: '2 Years', status: 'Active', coordinator: 'Unassigned' }
      ];
      return NextResponse.json({ success: true, data: defaultPrograms });
    }

    return NextResponse.json({ success: false, error: 'Invalid resource type requested' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, programName, level, description, courses } = body;

    // Handle curriculum submission or program creation workflow
    if (action === 'submit_curriculum') {
      return NextResponse.json({
        success: true,
        message: 'Curriculum proposal submitted successfully and set to Pending Approval.',
        status: 'Pending Approval'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Academic program created successfully.',
      data: { programName, level, description, status: 'Active' }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
