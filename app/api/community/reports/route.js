import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost, communityHasAcceptedGuidelines } from "@/lib/community";

export const dynamic = "force-dynamic";

const REASONS = new Set(["SPAM", "HARASSMENT", "INAPPROPRIATE_CONTENT", "MISINFORMATION", "OTHER"]);

// Member-submitted content reports (Model 25 §8). Any signed-in member
// with Community access can report a post or a comment (never both at
// once); it lands OPEN and immediately shows up in the moderation
// queue at /api/admin/community/reports for staff/admin review --
// the same STUDENT_MATTERS permission the existing hide/pin controls
// already use, not a new permission invented for this.
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
    const postId = typeof body?.postId === "string" && body.postId ? body.postId : null;
    const commentId = typeof body?.commentId === "string" && body.commentId ? body.commentId : null;
    const reason = REASONS.has(body?.reason) ? body.reason : null;
    const details = typeof body?.details === "string" ? body.details.trim().slice(0, 1000) : null;

    if ((!postId && !commentId) || (postId && commentId)) {
      return NextResponse.json({ success: false, error: "Report exactly one post or comment." }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ success: false, error: "A reason is required." }, { status: 400 });
    }

    if (postId) {
      const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
      if (!post) return NextResponse.json({ success: false, error: "Post not found." }, { status: 404 });
    } else {
      const comment = await prisma.communityComment.findUnique({ where: { id: commentId }, select: { id: true } });
      if (!comment) return NextResponse.json({ success: false, error: "Comment not found." }, { status: 404 });
    }

    const report = await prisma.communityReport.create({
      data: {
        reporterId: user.id,
        postId,
        commentId,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: report.id },
      message: "Thank you — this has been reported to our moderation team.",
    });
  } catch (error) {
    console.error("POST community report error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit report." }, { status: 500 });
  }
}
