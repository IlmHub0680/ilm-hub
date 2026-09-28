import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");
    const { id } = await params;

    const calendar = await prisma.academicCalendar.findUnique({
      where: { id },
      include: { entries: { orderBy: [{ sortOrder: "asc" }] } },
    });

    if (!calendar) {
      return errorResponse("Academic calendar not found.", 404);
    }

    return NextResponse.json({ success: true, calendar });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar detail error:", error);
    return errorResponse("Unable to load this academic calendar.", 500);
  }
}

// Replaces the calendar's meta and its full set of entries in one call —
// entries have no independent identity worth preserving row-by-row (they're
// re-typed/re-ordered together as one table), so a whole-table replace is
// simpler and safer than a separate CRUD endpoint per row. Only allowed
// while the calendar is still a DRAFT: a PUBLISHED or ARCHIVED calendar is
// the historical record and is never rewritten in place.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");
    const { id } = await params;
    const body = await request.json();
    const { academicYearLabel, hijriYearLabel, entries } = body;

    const existing = await prisma.academicCalendar.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Academic calendar not found.", 404);
    }
    if (existing.status !== "DRAFT") {
      return errorResponse("Only a draft calendar can be edited. Create a new draft instead.", 400);
    }

    if (!Array.isArray(entries)) {
      return errorResponse("Entries must be a list.", 400);
    }
    for (const entry of entries) {
      if (!entry.section || !entry.procedure || !entry.gregorianDate || !entry.hijriDate) {
        return errorResponse("Every row needs a section, procedure, Gregorian date and Hijri date.", 400);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.academicCalendar.update({
        where: { id },
        data: {
          ...(academicYearLabel ? { academicYearLabel: academicYearLabel.trim() } : {}),
          ...(hijriYearLabel ? { hijriYearLabel: hijriYearLabel.trim() } : {}),
        },
      });

      await tx.academicCalendarEntry.deleteMany({ where: { calendarId: id } });

      if (entries.length > 0) {
        await tx.academicCalendarEntry.createMany({
          data: entries.map((entry: any, index: number) => ({
            calendarId: id,
            section: String(entry.section).trim(),
            procedure: String(entry.procedure).trim(),
            gregorianDate: String(entry.gregorianDate).trim(),
            hijriDate: String(entry.hijriDate).trim(),
            sortOrder: index,
          })),
        });
      }

      return tx.academicCalendar.findUnique({
        where: { id },
        include: { entries: { orderBy: [{ sortOrder: "asc" }] } },
      });
    });

    return NextResponse.json({ success: true, calendar: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar update error:", error);
    return errorResponse("Unable to save this academic calendar.", 500);
  }
}

// A draft that was never published can be deleted outright (nothing in the
// rest of the system references a draft's rows).
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");
    const { id } = await params;

    const existing = await prisma.academicCalendar.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Academic calendar not found.", 404);
    }
    if (existing.status !== "DRAFT") {
      return errorResponse("Only a draft calendar can be deleted.", 400);
    }

    await prisma.academicCalendar.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar delete error:", error);
    return errorResponse("Unable to delete this academic calendar.", 500);
  }
}
