import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return errorResponse("A title is required.", 400);

    const staff = await prisma.staffProfile.findUnique({ where: { id } });
    if (!staff) return errorResponse("Staff member not found", 404);

    const record = await prisma.staffDevelopmentRecord.create({
      data: {
        staffId: id,
        title,
        provider: typeof body.provider === "string" ? body.provider.trim() || null : null,
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        hours: Number.isFinite(Number(body.hours)) && body.hours ? Number(body.hours) : null,
        certificateUrl: typeof body.certificateUrl === "string" ? body.certificateUrl.trim() || null : null,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Staff development POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to add development record", 500);
  }
}
