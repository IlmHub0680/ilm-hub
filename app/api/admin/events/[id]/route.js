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
    category: event.category || null,
    createdByName: event.createdBy?.name || "Unknown",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

const VALID_EVENT_CATEGORIES = ["RESEARCH", "SEMINAR", "CONFERENCE", "WORKSHOP", "GENERAL"];

const EDITABLE_FIELDS = [
  "titleEn", "titleAr", "descriptionEn", "descriptionAr",
  "eventTime", "location", "onlineLink", "thumbnailUrl", "detailsLink",
];

export async function PATCH(request, { params }) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return json({ success: false, error: "Event not found." }, 404);

    const body = await request.json();
    const data = {};
    const changes = [];

    for (const field of EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        const raw = body[field];
        const value = typeof raw === "string" ? raw.trim() || null : null;
        const requiredField = field === "titleEn" || field === "descriptionEn";
        if (requiredField && !value) {
          return json({ success: false, error: `${field} cannot be empty.` }, 400);
        }
        if (value !== (existing[field] ?? null)) {
          data[field] = value;
          changes.push(field);
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "eventDate")) {
      const eventDate = body.eventDate ? new Date(body.eventDate) : null;
      if (!eventDate || Number.isNaN(eventDate.getTime())) {
        return json({ success: false, error: "A valid event date is required." }, 400);
      }
      if (eventDate.getTime() !== new Date(existing.eventDate).getTime()) {
        data.eventDate = eventDate;
        changes.push("eventDate");
      }
    }

    let publishChange = null;
    if (Object.prototype.hasOwnProperty.call(body, "isPublished") && typeof body.isPublished === "boolean") {
      if (body.isPublished !== existing.isPublished) {
        data.isPublished = body.isPublished;
        publishChange = body.isPublished;
      }
    }

    // Research & Scholarly Affairs integration -- optional, nullable;
    // an explicit null/empty clears the category back to a plain
    // institute event.
    if (Object.prototype.hasOwnProperty.call(body, "category")) {
      const category = VALID_EVENT_CATEGORIES.includes(body.category) ? body.category : null;
      if (category !== (existing.category ?? null)) {
        data.category = category;
        changes.push("category");
      }
    }

    const event = Object.keys(data).length > 0
      ? await prisma.event.update({ where: { id }, data, include: { createdBy: { select: { name: true } } } })
      : await prisma.event.findUnique({ where: { id }, include: { createdBy: { select: { name: true } } } });

    if (changes.length > 0 || publishChange !== null) {
      await logAudit({
        actor,
        action: publishChange !== null ? (publishChange ? "EVENT_PUBLISHED" : "EVENT_UNPUBLISHED") : "EVENT_UPDATED",
        category: "OTHER",
        targetType: "Event",
        targetId: event.id,
        summary: `Event "${event.titleEn}" ${publishChange !== null ? (publishChange ? "published" : "unpublished") : `updated (${changes.join(", ")})`}.`,
      });
    }

    return json({ success: true, data: serialize(event) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("PATCH admin event error:", error);
    return json({ success: false, error: "Failed to update the event." }, 500);
  }
}

// No hard delete -- unpublish (isPublished:false via PATCH) is the
// supported way to pull an event from the public site, matching the
// "never hard-delete, use a status flag" convention already used for
// StaffProfile/Position elsewhere in this codebase, so an event's
// history is never silently lost.
