import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprovedAuthor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// An author's own payout history — own data only. Real rows created
// by the admin Payout Management screen (app/api/admin/royalty/payouts),
// never fabricated here: an author with no payouts yet simply sees an
// empty, honest list rather than placeholder entries.
export async function GET() {
  try {
    const user = await requireApprovedAuthor();

    const payouts = await prisma.authorPayout.findMany({
      where: { authorId: user.id },
      orderBy: { requestedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: payouts.map((p) => ({
        id: p.id,
        amountUSD: Number(p.amountUSD),
        method: p.method,
        reference: p.reference,
        status: p.status,
        requestedAt: p.requestedAt,
        processedAt: p.processedAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Author access is required.", 403);
    }

    if (error instanceof Error && error.message === "AUTHOR_NOT_APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Your author application has not been approved yet.",
          code: "AUTHOR_NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    console.error("AUTHOR PAYOUTS GET ERROR:", error);
    return errorResponse("Unable to load your payout history.", 500);
  }
}
