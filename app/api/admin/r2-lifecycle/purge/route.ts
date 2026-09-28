import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { findOrphanFiles, purgeOrphanFiles } from "@/lib/r2FileLifecycle";

export const dynamic = "force-dynamic";

// Deletes only keys that a FRESH scan (run again here, not trusted
// from the client's earlier /scan call) confirms are still orphaned --
// closing the window where a file could have been attached to a new
// database row in between an admin viewing a scan and clicking
// "purge". The client-supplied `keys` is intersected against this
// fresh scan rather than used directly, so this endpoint can never be
// made to delete a key that is actually referenced.
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const requestedKeys: string[] = Array.isArray(body.keys)
      ? body.keys.filter((k: unknown) => typeof k === "string")
      : [];

    if (requestedKeys.length === 0) {
      return NextResponse.json(
        { success: false, error: "No file keys were provided to purge." },
        { status: 400 }
      );
    }

    const freshScan = await findOrphanFiles();
    const stillOrphaned = new Set(freshScan.orphanKeys);

    const safeToDelete = requestedKeys.filter((key) => stillOrphaned.has(key));
    const skipped = requestedKeys.filter((key) => !stillOrphaned.has(key));

    if (safeToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "None of the requested keys are still orphaned -- nothing was deleted.",
        deleted: [],
        skipped,
      });
    }

    const result = await purgeOrphanFiles(safeToDelete);

    return NextResponse.json({
      success: true,
      attempted: result.attempted,
      deleted: result.deleted,
      failed: result.failed,
      skipped,
    });
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

    console.error("R2 orphan purge error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to purge orphan files." },
      { status: 500 }
    );
  }
}
