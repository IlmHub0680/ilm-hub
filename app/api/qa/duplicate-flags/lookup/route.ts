import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Resolves real Course/Program/Category rows by name for the
// duplication-flag picker (Model 30 §7) -- never a static list.
export async function GET(request: Request) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const { searchParams } = new URL(request.url);
    const subjectType = searchParams.get("type") || "";
    const q = (searchParams.get("q") || "").trim();

    if (subjectType === "COURSE") {
      const courses = await prisma.course.findMany({
        where: q
          ? { OR: [{ titleEn: { contains: q, mode: "insensitive" } }, { courseCode: { contains: q, mode: "insensitive" } }] }
          : {},
        select: { id: true, titleEn: true, courseCode: true },
        take: 20,
        orderBy: { titleEn: "asc" },
      });
      return NextResponse.json({
        success: true,
        data: courses.map((c) => ({ id: c.id, label: `${c.titleEn} (${c.courseCode})` })),
      });
    }

    if (subjectType === "PROGRAM") {
      const programs = await prisma.program.findMany({
        where: q
          ? { OR: [{ nameEn: { contains: q, mode: "insensitive" } }, { code: { contains: q, mode: "insensitive" } }] }
          : {},
        select: { id: true, nameEn: true, code: true },
        take: 20,
        orderBy: { nameEn: "asc" },
      });
      return NextResponse.json({
        success: true,
        data: programs.map((p) => ({ id: p.id, label: `${p.nameEn} (${p.code})` })),
      });
    }

    if (subjectType === "CATEGORY") {
      const categories = await prisma.category.findMany({
        where: q ? { nameEn: { contains: q, mode: "insensitive" } } : {},
        select: { id: true, nameEn: true },
        take: 20,
        orderBy: { nameEn: "asc" },
      });
      return NextResponse.json({
        success: true,
        data: categories.map((c) => ({ id: c.id, label: c.nameEn })),
      });
    }

    return errorResponse("A valid subject type is required", 400);
  } catch (error: any) {
    console.error("GET duplicate flag lookup error:", error);
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("QA access required", 403);
    return errorResponse("Failed to search subjects", 500);
  }
}
