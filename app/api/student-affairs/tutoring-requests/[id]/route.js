import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request, { params }) {
  try {
    await requireModulePermission("STUDENT_MATTERS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    const existing = await prisma.tutoringRequest.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse("Tutoring request not found", 404);
    }

    if (action === "approve") {
      if (existing.status !== "PENDING") {
        return errorResponse(
          `Cannot approve a request that is currently ${existing.status}`,
          409
        );
      }

      const feeUSD = Number(body.feeUSD);

      if (!Number.isFinite(feeUSD) || feeUSD <= 0) {
        return errorResponse("A valid fee (in USD) is required to approve this request", 400);
      }

      const updated = await prisma.tutoringRequest.update({
        where: { id },
        data: { status: "APPROVED", feeUSD },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "reject") {
      if (existing.status !== "PENDING") {
        return errorResponse(
          `Cannot reject a request that is currently ${existing.status}`,
          409
        );
      }

      const updated = await prisma.tutoringRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "complete") {
      if (existing.status !== "APPROVED") {
        return errorResponse(
          `Cannot complete a request that is currently ${existing.status}`,
          409
        );
      }

      const updated = await prisma.tutoringRequest.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return errorResponse("Unknown action", 400);
  } catch (error) {
    console.error("Student Affairs tutoring request update error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs edit access required", 403);

    return errorResponse("Failed to update tutoring request", 500);
  }
}
