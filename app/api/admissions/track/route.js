import { prisma } from '@/lib/prisma';

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const applicationNumber =
      typeof body.applicationNumber === 'string'
        ? body.applicationNumber.trim()
        : '';

    if (!applicationNumber) {
      return response(
        {
          success: false,
          error: 'Application number is required.',
        },
        400
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          applicationNumber,
        },
        include: {
          payment: true,
        },
      });

    if (!application) {
      return response(
        {
          success: false,
          error:
            'No admission application was found with that application number.',
        },
        404
      );
    }

    const isSubmitted =
      application.status === 'UNDER_REVIEW' ||
      application.status === 'APPROVED' ||
      application.status === 'REJECTED';

    return response({
      success: true,
      data: {
        applicationNumber: application.applicationNumber,
        applicantName: application.fullName,

        programme: application.programName,
        programmeLevel: application.programLevel,
        studySession: application.studySession,

        status: application.status,

        paymentStatus:
          application.payment?.status || 'PENDING',

        paymentGateway:
          application.payment?.gateway || null,

        paymentMethod:
          application.payment?.method || null,

        paidAt:
          application.paidAt ||
          application.payment?.paidAt ||
          null,

        submittedAt: isSubmitted
          ? application.updatedAt
          : null,

        createdAt: application.createdAt,

        documents: {
          identityDocument: Boolean(
            application.identityDocumentUrl
          ),
          passportPicture: Boolean(
            application.passportPictureUrl
          ),
          transcripts: Boolean(
            application.transcriptsUrl
          ),
          certificate: Boolean(
            application.certificateUrl
          ),
          testimonial: Boolean(
            application.testimonialUrl
          ),
          recommendation: Boolean(
            application.recommendationUrl
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      'Admission tracking error:',
      error
    );

    return response(
      {
        success: false,
        error:
          error?.message ||
          'Unable to retrieve admission application status.',
      },
      500
    );
  }
}
