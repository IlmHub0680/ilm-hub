import Stripe from 'stripe';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAcademicProgrammeById } from '@/lib/academic-programmes';

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
      'Admission fee settings are not configured by the administrator.'
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
      'Invalid international admission fee configuration.'
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
      getAcademicProgrammeById(programId);

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

    const applicationNumber =
      `ILM-${Date.now()}-${crypto
        .randomBytes(3)
        .toString('hex')
        .toUpperCase()}`;

    /*
     * Create the admission application first.
     * The application remains PENDING_PAYMENT
     * until Stripe confirms payment.
     */
    const application =
      await prisma.admissionApplication.create({
        data: {
          applicationNumber,
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

          admissionFee:
            fee.amount,

          currencyCode:
            'USD',

          feeBasis:
            fee.feeBasis,

          status:
            'PENDING_PAYMENT',
        },
      });

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
                  'ILM Hub Admission Fee',

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

    await prisma.admissionPayment.create({
      data: {
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
