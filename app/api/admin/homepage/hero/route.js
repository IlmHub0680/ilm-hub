import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const HERO_SETTINGS_ID = "default-homepage-hero";

// Mirrors DEFAULT_HERO in app/api/homepage-content/route.js exactly --
// used only as the text content for a brand-new hero row created by
// PATCH (logo/banner-only save) before the admin has ever run the
// full "Save Hero Section" form.
const DEFAULT_HERO_TEXT = {
  badge: "A DIGITAL HOME FOR ISLAMIC KNOWLEDGE",
  title: "Excellence in Islamic Studies & Qur'anic Sciences",
  subtitle:
    "A structured environment for students seeking authentic, beneficial and disciplined Islamic knowledge through qualified instruction, classical texts, modern learning resources and academic programmes.",
  primaryLabel: "Apply Now →",
  primaryHref: "/admission",
  secondaryLabel: "Explore Academics →",
  secondaryHref: "/programs",
  features: [
    "Structured curriculum",
    "Online learning",
    "Academic resources",
    "Global access",
  ],
  badgeAr: "",
  titleAr: "",
  subtitleAr: "",
  primaryLabelAr: "",
  secondaryLabelAr: "",
  featuresAr: [],
  loginBackgroundUrl: "",
};

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(hero) {
  return {
    badge: hero.badge,
    title: hero.title,
    subtitle: hero.subtitle,
    primaryLabel: hero.primaryLabel,
    primaryHref: hero.primaryHref,
    secondaryLabel: hero.secondaryLabel,
    secondaryHref: hero.secondaryHref,
    features: hero.features,
    badgeAr: hero.badgeAr || '',
    titleAr: hero.titleAr || '',
    subtitleAr: hero.subtitleAr || '',
    primaryLabelAr: hero.primaryLabelAr || '',
    secondaryLabelAr: hero.secondaryLabelAr || '',
    featuresAr: hero.featuresAr || [],
    logoUrl: hero.logoUrl || '',
    heroImageUrl: hero.heroImageUrl || '',
    logoSize: hero.logoSize || 100,
    loginBackgroundUrl: hero.loginBackgroundUrl || '',
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const hero = await prisma.homepageHero.findUnique({
      where: { id: HERO_SETTINGS_ID },
    });

    if (!hero) {
      return json({ success: false, error: "Hero content has not been configured yet." }, 404);
    }

    return json({ success: true, data: serialize(hero) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET homepage hero error:", error);
    return json({ success: false, error: "Failed to load hero content." }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const stringFields = [
      "badge",
      "title",
      "subtitle",
      "primaryLabel",
      "primaryHref",
      "secondaryLabel",
      "secondaryHref",
    ];

    const values = {};

    for (const field of stringFields) {
      const value = typeof body[field] === "string" ? body[field].trim() : "";

      if (!value) {
        return json({ success: false, error: `${field} is required.` }, 400);
      }

      values[field] = value;
    }

    const features = Array.isArray(body.features)
      ? body.features
          .map((f) => (typeof f === "string" ? f.trim() : ""))
          .filter(Boolean)
      : [];

    values.features = features;

    // Arabic translations and uploaded assets are all optional -- the
    // public homepage falls back to English / the text-glyph mark when
    // these are blank, so nothing here is required.
    const optionalStringFields = [
      "badgeAr",
      "titleAr",
      "subtitleAr",
      "primaryLabelAr",
      "secondaryLabelAr",
      "logoUrl",
      "heroImageUrl",
    ];

    for (const field of optionalStringFields) {
      values[field] = typeof body[field] === "string" ? body[field].trim() : "";
    }

    values.featuresAr = Array.isArray(body.featuresAr)
      ? body.featuresAr
          .map((f) => (typeof f === "string" ? f.trim() : ""))
          .filter(Boolean)
      : [];

    const hero = await prisma.homepageHero.upsert({
      where: { id: HERO_SETTINGS_ID },
      update: values,
      create: { id: HERO_SETTINGS_ID, ...values },
    });

    return json({ success: true, data: serialize(hero) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT homepage hero error:", error);
    return json({ success: false, error: "Failed to save hero content." }, 500);
  }
}

// The only sizes an admin can pick -- keeps the stored value always
// inside a range the header/footer layouts are known to handle
// cleanly, no matter what a request sends.
const LOGO_SIZE_PRESETS = [70, 85, 100, 115, 130, 145, 160];

// Updates ONLY the brand assets (site logo, hero/site banner image) --
// deliberately independent of PUT's required-field validation on the
// rest of the hero copy, so the admin can swap a logo or banner
// without also having to fill in (or resubmit) the headline,
// description, CTA buttons or Arabic translation. Applies immediately:
// this route has no caching/staging step, so the next page load
// anywhere on the site (header, footer, homepage) already reflects it.
export async function PATCH(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (
      typeof body.logoUrl !== "string" &&
      typeof body.heroImageUrl !== "string" &&
      typeof body.loginBackgroundUrl !== "string" &&
      body.logoSize === undefined
    ) {
      return json(
        { success: false, error: "logoUrl, heroImageUrl, loginBackgroundUrl and/or logoSize is required." },
        400
      );
    }

    const assetValues = {};
    if (typeof body.logoUrl === "string") {
      assetValues.logoUrl = body.logoUrl.trim();
    }
    if (typeof body.heroImageUrl === "string") {
      assetValues.heroImageUrl = body.heroImageUrl.trim();
    }
    if (typeof body.loginBackgroundUrl === "string") {
      assetValues.loginBackgroundUrl = body.loginBackgroundUrl.trim();
    }
    if (body.logoSize !== undefined) {
      const size = Number(body.logoSize);
      if (!LOGO_SIZE_PRESETS.includes(size)) {
        return json({ success: false, error: "Unsupported logo size." }, 400);
      }
      assetValues.logoSize = size;
    }

    const existing = await prisma.homepageHero.findUnique({
      where: { id: HERO_SETTINGS_ID },
    });

    const hero = existing
      ? await prisma.homepageHero.update({
          where: { id: HERO_SETTINGS_ID },
          data: assetValues,
        })
      : await prisma.homepageHero.create({
          data: {
            id: HERO_SETTINGS_ID,
            ...DEFAULT_HERO_TEXT,
            logoUrl: "",
            heroImageUrl: "",
            loginBackgroundUrl: "",
            ...assetValues,
          },
        });

    return json({ success: true, data: serialize(hero) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PATCH homepage hero error:", error);
    return json({ success: false, error: "Failed to save brand assets." }, 500);
  }
}
