import {
  getAcademicProgrammes,
} from '@/lib/academic-programmes';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'programs';

    if (type === 'programs') {
      return jsonResponse({
        success: true,
        data: getAcademicProgrammes(),
      });
    }

    return jsonResponse(
      {
        success: false,
        error: 'Invalid resource type requested',
      },
      400
    );
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      action,
      programName,
      level,
      description,
      courses,
    } = body;

    if (action === 'submit_curriculum') {
      return jsonResponse({
        success: true,
        message:
          'Curriculum proposal submitted successfully and set to Pending Approval.',
        status: 'Pending Approval',
      });
    }

    return jsonResponse({
      success: true,
      message: 'Academic program created successfully.',
      data: {
        programName,
        level,
        description,
        courses,
        status: 'Active',
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}
