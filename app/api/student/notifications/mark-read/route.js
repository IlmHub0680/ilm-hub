import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Marks all of the current user's notifications as read. "Mark All as
// Read" in the Notification Center previously only mutated local React
// state, so it reverted the moment the portal reloaded.
export async function POST() {
  try {
    const user = await requireUser();

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Mark notifications read error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update notifications." },
      { status: 500 }
    );
  }
}
