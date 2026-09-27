import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost, communityHasAcceptedGuidelines } from "@/lib/community";

export const dynamic = "force-dynamic";

// Member-to-member blocking (Model 25 §7). GET lists who the current
// user has blocked (for a "Blocked Members" settings-style list);
// POST blocks someone; DELETE (?userId=) unblocks them. A block is
// created by the blocker alone -- no consent from the blocked side,
// same as blocking works on any platform -- but its effect is checked
// both ways everywhere it matters (see lib/community.js).

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const blocks = await prisma.communityBlock.findMany({
      where: { blockerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { blocked: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      success: true,
      data: blocks.map((b) => ({
        id: b.id,
        userId: b.blocked.id,
        name: b.blocked.name,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET community blocks error:", error);
    return NextResponse.json({ success: false, error: "Failed to load blocked members." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }
    if (!(await communityCanPost(user))) {
      return NextResponse.json({ success: false, error: "You don't have access to the Community." }, { status: 403 });
    }
    if (!(await communityHasAcceptedGuidelines(user.id))) {
      return NextResponse.json({ success: false, error: "Please review and accept the Community Guidelines first.", code: "GUIDELINES_NOT_ACCEPTED" }, { status: 403 });
    }

    const body = await request.json();
    const blockedId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (!blockedId) {
      return NextResponse.json({ success: false, error: "A member is required." }, { status: 400 });
    }
    if (blockedId === user.id) {
      return NextResponse.json({ success: false, error: "You can't block yourself." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
    }

    const block = await prisma.communityBlock.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId } },
      update: {},
      create: { blockerId: user.id, blockedId },
    });

    return NextResponse.json({ success: true, data: { id: block.id, userId: blockedId } });
  } catch (error) {
    console.error("POST community block error:", error);
    return NextResponse.json({ success: false, error: "Failed to block member." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blockedId = searchParams.get("userId") || "";

    if (!blockedId) {
      return NextResponse.json({ success: false, error: "A member is required." }, { status: 400 });
    }

    await prisma.communityBlock.deleteMany({ where: { blockerId: user.id, blockedId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE community block error:", error);
    return NextResponse.json({ success: false, error: "Failed to unblock member." }, { status: 500 });
  }
}
