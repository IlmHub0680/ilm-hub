import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost, communityIsBlockedEitherWay } from "@/lib/community";

export const dynamic = "force-dynamic";

// Public-facing view of ANOTHER member's Community profile (Model 25 §5/§7).
// Respects CommunityProfile.isPublic and mutual block status. Never returns
// email/phone/academic/admissions/grades/finance fields -- only what
// app/api/community/profile/route.js (the "own profile" route) already
// exposes about a user, reused here rather than re-derived.
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }
    if (!(await communityCanPost(user))) {
      return NextResponse.json({ success: false, error: "You don't have access to the Community." }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
    }

    // Viewing yourself through this endpoint just mirrors your own profile.
    if (userId === user.id) {
      return NextResponse.json({
        success: false,
        error: "Use /api/community/profile for your own profile.",
      }, { status: 400 });
    }

    const isBlocked = await communityIsBlockedEitherWay(user.id, userId);
    if (isBlocked) {
      // Don't distinguish "blocked" from "not found" in the response shape --
      // a blocked member should not learn they were specifically blocked.
      return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatarUrl: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
    }

    // Only show a profile for someone who actually has Community access
    // (a real student/staff/admin account), not just any User row.
    const targetHasAccess = await communityCanPost(target);
    if (!targetHasAccess) {
      return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
    }

    const [profile, studentProfile] = await Promise.all([
      prisma.communityProfile.findUnique({ where: { userId } }),
      prisma.studentProfile.findUnique({
        where: { userId },
        include: { department: { select: { nameEn: true } }, program: { select: { nameEn: true } } },
      }),
    ]);

    const isPublic = profile?.isPublic ?? true;
    if (!isPublic) {
      return NextResponse.json({
        success: true,
        data: {
          name: target.name,
          avatarUrl: target.avatarUrl || "",
          isPublic: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: target.name,
        avatarUrl: target.avatarUrl || "",
        bio: profile?.bio || "",
        interests: profile?.interests || "",
        isPublic: true,
        department: studentProfile?.department?.nameEn || null,
        program: studentProfile?.program?.nameEn || null,
        isAlumni: studentProfile?.status === "GRADUATED",
      },
    });
  } catch (error) {
    console.error("GET community member profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to load member." }, { status: 500 });
  }
}
