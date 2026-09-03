import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DOCUMENT_FIELDS = {
  identityDocument: 'identityDocumentUrl',
  passportPicture: 'passportPictureUrl',
  transcripts: 'transcriptsUrl',
  certificate: 'certificateUrl',
  testimonial: 'testimonialUrl',
  recommendation: 'recommendationUrl',
};

function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: String(message),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

function safeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120);
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const applicationId = String(
      formData.get('applicationId') || ''
    ).trim();

    if (!applicationId) {
      return errorResponse('Application ID is required.');
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: { id: applicationId },
      });

    if (!application) {
      return errorResponse(
        'Admission application not found.',
        404
      );
    }

    if (
      application.status !== 'PENDING_PAYMENT' &&
      application.status !== 'PAID'
    ) {
      return errorResponse(
        'Documents can no longer be uploaded for this application.',
        400
      );
    }

    const uploaded = {};

    for (const [field, databaseField] of Object.entries(
      DOCUMENT_FIELDS
    )) {
      const file = formData.get(field);

      if (!(file instanceof File) || file.size === 0) {
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(
          `${field} exceeds the 10MB file size limit.`
        );
      }

      const originalName = safeFileName(
        file.name || `${field}.file`
      );

      const extension = originalName.includes('.')
        ? originalName.substring(
            originalName.lastIndexOf('.')
          )
        : '';

      const key =
        `admissions/${applicationId}/${field}-${crypto.randomUUID()}${extension}`;

      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      await uploadToR2(
        key,
        buffer,
        file.type || 'application/octet-stream'
      );

      uploaded[databaseField] = key;
    }

    if (Object.keys(uploaded).length === 0) {
      return errorResponse(
        'No valid documents were uploaded.'
      );
    }

    const updated =
      await prisma.admissionApplication.update({
        where: { id: applicationId },
        data: uploaded,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Documents uploaded successfully.',
        data: {
          applicationId: updated.id,
          documents: uploaded,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'Admission document upload error:',
      error
    );

    return errorResponse(
      error?.message ||
        'Unable to upload admission documents.',
      500
    );
  }
}
