import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const SETTINGS_ID = 'default-admission-fees';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function serializeFees(settings) {
  return {
    juniorGhana: Number(settings.juniorGhana),
    seniorGhana: Number(settings.seniorGhana),
    matureGhana: Number(settings.matureGhana),
    juniorInternational: Number(settings.juniorInternational),
    seniorInternational: Number(settings.seniorInternational),
    matureInternational: Number(settings.matureInternational),
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.admissionFeeSettings.findUnique({
      where: {
        id: SETTINGS_ID,
      },
    });

    if (!settings) {
      return json(
        {
          success: false,
          error: 'Admission fee settings have not been configured.',
        },
        404
      );
    }

    return json({
      success: true,
      data: serializeFees(settings),
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') {
      return json(
        {
          success: false,
          error: 'Unauthorized.',
        },
        401
      );
    }

    if (error?.message === 'FORBIDDEN') {
      return json(
        {
          success: false,
          error: 'Admin access required.',
        },
        403
      );
    }

    console.error('GET admission fees error:', error);

    return json(
      {
        success: false,
        error: 'Failed to load admission fees.',
      },
      500
    );
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const fields = [
      'juniorGhana',
      'seniorGhana',
      'matureGhana',
      'juniorInternational',
      'seniorInternational',
      'matureInternational',
    ];

    const values = {};

    for (const field of fields) {
      const value = Number(body[field]);

      if (!Number.isFinite(value) || value < 0) {
        return json(
          {
            success: false,
            error: `${field} must be a valid non-negative number.`,
          },
          400
        );
      }

      values[field] = value;
    }

    const settings = await prisma.admissionFeeSettings.upsert({
      where: {
        id: SETTINGS_ID,
      },
      update: values,
      create: {
        id: SETTINGS_ID,
        ...values,
      },
    });

    return json({
      success: true,
      data: serializeFees(settings),
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') {
      return json(
        {
          success: false,
          error: 'Unauthorized.',
        },
        401
      );
    }

    if (error?.message === 'FORBIDDEN') {
      return json(
        {
          success: false,
          error: 'Admin access required.',
        },
        403
      );
    }

    console.error('PUT admission fees error:', error);

    return json(
      {
        success: false,
        error: 'Failed to save admission fees.',
      },
      500
    );
  }
}
