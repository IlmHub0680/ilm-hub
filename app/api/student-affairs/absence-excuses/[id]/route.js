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
    const reviewNote =
      typeof body.reviewNote === "string" && body.reviewNote.trim()
        ? body.reviewNote.trim()
        : undefined;

    const existing = await prisma.absenceExcuse.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse("Absence excuse not found", 404);
    }

    if (existing.status !== "PENDING") {
      return errorResponse(
        `Cannot ${action} an excuse that is currently ${existing.status}`,
        409
      );
    }

    if (action !== "approve" && action !== "reject") {
      return errorResponse("Unknown action", 400);
    }

    const updated = await prisma.absenceExcuse.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        ...(reviewNote !== undefined ? { reviewNote } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Student Affairs absence excuse update error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Student Affairs edit access required", 403);

    return errorResponse("Failed to update absence excuse", 500);
  }
}
