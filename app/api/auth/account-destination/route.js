import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAccountDestination } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// Mirrors /api/auth/staff-destination, but for any account type: tells
// the caller where a logged-in user's "My Account"/"Dashboard" link
// should actually go (staff dashboard, student portal, or the
// bookstore/media account page), instead of that being hardcoded.
export async function GET() {
  try {
    const user = await requireUser();
    const destination = await getAccountDestination(user.id);

    return NextResponse.json({ success: true, destination });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Account destination lookup error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to determine destination." },
      { status: 500 }
    );
  }
}
