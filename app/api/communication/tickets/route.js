import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'EP2026001';

    const communicationData = {
      userId: userId,
      announcements: [
        { id: 'ANN-01', title: 'Semester 1 Resumption Notice', category: 'Academic', date: '2026-07-28', priority: 'High' }
      ],
      tickets: [
        { ticketId: 'TCK-1002', subject: 'Payment Receipt Verification', category: 'Payment', status: 'In Progress', updated: '2026-07-29' }
      ]
    };

    return NextResponse.json({ success: true, data: communicationData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, subject, category, description, priority, userId } = body;

    if (action === 'create_ticket') {
      return NextResponse.json({
        success: true,
        message: 'Support ticket created successfully and set to Open.',
        data: {
          ticketId: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
          userId,
          subject,
          category,
          description,
          priority: priority || 'Normal',
          status: 'Open'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
