import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  communityCanPost,
  communityGuidelinesAcceptanceStatus,
} from "@/lib/community";

export const dynamic = "force-dynamic";

// Mandatory Community Guidelines acknowledgment (Model 25 addendum).
// GET returns the current guidelines content plus whether this user
// has accepted the version currently in force; POST records
// acceptance. Content itself is the existing Legal & Info Pages CMS
// row (slug "community-guidelines") -- this route never stores a
// second copy of the guidelines text.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const status = await communityGuidelinesAcceptanceStatus(user.id);

    return NextResponse.json({
      success: true,
      data: {
        title: status.current.title,
        bodyHtml: status.current.bodyHtml,
        accepted: status.accepted,
        acceptedAt: status.acceptedAt,
      },
    });
  } catch (error) {
    console.error("GET community guidelines error:", error);
    return NextResponse.json({ success: false, error: "Failed to load Community Guidelines." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }
    if (!(await communityCanPost(user))) {
      return NextResponse.json({ success: false, error: "You don't have access to the Community." }, { status: 403 });
    }

    const status = await communityGuidelinesAcceptanceStatus(user.id);

    const acceptance = await prisma.communityGuidelinesAcceptance.upsert({
      where: { userId: user.id },
      update: { contentHash: status.current.hash, acceptedAt: new Date() },
      create: { userId: user.id, contentHash: status.current.hash },
    });

    return NextResponse.json({
      success: true,
      data: { accepted: true, acceptedAt: acceptance.acceptedAt },
    });
  } catch (error) {
    console.error("POST community guidelines acceptance error:", error);
    return NextResponse.json({ success: false, error: "Failed to record acceptance." }, { status: 500 });
  }
}
