import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Admin CRUD for the public /alumni page -- hero/section copy (one
// singleton row) plus two ordered lists (Statistics, Spotlight
// profiles). Same "whole structure as a single form, replace-all on
// save" pattern as /api/admin/homepage/sections and
// /api/admin/bookstore/page-content. Both lists start empty; nothing
// here is ever pre-filled with invented numbers, names or quotes --
// an admin enters real figures and real graduate stories.
const CONTENT_ID = "default-alumni-page-content";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const TEXT_FIELDS = [
  "heroEyebrow",
  "heroTitle",
  "heroSubtitle",
  "statsHeading",
  "spotlightLabel",
  "spotlightHeading",
  "spotlightSubtitle",
  "ctaHeading",
  "ctaText",
];

function serializeContent(row) {
  if (!row) return null;
  const out = {};
  for (const field of TEXT_FIELDS) out[field] = row[field];
  return out;
}

function serializeStat(stat) {
  return { id: stat.id, value: stat.value, label: stat.label, order: stat.order, isActive: stat.isActive };
}

function serializeProfile(profile) {
  return {
    id: profile.id,
    name: profile.name,
    graduationYear: profile.graduationYear || "",
    program: profile.program || "",
    photoUrl: profile.photoUrl || "",
    currentRole: profile.currentRole || "",
    quote: profile.quote || "",
    order: profile.order,
    isActive: profile.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const [content, stats, profiles] = await Promise.all([
      prisma.alumniPageContent.findUnique({ where: { id: CONTENT_ID } }),
      prisma.alumniStat.findMany({ orderBy: { order: "asc" } }),
      prisma.alumniProfile.findMany({ orderBy: { order: "asc" } }),
    ]);

    return json({
      success: true,
      data: {
        content: serializeContent(content),
        stats: stats.map(serializeStat),
        profiles: profiles.map(serializeProfile),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET alumni admin error:", error);
    return json({ success: false, error: "Failed to load the alumni page content." }, 500);
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

    const rawStats = Array.isArray(body.stats) ? body.stats : null;
    const rawProfiles = Array.isArray(body.profiles) ? body.profiles : null;

    if (!rawStats || !rawProfiles) {
      return json({ success: false, error: "stats and profiles must both be arrays." }, 400);
    }

    const statValues = [];
    for (let i = 0; i < rawStats.length; i++) {
      const stat = rawStats[i];
      const value = typeof stat?.value === "string" ? stat.value.trim() : "";
      const label = typeof stat?.label === "string" ? stat.label.trim() : "";

      if (!value || !label) {
        return json({ success: false, error: `Stat ${i + 1}: value and label are both required.` }, 400);
      }

      statValues.push({ value, label, order: i, isActive: stat?.isActive !== false });
    }

    const profileValues = [];
    for (let i = 0; i < rawProfiles.length; i++) {
      const profile = rawProfiles[i];
      const name = typeof profile?.name === "string" ? profile.name.trim() : "";

      if (!name) {
        return json({ success: false, error: `Alumni profile ${i + 1}: a name is required.` }, 400);
      }

      profileValues.push({
        name,
        graduationYear: typeof profile?.graduationYear === "string" ? profile.graduationYear.trim() || null : null,
        program: typeof profile?.program === "string" ? profile.program.trim() || null : null,
        photoUrl: typeof profile?.photoUrl === "string" ? profile.photoUrl.trim() || null : null,
        currentRole: typeof profile?.currentRole === "string" ? profile.currentRole.trim() || null : null,
        quote: typeof profile?.quote === "string" ? profile.quote.trim() || null : null,
        order: i,
        isActive: profile?.isActive !== false,
      });
    }

    const saved = await prisma.$transaction(async (tx) => {
      await tx.alumniPageContent.upsert({
        where: { id: CONTENT_ID },
        update: textValues,
        create: { id: CONTENT_ID, ...textValues },
      });

      await tx.alumniStat.deleteMany({});
      if (statValues.length > 0) {
        await tx.alumniStat.createMany({ data: statValues });
      }

      await tx.alumniProfile.deleteMany({});
      if (profileValues.length > 0) {
        await tx.alumniProfile.createMany({ data: profileValues });
      }

      const [content, stats, profiles] = await Promise.all([
        tx.alumniPageContent.findUnique({ where: { id: CONTENT_ID } }),
        tx.alumniStat.findMany({ orderBy: { order: "asc" } }),
        tx.alumniProfile.findMany({ orderBy: { order: "asc" } }),
      ]);

      return { content, stats, profiles };
    });

    return json({
      success: true,
      data: {
        content: serializeContent(saved.content),
        stats: saved.stats.map(serializeStat),
        profiles: saved.profiles.map(serializeProfile),
      },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT alumni admin error:", error);
    return json({ success: false, error: "Failed to save the alumni page content." }, 500);
  }
}
