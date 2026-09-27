import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getViewerInstituteLibraryRank,
  instituteLibraryVisibilityWhere,
} from "@/lib/institute-library-visibility";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public institute Digital Library listing (spec §12) -- a Delegated
// Operation run by the Librarian / Library Services role. Access
// follows BOTH isPublished (the coarse kill-switch) and the
// resource's visibility tier for the CURRENT viewer -- see
// lib/institute-library-visibility.js, the single shared enforcement
// helper every institute-Library-facing route goes through. This
// route reads the caller's session (if any) so a signed-in student,
// faculty member, or staff member sees everything their tier covers
// (not just PUBLIC, which is all an anonymous visitor gets).
//
// Deliberately separate from app/api/library-resources/route.js
// (the platform owner's personal public library, isPublished-only,
// no tiering) -- see that route's own comment.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") || searchParams.get("q") || "").trim();

    const user = await getCurrentUser();
    const viewerRank = await getViewerInstituteLibraryRank(user);

    const searchClause = search
      ? {
          OR: [
            { titleEn: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
            { descriptionEn: { contains: search, mode: "insensitive" } },
            { descriptionAr: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { topic: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const items = await prisma.instituteLibraryResource.findMany({
      where: {
        ...instituteLibraryVisibilityWhere(viewerRank),
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
        subject: true,
        topic: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("INSTITUTE LIBRARY LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load the Digital Library right now." },
      { status: 500 }
    );
  }
}
