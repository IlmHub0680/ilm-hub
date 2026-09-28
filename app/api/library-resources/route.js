import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public Library listing. This is the platform owner's own personal
// public reading library (articles, fatwas, research papers,
// manuscripts, etc.) -- no subscription, no viewer-tiering, access
// controlled only by isPublished. Deliberately separate from the
// institute's Digital Library (a Delegated Operation with its own
// visibility tiers -- see app/api/institute-library/route.js).
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim();

    const searchClause = search
      ? {
          OR: [
            { titleEn: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
            { descriptionEn: { contains: search, mode: "insensitive" } },
            { descriptionAr: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const items = await prisma.libraryResource.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...searchClause,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        slug: true,
        descriptionEn: true,
        descriptionAr: true,
        category: true,
        thumbnailUrl: true,
        author: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("LIBRARY LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load the Library right now." },
      { status: 500 }
    );
  }
}
