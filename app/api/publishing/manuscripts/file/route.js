import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getR2PresignedUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "";

    if (!key.startsWith("manuscripts/")) {
      return NextResponse.json(
        { success: false, error: "Invalid manuscript file reference." },
        { status: 400 }
      );
    }

    const isOwner = key.startsWith(`manuscripts/${user.id}/`);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    const url = await getR2PresignedUrl(key, 300);

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Manuscript file access error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to access manuscript file." },
      { status: 500 }
    );
  }
}
