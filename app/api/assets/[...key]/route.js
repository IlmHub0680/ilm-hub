import { getR2Object } from '@/lib/r2';

export const runtime = 'nodejs';

// Public asset proxy -- serves ONLY objects stored under the "public/"
// key prefix in R2, streamed through our own server rather than a
// presigned URL (so the link never expires and can be hotlinked from a
// public page like the homepage). This is a real, deliberate boundary:
// every other R2-backed route in this app (admission documents,
// assignments, manuscripts, transcripts, ...) is private and only ever
// reachable through getR2PresignedUrl() after an RBAC check. Nothing
// outside "public/" is ever reachable here, so a caller cannot use this
// route to read a private applicant document by guessing its key.
export async function GET(request, { params }) {
  try {
    const { key } = await params;
    const joinedKey = Array.isArray(key) ? key.join('/') : String(key || '');

    if (!joinedKey || !joinedKey.startsWith('public/')) {
      return new Response('Not found.', { status: 404 });
    }

    // No parent-directory traversal, no querying outside the public/
    // prefix via an encoded ".." segment.
    if (joinedKey.includes('..')) {
      return new Response('Not found.', { status: 404 });
    }

    const object = await getR2Object(joinedKey);

    if (!object.Body) {
      return new Response('Not found.', { status: 404 });
    }

    const body = await object.Body.transformToByteArray();

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': object.ContentType || 'application/octet-stream',
        // Public brand assets rarely change and are re-uploaded under a
        // fresh key (new UUID) rather than overwritten in place, so a
        // long, immutable cache is safe and keeps the homepage fast.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.Code === 'NoSuchKey') {
      return new Response('Not found.', { status: 404 });
    }
    console.error('Public asset proxy error:', error);
    return new Response('Failed to load asset.', { status: 500 });
  }
}
