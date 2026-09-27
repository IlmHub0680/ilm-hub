import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getStaffDestination } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const destination = await getStaffDestination(user.id);

    return NextResponse.json({ success: true, destination });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Staff destination lookup error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to determine destination." },
      { status: 500 }
    );
  }
}