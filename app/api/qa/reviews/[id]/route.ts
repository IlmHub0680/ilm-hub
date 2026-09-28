import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const VALID_OUTCOMES = [
  "COMPLIANT",
  "MINOR_NON_COMPLIANCE",
  "MAJOR_NON_COMPLIANCE",
];

const VALID_IMPROVEMENT_STATUSES = ["NOT_REQUIRED", "PENDING", "IN_PROGRESS", "COMPLETED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "edit");

    const { id } = await params;
    const body = await request.json();

    const action = typeof body.action === "string" ? body.action : "";

    const existing = await prisma.qualityReview.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Review not found", 404);
    }

    if (action === "start") {
      if (existing.status !== "SCHEDULED") {
        return errorResponse("Only a scheduled review can be started", 409);
      }

      const updated = await prisma.qualityReview.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "complete") {
      if (existing.status === "COMPLETED") {
        return errorResponse("Review is already completed", 409);
      }

      const findings =
        typeof body.findings === "string" ? body.findings.trim() : "";
      const recommendation =
        typeof body.recommendation === "string" && body.recommendation.trim()
          ? body.recommendation.trim()
          : null;
      const outcome = typeof body.outcome === "string" ? body.outcome : "";

      if (!findings) {
        return errorResponse("Findings are required to complete a review", 400);
      }

      if (!VALID_OUTCOMES.includes(outcome)) {
        return errorResponse("A valid outcome is required", 400);
      }

      const improvementStatus = VALID_IMPROVEMENT_STATUSES.includes(body.improvementStatus)
        ? body.improvementStatus
        : recommendation
          ? "PENDING"
          : "NOT_REQUIRED";
      const evidenceUrls = Array.isArray(body.evidenceUrls)
        ? body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)
        : existing.evidenceUrls;
      const actionOwner =
        typeof body.actionOwner === "string" && body.actionOwner.trim()
          ? body.actionOwner.trim()
          : null;

      const updated = await prisma.qualityReview.update({
        where: { id },
        data: {
          status: "COMPLETED",
          findings,
          recommendation,
          outcome: outcome as any,
          improvementStatus: improvementStatus as any,
          evidenceUrls,
          completedAt: new Date(),
          ...(improvementStatus !== "NOT_REQUIRED" ? { actionOwner } : {}),
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Tracks an improvement plan (and adds evidence) after a review has
    // already been completed — a review's improvement plan is often
    // followed up over several later visits, not resolved in one step.
    if (action === "update_progress") {
      if (existing.status !== "COMPLETED") {
        return errorResponse("Only a completed review has an improvement plan to update", 409);
      }

      const improvementStatus = VALID_IMPROVEMENT_STATUSES.includes(body.improvementStatus)
        ? body.improvementStatus
        : existing.improvementStatus;
      const evidenceUrls = Array.isArray(body.evidenceUrls)
        ? Array.from(new Set([...existing.evidenceUrls, ...body.evidenceUrls.map((u: unknown) => String(u).trim()).filter(Boolean)]))
        : existing.evidenceUrls;
      const actionOwner =
        typeof body.actionOwner === "string" && body.actionOwner.trim()
          ? body.actionOwner.trim()
          : existing.actionOwner;

      const updated = await prisma.qualityReview.update({
        where: { id },
        data: {
          improvementStatus: improvementStatus as any,
          evidenceUrls,
          actionOwner,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    console.error("QA review update error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("QA edit access required", 403);
    }

    return errorResponse("Failed to update review", 500);
  }
}
