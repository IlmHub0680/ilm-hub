import { prisma } from "@/lib/prisma";

// Public, unauthenticated read of the /academy hub page's CMS-managed
// content (hero copy + document/programme cards). Falls back to the
// same content this page originally shipped with whenever the admin
// hasn't configured it yet, so the public page never regresses to an
// empty or broken state. Same pattern as /api/homepage-content.
export const dynamic = "force-dynamic";

const HERO_ID = "default-academy-hub-hero";

const DEFAULT_HERO = {
  badge: "Ulul Azm",
  title: "The Academy",
  subtitle:
    "Everything that defines how Ulul Azm Academy teaches, assesses and progresses its students — from the programmes you can enrol in today to the institutional documents that govern them.",
};

const DEFAULT_CARDS = [
  {
    icon: "🕌",
    title: "Academy Foundation",
    description:
      "The Academy's institutional identity, educational philosophy, the learners it serves, and the principles that govern every curriculum, program and course decision.",
    href: "/academy-foundation",
  },
  {
    icon: "🎓",
    title: "Academy Pathways",
    description:
      "The academic pathways and qualification framework — Foundation, Intermediate, Advanced, Diploma and Specialized Certificates.",
    href: "/academy-pathways",
  },
];

export async function GET() {
  try {
    const [hero, cards] = await Promise.all([
      prisma.academyHubHero.findUnique({ where: { id: HERO_ID } }),
      prisma.academyHubCard.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
    ]);

    return Response.json({
      success: true,
      data: {
        hero: hero
          ? { badge: hero.badge, title: hero.title, subtitle: hero.subtitle }
          : DEFAULT_HERO,
        cards:
          cards.length > 0
            ? cards.map((card) => ({
                icon: card.icon,
                title: card.title,
                description: card.description,
                href: card.href,
              }))
            : DEFAULT_CARDS,
      },
    });
  } catch (error) {
    console.error("GET academy hub content error:", error);

    // Even on an unexpected error, the public page should still render
    // with its known-good defaults rather than break.
    return Response.json({
      success: true,
      data: { hero: DEFAULT_HERO, cards: DEFAULT_CARDS },
    });
  }
}
