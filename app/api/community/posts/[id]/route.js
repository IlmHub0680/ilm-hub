import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

// Light moderation only (hide/unhide, pin/unpin) — no hard delete here,
// consistent with the rest of the site treating destructive actions as
// something that needs its own deliberate confirmation flow, not a
// same-endpoint toggle.
export const dynamic = "force-dynamic";

async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return user;

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    include: { position: { include: { permissions: true } } },
  });
  const perm = staff?.isActive
    ? staff.position.permissions.find((p) => p.module === "STUDENT_MATTERS")
    : null;
  if (!perm?.canEdit) throw new Error("FORBIDDEN");
  return user;
}

export async function PATCH(request, { params }) {
  try {
    const moderator = await requireModerator();
    const { id } = await params;

    const body = await request.json();
    const data = {};
    if (typeof body?.isHidden === "boolean") data.isHidden = body.isHidden;
    if (typeof body?.isPinned === "boolean") data.isPinned = body.isPinned;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update." }, { status: 400 });
    }

    const post = await prisma.communityPost.update({ where: { id }, data });

    await logAudit({
      actor: moderator,
      action: "COMMUNITY_POST_MODERATED",
      category: "COMMUNITY_MODERATION",
      module: "STUDENT_MATTERS",
      targetType: "CommunityPost",
      targetId: post.id,
      summary: `Post ${post.id} updated: ${Object.entries(data).map(([k, v]) => `${k}=${v}`).join(", ")}`,
      metadata: data,
    });

    return NextResponse.json({ success: true, data: { id: post.id, isHidden: post.isHidden, isPinned: post.isPinned } });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Moderator access required." }, { status: 403 });

    console.error("PATCH community post error:", error);
    return NextResponse.json({ success: false, error: "Failed to update post." }, { status: 500 });
  }
}
