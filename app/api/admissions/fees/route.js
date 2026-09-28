import { prisma } from '@/lib/prisma';
import { requireAdmissionsView, requireAdmissionsEdit } from '@/lib/permissions';

// Student Admission Application Fee — the professionally correct home
// for this is Admission & Registration (the office that actually runs
// admissions day to day), not Admin/Super Admin. This mirrors the
// same "oversight vs. operation" split already documented in
// lib/permissions.ts for the ADMISSIONS module: Admin/Super Admin can
// VIEW (oversight, at /admin/admission-fees, read-only), while
// Admissions/Registry staff — and Super Admin — can EDIT here and at
// /registry-dashboard/fees. There is deliberately only one API route
// and one settings row for this; the old Admin-only
// app/api/admin/admission-fees route has been retired in favour of
// this one so the fee is never configured in two places at once.
const SETTINGS_ID = 'default-admission-fees';

// Sensible starting values so this settings row always exists —
// Admission & Registration staff edit these from
// /registry-dashboard/fees rather than ever seeing a "not
// configured" dead end (same auto-provision-on-read pattern used by
// AuthorFeeSettings / RoyaltySettings elsewhere in this app).
const DEFAULT_FEES = {
  juniorGhana: 50,
  seniorGhana: 80,
  matureGhana: 100,
  juniorInternational: 20,
  seniorInternational: 30,
  matureInternational: 40,
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
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

async function getOrCreateSettings() {
  return prisma.admissionFeeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, ...DEFAULT_FEES },
  });
}

export async function GET() {
  try {
    await requireAdmissionsView();

    const settings = await getOrCreateSettings();

    return json({ success: true, data: serializeFees(settings) });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') {
      return json({ success: false, error: 'Admission & Registration access required.' }, 403);
    }

    console.error('GET application fees error:', error);
    return json({ success: false, error: 'Failed to load application fees.' }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmissionsEdit();

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
        return json({ success: false, error: `${field} must be a valid non-negative number.` }, 400);
      }

      values[field] = value;
    }

    const settings = await prisma.admissionFeeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: values,
      create: { id: SETTINGS_ID, ...values },
    });

    return json({ success: true, data: serializeFees(settings) });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') {
      return json({ success: false, error: 'Admission & Registration edit access required.' }, 403);
    }

    console.error('PUT application fees error:', error);
    return json({ success: false, error: 'Failed to save application fees.' }, 500);
  }
}
