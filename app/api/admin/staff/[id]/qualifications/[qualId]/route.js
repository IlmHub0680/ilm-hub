import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id, qualId } = await params;

    const result = await prisma.staffQualification.deleteMany({
      where: { id: qualId, staffId: id },
    });

    if (result.count === 0) return errorResponse("Qualification not found", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff qualification DELETE error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to remove qualification", 500);
  }
}
