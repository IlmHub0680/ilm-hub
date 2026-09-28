import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Sets (or clears) one author's standing royalty rate override — sits
// above the institution-wide default and below a specific book's own
// rate in the resolution order (see lib/royalty.js).
export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { authorId } = await params;

    const author = await prisma.user.findUnique({ where: { id: authorId } });

    if (!author || author.role !== "AUTHOR") {
      return errorResponse("Author not found.", 404);
    }

    const body = await request.json();

    // No rate provided (or explicitly cleared) removes the override
    // entirely, falling back to the institution-wide default.
    if (body.ratePct === null || body.ratePct === undefined || body.ratePct === "") {
      await prisma.authorRoyaltyOverride.deleteMany({ where: { authorId } });

      return NextResponse.json({ success: true, data: null });
    }

    const ratePct = Number(body.ratePct);

    if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 100) {
      return errorResponse("Royalty rate must be a number between 0 and 100.", 400);
    }

    const override = await prisma.authorRoyaltyOverride.upsert({
      where: { authorId },
      update: {
        ratePct,
        isActive: true,
        note: body.note ? String(body.note).slice(0, 500) : null,
      },
      create: {
        authorId,
        ratePct,
        isActive: true,
        note: body.note ? String(body.note).slice(0, 500) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ratePct: Number(override.ratePct), note: override.note || "" },
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin author royalty override PUT error:", error);
    return errorResponse("Failed to save this author's royalty override.", 500);
  }
}
