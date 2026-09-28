import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Admin CRUD for the /bookstore page's own surrounding copy (hero,
// section headings, value-strip cards, publisher CTA, footer About
// text) -- same "whole structure as a single form, replace-all on
// save" pattern as /api/admin/homepage/sections. The book catalogue
// itself (Book, Category, BookOrder, ...) has its own separate admin
// pages and is untouched by this route.
const CONTENT_ID = "default-bookstore-page-content";

const DEFAULT_TEXT = {
  heroEyebrow: "ULUL AZM BOOKSTORE",
  heroTitle: "Books that accompany the journey of knowledge.",
  heroSubtitle:
    "Discover an expertly curated collection of authentic Islamic scholarship, timeless classical works, and foundational academic resources designed to support seekers of knowledge at every stage of their journey.",
  heroTrust: ["Curated Islamic literature", "Secure checkout", "Digital editions"],
  categoryLabel: "EXPLORE",
  categoryHeading: "Browse by discipline",
  featuredLabel: "EDITOR'S SELECTION",
  featuredHeading: "Featured Books",
  featuredSubtitle: "Distinguished works selected for serious students and readers.",
  collectionLabel: "THE COLLECTION",
  collectionHeading: "Islamic Books",
  publisherLabel: "AUTHORS & PUBLISHERS",
  publisherHeading: "Have a book to publish?",
  publisherText: "Ulul Azm welcomes authors and publishers whose works contribute to beneficial Islamic knowledge.",
  footerAboutText:
    "A dedicated bookstore providing beneficial Islamic literature, classical texts and educational resources.",
};

const DEFAULT_VALUE_CARDS = [
  { icon: "📚", title: "Curated Collection", text: "Selected literature for meaningful Islamic study." },
  { icon: "🔒", title: "Secure Checkout", text: "Protected online payment and order processing." },
  { icon: "📱", title: "Digital Access", text: "Selected publications available in digital format." },
  { icon: "🌍", title: "Learning Without Borders", text: "Resources designed for students wherever they are." },
];

const TEXT_FIELDS = [
  "heroEyebrow",
  "heroTitle",
  "heroSubtitle",
  "categoryLabel",
  "categoryHeading",
  "featuredLabel",
  "featuredHeading",
  "featuredSubtitle",
  "collectionLabel",
  "collectionHeading",
  "publisherLabel",
  "publisherHeading",
  "publisherText",
  "footerAboutText",
];

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serializeContent(row) {
  if (!row) return null;
  const out = { heroTrust: row.heroTrust.length > 0 ? row.heroTrust : DEFAULT_TEXT.heroTrust };
  for (const field of TEXT_FIELDS) out[field] = row[field];
  return out;
}

function serializeValueCard(card) {
  return {
    id: card.id,
    icon: card.icon,
    title: card.title,
    text: card.text,
    order: card.order,
    isActive: card.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const [content, valueCards] = await Promise.all([
      prisma.bookstorePageContent.findUnique({ where: { id: CONTENT_ID } }),
      prisma.bookstoreValueCard.findMany({ orderBy: { order: "asc" } }),
    ]);

    return json({
      success: true,
      data: {
        content: serializeContent(content) || { ...DEFAULT_TEXT },
        valueCards:
          valueCards.length > 0
            ? valueCards.map(serializeValueCard)
            : DEFAULT_VALUE_CARDS.map((card, index) => ({ id: null, ...card, order: index, isActive: true })),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET bookstore page-content error:", error);
    return json({ success: false, error: "Failed to load the bookstore page content." }, 500);
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const textInput = body.content || {};
    const textValues = {};

    for (const field of TEXT_FIELDS) {
      const value = typeof textInput[field] === "string" ? textInput[field].trim() : "";
      if (!value) {
        return json({ success: false, error: `${field} is required.` }, 400);
      }
      textValues[field] = value;
    }

    textValues.heroTrust = Array.isArray(textInput.heroTrust)
      ? textInput.heroTrust.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)
      : [];

    const rawValueCards = Array.isArray(body.valueCards) ? body.valueCards : null;

    if (!rawValueCards) {
      return json({ success: false, error: "valueCards must be an array." }, 400);
    }

    const valueCardValues = [];
    for (let i = 0; i < rawValueCards.length; i++) {
      const card = rawValueCards[i];
      const icon = typeof card?.icon === "string" ? card.icon.trim() : "";
      const title = typeof card?.title === "string" ? card.title.trim() : "";
      const text = typeof card?.text === "string" ? card.text.trim() : "";

      if (!title || !text) {
        return json({ success: false, error: `Value card ${i + 1}: title and text are both required.` }, 400);
      }

      valueCardValues.push({ icon: icon || "📚", title, text, order: i, isActive: card?.isActive !== false });
    }

    const saved = await prisma.$transaction(async (tx) => {
      await tx.bookstorePageContent.upsert({
        where: { id: CONTENT_ID },
        update: textValues,
        create: { id: CONTENT_ID, ...textValues },
      });

      await tx.bookstoreValueCard.deleteMany({});
      if (valueCardValues.length > 0) {
        await tx.bookstoreValueCard.createMany({ data: valueCardValues });
      }

      const [content, valueCards] = await Promise.all([
        tx.bookstorePageContent.findUnique({ where: { id: CONTENT_ID } }),
        tx.bookstoreValueCard.findMany({ orderBy: { order: "asc" } }),
      ]);

      return { content, valueCards };
    });

    return json({
      success: true,
      data: {
        content: serializeContent(saved.content),
        valueCards: saved.valueCards.map(serializeValueCard),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT bookstore page-content error:", error);
    return json({ success: false, error: "Failed to save the bookstore page content." }, 500);
  }
}
