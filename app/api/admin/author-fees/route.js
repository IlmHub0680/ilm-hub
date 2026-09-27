import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Institution-wide Author Application Fee — deliberately a separate
// singleton settings row from AdmissionFeeSettings (student admissions).
// Authors are not split by age tier the way student applicants are, so
// this only carries the Ghana / International resident distinction.
const SETTINGS_ID = 'default-author-fees';

// Sensible starting values so the settings row always exists — the
// Super Admin edits these from Admin > Author Application Fee rather
// than ever seeing a "not configured" dead end. Matches the amounts
// already used elsewhere in this codebase for author-fee examples.
const DEFAULT_SETTINGS = {
  ghana: 50,
  ghanaCurrency: 'GHS',
  international: 30,
  internationalCurrency: 'USD',
  isActive: true,
  description:
    'One-time non-refundable fee to process a new author application.',
  paymentMethod: 'Paystack',
  validityDays: null,
  effectiveDate: null,
};

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
    ghana: Number(settings.ghana),
    ghanaCurrency: settings.ghanaCurrency,
    international: Number(settings.international),
    internationalCurrency: settings.internationalCurrency,
    isActive: settings.isActive,
    description: settings.description || '',
    paymentMethod: settings.paymentMethod,
    validityDays: settings.validityDays,
    effectiveDate: settings.effectiveDate
      ? settings.effectiveDate.toISOString().slice(0, 10)
      : '',
    updatedAt: settings.updatedAt,
  };
}

// Ensures the singleton row exists. Author Application Fee settings
// should never present a "not configured" dead end to an admin (or
// silently block real applicants) just because nobody has saved the
// form yet — a fresh install gets sensible defaults immediately,
// which the Super Admin can then edit and save like any other value.
async function getOrCreateSettings() {
  return prisma.authorFeeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
  });
}

export async function GET() {
  try {
    await requireAdmin();

    const settings = await getOrCreateSettings();

    return json({
      success: true,
      data: serializeFees(settings),
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') {
      return json({ success: false, error: 'Unauthorized.' }, 401);
    }

    if (error?.message === 'FORBIDDEN') {
      return json({ success: false, error: 'Admin access required.' }, 403);
    }

    console.error('GET author fees error:', error);

    return json(
      { success: false, error: 'Failed to load author application fees.' },
      500
    );
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const numericFields = ['ghana', 'international'];
    const values = {};

    for (const field of numericFields) {
      const value = Number(body[field]);

      if (!Number.isFinite(value) || value < 0) {
        return json(
          { success: false, error: `${field} must be a valid non-negative number.` },
          400
        );
      }

      values[field] = value;
    }

    const ghanaCurrency = String(body.ghanaCurrency || 'GHS').trim().toUpperCase() || 'GHS';
    const internationalCurrency =
      String(body.internationalCurrency || 'USD').trim().toUpperCase() || 'USD';

    if (!/^[A-Z]{3}$/.test(ghanaCurrency) || !/^[A-Z]{3}$/.test(internationalCurrency)) {
      return json(
        { success: false, error: 'Currency codes must be 3-letter ISO codes (e.g. GHS, USD).' },
        400
      );
    }

    values.ghanaCurrency = ghanaCurrency;
    values.internationalCurrency = internationalCurrency;
    values.isActive = Boolean(body.isActive);
    values.description = body.description ? String(body.description).slice(0, 500) : null;
    values.paymentMethod = body.paymentMethod ? String(body.paymentMethod).slice(0, 100) : 'Paystack';

    if (body.validityDays !== undefined && body.validityDays !== null && body.validityDays !== '') {
      const validityDays = Number(body.validityDays);

      if (!Number.isFinite(validityDays) || validityDays <= 0 || !Number.isInteger(validityDays)) {
        return json(
          { success: false, error: 'Application validity must be a whole number of days greater than zero.' },
          400
        );
      }

      values.validityDays = validityDays;
    } else {
      values.validityDays = null;
    }

    if (body.effectiveDate) {
      const effectiveDate = new Date(body.effectiveDate);

      if (Number.isNaN(effectiveDate.getTime())) {
        return json({ success: false, error: 'Effective date is invalid.' }, 400);
      }

      values.effectiveDate = effectiveDate;
    } else {
      values.effectiveDate = null;
    }

    const settings = await prisma.authorFeeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: values,
      create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS, ...values },
    });

    return json({
      success: true,
      data: serializeFees(settings),
    });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') {
      return json({ success: false, error: 'Unauthorized.' }, 401);
    }

    if (error?.message === 'FORBIDDEN') {
      return json({ success: false, error: 'Admin access required.' }, 403);
    }

    console.error('PUT author fees error:', error);

    return json(
      { success: false, error: 'Failed to save author application fees.' },
      500
    );
  }
}
