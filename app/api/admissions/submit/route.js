import { prisma } from '@/lib/prisma';

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const applicationId =
      typeof body.applicationId === 'string'
        ? body.applicationId.trim()
        : '';

    if (!applicationId) {
      return response(
        {
          success: false,
          error: 'Application ID is required.',
        },
        400
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
        include: { payment: true },
      });

    if (!application) {
      return response(
        {
          success: false,
          error: 'Admission application not found.',
        },
        404
      );
    }

    /*
     * Final submission is idempotent.
     *
     * If the applicant has already submitted the application,
     * refreshing the page or submitting again must not produce
     * an error.
     */
    if (
      application.status === 'UNDER_REVIEW' ||
      application.status === 'APPROVED'
    ) {
      return response({
        success: true,
        message:
          'Your admission application has already been submitted.',
        data: {
          applicationId: application.id,
          applicationNumber:
            application.applicationNumber,
          status: application.status,
        },
      });
    }

    /*
     * Payment must be completely verified before final submission.
     */
    if (
      !application.payment ||
      application.payment.status !== 'PAID' ||
      application.status !== 'PAID'
    ) {
      return response(
        {
          success: false,
          error:
            'Your admission payment must be completed before submitting the application.',
        },
        400
      );
    }

    /*
     * Required documents.
     *
     * Every applicant needs:
     * - identity document
     * - passport picture
     *
     * Diploma applicants additionally need:
     * - transcripts
     * - certificate
     * - testimonial
     * - recommendation letter
     */
    const requiredDocuments = [
      ['identityDocumentUrl', 'identity document'],
      ['passportPictureUrl', 'passport picture'],
    ];

    const isDiploma =
      application.programName ===
      'Diploma in Islamic Sciences';

    if (isDiploma) {
      requiredDocuments.push(
        ['transcriptsUrl', 'transcripts'],
        ['certificateUrl', 'certificate'],
        ['testimonialUrl', 'testimonial'],
        ['recommendationUrl', 'recommendation letter']
      );
    }

    const missing = requiredDocuments
      .filter(([field]) => !application[field])
      .map(([, label]) => label);

    if (missing.length > 0) {
      return response(
        {
          success: false,
          error:
            `Please upload all required documents: ${missing.join(', ')}.`,
        },
        400
      );
    }

    /*
     * Move the paid application into the review queue.
     */
    const updated =
      await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: 'UNDER_REVIEW',
        },
      });

    return response({
      success: true,
      message:
        'Your admission application has been submitted successfully.',
      data: {
        applicationId: updated.id,
        applicationNumber:
          updated.applicationNumber,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error(
      'Admission application submission error:',
      error
    );

    return response(
      {
        success: false,
        error:
          error?.message ||
          'Unable to submit admission application.',
      },
      500
    );
  }
}
