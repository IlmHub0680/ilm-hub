import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canViewInstituteLibraryResource } from "@/lib/institute-library-visibility";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public single institute Digital Library item. Deliberately returns
// 404 (never 403) whenever the current viewer's tier doesn't satisfy
// the resource's visibility -- restricted resources must never be
// exposed simply because someone knows the URL; a 403 would still
// confirm existence to an unauthorized caller. From the outside,
// "doesn't exist" and "exists but you can't see it" must look
// identical.
export async function GET(request, { params }) {
  try {
    const slug = params?.slug?.trim();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Digital Library item is required." },
        { status: 400 }
      );
    }

    const item = await prisma.instituteLibraryResource.findUnique({ where: { slug } });

    const user = await getCurrentUser();
    const visible = item ? await canViewInstituteLibraryResource(item, user) : false;

    if (!visible) {
      return NextResponse.json(
        { success: false, error: "Digital Library item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("INSTITUTE LIBRARY ITEM ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load this Digital Library item." },
      { status: 500 }
    );
  }
}
