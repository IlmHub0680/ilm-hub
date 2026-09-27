import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Admin CRUD for the homepage's "Welcome", "Academy", "Our Approach"
// section text and the closing "Bismillah" banner, plus the three
// ordered lists that go with them (feature cards, academy subject
// icons, approach steps). Same "whole structure as a single form,
// replace-all on save" pattern as /api/admin/academy-hub.
const SECTIONS_TEXT_ID = "default-homepage-sections";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serializeSectionsText(row) {
  if (!row) return null;
  return {
    welcomeBadge: row.welcomeBadge,
    welcomeTitle: row.welcomeTitle,
    welcomeSubtitle: row.welcomeSubtitle,
    academyBadge: row.academyBadge,
    academyTitle: row.academyTitle,
    academySubtitle: row.academySubtitle,
    approachBadge: row.approachBadge,
    approachTitle: row.approachTitle,
    approachSubtitle: row.approachSubtitle,
    ctaArabicLine: row.ctaArabicLine,
    ctaTitle: row.ctaTitle,
    ctaDescription: row.ctaDescription,
  };
}

function serializeFeatureCard(card) {
  return {
    id: card.id,
    icon: card.icon,
    title: card.title,
    text: card.text,
    order: card.order,
    isActive: card.isActive,
  };
}

function serializeAcademyItem(item) {
  return {
    id: item.id,
    icon: item.icon,
    text: item.text,
    order: item.order,
    isActive: item.isActive,
  };
}

function serializeApproachStep(step) {
  return {
    id: step.id,
    number: step.number,
    title: step.title,
    text: step.text,
    order: step.order,
    isActive: step.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const [sectionsText, featureCards, academyItems, approachSteps] = await Promise.all([
      prisma.homepageSectionsText.findUnique({ where: { id: SECTIONS_TEXT_ID } }),
      prisma.homepageFeatureCard.findMany({ orderBy: { order: "asc" } }),
      prisma.homepageAcademyItem.findMany({ orderBy: { order: "asc" } }),
      prisma.homepageApproachStep.findMany({ orderBy: { order: "asc" } }),
    ]);

    return json({
      success: true,
      data: {
        sectionsText: serializeSectionsText(sectionsText),
        featureCards: featureCards.map(serializeFeatureCard),
        academyItems: academyItems.map(serializeAcademyItem),
        approachSteps: approachSteps.map(serializeApproachStep),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET homepage sections error:", error);
    return json({ success: false, error: "Failed to load the homepage sections." }, 500);
  }
}

const SECTIONS_TEXT_FIELDS = [
  "welcomeBadge",
  "welcomeTitle",
  "welcomeSubtitle",
  "academyBadge",
  "academyTitle",
  "academySubtitle",
  "approachBadge",
  "approachTitle",
  "approachSubtitle",
  "ctaArabicLine",
  "ctaTitle",
  "ctaDescription",
];

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const textInput = body.sectionsText || {};
    const textValues = {};

    for (const field of SECTIONS_TEXT_FIELDS) {
      const value = typeof textInput[field] === "string" ? textInput[field].trim() : "";
      if (!value) {
        return json({ success: false, error: `${field} is required.` }, 400);
      }
      textValues[field] = value;
    }

    const rawFeatureCards = Array.isArray(body.featureCards) ? body.featureCards : null;
    const rawAcademyItems = Array.isArray(body.academyItems) ? body.academyItems : null;
    const rawApproachSteps = Array.isArray(body.approachSteps) ? body.approachSteps : null;

    if (!rawFeatureCards || !rawAcademyItems || !rawApproachSteps) {
      return json(
        { success: false, error: "featureCards, academyItems and approachSteps must all be arrays." },
        400
      );
    }

    const featureCardValues = [];
    for (let i = 0; i < rawFeatureCards.length; i++) {
      const card = rawFeatureCards[i];
      const icon = typeof card?.icon === "string" ? card.icon.trim() : "";
      const title = typeof card?.title === "string" ? card.title.trim() : "";
      const text = typeof card?.text === "string" ? card.text.trim() : "";

      if (!title || !text) {
        return json({ success: false, error: `Feature card ${i + 1}: title and text are both required.` }, 400);
      }

      featureCardValues.push({ icon: icon || "📚", title, text, order: i, isActive: card?.isActive !== false });
    }

    const academyItemValues = [];
    for (let i = 0; i < rawAcademyItems.length; i++) {
      const item = rawAcademyItems[i];
      const icon = typeof item?.icon === "string" ? item.icon.trim() : "";
      const text = typeof item?.text === "string" ? item.text.trim() : "";

      if (!text) {
        return json({ success: false, error: `Academy item ${i + 1}: text is required.` }, 400);
      }

      academyItemValues.push({ icon: icon || "📖", text, order: i, isActive: item?.isActive !== false });
    }

    const approachStepValues = [];
    for (let i = 0; i < rawApproachSteps.length; i++) {
      const step = rawApproachSteps[i];
      const number = typeof step?.number === "string" ? step.number.trim() : "";
      const title = typeof step?.title === "string" ? step.title.trim() : "";
      const text = typeof step?.text === "string" ? step.text.trim() : "";

      if (!number || !title || !text) {
        return json(
          { success: false, error: `Approach step ${i + 1}: number, title and text are all required.` },
          400
        );
      }

      approachStepValues.push({ number, title, text, order: i, isActive: step?.isActive !== false });
    }

    const saved = await prisma.$transaction(async (tx) => {
      await tx.homepageSectionsText.upsert({
        where: { id: SECTIONS_TEXT_ID },
        update: textValues,
        create: { id: SECTIONS_TEXT_ID, ...textValues },
      });

      await tx.homepageFeatureCard.deleteMany({});
      if (featureCardValues.length > 0) {
        await tx.homepageFeatureCard.createMany({ data: featureCardValues });
      }

      await tx.homepageAcademyItem.deleteMany({});
      if (academyItemValues.length > 0) {
        await tx.homepageAcademyItem.createMany({ data: academyItemValues });
      }

      await tx.homepageApproachStep.deleteMany({});
      if (approachStepValues.length > 0) {
        await tx.homepageApproachStep.createMany({ data: approachStepValues });
      }

      const [sectionsText, featureCards, academyItems, approachSteps] = await Promise.all([
        tx.homepageSectionsText.findUnique({ where: { id: SECTIONS_TEXT_ID } }),
        tx.homepageFeatureCard.findMany({ orderBy: { order: "asc" } }),
        tx.homepageAcademyItem.findMany({ orderBy: { order: "asc" } }),
        tx.homepageApproachStep.findMany({ orderBy: { order: "asc" } }),
      ]);

      return { sectionsText, featureCards, academyItems, approachSteps };
    });

    return json({
      success: true,
      data: {
        sectionsText: serializeSectionsText(saved.sectionsText),
        featureCards: saved.featureCards.map(serializeFeatureCard),
        academyItems: saved.academyItems.map(serializeAcademyItem),
        approachSteps: saved.approachSteps.map(serializeApproachStep),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT homepage sections error:", error);
    return json({ success: false, error: "Failed to save the homepage sections." }, 500);
  }
}
