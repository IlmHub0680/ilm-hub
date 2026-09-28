import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityIsModerator } from "@/lib/community";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

// Resolve one report as REVIEWED or DISMISSED. Optionally hides the
// reported post/comment in the same request (hideContent: true) so a
// moderator can act on an obviously-bad report from this one screen
// instead of separately finding the post in the feed to hide it --
// this reuses CommunityPost/CommunityComment.isHidden, the exact same
// field the feed's own hide/pin buttons already toggle; it does not
// invent a second hidden-state.
export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }
    if (!(await communityIsModerator(user))) {
      return NextResponse.json({ success: false, error: "Moderator access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const status = body?.status === "DISMISSED" ? "DISMISSED" : body?.status === "REVIEWED" ? "REVIEWED" : null;
    const hideContent = body?.hideContent === true;

    if (!status) {
      return NextResponse.json({ success: false, error: "A resolution status is required." }, { status: 400 });
    }

    const existing = await prisma.communityReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Report not found." }, { status: 404 });
    }

    if (hideContent) {
      if (existing.postId) {
        await prisma.communityPost.update({ where: { id: existing.postId }, data: { isHidden: true } });
      } else if (existing.commentId) {
        await prisma.communityComment.update({ where: { id: existing.commentId }, data: { isHidden: true } });
      }
    }

    const report = await prisma.communityReport.update({
      where: { id },
      data: { status, reviewedById: user.id, reviewedAt: new Date() },
    });

    await logAudit({
      actor: user,
      action: "COMMUNITY_REPORT_RESOLVED",
      category: "COMMUNITY_MODERATION",
      module: "STUDENT_MATTERS",
      targetType: "CommunityReport",
      targetId: report.id,
      summary: `Report ${report.id} resolved as ${status}${hideContent ? " (content hidden)" : ""}`,
      metadata: { status, hideContent, postId: existing.postId, commentId: existing.commentId },
    });

    return NextResponse.json({ success: true, data: { id: report.id, status: report.status } });
  } catch (error) {
    console.error("PATCH community report error:", error);
    return NextResponse.json({ success: false, error: "Failed to update report." }, { status: 500 });
  }
}
