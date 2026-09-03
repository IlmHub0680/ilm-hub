import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'status';

    if (endpoint === 'status') {
      const aiSystemStatus = {
        module: 'EPIS-015 AI Features & System Intelligence',
        status: 'Operational',
        enabledFeatures: [
          'AI Student Assistant',
          'AI Admission Assistant',
          'AI Course Recommendations',
          'AI Learning Assistant'
        ],
        securityCompliance: 'Strict Human-in-the-Loop Enforced (No automated grade/payment decisions)'
      };
      return NextResponse.json({ success: true, data: aiSystemStatus });
    } else if (endpoint === 'audit_logs') {
      const auditLogs = {
        logs: [
          { logId: 'LOG-9001', user: 'SuperAdmin Imam Muhammad', action: 'Certificate Approved', timestamp: '2026-07-29T23:30:00Z', ip: '192.168.1.50' }
        ]
      };
      return NextResponse.json({ success: true, data: auditLogs });
    }

    return NextResponse.json({ success: false, error: 'Invalid endpoint parameter' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, prompt, userRole } = body;

    if (action === 'query_ai_assistant') {
      return NextResponse.json({
        success: true,
        message: 'AI assistant response generated successfully.',
        data: {
          query: prompt,
          response: 'Based on your inquiry, the Foundation Programme offers courses in Hadith Studies, Fiqh, and Arabic Language. Please visit your student portal course registration page to enroll.',
          disclaimer: 'AI guidance is for informational purposes. Final approvals rest with institutional administration.'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
