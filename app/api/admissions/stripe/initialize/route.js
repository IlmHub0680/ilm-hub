import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { generateApplicationNumber } from '@/lib/applicationNumber';
import { getAdmissibleProgram } from '@/lib/academicProgram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SETTINGS_ID = 'default-admission-fees';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is missing.');
  }

  return new Stripe(key);
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
    return 'Junior Learner';
  }

  if (age >= 15 && age <= 20) {
    return 'Senior Learner';
  }

  if (age >= 21) {
    return 'Mature Learner';
  }

  return null;
}

async function calculateInternationalFee(dob, countryOfResidence) {
  const age = calculateAge(dob);

  if (age === null) {
    throw new Error('Invalid date of birth.');
  }

  const learnerCategory = getCategory(age);

  if (!learnerCategory) {
    throw new Error(
      'Applicant does not fall within an eligible learner age category.'
    );
  }

  const settings =
    await prisma.admissionFeeSettings.findUnique({
      where: {
        id: SETTINGS_ID,
      },
    });

  if (!settings) {
    throw new Error(
      'Application fee settings are not configured by the administrator.'
    );
  }

  const residence =
    countryOfResidence.trim().toLowerCase();

  if (residence === 'ghana') {
    throw new Error(
      'Ghana residents must use Paystack.'
    );
  }

  let amount;

  if (learnerCategory === 'Junior Learner') {
    amount = Number(settings.juniorInternational);
  } else if (learnerCategory === 'Senior Learner') {
    amount = Number(settings.seniorInternational);
  } else {
    amount = Number(settings.matureInternational);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      'Invalid international application fee configuration.'
    );
  }

  return {
    amount,
    currency: 'USD',
    learnerCategory,
    age,
    feeBasis: 'International Resident Rate',
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === 'string'
        ? body.fullName.trim()
        : '';

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    const dob =
      typeof body.dob === 'string'
        ? body.dob.trim()
        : '';

    const nationality =
      typeof body.nationality === 'string'
        ? body.nationality.trim()
        : '';

    const countryOfResidence =
      typeof body.countryOfResidence === 'string'
        ? body.countryOfResidence.trim()
        : '';

    const programId =
      typeof body.programId === 'string'
        ? body.programId.trim()
        : '';

    const studySession =
      typeof body.studySession === 'string'
        ? body.studySession.trim()
        : '';

    if (
      !fullName ||
      !email ||
      !dob ||
      !countryOfResidence ||
      !programId
    ) {
      return json(
        {
          success: false,
          error:
            'Full name, email, date of birth, country of residence and programme are required.',
        },
        400
      );
    }

    const programme =
      await getAdmissibleProgram(programId);

    if (!programme) {
      return json(
        {
          success: false,
          error:
            'Please select a valid academic programme.',
        },
        400
      );
    }

    const residence =
      countryOfResidence.toLowerCase();

    if (residence === 'ghana') {
      return json(
        {
          success: false,
          error:
            'Ghana residents must use Paystack.',
        },
        400
      );
    }

    const fee =
      await calculateInternationalFee(
        dob,
        countryOfResidence
      );

    const existingPendingApplication =
      await prisma.admissionApplication.findFirst({
        where: {
          email,
          programId: programme.id,
          status: 'PENDING_PAYMENT',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    /*
     * Create the admission application first.
     * The application remains PENDING_PAYMENT
     * until Stripe confirms payment.
     */
    const SELF_RATED_LEVELS = ['NONE', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFICIENT'];

function normalizeSelfLevel(value) {
  return typeof value === 'string' && SELF_RATED_LEVELS.includes(value) ? value : null;
}

    const applicationFieldsData = {
      email,
      fullName,
      dateOfBirth: new Date(dob),

      gender: body.gender || '',
      nationality,
      countryOfResidence,

      phoneNumber:
        body.phoneNumber || '',

      idNumber:
        body.idNumber || '',

      residentialAddress:
        body.residentialAddress || '',

      applicantCategory:
        body.applicantCategory ||
        fee.learnerCategory,

      guardianName:
        body.guardianName || '',

      guardianPhone:
        body.guardianPhone || '',

      guardianRelationship:
        body.guardianRelationship || '',

      emergencyName:
        body.emergencyName || '',

      emergencyPhone:
        body.emergencyPhone || '',

      emergencyRelationship:
        body.emergencyRelationship || '',

      highestEducation:
        body.highestEducation || '',

      institutionName:
        body.institutionName || '',

      programId:
        programme.id,

      programName:
        programme.name,

      programLevel:
        programme.level,

      studySession,

      identityDocType:
        body.identityDocType || '',

      preferredName:
        body.preferredName || null,

      pathwayPreference:
        body.pathwayPreference || null,

      preferredDepartmentId:
        body.preferredDepartmentId || null,

      specialization:
        body.specialization || null,

      studyMode:
        body.studyMode === 'FULL_TIME' || body.studyMode === 'PART_TIME'
          ? body.studyMode
          : null,

      islamicStudiesBackground:
        body.islamicStudiesBackground || null,

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
        body.learningGoals || null,

      supportNeeds:
        body.supportNeeds || null,

      declarationAccepted: Boolean(body.declarationAccepted),
      declarationAcceptedAt: body.declarationAccepted ? new Date() : null,

      admissionFee:
        fee.amount,

      currencyCode:
        'USD',

      feeBasis:
        fee.feeBasis,
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
            status:
              'PENDING_PAYMENT',
          },
        });
    }

    const stripe =
      getStripe();

    const session =
      await stripe.checkout.sessions.create({
        mode: 'payment',

        customer_email:
          email,

        currency: 'usd',

        line_items: [
          {
            price_data: {
              currency: 'usd',

              product_data: {
                name:
                  'Ulul Azm Application Fee',

                description:
                  `${programme.name} - ${fee.learnerCategory}`,
              },

              unit_amount:
                Math.round(
                  fee.amount * 100
                ),
            },

            quantity: 1,
          },
        ],

        metadata: {
          admissionApplicationId:
            application.id,

          applicationId:
            application.id,

          applicationNumber,

          programId:
            programme.id,

          admissionFee:
            String(fee.amount),

          admissionCurrency:
            'USD',
        },

        success_url:
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/admission?stripe_session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.NEXT_PUBLIC_APP_URL || ''}/admission?payment=cancelled`,
      });

    if (!session.url) {
      await prisma.admissionApplication.update({
        where: {
          id: application.id,
        },

        data: {
          status: 'REJECTED',
        },
      });

      return json(
        {
          success: false,
          error:
            'Stripe did not return a checkout URL.',
        },
        500
      );
    }

    await prisma.admissionPayment.upsert({
      where: {
        applicationId: application.id,
      },
      create: {
        applicationId:
          application.id,

        gateway:
          'STRIPE',

        method:
          'VISA',

        status:
          'PENDING',

        amount:
          fee.amount,

        currencyCode:
          'USD',

        gatewayReference:
          session.payment_intent
            ? String(session.payment_intent)
            : null,

        checkoutReference:
          session.id,

        authorizationUrl:
          session.url,
      },
      update: {
        gateway:
          'STRIPE',

        method:
          'VISA',

        /*
         * A fresh Stripe session was just created for this
         * (possibly reused) application, so any previous payment
         * attempt is superseded. Reset it to PENDING regardless of
         * its prior state.
         */
        status:
          'PENDING',

        amount:
          fee.amount,

        currencyCode:
          'USD',

        gatewayReference:
          session.payment_intent
            ? String(session.payment_intent)
            : null,

        checkoutReference:
          session.id,

        authorizationUrl:
          session.url,

        transactionId: null,
        paidAt: null,
      },
    });

    return json({
      success: true,

      data: {
        applicationId:
          application.id,

        applicationNumber,

        sessionId:
          session.id,

        checkoutUrl:
          session.url,

        authorizationUrl:
          session.url,

        amount:
          fee.amount,

        currency:
          'USD',

        admissionFee:
          fee.amount,

        admissionCurrency:
          'USD',

        feeBasis:
          fee.feeBasis,
      },
    });
  } catch (error) {
    console.error(
      'Admission Stripe initialization error:',
      error
    );

    return json(
      {
        success: false,
        error:
          error?.message ||
          'Unable to initialize Stripe admission payment.',
      },
      500
    );
  }
}
