import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStaffDestinations } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// Model 32 §1: every dashboard the signed-in staff member's real
// position permissions unlock, not just the single one
// /api/auth/staff-destination routes them to right after login --
// backs the dashboard/system switcher shown in DashboardShell when a
// staff member holds more than one.
export async function GET() {
  try {
    const user = await requireUser();
    const destinations = await getStaffDestinations(user.id);

    return NextResponse.json({ success: true, destinations });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Staff destinations lookup error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to determine destinations." },
      { status: 500 }
    );
  }
}
