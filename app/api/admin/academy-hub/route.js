import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const HERO_ID = "default-academy-hub-hero";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serializeHero(hero) {
  if (!hero) return null;
  return { badge: hero.badge, title: hero.title, subtitle: hero.subtitle };
}

function serializeCard(card) {
  return {
    id: card.id,
    icon: card.icon,
    title: card.title,
    description: card.description,
    href: card.href,
    order: card.order,
    isActive: card.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const [hero, cards] = await Promise.all([
      prisma.academyHubHero.findUnique({ where: { id: HERO_ID } }),
      prisma.academyHubCard.findMany({ orderBy: { order: "asc" } }),
    ]);

    return json({
      success: true,
      data: { hero: serializeHero(hero), cards: cards.map(serializeCard) },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET academy hub error:", error);
    return json({ success: false, error: "Failed to load the Academy hub content." }, 500);
  }
}

// Replaces the hero copy and the whole card list in one call — same
// "whole structure as a single form" reasoning as footer links.
export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const heroInput = body.hero || {};
    const heroFields = ["badge", "title", "subtitle"];
    const heroValues = {};

    for (const field of heroFields) {
      const value = typeof heroInput[field] === "string" ? heroInput[field].trim() : "";
      if (!value) {
        return json({ success: false, error: `Hero ${field} is required.` }, 400);
      }
      heroValues[field] = value;
    }

    const rawCards = Array.isArray(body.cards) ? body.cards : null;
    if (!rawCards) {
      return json({ success: false, error: "cards must be an array." }, 400);
    }

    const cardValues = [];

    for (let ci = 0; ci < rawCards.length; ci++) {
      const card = rawCards[ci];
      const icon = typeof card?.icon === "string" ? card.icon.trim() : "";
      const title = typeof card?.title === "string" ? card.title.trim() : "";
      const description = typeof card?.description === "string" ? card.description.trim() : "";
      const href = typeof card?.href === "string" ? card.href.trim() : "";

      if (!title || !href) {
        return json(
          { success: false, error: `Card ${ci + 1}: title and link are both required.` },
          400
        );
      }

      cardValues.push({
        icon: icon || "📄",
        title,
        description,
        href,
        order: ci,
        isActive: card?.isActive !== false,
      });
    }

    const saved = await prisma.$transaction(async (tx) => {
      await tx.academyHubHero.upsert({
        where: { id: HERO_ID },
        update: heroValues,
        create: { id: HERO_ID, ...heroValues },
      });

      await tx.academyHubCard.deleteMany({});

      if (cardValues.length > 0) {
        await tx.academyHubCard.createMany({ data: cardValues });
      }

      const [hero, cards] = await Promise.all([
        tx.academyHubHero.findUnique({ where: { id: HERO_ID } }),
        tx.academyHubCard.findMany({ orderBy: { order: "asc" } }),
      ]);

      return { hero, cards };
    });

    return json({
      success: true,
      data: { hero: serializeHero(saved.hero), cards: saved.cards.map(serializeCard) },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT academy hub error:", error);
    return json({ success: false, error: "Failed to save the Academy hub content." }, 500);
  }
}
