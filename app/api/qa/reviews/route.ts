import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const VALID_SUBJECT_TYPES = ["PROGRAM", "COURSE", "DEPARTMENT", "FACULTY", "STAFF"];

const SUBJECT_FIELD: Record<string, string> = {
  PROGRAM: "programId",
  COURSE: "courseId",
  DEPARTMENT: "departmentId",
  FACULTY: "facultyId",
  STAFF: "staffId",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const reviews = await prisma.qualityReview.findMany({
      include: {
        program: { select: { nameEn: true } },
        course: { select: { titleEn: true } },
        department: { select: { nameEn: true } },
        faculty: { select: { nameEn: true } },
        staff: { select: { user: { select: { name: true } } } },
        reviewedBy: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        subjectType: r.subjectType,
        subjectName:
          r.program?.nameEn ||
          r.course?.titleEn ||
          r.department?.nameEn ||
          r.faculty?.nameEn ||
          r.staff?.user?.name ||
          "Unknown",
        reviewType: r.reviewType,
        status: r.status,
        outcome: r.outcome,
        findings: r.findings,
        recommendation: r.recommendation,
        improvementStatus: r.improvementStatus,
        actionOwner: r.actionOwner,
        evidenceUrls: r.evidenceUrls,
        followUpDate: r.followUpDate,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        reviewedByName: r.reviewedBy.user.name,
      })),
    });
  } catch (error) {
    console.error("QA reviews GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("QA access required", 403);
    }

    return errorResponse("Failed to fetch reviews", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireModulePermission("QUALITY_ASSURANCE", "edit");

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: user.id },
    });

    if (!staff) {
      return errorResponse("No staff profile found for this account", 403);
    }

    const body = await request.json();

    const subjectType =
      typeof body.subjectType === "string" ? body.subjectType : "";
    const subjectId =
      typeof body.subjectId === "string" ? body.subjectId : "";
    const reviewType =
      typeof body.reviewType === "string" ? body.reviewType.trim() : "";
    const findings =
      typeof body.findings === "string" ? body.findings.trim() : "";
    const followUpDate =
      typeof body.followUpDate === "string" && body.followUpDate
        ? new Date(body.followUpDate)
        : null;
    const evidenceUrls = Array.isArray(body.evidenceUrls)
      ? body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
      : [];

    if (!VALID_SUBJECT_TYPES.includes(subjectType)) {
      return errorResponse("A valid subject type is required", 400);
    }

    if (!subjectId) {
      return errorResponse("A subject must be selected", 400);
    }

    if (!reviewType) {
      return errorResponse("A review type is required", 400);
    }

    const review = await prisma.qualityReview.create({
      data: {
        subjectType: subjectType as any,
        [SUBJECT_FIELD[subjectType]]: subjectId,
        reviewType,
        findings: findings || "Review scheduled — findings pending.",
        followUpDate,
        evidenceUrls,
        reviewedById: staff.id,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("QA reviews POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("QA edit access required", 403);
    }

    return errorResponse("Failed to schedule review", 500);
  }
}
