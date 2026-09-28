import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Security audit fix -- previously GET /api/media/[slug] returned the
 * raw stored mediaUrl directly in its JSON response once a viewer's
 * subscription check passed. That raw value, once seen by the browser,
 * could be copied, shared, or hotlinked indefinitely: the subscription
 * gate only ran once, at that single API call, never again on whatever
 * request actually fetched the video bytes.
 *
 * This route is the fix: it is what the <video>/<audio> element's src
 * now points at (see /api/media/[slug]/route.js), and it re-verifies
 * the SAME access rules on every single request for the media bytes
 * themselves, not just once up front. The real storage location is
 * never sent to the browser:
 *   - If mediaUrl is a key in OUR OWN R2 bucket, this redirects to a
 *     short-lived (60s) presigned URL -- long enough for the player to
 *     open the stream, short enough that a copied link stops working
 *     almost immediately, and the presigned URL itself never reveals
 *     the bucket's real endpoint pattern to a scraper reading page
 *     source, because R2 signs a temporary query string onto it.
 *   - If mediaUrl is any other origin (an external host/CDN an admin
 *     pasted in, since this field has never been restricted to R2 --
 *     see lib/r2FileLifecycle.ts's own note on this), this route
 *     proxies the bytes through our own server instead of redirecting,
 *     so the external URL itself is never exposed to the browser at
 *     all, and range requests are forwarded so video seeking still
 *     works.
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;

function looksLikeOwnR2Url(url: string): { isOwnBucket: true; key: string } | { isOwnBucket: false } {
  if (!R2_ACCOUNT_ID) return { isOwnBucket: false };

  const ownHost = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== ownHost) return { isOwnBucket: false };
    // Strip the leading "/<bucket>/" segment R2's S3-compatible path
    // style puts in front of the object key.
    const pathParts = parsed.pathname.replace(/^\/+/, "").split("/");
    const key = pathParts.slice(1).join("/");
    if (!key) return { isOwnBucket: false };
    return { isOwnBucket: true, key };
  } catch {
    // Not a full URL at all -- treat a bare value as a raw R2 key
    // (this is how every other R2-key field in this app stores its
    // value; MediaItem.mediaUrl is the one exception admins can type a
    // full external URL into, so both shapes have to be handled).
    return { isOwnBucket: true, key: url };
  }
}

async function hasActiveSubscription(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const active = await prisma.userMediaSubscription.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  return Boolean(active);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const cleanSlug = slug?.trim();

    if (!cleanSlug) {
      return new Response("Not found.", { status: 404 });
    }

    const item = await prisma.mediaItem.findUnique({ where: { slug: cleanSlug } });

    if (!item || !item.isPublished) {
      return new Response("Not found.", { status: 404 });
    }

    // Same access rule as /api/media/[slug]/route.js, re-checked here
    // independently -- this route must never trust that an earlier
    // call already checked it.
    const user = await getCurrentUser();
    const subscribed = await hasActiveSubscription(user?.id);
    const unlocked = item.isFreePreview || !item.requiresSubscription || subscribed;

    if (!unlocked) {
      return new Response("A subscription is required to stream this item.", { status: 403 });
    }

    const detection = looksLikeOwnR2Url(item.mediaUrl);

    if (detection.isOwnBucket) {
      const presignedUrl = await getR2PresignedUrl(detection.key, 60);
      return Response.redirect(presignedUrl, 302);
    }

    // External origin -- proxy the bytes through our own server rather
    // than redirecting, so the real external URL is never exposed to
    // the browser. Range requests are forwarded so seeking still works
    // for video.
    const rangeHeader = request.headers.get("range");
    const upstream = await fetch(item.mediaUrl, {
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response("Unable to load media.", { status: 502 });
    }

    const headers = new Headers();
    const passthroughHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ];
    for (const header of passthroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }
    headers.set("Cache-Control", "private, no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Media stream error:", error);
    return new Response("Unable to stream this media item.", { status: 500 });
  }
}
