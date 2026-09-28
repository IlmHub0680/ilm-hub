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
          program: { include: { department: true } },
          // Only ever surface APPLICANT_VISIBLE notes here -- INTERNAL
          // notes must never reach an applicant-facing route.
          notes: {
            where: { visibility: 'APPLICANT_VISIBLE' },
            orderBy: { createdAt: 'desc' },
            select: { id: true, note: true, createdAt: true },
          },
          // Only its FINALIZED status/existence is ever exposed here --
          // never the row's editable draft fields.
          admissionLetter: {
            select: { status: true },
          },
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
      application.status === 'INITIAL_ACCEPTANCE' ||
      application.status === 'PENDING_FINAL_APPROVAL' ||
      application.status === 'APPROVED' ||
      application.status === 'REJECTED';

    // Initial Acceptance and Pending Final Approval are real progress,
    // but neither one is final admission -- callers (the tracking
    // page) must say so plainly rather than letting the applicant
    // assume they've been admitted.
    const isFinalDecision =
      application.status === 'APPROVED' ||
      application.status === 'REJECTED';

    // A dynamic congratulations line built from this applicant's own
    // data -- never a hardcoded message -- for the tracking page to
    // show once approved (the same information already went out by
    // email when the decision was made).
    const congratulationsMessage =
      application.status === 'APPROVED'
        ? `Congratulations, ${application.fullName}! You have been admitted${
            application.program?.nameEn
              ? ` into ${application.program.nameEn}${
                  application.program.department?.nameEn
                    ? ` (${application.program.department.nameEn})`
                    : ''
                }`
              : ''
          } at Ulul Azm Institute.`
        : null;

    return response({
      success: true,
      data: {
        applicationNumber: application.applicationNumber,
        applicantName: application.fullName,

        programme: application.programName,
        programmeLevel: application.programLevel,
        studySession: application.studySession,

        status: application.status,
        isFinalDecision,
        congratulationsMessage,
        declineReason:
          application.status === 'REJECTED' ? application.declineReason || null : null,

        // Applicant-visible notes staff have left on this application,
        // most recent first. Internal notes are never included.
        notes: application.notes.map((n) => ({
          note: n.note,
          createdAt: n.createdAt,
        })),

        admissionLetterAvailable: application.admissionLetter?.status === 'FINALIZED',

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
