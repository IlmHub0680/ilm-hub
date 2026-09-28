import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Lists the real, currently-active institutional Units (Rectorate,
// Deanship of Student Affairs, Deanship of Admission, Finance, ICT,
// etc.) and academic Departments a student can address a complaint or
// enquiry to. Backed entirely by existing data — adding a new Unit or
// Department in Admin automatically makes it selectable here, with no
// code change required.
export async function GET() {
  try {
    await requireUser();

    const [units, departments] = await Promise.all([
      prisma.unit.findMany({
        where: { isActive: true },
        select: { id: true, nameEn: true, nameAr: true, type: true, code: true },
        orderBy: [{ type: "asc" }, { nameEn: "asc" }],
      }),
      prisma.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          code: true,
          faculty: { select: { nameEn: true } },
        },
        orderBy: { nameEn: "asc" },
      }),
    ]);

    return NextResponse.json({ success: true, units, departments });
  } catch (error) {
    console.error("List recipients error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);

    return errorResponse("Failed to load recipients", 500);
  }
}
