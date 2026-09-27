import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { findOrphanFiles } from "@/lib/r2FileLifecycle";

export const dynamic = "force-dynamic";

// Read-only scan: lists the live bucket, cross-references it against
// every real R2-key column in the database, and reports orphans.
// Never deletes anything -- see /purge for that, which requires the
// admin to explicitly pass back the keys this scan reported.
export async function GET() {
  try {
    await requireAdmin();

    const result = await findOrphanFiles();

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Admin access required." },
        { status: 403 }
      );
    }

    console.error("R2 orphan scan error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to scan for orphan files." },
      { status: 500 }
    );
  }
}
