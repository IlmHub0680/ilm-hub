import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Publishing a calendar makes it the one calendar every portal reads
// (see app/api/academic-calendar) and archives whichever calendar was
// published before it — so there is always exactly one PUBLISHED
// calendar, and every calendar that was ever published is kept, never
// deleted, as ARCHIVED history.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");
    const { id } = await params;

    const calendar = await prisma.academicCalendar.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });
    if (!calendar) {
      return errorResponse("Academic calendar not found.", 404);
    }
    if (calendar.status !== "DRAFT") {
      return errorResponse("Only a draft calendar can be published.", 400);
    }
    if (calendar._count.entries === 0) {
      return errorResponse("Add at least one row to the calendar before publishing.", 400);
    }

    const published = await prisma.$transaction(async (tx) => {
      await tx.academicCalendar.updateMany({
        where: { status: "PUBLISHED" },
        data: { status: "ARCHIVED" },
      });

      return tx.academicCalendar.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true, calendar: published });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("Academic calendar publish error:", error);
    return errorResponse("Unable to publish this academic calendar.", 500);
  }
}
