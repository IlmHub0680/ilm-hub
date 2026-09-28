import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Admin control for a single purchased book's download entitlement.
// This is the real, server-side enforcement point: toggling `revokedAt`
// here is what the download route (app/api/downloads/[orderId]/[bookId])
// actually checks before it will hand out a signed file URL — this is not
// a frontend-only show/hide flag.
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const id = String(params?.id || '').trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Book access ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    if (typeof body?.active !== 'boolean') {
      return NextResponse.json({ success: false, error: '"active" (boolean) is required.' }, { status: 400 });
    }

    const existing = await prisma.bookAccess.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Book access record not found.' }, { status: 404 });
    }

    const updated = await prisma.bookAccess.update({
      where: { id },
      data: { revokedAt: body.active ? null : new Date() },
    });

    return NextResponse.json({
      success: true,
      access: {
        id: updated.id,
        active: !updated.revokedAt,
        approvedAt: updated.approvedAt,
        revokedAt: updated.revokedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Administrator access is required.' }, { status: 403 });
    }

    console.error('Book access toggle error:', error);
    return NextResponse.json({ success: false, error: 'Unable to update book access.' }, { status: 500 });
  }
}
