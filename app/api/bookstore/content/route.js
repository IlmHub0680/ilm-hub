import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CONTENT_ID = "default-bookstore-page-content";

// Matches the current hardcoded copy in app/bookstore/page.jsx
// exactly, so the public page never regresses if the database is
// unreachable or hasn't been configured yet.
const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "ULUL AZM BOOKSTORE",
    title: "Books that accompany the journey of knowledge.",
    subtitle:
      "Discover an expertly curated collection of authentic Islamic scholarship, timeless classical works, and foundational academic resources designed to support seekers of knowledge at every stage of their journey.",
    trust: ["Curated Islamic literature", "Secure checkout", "Digital editions"],
  },
  category: { label: "EXPLORE", heading: "Browse by discipline" },
  featured: {
    label: "EDITOR'S SELECTION",
    heading: "Featured Books",
    subtitle: "Distinguished works selected for serious students and readers.",
  },
  valueCards: [
    { icon: "📚", title: "Curated Collection", text: "Selected literature for meaningful Islamic study." },
    { icon: "🔒", title: "Secure Checkout", text: "Protected online payment and order processing." },
    { icon: "📱", title: "Digital Access", text: "Selected publications available in digital format." },
    { icon: "🌍", title: "Learning Without Borders", text: "Resources designed for students wherever they are." },
  ],
  collection: { label: "THE COLLECTION", heading: "Islamic Books" },
  publisher: {
    label: "AUTHORS & PUBLISHERS",
    heading: "Have a book to publish?",
    text: "Ulul Azm welcomes authors and publishers whose works contribute to beneficial Islamic knowledge.",
  },
  footerAboutText:
    "A dedicated bookstore providing beneficial Islamic literature, classical texts and educational resources.",
};

export async function GET() {
  try {
    const [content, valueCards] = await Promise.all([
      prisma.bookstorePageContent.findUnique({ where: { id: CONTENT_ID } }),
      prisma.bookstoreValueCard.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    ]);

    const data = content
      ? {
          hero: {
            eyebrow: content.heroEyebrow,
            title: content.heroTitle,
            subtitle: content.heroSubtitle,
            trust: content.heroTrust.length > 0 ? content.heroTrust : DEFAULT_CONTENT.hero.trust,
          },
          category: { label: content.categoryLabel, heading: content.categoryHeading },
          featured: {
            label: content.featuredLabel,
            heading: content.featuredHeading,
            subtitle: content.featuredSubtitle,
          },
          valueCards:
            valueCards.length > 0
              ? valueCards.map((card) => ({ icon: card.icon, title: card.title, text: card.text }))
              : DEFAULT_CONTENT.valueCards,
          collection: { label: content.collectionLabel, heading: content.collectionHeading },
          publisher: {
            label: content.publisherLabel,
            heading: content.publisherHeading,
            text: content.publisherText,
          },
          footerAboutText: content.footerAboutText,
        }
      : {
          ...DEFAULT_CONTENT,
          valueCards: valueCards.length > 0
            ? valueCards.map((card) => ({ icon: card.icon, title: card.title, text: card.text }))
            : DEFAULT_CONTENT.valueCards,
        };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("GET bookstore content error (serving defaults):", error);
    return Response.json({ success: true, data: DEFAULT_CONTENT });
  }
}
