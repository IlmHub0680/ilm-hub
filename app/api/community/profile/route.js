import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { communityCanPost, communityHasAcceptedGuidelines } from "@/lib/community";

export const dynamic = "force-dynamic";

// The signed-in member's own Community profile (Model 25 §5). Bio and
// interests are genuinely new, Community-only fields (CommunityProfile,
// created lazily on first save); department/program/graduation-year
// and alumni status are never duplicated here -- they're read live off
// the user's own StudentProfile so there is exactly one source of
// truth for that data, matching the standing "don't duplicate
// something that already exists and works" instruction. Never returns
// email/phone or anything from academic records, admissions, grades or
// finance -- see app/api/community/members/[userId]/route.js for the
// same privacy boundary on a public-facing profile.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
    }

    const [profile, studentProfile] = await Promise.all([
      prisma.communityProfile.findUnique({ where: { userId: user.id } }),
      prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { department: { select: { nameEn: true } }, program: { select: { nameEn: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        avatarUrl: user.avatarUrl || "",
        bio: profile?.bio || "",
        interests: profile?.interests || "",
        isPublic: profile?.isPublic ?? true,
        department: studentProfile?.department?.nameEn || null,
        program: studentProfile?.program?.nameEn || null,
        isAlumni: studentProfile?.status === "GRADUATED",
      },
    });
  } catch (error) {
    console.error("GET community profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(request) {
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
    const bio = typeof body?.bio === "string" ? body.bio.trim().slice(0, 500) : "";
    const interests = typeof body?.interests === "string" ? body.interests.trim().slice(0, 300) : "";
    const isPublic = typeof body?.isPublic === "boolean" ? body.isPublic : true;

    const profile = await prisma.communityProfile.upsert({
      where: { userId: user.id },
      update: { bio: bio || null, interests: interests || null, isPublic },
      create: { userId: user.id, bio: bio || null, interests: interests || null, isPublic },
    });

    return NextResponse.json({
      success: true,
      data: { bio: profile.bio || "", interests: profile.interests || "", isPublic: profile.isPublic },
    });
  } catch (error) {
    console.error("PATCH community profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to save profile." }, { status: 500 });
  }
}
