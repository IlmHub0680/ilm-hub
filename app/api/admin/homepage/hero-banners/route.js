import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const MAX_BANNERS = 5;

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(banner) {
  return {
    id: banner.id,
    imageUrl: banner.imageUrl,
    captionEn: banner.captionEn || '',
    captionAr: banner.captionAr || '',
    order: banner.order,
    isActive: banner.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const banners = await prisma.homepageHeroBanner.findMany({ orderBy: { order: "asc" } });

    return json({ success: true, data: banners.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET hero banners error:", error);
    return json({ success: false, error: "Failed to load hero banners." }, 500);
  }
}

// Replaces the entire ordered list in one call -- same convention as
// /api/admin/homepage/social-links: the admin editor adds/removes/
// reorders/toggles rows locally, then Save writes the whole set at
// once. Capped at MAX_BANNERS so the public slider never has to
// handle an unbounded number of images.
export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const banners = Array.isArray(body.banners) ? body.banners : null;

    if (!banners) {
      return json({ success: false, error: "banners must be an array." }, 400);
    }

    if (banners.length > MAX_BANNERS) {
      return json({ success: false, error: `A maximum of ${MAX_BANNERS} banner images is allowed.` }, 400);
    }

    const values = [];

    for (let i = 0; i < banners.length; i++) {
      const item = banners[i];
      const imageUrl = typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "";

      if (!imageUrl) {
        return json({ success: false, error: `Banner ${i + 1}: an image is required.` }, 400);
      }

      const captionEn = typeof item?.captionEn === "string" ? item.captionEn.trim() : "";
      const captionAr = typeof item?.captionAr === "string" ? item.captionAr.trim() : "";

      values.push({
        imageUrl,
        captionEn: captionEn || null,
        captionAr: captionAr || null,
        order: i,
        isActive: item?.isActive !== false,
      });
    }

    const banners_ = await prisma.$transaction(async (tx) => {
      await tx.homepageHeroBanner.deleteMany({});

      if (values.length === 0) return [];

      await tx.homepageHeroBanner.createMany({ data: values });

      return tx.homepageHeroBanner.findMany({ orderBy: { order: "asc" } });
    });

    return json({ success: true, data: banners_.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT hero banners error:", error);
    return json({ success: false, error: "Failed to save hero banners." }, 500);
  }
}
