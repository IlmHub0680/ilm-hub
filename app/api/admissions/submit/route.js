import { prisma } from "@/lib/prisma";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const applicationId =
      typeof body.applicationId === "string"
        ? body.applicationId.trim()
        : "";

    if (!applicationId) {
      return response(
        {
          success: false,
          error:
            "Application ID is required.",
        },
        400
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id: applicationId,
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
            "Admission application not found.",
        },
        404
      );
    }

    /*
     * Idempotency.
     *
     * Once an application has entered review or has
     * already been approved, repeated submission requests
     * should not create an error.
     */
    if (
      application.status === "UNDER_REVIEW" ||
      application.status === "APPROVED"
    ) {
      return response({
        success: true,

        message:
          "Your admission application has already been submitted.",

        data: {
          applicationId:
            application.id,

          applicationNumber:
            application.applicationNumber,

          status:
            application.status,
        },
      });
    }

    /*
     * The application can only be submitted after
     * the payment has been independently verified.
     *
     * Both records must say PAID.
     */
    if (
      !application.payment ||
      application.payment.status !== "PAID" ||
      application.status !== "PAID"
    ) {
      return response(
        {
          success: false,
          error:
            "Your admission payment must be completed before submitting the application.",
        },
        400
      );
    }

    /*
     * Required documents.
     *
     * Every applicant:
     * - identity document
     * - passport picture
     *
     * Diploma in Islamic Studies:
     * - transcripts
     * - certificate
     * - testimonial
     * - recommendation letter
     */
    const requiredDocuments = [
      [
        "identityDocumentUrl",
        "identity document",
      ],

      [
        "passportPictureUrl",
        "passport picture",
      ],
    ];

    const isDiploma =
      application.programLevel === "DIPLOMA";

    if (isDiploma) {
      requiredDocuments.push(
        [
          "transcriptsUrl",
          "transcripts",
        ],

        [
          "certificateUrl",
          "certificate",
        ],

        [
          "testimonialUrl",
          "testimonial",
        ],

        [
          "recommendationUrl",
          "recommendation letter",
        ]
      );
    }

    const missing =
      requiredDocuments
        .filter(
          ([field]) =>
            !application[field]
        )
        .map(
          ([, label]) =>
            label
        );

    if (missing.length > 0) {
      return response(
        {
          success: false,
          error:
            `Please upload all required documents: ${missing.join(
              ", "
            )}.`,
        },
        400
      );
    }

    /*
     * Final transition:
     *
     * PAID -> UNDER_REVIEW
     *
     * We use a conditional update so that a repeated
     * request cannot accidentally move an application
     * from some unrelated state into review.
     */
    const updated =
      await prisma.admissionApplication.updateMany({
        where: {
          id: applicationId,
          status: "PAID",
        },

        data: {
          status: "UNDER_REVIEW",
        },
      });

    if (updated.count !== 1) {
      /*
       * Another request may have submitted it between
       * the initial read and this update.
       *
       * Re-read the application and return the appropriate
       * idempotent result.
       */
      const latest =
        await prisma.admissionApplication.findUnique({
          where: {
            id: applicationId,
          },
        });

      if (
        latest?.status ===
          "UNDER_REVIEW" ||
        latest?.status === "APPROVED"
      ) {
        return response({
          success: true,

          message:
            "Your admission application has already been submitted.",

          data: {
            applicationId:
              latest.id,

            applicationNumber:
              latest.applicationNumber,

            status:
              latest.status,
          },
        });
      }

      return response(
        {
          success: false,
          error:
            "The admission application could not be submitted. Please try again.",
        },
        409
      );
    }

    const finalApplication =
      await prisma.admissionApplication.findUnique({
        where: {
          id: applicationId,
        },
      });

    return response({
      success: true,

      message:
        "Your admission application has been submitted successfully.",

      data: {
        applicationId:
          finalApplication.id,

        applicationNumber:
          finalApplication.applicationNumber,

        status:
          finalApplication.status,
      },
    });
  } catch (error) {
    console.error(
      "Admission application submission error:",
      error
    );

    return response(
      {
        success: false,
        error:
          error?.message ||
          "Unable to submit admission application.",
      },
      500
    );
  }
}
