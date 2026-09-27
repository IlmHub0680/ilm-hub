import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApprovedAuthor } from "@/lib/auth";
import { getAuthorRoyaltyBalance, getOrCreateRoyaltySettings, resolveRoyaltyRate } from "@/lib/royalty";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// An author's own real royalty position — their current effective
// rate, their live balance (available / queued / already paid), and
// their recent per-sale ledger. Own data only: everything here is
// scoped to the signed-in author, never another author's figures.
export async function GET() {
  try {
    const user = await requireApprovedAuthor();

    const [balance, override, settings, recentEntries] = await Promise.all([
      getAuthorRoyaltyBalance(user.id),
      prisma.authorRoyaltyOverride.findUnique({ where: { authorId: user.id } }),
      getOrCreateRoyaltySettings(),
      prisma.royaltyLedgerEntry.findMany({
        where: { authorId: user.id },
        include: { book: { select: { titleEn: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const currentRatePct = resolveRoyaltyRate({
      book: null,
      authorOverride: override,
      settings,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentRatePct,
        ...balance,
        recentSales: recentEntries.map((e) => ({
          id: e.id,
          bookTitle: e.book?.titleEn || "",
          saleAmountUSD: Number(e.saleAmountUSD),
          royaltyRatePct: Number(e.royaltyRatePct),
          royaltyAmountUSD: Number(e.royaltyAmountUSD),
          status: e.status,
          createdAt: e.createdAt,
        })),
      },
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

    console.error("AUTHOR ROYALTY GET ERROR:", error);
    return errorResponse("Unable to load your royalty information.", 500);
  }
}
