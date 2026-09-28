import { prisma } from "@/lib/prisma";

// Public, read-only endpoint -- only published events, matching the
// same "public routes never see drafts" rule already used for
// /api/legal-content and /api/community/*. Past events stay listed for
// a short grace window (so an event doesn't vanish from the page the
// moment it starts) but the public page itself separates them into
// "Upcoming" and "Past" sections client-side using the event's own
// eventDate.
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { eventDate: "asc" },
    });

    return Response.json({
      success: true,
      data: events.map((event) => ({
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
        category: event.category || null,
      })),
    });
  } catch (error) {
    console.error("Public events GET error (serving empty list):", error);
    return Response.json({ success: true, data: [] });
  }
}
