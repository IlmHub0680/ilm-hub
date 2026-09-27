import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const QUALIFICATION_TYPES = ["GENERAL", "ISLAMIC"];

export async function POST(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const type = QUALIFICATION_TYPES.includes(body.type) ? body.type : null;

    if (!title || !type) {
      return errorResponse("A qualification title and type (GENERAL or ISLAMIC) are required.", 400);
    }

    const staff = await prisma.staffProfile.findUnique({ where: { id } });
    if (!staff) return errorResponse("Staff member not found", 404);

    const qualification = await prisma.staffQualification.create({
      data: {
        staffId: id,
        type,
        title,
        institution: typeof body.institution === "string" ? body.institution.trim() || null : null,
        yearObtained: Number.isFinite(Number(body.yearObtained)) && body.yearObtained
          ? Math.round(Number(body.yearObtained))
          : null,
      },
    });

    return NextResponse.json({ success: true, data: qualification });
  } catch (error) {
    console.error("Staff qualification POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to add qualification", 500);
  }
}
