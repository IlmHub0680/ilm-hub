import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Academic Calendar management — Academic Records / Registrar staff only.
// Calendars are never edited in place once PUBLISHED or ARCHIVED: publishing
// snapshots a calendar as the one every portal reads, and archives whichever
// calendar was published before it, so every past academic calendar stays on
// file rather than being overwritten.
export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const calendars = await prisma.academicCalendar.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { entries: true } },
      },
    });

    return NextResponse.json({
      success: true,
      calendars: calendars.map((c) => ({
        id: c.id,
        academicYearLabel: c.academicYearLabel,
        hijriYearLabel: c.hijriYearLabel,
        status: c.status,
        publishedAt: c.publishedAt,
        createdAt: c.createdAt,
        createdByName: c.createdBy.name,
        entryCount: c._count.entries,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar list error:", error);
    return errorResponse("Unable to load academic calendars.", 500);
  }
}

// Create a new DRAFT calendar (meta only — entries are added via PATCH on
// the [id] route once the draft exists).
export async function POST(request: Request) {
  try {
    const user = await requireModulePermission("ACADEMIC_RECORDS", "edit");
    const body = await request.json();
    const { academicYearLabel, hijriYearLabel } = body;

    if (!academicYearLabel || !academicYearLabel.trim()) {
      return errorResponse("An academic year (e.g. 2026/2027) is required.", 400);
    }
    if (!hijriYearLabel || !hijriYearLabel.trim()) {
      return errorResponse("A Hijri year (e.g. 1448/1449 AH) is required.", 400);
    }

    const calendar = await prisma.academicCalendar.create({
      data: {
        academicYearLabel: academicYearLabel.trim(),
        hijriYearLabel: hijriYearLabel.trim(),
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true, calendar });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar create error:", error);
    return errorResponse("Unable to create this academic calendar.", 500);
  }
}
