import { prisma } from "@/lib/prisma";
import { generateApplicationNumber } from "@/lib/applicationNumber";
import { getAdmissibleProgram } from "@/lib/academicProgram";

const SETTINGS_ID = "default-admission-fees";

const SELF_RATED_LEVELS = ["NONE", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFICIENT"];

function normalizeSelfLevel(value) {
  return typeof value === "string" && SELF_RATED_LEVELS.includes(value) ? value : null;
}


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
  if (age >= 4 && age <= 13) {
    return "Junior Learner";
  }

  if (age >= 15 && age <= 20) {
    return "Senior Learner";
  }

  if (age >= 21) {
    return "Mature Learner";
  }

  return null;
}

function getAdmissionFee(settings, learnerCategory, isGhanaResident) {
  if (isGhanaResident) {
    if (learnerCategory === "Junior Learner") {
      return Number(settings.juniorGhana);
    }

    if (learnerCategory === "Senior Learner") {
      return Number(settings.seniorGhana);
    }

    return Number(settings.matureGhana);
  }

  if (learnerCategory === "Junior Learner") {
    return Number(settings.juniorInternational);
  }

  if (learnerCategory === "Senior Learner") {
    return Number(settings.seniorInternational);
  }

  return Number(settings.matureInternational);
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
      await getAdmissibleProgram(programId);

    if (!programme) {
      return response(
        {
          success: false,
          error:
            "Please select a valid academic programme.",
        },
        400
      );
    }

    const birthDate = new Date(dob);

    if (Number.isNaN(birthDate.getTime())) {
      return response(
        {
          success: false,
          error: "Invalid date of birth.",
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
            "Application fee settings are not configured by the administrator.",
        },
        500
      );
    }

    const isGhanaResident =
      countryOfResidence.toLowerCase() === "ghana";

    /*
     * The application fee shown/stored on the application
     * is based ONLY on country of residence + learner category.
     *
     * Ghana resident:
     *   GHS
     *
     * International resident:
     *   USD
     */
    const admissionCurrency =
      isGhanaResident ? "GHS" : "USD";

    const admissionFee =
      getAdmissionFee(
        settings,
        learnerCategory,
        isGhanaResident
      );

    if (
      !Number.isFinite(admissionFee) ||
      admissionFee <= 0
    ) {
      return response(
        {
          success: false,
          error:
            "Invalid application fee configuration.",
        },
        500
      );
    }

    /*
     * Paystack payment representation.
     *
     * Ghana:
     *   admissionFee GHS -> Paystack GHS
     *
     * International:
     *   admissionFee USD
     *   -> configured USD/GHS rate
     *   -> Paystack GHS
     */
    let paystackAmount = admissionFee;
    let paystackCurrency = admissionCurrency;
    let exchangeRate = null;

    if (admissionCurrency === "USD") {
      exchangeRate = Number(
        process.env.PAYSTACK_USD_GHS_RATE
      );

      if (
        !Number.isFinite(exchangeRate) ||
        exchangeRate <= 0
      ) {
        return response(
          {
            success: false,
            error:
              "PAYSTACK_USD_GHS_RATE is missing or invalid.",
          },
          500
        );
      }

      paystackAmount =
        admissionFee * exchangeRate;

      paystackCurrency = "GHS";
    }

    if (
      !Number.isFinite(paystackAmount) ||
      paystackAmount <= 0
    ) {
      return response(
        {
          success: false,
          error:
            "Unable to calculate the Paystack payment amount.",
        },
        500
      );
    }

    /*
     * Paystack accepts the amount in the smallest currency unit.
     * For GHS this is pesewas, hence * 100.
     */
    const paystackAmountMinor =
      Math.round(paystackAmount * 100);

    if (paystackAmountMinor <= 0) {
      return response(
        {
          success: false,
          error:
            "Invalid Paystack payment amount.",
        },
        500
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        {
          success: false,
          error:
            "Paystack is not configured.",
        },
        500
      );
    }

    const existingPendingApplication =
      await prisma.admissionApplication.findFirst({
        where: {
          email,
          programId: programme.id,
          status: "PENDING_PAYMENT",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     * Store the application's advertised application fee
     * separately from the actual Paystack charge.
     *
     * Example international applicant:
     *
     * AdmissionApplication:
     *   admissionFee = 50
     *   currencyCode = USD
     *
     * AdmissionPayment:
     *   amount = 750
     *   currencyCode = GHS
     *
     * if USD/GHS rate = 15.
     */
    const applicationFieldsData = {
      email,
      fullName,
      dateOfBirth: birthDate,

      gender:
        typeof body.gender === "string"
          ? body.gender.trim()
          : "",

      nationality,

      countryOfResidence,

      phoneNumber:
        typeof body.phoneNumber === "string"
          ? body.phoneNumber.trim()
          : "",

      idNumber:
        typeof body.idNumber === "string"
          ? body.idNumber.trim()
          : "",

      residentialAddress:
        typeof body.residentialAddress === "string"
          ? body.residentialAddress.trim()
          : "",

      applicantCategory:
        typeof body.applicantCategory === "string" &&
        body.applicantCategory.trim()
          ? body.applicantCategory.trim()
          : learnerCategory,

      guardianName:
        typeof body.guardianName === "string"
          ? body.guardianName.trim()
          : "",

      guardianPhone:
        typeof body.guardianPhone === "string"
          ? body.guardianPhone.trim()
          : "",

      guardianRelationship:
        typeof body.guardianRelationship === "string"
          ? body.guardianRelationship.trim()
          : "",

      emergencyName:
        typeof body.emergencyName === "string"
          ? body.emergencyName.trim()
          : "",

      emergencyPhone:
        typeof body.emergencyPhone === "string"
          ? body.emergencyPhone.trim()
          : "",

      emergencyRelationship:
        typeof body.emergencyRelationship === "string"
          ? body.emergencyRelationship.trim()
          : "",

      highestEducation:
        typeof body.highestEducation === "string"
          ? body.highestEducation.trim()
          : "",

      institutionName:
        typeof body.institutionName === "string"
          ? body.institutionName.trim()
          : "",

      programId: programme.id,
      programName: programme.name,
      programLevel: programme.level,
      studySession,

      identityDocType:
        typeof body.identityDocType === "string"
          ? body.identityDocType.trim()
          : "",

      preferredName:
        typeof body.preferredName === "string" && body.preferredName.trim()
          ? body.preferredName.trim()
          : null,

      pathwayPreference:
        typeof body.pathwayPreference === "string" && body.pathwayPreference.trim()
          ? body.pathwayPreference.trim()
          : null,

      preferredDepartmentId:
        typeof body.preferredDepartmentId === "string" && body.preferredDepartmentId.trim()
          ? body.preferredDepartmentId.trim()
          : null,

      specialization:
        typeof body.specialization === "string" && body.specialization.trim()
          ? body.specialization.trim()
          : null,

      studyMode:
        body.studyMode === "FULL_TIME" || body.studyMode === "PART_TIME"
          ? body.studyMode
          : null,

      islamicStudiesBackground:
        typeof body.islamicStudiesBackground === "string" && body.islamicStudiesBackground.trim()
          ? body.islamicStudiesBackground.trim()
          : null,

      quranReadingSelf: normalizeSelfLevel(body.quranReadingSelf),
      quranTajweedSelf: normalizeSelfLevel(body.quranTajweedSelf),
      quranHifzSelf: normalizeSelfLevel(body.quranHifzSelf),
      quranRecitationSelf: normalizeSelfLevel(body.quranRecitationSelf),
      arabicReadingSelf: normalizeSelfLevel(body.arabicReadingSelf),
      arabicWritingSelf: normalizeSelfLevel(body.arabicWritingSelf),
      arabicGrammarSelf: normalizeSelfLevel(body.arabicGrammarSelf),
      arabicVocabularySelf: normalizeSelfLevel(body.arabicVocabularySelf),
      arabicConversationSelf: normalizeSelfLevel(body.arabicConversationSelf),
      quranicArabicSelf: normalizeSelfLevel(body.quranicArabicSelf),

      learningGoals:
        typeof body.learningGoals === "string" && body.learningGoals.trim()
          ? body.learningGoals.trim()
          : null,

      supportNeeds:
        typeof body.supportNeeds === "string" && body.supportNeeds.trim()
          ? body.supportNeeds.trim()
          : null,

      declarationAccepted: Boolean(body.declarationAccepted),
      declarationAcceptedAt: body.declarationAccepted ? new Date() : null,

      admissionFee,
      currencyCode: admissionCurrency,

      feeBasis: isGhanaResident
        ? "Ghana Resident Rate"
        : "International Resident Rate",
    };

    let application;
    let applicationNumber;

    if (existingPendingApplication) {
      /*
       * The same applicant already started (but never paid for) an
       * application for this same programme. Reuse that row instead
       * of creating a duplicate one on retry / double submit /
       * back-button resubmission.
       */
      applicationNumber = existingPendingApplication.applicationNumber;

      application =
        await prisma.admissionApplication.update({
          where: {
            id: existingPendingApplication.id,
          },
          data: applicationFieldsData,
        });
    } else {
      applicationNumber = await generateApplicationNumber();

      application =
        await prisma.admissionApplication.create({
          data: {
            applicationNumber,
            ...applicationFieldsData,
            status: "PENDING_PAYMENT",
          },
        });
    }

    const reference =
      `ADM-${application.id}-${Date.now()}`;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "";

    const callbackUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/admission`
      : undefined;

    const paystackBody = {
      email,
      amount: paystackAmountMinor,
      currency: paystackCurrency,
      reference,

      ...(callbackUrl
        ? {
            callback_url: callbackUrl,
          }
        : {}),

      metadata: {
        applicationId: application.id,
        applicationNumber,
        programId: programme.id,
        learnerCategory,

        /*
         * These identify the original admission price
         * independently from the Paystack charge.
         */
        admissionFee,
        admissionCurrency,

        /*
         * For international applicants this records
         * the configured conversion rate used.
         */
        ...(exchangeRate !== null
          ? {
              exchangeRate,
            }
          : {}),
      },
    };

    let paystackResponse;

    try {
      paystackResponse =
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
            body: JSON.stringify(
              paystackBody
            ),
          }
        );
    } catch (paystackError) {
      console.error(
        "Paystack initialization network error:",
        paystackError
      );

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
            "Unable to connect to Paystack.",
        },
        502
      );
    }

    let result;

    try {
      result =
        await paystackResponse.json();
    } catch {
      result = null;
    }

    if (
      !paystackResponse.ok ||
      !result?.status ||
      !result?.data
    ) {
      console.error(
        "Paystack initialization failed:",
        {
          status: paystackResponse.status,
          result,
          applicationId: application.id,
          reference,
        }
      );

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
            result?.message ||
            "Unable to initialize Paystack payment.",
        },
        400
      );
    }

    const paystackData = result.data;

    if (
      !paystackData.reference ||
      !paystackData.access_code ||
      !paystackData.authorization_url
    ) {
      console.error(
        "Paystack returned incomplete initialization data:",
        paystackData
      );

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
            "Paystack returned an incomplete payment initialization response.",
        },
        502
      );
    }

    /*
     * IMPORTANT:
     *
     * Store the exact amount/currency that Paystack
     * was initialized with.
     *
     * Verification will compare Paystack's final
     * transaction against THESE values.
     */
    await prisma.admissionPayment.upsert({
      where: {
        applicationId: application.id,
      },
      create: {
        applicationId: application.id,
        gateway: "PAYSTACK",
        method: "VISA",

        status: "PENDING",

        amount:
          paystackAmountMinor / 100,

        currencyCode:
          paystackCurrency,

        gatewayReference:
          paystackData.reference,

        checkoutReference:
          paystackData.access_code,

        authorizationUrl:
          paystackData.authorization_url,
      },
      update: {
        gateway: "PAYSTACK",
        method: "VISA",

        /*
         * A fresh Paystack session was just initialized for this
         * (possibly reused) application, so any previous payment
         * attempt is superseded. Reset it to PENDING regardless of
         * its prior state.
         */
        status: "PENDING",

        amount:
          paystackAmountMinor / 100,

        currencyCode:
          paystackCurrency,

        gatewayReference:
          paystackData.reference,

        checkoutReference:
          paystackData.access_code,

        authorizationUrl:
          paystackData.authorization_url,

        transactionId: null,
        paidAt: null,
      },
    });

    return response({
      success: true,
      data: {
        applicationId:
          application.id,

        applicationNumber,

        reference:
          paystackData.reference,

        accessCode:
          paystackData.access_code,

        authorizationUrl:
          paystackData.authorization_url,

        /*
         * Actual amount sent to Paystack.
         */
        amount:
          paystackAmountMinor / 100,

        currency:
          paystackCurrency,

        /*
         * Original application fee.
         */
        admissionFee,

        admissionCurrency,

        learnerCategory,

        ...(exchangeRate !== null
          ? {
              exchangeRate,
            }
          : {}),
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
