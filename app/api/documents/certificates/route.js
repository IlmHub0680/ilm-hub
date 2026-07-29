import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 'EP2026001';

    const certificateData = {
      studentId: studentId,
      certificates: [
        {
          certificateId: 'CERT-2026-00001',
          programme: 'Diploma in Islamic Sciences',
          completionDate: '2026-07-15',
          status: 'Available',
          downloadUrl: '/api/documents/download?id=CERT-2026-00001'
        }
      ],
      transcripts: [
        {
          transcriptId: 'TR-2026-001',
          status: 'Approved & Available',
          issuedDate: '2026-07-20'
        }
      ]
    };

    return NextResponse.json({ success: true, data: certificateData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, studentId, programmeName, documentType } = body;

    if (action === 'request_document') {
      return NextResponse.json({
        success: true,
        message: 'Document request submitted successfully and set to Pending Review.',
        data: {
          requestId: 'DOC-REQ-' + Math.floor(1000 + Math.random() * 9000),
          studentId,
          programmeName,
          documentType,
          status: 'Pending Review'
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
