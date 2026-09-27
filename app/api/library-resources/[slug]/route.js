import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public single Library item. Personal public reading library --
// access controlled only by isPublished, no viewer-tiering. See
// app/api/library-resources/route.js's top comment.
export async function GET(request, { params }) {
  try {
    const slug = params?.slug?.trim();

    if (!slug) {
      return NextResponse.json({ success: false, error: "Library item is required." }, { status: 400 });
    }

    const item = await prisma.libraryResource.findUnique({ where: { slug } });

    if (!item || !item.isPublished) {
      return NextResponse.json({ success: false, error: "Library item not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("LIBRARY ITEM ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load this Library item." },
      { status: 500 }
    );
  }
}
