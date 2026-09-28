import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function serialize(h: { id: string; name: string; startDate: Date; endDate: Date; note: string | null; order: number; isActive: boolean }) {
  return {
    id: h.id,
    name: h.name,
    startDate: h.startDate.toISOString().slice(0, 10),
    endDate: h.endDate.toISOString().slice(0, 10),
    note: h.note || "",
    order: h.order,
    isActive: h.isActive,
  };
}

// Institution holidays, managed by Academic Records staff -- same
// permission gate as the Academic Calendar itself. Whole-list
// replace on save (add/remove/reorder rows, then Save), same
// convention as /api/admin/homepage/social-links: holidays have no
// external references by id.
export async function GET() {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "view");

    const holidays = await prisma.institutionHoliday.findMany({ orderBy: { order: "asc" } });

    return NextResponse.json({ success: true, holidays: holidays.map(serialize) });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("GET holidays error:", error);
    return errorResponse("Unable to load holidays.", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireModulePermission("ACADEMIC_RECORDS", "edit");

    const body = await request.json();
    const items = Array.isArray(body.holidays) ? body.holidays : null;

    if (!items) {
      return errorResponse("holidays must be an array.", 400);
    }

    const values = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = typeof item?.name === "string" ? item.name.trim() : "";
      const startDate = typeof item?.startDate === "string" ? new Date(item.startDate) : null;
      const endDate = typeof item?.endDate === "string" ? new Date(item.endDate) : null;
      const note = typeof item?.note === "string" ? item.note.trim() : "";

      if (!name) {
        return errorResponse(`Holiday ${i + 1}: a name is required.`, 400);
      }
      if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) {
        return errorResponse(`Holiday ${i + 1}: a valid start and end date are required.`, 400);
      }
      if (endDate < startDate) {
        return errorResponse(`Holiday ${i + 1}: the end date can't be before the start date.`, 400);
      }

      values.push({
        name,
        startDate,
        endDate,
        note: note || null,
        order: i,
        isActive: item?.isActive !== false,
      });
    }

    const holidays = await prisma.$transaction(async (tx) => {
      await tx.institutionHoliday.deleteMany({});

      if (values.length === 0) return [];

      await tx.institutionHoliday.createMany({ data: values });

      return tx.institutionHoliday.findMany({ orderBy: { order: "asc" } });
    });

    return NextResponse.json({ success: true, holidays: holidays.map(serialize) });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Academic Records access required.", 403);
    }
    console.error("PUT holidays error:", error);
    return errorResponse("Unable to save holidays.", 500);
  }
}
