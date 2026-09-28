import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    await requireAdmin();

    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      sponsors: sponsors.map((s) => ({
        ...s,
        amountUSD: s.amountUSD === null ? null : Number(s.amountUSD),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin sponsors GET error:", error);
    return errorResponse("Failed to load sponsors", 500);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return errorResponse("Sponsor name is required", 400);
    }

    const description = typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;
    const logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;
    const websiteUrl = typeof body.websiteUrl === "string" && body.websiteUrl.trim() ? body.websiteUrl.trim() : null;

    let amountUSD = null;
    if (body.amountUSD !== undefined && body.amountUSD !== null && body.amountUSD !== "") {
      const parsed = Number(body.amountUSD);
      if (Number.isNaN(parsed) || parsed < 0) {
        return errorResponse("Amount must be a valid non-negative number", 400);
      }
      amountUSD = parsed;
    }

    const startDate = typeof body.startDate === "string" && body.startDate ? new Date(body.startDate) : null;
    const endDate = typeof body.endDate === "string" && body.endDate ? new Date(body.endDate) : null;

    if (startDate && Number.isNaN(startDate.getTime())) return errorResponse("Invalid start date", 400);
    if (endDate && Number.isNaN(endDate.getTime())) return errorResponse("Invalid end date", 400);

    const isPublic = typeof body.isPublic === "boolean" ? body.isPublic : true;

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        description,
        logoUrl,
        websiteUrl,
        amountUSD,
        startDate,
        endDate,
        isPublic,
        createdById: admin.id,
      },
    });

    return NextResponse.json(
      { success: true, sponsor: { ...sponsor, amountUSD: sponsor.amountUSD === null ? null : Number(sponsor.amountUSD) } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Administrator access is required.", 403);

    console.error("Admin sponsors POST error:", error);
    return errorResponse("Failed to create sponsor", 500);
  }
}
