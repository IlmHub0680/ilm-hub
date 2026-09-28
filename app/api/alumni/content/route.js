import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CONTENT_ID = "default-alumni-page-content";

// Placeholder copy only -- no numbers, names or quotes are invented
// here. Statistics and Alumni Spotlight are real content entered by
// staff at /admin/alumni and start out empty; each section simply
// doesn't render until an admin adds real entries (same pattern as
// the homepage hero banner slider).
const DEFAULT_CONTENT = {
  heroEyebrow: "OUR ALUMNI",
  heroTitle: "Carrying the light of knowledge forward.",
  heroSubtitle:
    "Ulul Azm graduates go on to teach, lead, and serve their communities. This page celebrates their journey beyond these halls.",
  statsHeading: "Our Graduates, By the Numbers",
  spotlightLabel: "ALUMNI SPOTLIGHT",
  spotlightHeading: "Where They Are Now",
  spotlightSubtitle: "A few of the graduates who continue the mission of beneficial knowledge in their own way.",
  ctaHeading: "Are you a Ulul Azm graduate?",
  ctaText: "We would love to hear about your journey since graduation and stay connected with you.",
};

export async function GET() {
  try {
    const [content, stats, profiles] = await Promise.all([
      prisma.alumniPageContent.findUnique({ where: { id: CONTENT_ID } }),
      prisma.alumniStat.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.alumniProfile.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    ]);

    const data = {
      content: content
        ? {
            heroEyebrow: content.heroEyebrow,
            heroTitle: content.heroTitle,
            heroSubtitle: content.heroSubtitle,
            statsHeading: content.statsHeading,
            spotlightLabel: content.spotlightLabel,
            spotlightHeading: content.spotlightHeading,
            spotlightSubtitle: content.spotlightSubtitle,
            ctaHeading: content.ctaHeading,
            ctaText: content.ctaText,
          }
        : DEFAULT_CONTENT,
      stats: stats.map((s) => ({ value: s.value, label: s.label })),
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        graduationYear: p.graduationYear || "",
        program: p.program || "",
        photoUrl: p.photoUrl || "",
        currentRole: p.currentRole || "",
        quote: p.quote || "",
      })),
    };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("GET alumni content error (serving defaults):", error);
    return Response.json({ success: true, data: { content: DEFAULT_CONTENT, stats: [], profiles: [] } });
  }
}
