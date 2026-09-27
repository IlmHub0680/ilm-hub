import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// The single, central Academic Calendar every portal reads — Student,
// Faculty, Department, staff, Admin, and (Model 15) the public Academy
// all call this same endpoint, so there is exactly one calendar in the
// whole system rather than a copy per portal. Only ever returns the
// PUBLISHED calendar, so this is safe to leave open to anonymous
// visitors -- the Academic Calendar is meant to be public, the way a
// real institution's calendar is. Read-only: management (create/edit/
// publish) lives under app/api/records/academic-calendar, still gated
// to Academic Records staff.
export async function GET() {
  try {
    const [calendar, holidayRows] = await Promise.all([
      prisma.academicCalendar.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: {
          entries: { orderBy: [{ sortOrder: "asc" }] },
        },
      }),
      // Holidays (Model 28) -- independent of the published calendar,
      // so they still show even before any calendar has been published.
      prisma.institutionHoliday.findMany({
        where: { isActive: true },
        orderBy: { startDate: "asc" },
      }),
    ]);

    const holidays = holidayRows.map((h) => ({
      id: h.id,
      name: h.name,
      startDate: h.startDate.toISOString().slice(0, 10),
      endDate: h.endDate.toISOString().slice(0, 10),
      note: h.note || "",
    }));

    if (!calendar) {
      return NextResponse.json({ success: true, calendar: null, holidays });
    }

    return NextResponse.json({
      success: true,
      calendar: {
        id: calendar.id,
        academicYearLabel: calendar.academicYearLabel,
        hijriYearLabel: calendar.hijriYearLabel,
        publishedAt: calendar.publishedAt,
        entries: calendar.entries,
      },
      holidays,
    });
  } catch (error) {
    console.error("Academic calendar public read error:", error);
    return NextResponse.json({ success: false, error: "Unable to load the academic calendar." }, { status: 500 });
  }
}
