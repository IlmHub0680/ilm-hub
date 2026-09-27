import crypto from 'crypto';
import { requireAdmin } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB -- generous for a logo/hero image, not for arbitrary files.

const ALLOWED_TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

// Generic admin image upload -- currently used by the Homepage Hero
// editor for the site logo and hero banner image, and written to be
// reused by any future admin image upload (a "folder" is passed in
// rather than hard-coded) instead of writing a one-off endpoint each
// time. Always uploads under the "public/" R2 prefix, which is the
// only prefix app/api/assets/[...key] is willing to serve -- keeping
// this endpoint separate from the private document-upload routes
// (app/api/admissions/documents, assignments, manuscripts, ...), which
// intentionally stay behind presigned, RBAC-gated URLs.
export async function POST(request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'general')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40) || 'general';

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ success: false, error: 'No file was uploaded.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, error: 'Image exceeds the 5MB size limit.' }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return Response.json(
        { success: false, error: 'Unsupported image type. Use PNG, JPEG, WebP or SVG.' },
        { status: 400 }
      );
    }

    const key = `public/${folder}/${crypto.randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2(key, buffer, file.type);

    return Response.json({ success: true, url: `/api/assets/${key}` });
  } catch (error) {
    if (error?.message === 'UNAUTHORIZED') return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    if (error?.message === 'FORBIDDEN') return Response.json({ success: false, error: 'Admin access required.' }, { status: 403 });

    console.error('Admin image upload error:', error);
    return Response.json({ success: false, error: 'Failed to upload image.' }, { status: 500 });
  }
}
