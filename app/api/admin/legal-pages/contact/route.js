import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_CONTACT } from '@/lib/legalContentDefaults';

const SETTINGS_ID = 'default-contact-info';

const FIELDS = [
  'address',
  'poBox',
  'phone',
  'whatsapp',
  'email',
  'admissionsEmail',
  'bookstoreEmail',
  'officeHours',
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// No row saved yet, or a field was never filled in — fall back to
// the site's real current contact details (the same copy the public
// Contact page falls back to), not a blank field, so an admin never
// mistakes "nothing saved" for "nothing there".
function serialize(contact) {
  const data = {};
  for (const field of FIELDS) data[field] = contact?.[field] || DEFAULT_CONTACT[field] || '';
  return data;
}

export async function GET() {
  try {
    await requireAdmin();

    const contact = await prisma.contactInfo.findUnique({ where: { id: SETTINGS_ID } });

    return json({ success: true, data: serialize(contact) });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('GET contact info error:', error);
    return json({ success: false, error: 'Failed to load contact information.' }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const values = {};

    for (const field of FIELDS) {
      values[field] = typeof body[field] === 'string' ? body[field].trim().slice(0, 300) : null;
    }

    const contact = await prisma.contactInfo.upsert({
      where: { id: SETTINGS_ID },
      update: values,
      create: { id: SETTINGS_ID, ...values },
    });

    return json({ success: true, data: serialize(contact) });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return json({ success: false, error: 'Unauthorized.' }, 401);
    if (error?.message === 'FORBIDDEN') return json({ success: false, error: 'Admin access required.' }, 403);
    console.error('PUT contact info error:', error);
    return json({ success: false, error: 'Failed to save contact information.' }, 500);
  }
}
