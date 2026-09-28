import { prisma } from '@/lib/prisma';
import { getR2PresignedUrl } from '@/lib/r2';

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// Applicant-facing: a short-lived download link for the finalized
// Letter of Admission, looked up the same way the rest of the
// tracking page works -- by application number alone, no account
// required. Only ever returns a presigned URL to the current
// FINALIZED pdf; a DRAFT letter (still under staff review) is never
// reachable from here.
export async function POST(request) {
  try {
    const body = await request.json();

    const applicationNumber =
      typeof body.applicationNumber === 'string' ? body.applicationNumber.trim() : '';

    if (!applicationNumber) {
      return response({ success: false, error: 'Application number is required.' }, 400);
    }

    const application = await prisma.admissionApplication.findUnique({
      where: { applicationNumber },
      select: { id: true, status: true },
    });

    if (!application) {
      return response(
        { success: false, error: 'No admission application was found with that application number.' },
        404
      );
    }

    if (application.status !== 'APPROVED') {
      return response(
        { success: false, error: 'Your Letter of Admission is only available after a final admission decision.' },
        409
      );
    }

    const letter = await prisma.admissionLetter.findUnique({
      where: { applicationId: application.id },
    });

    if (!letter || letter.status !== 'FINALIZED' || !letter.pdfUrl) {
      return response(
        { success: false, error: 'Your Letter of Admission has not been issued yet. Please check back soon.' },
        404
      );
    }

    const url = await getR2PresignedUrl(letter.pdfUrl, 300);

    return response({ success: true, data: { url } });
  } catch (error) {
    console.error('Admission letter tracking download error:', error);

    return response(
      { success: false, error: 'Unable to retrieve your Letter of Admission right now.' },
      500
    );
  }
}
