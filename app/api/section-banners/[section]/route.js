import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// The only three sections that get an uploadable banner (Model 17).
// A hardcoded whitelist rather than accepting any string keeps this
// from becoming a generic arbitrary-key-value store.
const VALID_SECTIONS = [
  "bookstore",
  "media",
  "library",
  "admission",
  "homepage-beneficial-knowledge",
  // The homepage's two MEDIA & LIBRARY cards -- each card's icon/image
  // and text are independently admin-editable via this same
  // SectionBanner model, same "upload an image, save it independently"
  // pattern as homepage-beneficial-knowledge above.
  "homepage-media-card",
  "homepage-library-card",
];

function json(data, status = 200) {
  return Response.json(data, { status });
}

// GET is intentionally public/unauthenticated -- the banner image URL
// isn't sensitive, and this is the same endpoint the public bookstore,
// media and library pages call to render their banner, exactly like
// /api/homepage-content is public while /api/admin/homepage/hero is
// admin-only.
export async function GET(request, { params }) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section)) {
    return json({ success: false, error: "Unknown section." }, 404);
  }

  try {
    const banner = await prisma.sectionBanner.findUnique({
      where: { id: section },
    });

    // titleEn/bodyEn only ever get set for 'homepage-beneficial-knowledge'
    // (see the SectionBanner model comment in prisma/schema.prisma) --
    // returning them for every section is harmless (they're just null
    // for bookstore/media/library) and keeps this one response shape
    // for every section rather than branching per section here.
    return json({
      success: true,
      data: {
        imageUrl: banner?.imageUrl || "",
        titleEn: banner?.titleEn || "",
        bodyEn: banner?.bodyEn || "",
      },
    });
  } catch (error) {
    console.error("GET section banner error:", error);
    // The public page must never break because the banner couldn't be
    // fetched -- fall back to "no banner" rather than an error.
    return json({ success: true, data: { imageUrl: "", titleEn: "", bodyEn: "" } });
  }
}

// PATCH is admin-only -- updates just this one section's imageUrl,
// independent of any other section or any other content on that
// section's page. Applies immediately: no caching/staging step.
export async function PATCH(request, { params }) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section)) {
    return json({ success: false, error: "Unknown section." }, 404);
  }

  try {
    await requireAdmin();

    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    // titleEn/bodyEn are only meaningful for 'homepage-beneficial-knowledge'
    // (see the SectionBanner model comment) -- accepted here for any
    // section for simplicity, but the admin editor only ever sends them
    // for that one section, and every other section's page never reads
    // them, so this has no effect elsewhere.
    const data = { imageUrl };
    if (body.titleEn !== undefined) {
      data.titleEn = typeof body.titleEn === "string" && body.titleEn.trim() ? body.titleEn.trim() : null;
    }
    if (body.bodyEn !== undefined) {
      data.bodyEn = typeof body.bodyEn === "string" && body.bodyEn.trim() ? body.bodyEn.trim() : null;
    }

    const banner = await prisma.sectionBanner.upsert({
      where: { id: section },
      update: data,
      create: { id: section, ...data },
    });

    return json({
      success: true,
      data: {
        imageUrl: banner.imageUrl || "",
        titleEn: banner.titleEn || "",
        bodyEn: banner.bodyEn || "",
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PATCH section banner error:", error);
    return json({ success: false, error: "Failed to save banner." }, 500);
  }
}
