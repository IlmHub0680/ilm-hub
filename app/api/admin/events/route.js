import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(event) {
  return {
    id: event.id,
    titleEn: event.titleEn,
    titleAr: event.titleAr || "",
    descriptionEn: event.descriptionEn,
    descriptionAr: event.descriptionAr || "",
    eventDate: event.eventDate,
    eventTime: event.eventTime || "",
    location: event.location || "",
    onlineLink: event.onlineLink || "",
    thumbnailUrl: event.thumbnailUrl || "",
    detailsLink: event.detailsLink || "",
    isPublished: event.isPublished,
    // Research & Scholarly Affairs integration -- optional, nullable
    // category so a Research-hosted event (conference, seminar,
    // defense, etc.) can be tagged through this SAME existing Event
    // flow. null for every event created before this field existed,
    // and for any ordinary institute event that isn't research-related.
    category: event.category || null,
    createdByName: event.createdBy?.name || "Unknown",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

const VALID_EVENT_CATEGORIES = ["RESEARCH", "SEMINAR", "CONFERENCE", "WORKSHOP", "GENERAL"];

// Admin list -- every event (draft and published), newest event date
// first, so upcoming and past events are both visible for editing.
export async function GET() {
  try {
    await requireAdmin();

    const events = await prisma.event.findMany({
      include: { createdBy: { select: { name: true } } },
      orderBy: { eventDate: "desc" },
    });

    return json({ success: true, data: events.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("GET admin events error:", error);
    return json({ success: false, error: "Failed to load events." }, 500);
  }
}

export async function POST(request) {
  try {
    const actor = await requireAdmin();

    const body = await request.json();
    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const descriptionEn = typeof body.descriptionEn === "string" ? body.descriptionEn.trim() : "";
    const eventDate = body.eventDate ? new Date(body.eventDate) : null;

    if (!titleEn) return json({ success: false, error: "A title is required." }, 400);
    if (!descriptionEn) return json({ success: false, error: "A description is required." }, 400);
    if (!eventDate || Number.isNaN(eventDate.getTime())) {
      return json({ success: false, error: "A valid event date is required." }, 400);
    }

    const event = await prisma.event.create({
      data: {
        titleEn,
        titleAr: typeof body.titleAr === "string" ? body.titleAr.trim() || null : null,
        descriptionEn,
        descriptionAr: typeof body.descriptionAr === "string" ? body.descriptionAr.trim() || null : null,
        eventDate,
        eventTime: typeof body.eventTime === "string" ? body.eventTime.trim() || null : null,
        location: typeof body.location === "string" ? body.location.trim() || null : null,
        onlineLink: typeof body.onlineLink === "string" ? body.onlineLink.trim() || null : null,
        thumbnailUrl: typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() || null : null,
        detailsLink: typeof body.detailsLink === "string" ? body.detailsLink.trim() || null : null,
        isPublished: Boolean(body.isPublished),
        category: VALID_EVENT_CATEGORIES.includes(body.category) ? body.category : null,
        createdById: actor.id,
      },
      include: { createdBy: { select: { name: true } } },
    });

    await logAudit({
      actor,
      action: "EVENT_CREATED",
      category: "OTHER",
      module: null,
      targetType: "Event",
      targetId: event.id,
      summary: `Event "${event.titleEn}" created${event.isPublished ? " and published" : " as a draft"}.`,
    });

    return json({ success: true, data: serialize(event) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("POST admin events error:", error);
    return json({ success: false, error: "Failed to create the event." }, 500);
  }
}
