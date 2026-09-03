import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAcademicProgrammeById } from "@/lib/academic-programmes";

const SETTINGS_ID = "default-admission-fees";

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function calculateAge(dob) {
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
}

function getCategory(age) {
  if (age >= 4 && age <= 13) return "Junior Learner";
  if (age >= 15 && age <= 20) return "Senior Learner";
  if (age >= 21) return "Mature Learner";
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const dob =
      typeof body.dob === "string"
        ? body.dob.trim()
        : "";

    const nationality =
      typeof body.nationality === "string"
        ? body.nationality.trim()
        : "";

    const countryOfResidence =
      typeof body.countryOfResidence === "string"
        ? body.countryOfResidence.trim()
        : "";

    const programId =
      typeof body.programId === "string"
        ? body.programId.trim()
        : "";

    const studySession =
      typeof body.studySession === "string"
        ? body.studySession.trim()
        : "";

    if (
      !fullName ||
      !email ||
      !dob ||
      !countryOfResidence ||
      !programId
    ) {
      return response(
        {
          success: false,
          error:
            "Full name, email, date of birth, country of residence and programme are required.",
        },
        400
      );
    }

    const programme =
      getAcademicProgrammeById(programId);

    if (!programme) {
      return response(
        {
          success: false,
          error: "Please select a valid academic programme.",
        },
        400
      );
    }

    const age = calculateAge(dob);

    if (age === null) {
      return response(
        {
          success: false,
          error: "Invalid date of birth.",
        },
        400
      );
    }

    const learnerCategory = getCategory(age);

    if (!learnerCategory) {
      return response(
        {
          success: false,
          error:
            "Applicant does not fall within an eligible learner age category.",
        },
        400
      );
    }

    const settings =
      await prisma.admissionFeeSettings.findUnique({
        where: {
          id: SETTINGS_ID,
        },
      });

    if (!settings) {
      return response(
        {
          success: false,
          error:
            "Admission fee settings are not configured by the administrator.",
        },
        500
      );
    }

    const isGhanaResident =
      countryOfResidence.toLowerCase() === "ghana";

    const currencyCode =
      isGhanaResident ? "GHS" : "USD";

    let amount;

    if (isGhanaResident) {
      if (learnerCategory === "Junior Learner") {
        amount = Number(settings.juniorGhana);
      } else if (
        learnerCategory === "Senior Learner"
      ) {
        amount = Number(settings.seniorGhana);
      } else {
        amount = Number(settings.matureGhana);
      }
    } else {
      if (learnerCategory === "Junior Learner") {
        amount = Number(settings.juniorInternational);
      } else if (
        learnerCategory === "Senior Learner"
      ) {
        amount = Number(settings.seniorInternational);
      } else {
        amount = Number(settings.matureInternational);
      }
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return response(
        {
          success: false,
          error: "Invalid admission fee configuration.",
        },
        500
      );
    }

    /*
     * Paystack currently processes the institution's
     * Paystack admission payment in GHS.
     *
     * International USD admission fees are converted
     * using the configured PAYSTACK_USD_GHS_RATE.
     */
    let paystackAmount = amount;
    let paystackCurrency = currencyCode;

    if (currencyCode === "USD") {
      const rate = Number(
        process.env.PAYSTACK_USD_GHS_RATE
      );

      if (!Number.isFinite(rate) || rate <= 0) {
        return response(
          {
            success: false,
            error:
              "PAYSTACK_USD_GHS_RATE is missing or invalid.",
          },
          500
        );
      }

      paystackAmount = amount * rate;
      paystackCurrency = "GHS";
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        {
          success: false,
          error: "Paystack is not configured.",
        },
        500
      );
    }

    const applicationNumber =
      `ILM-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

    const application =
      await prisma.admissionApplication.create({
        data: {
          applicationNumber,
          email,
          fullName,
          dateOfBirth: new Date(dob),
          gender: body.gender || "",
          nationality,
          countryOfResidence,
          phoneNumber: body.phoneNumber || "",
          idNumber: body.idNumber || "",
          residentialAddress:
            body.residentialAddress || "",

          applicantCategory:
            body.applicantCategory ||
            learnerCategory,

          guardianName:
            body.guardianName || "",
          guardianPhone:
            body.guardianPhone || "",
          guardianRelationship:
            body.guardianRelationship || "",

          emergencyName:
            body.emergencyName || "",
          emergencyPhone:
            body.emergencyPhone || "",
          emergencyRelationship:
            body.emergencyRelationship || "",

          highestEducation:
            body.highestEducation || "",
          institutionName:
            body.institutionName || "",

          programId: programme.id,
          programName: programme.name,
          programLevel: programme.level,
          studySession,

          identityDocType:
            body.identityDocType || "",

          admissionFee: amount,
          currencyCode,
          feeBasis: isGhanaResident
            ? "Ghana Resident Rate"
            : "International Resident Rate",

          status: "PENDING_PAYMENT",
        },
      });

    const reference =
      `ADM-${application.id}-${Date.now()}`;

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${secretKey}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            amount: Math.round(
              paystackAmount * 100
            ),
            currency: paystackCurrency,
            reference,
            callback_url:
              `${process.env.NEXT_PUBLIC_APP_URL || ""}/admission`,
            metadata: {
              applicationId:
                application.id,
              applicationNumber,
              programId: programme.id,
              admissionFee: amount,
              admissionCurrency:
                currencyCode,
            },
          }),
        }
      );

    const result =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !result.status ||
      !result.data
    ) {
      await prisma.admissionApplication.update({
        where: {
          id: application.id,
        },
        data: {
          status: "REJECTED",
        },
      });

      return response(
        {
          success: false,
          error:
            result.message ||
            "Unable to initialize Paystack payment.",
        },
        400
      );
    }

    await prisma.admissionPayment.create({
      data: {
        applicationId:
          application.id,
        gateway: "PAYSTACK",
        method: "VISA",
        status: "PENDING",
        amount: paystackAmount,
        currencyCode:
          paystackCurrency,
        gatewayReference:
          result.data.reference,
        checkoutReference:
          result.data.access_code,
        authorizationUrl:
          result.data.authorization_url,
      },
    });

    return response({
      success: true,
      data: {
        applicationId:
          application.id,
        applicationNumber,
        reference:
          result.data.reference,
        accessCode:
          result.data.access_code,
        authorizationUrl:
          result.data.authorization_url,
        amount: paystackAmount,
        currency:
          paystackCurrency,
        admissionFee: amount,
        admissionCurrency:
          currencyCode,
      },
    });
  } catch (error) {
    console.error(
      "Admission Paystack initialization error:",
      error
    );

    return response(
      {
        success: false,
        error:
          error?.message ||
          "Unable to initialize admission payment.",
      },
      500
    );
  }
}
