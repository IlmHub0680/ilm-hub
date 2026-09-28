import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// Read-only category list for the Coordinator's course-authoring form.
// Categories are the shared Book/Course/Program table (see
// app/api/admin/publishing/categories) — a Coordinator only needs to
// pick from what already exists, never create one, so this is
// intentionally GET-only.
export async function GET() {
  try {
    await requireModulePermission("PROGRAM_MATTERS", "view");

    const categories = await prisma.category.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameAr: true },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (error?.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "Program Matters access required" }, { status: 403 });
    }

    console.error("Coordinator categories GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load categories" }, { status: 500 });
  }
}
