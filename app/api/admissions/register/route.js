import { prisma } from '@/lib/prisma';
import {
  getAcademicProgrammeById,
} from '@/lib/academic-programmes';

const SETTINGS_ID = 'default-admission-fees';

function json(data, status = 200) {
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

    const {
      fullName,
      dob,
      nationality,
      countryOfResidence,
      programId,
      studySession,
    } = body;

    // Programme selection is optional for fee calculation.
    // If a programme is supplied, validate it before returning programme details.
    const programme = programId
      ? getAcademicProgrammeById(programId)
      : null;

    if (programId && !programme) {
      return json(
        {
          success: false,
          error: 'Please select a valid academic programme.',
        },
        400
      );
    }

    if (!fullName || !dob || !countryOfResidence) {
      return json(
        {
          success: false,
          error:
            'Full name, date of birth, and country of residence are required.',
        },
        400
      );
    }

    const birthDate = new Date(dob);

    if (Number.isNaN(birthDate.getTime())) {
      return json(
        {
          success: false,
          error: 'Invalid date of birth.',
        },
        400
      );
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    let category;

    if (age >= 4 && age <= 13) {
      category = 'Junior Learner';
    } else if (age >= 15 && age <= 20) {
      category = 'Senior Learner';
    } else if (age >= 21) {
      category = 'Mature Learner';
    } else {
      return json(
        {
          success: false,
          error:
            'Applicant does not fall within an eligible learner age category.',
        },
        400
      );
    }

    /*
     * IMPORTANT:
     *
     * Admission fee is determined ONLY by country of residence.
     *
     * Ghana:
     *   Junior -> juniorGhana
     *   Senior -> seniorGhana
     *   Mature -> matureGhana
     *
     * Outside Ghana:
     *   Junior -> juniorInternational
     *   Senior -> seniorInternational
     *   Mature -> matureInternational
     *
     * Nationality is NOT used to determine the fee.
     */

    const residence = countryOfResidence.trim().toLowerCase();
    const isGhanaResident = residence === 'ghana';

    const settings = await prisma.admissionFeeSettings.findUnique({
      where: {
        id: SETTINGS_ID,
      },
    });

    if (!settings) {
      return json(
        {
          success: false,
          error:
            'Admission fee settings are not configured by the administrator.',
        },
        500
      );
    }

    let amount;
    let currency;

    if (isGhanaResident) {
      currency = 'GHS';

      if (category === 'Junior Learner') {
        amount = Number(settings.juniorGhana);
      } else if (category === 'Senior Learner') {
        amount = Number(settings.seniorGhana);
      } else {
        amount = Number(settings.matureGhana);
      }
    } else {
      currency = 'USD';

      if (category === 'Junior Learner') {
        amount = Number(settings.juniorInternational);
      } else if (category === 'Senior Learner') {
        amount = Number(settings.seniorInternational);
      } else {
        amount = Number(settings.matureInternational);
      }
    }

    return json({
      success: true,
      data: {
        learnerCategory: category,
        age,
        currency,
        admissionFee: amount,
        countryOfResidence,
        nationality,
        programId: programme?.id || null,
        programName: programme?.name || null,
        programLevel: programme?.level || null,
        studySession,
        feeBasis: isGhanaResident
          ? 'Ghana Resident Rate'
          : 'International Resident Rate',
        status: 'Pending Payment',
      },
    });
  } catch (error) {
    console.error('Admission registration error:', error);

    return json(
      {
        success: false,
        error: error?.message || 'Unable to calculate admission fee.',
      },
      500
    );
  }
}
