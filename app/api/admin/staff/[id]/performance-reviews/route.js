import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const RATINGS = ["NEEDS_IMPROVEMENT", "MEETS_EXPECTATIONS", "EXCEEDS_EXPECTATIONS", "OUTSTANDING"];
const STATUSES = ["DRAFT", "SUBMITTED", "ACKNOWLEDGED"];

// Who may file a performance review for a staff member: an Admin/Super
// Admin, or anyone holding edit rights on DEPARTMENT_MATTERS (a Head
// of Department) or FACULTY_MATTERS (a Dean) — the same module
// permissions those positions are already seeded with, rather than a
// new permission of its own. The reviewer must have their own
// StaffProfile, since StaffPerformanceReview.reviewerId is a real
// relation, not a free-text name.
async function requireReviewer() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    let allowed = false;
    try {
      await requireModulePermission("DEPARTMENT_MATTERS", "edit");
      allowed = true;
    } catch {
      // fall through to the faculty-level check
    }
    if (!allowed) {
      await requireModulePermission("FACULTY_MATTERS", "edit");
    }
  }

  const reviewerStaff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

  if (!reviewerStaff) {
    throw new Error("NO_REVIEWER_PROFILE");
  }

  return reviewerStaff;
}

export async function GET(request, { params }) {
  try {
    await requireReviewer();

    const { id } = await params;

    const reviews = await prisma.staffPerformanceReview.findMany({
      where: { staffId: id },
      orderBy: { createdAt: "desc" },
      include: { reviewer: { select: { user: { select: { name: true } } } } },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Performance reviews GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("You do not have permission to view performance reviews.", 403);
    if (error?.message === "NO_REVIEWER_PROFILE") return errorResponse("Only staff with their own profile may view performance reviews.", 403);

    return errorResponse("Failed to load performance reviews", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const reviewerStaff = await requireReviewer();

    const { id } = await params;
    const body = await request.json();

    const period = typeof body.period === "string" ? body.period.trim() : "";
    if (!period) return errorResponse("A review period (e.g. \"2026 Semester 1\") is required.", 400);

    const staff = await prisma.staffProfile.findUnique({ where: { id } });
    if (!staff) return errorResponse("Staff member not found", 404);

    const review = await prisma.staffPerformanceReview.create({
      data: {
        staffId: id,
        reviewerId: reviewerStaff.id,
        period,
        rating: RATINGS.includes(body.rating) ? body.rating : null,
        strengths: typeof body.strengths === "string" ? body.strengths.trim() || null : null,
        areasForGrowth: typeof body.areasForGrowth === "string" ? body.areasForGrowth.trim() || null : null,
        status: STATUSES.includes(body.status) ? body.status : "DRAFT",
        reviewedAt: STATUSES.includes(body.status) && body.status !== "DRAFT" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Performance reviews POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("You do not have permission to file performance reviews.", 403);
    if (error?.message === "NO_REVIEWER_PROFILE") return errorResponse("Only staff with their own profile may file performance reviews.", 403);

    return errorResponse("Failed to save performance review", 500);
  }
}
