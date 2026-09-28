import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getAuthorRoyaltyBalance } from "@/lib/royalty";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// One row per approved author, with their real royalty balance —
// the admin's single screen for "who's owed what" before queuing a
// payout. Only APPROVED authors are listed (matches the approved-only
// scope everywhere else authors are surfaced, e.g. requireApprovedAuthor).
export async function GET() {
  try {
    await requireAdmin();

    const authors = await prisma.user.findMany({
      where: { role: "AUTHOR", authorStatus: "APPROVED" },
      select: {
        id: true,
        name: true,
        email: true,
        royaltyOverride: true,
        _count: { select: { books: true } },
      },
      orderBy: { name: "asc" },
    });

    const data = await Promise.all(
      authors.map(async (author) => {
        const balance = await getAuthorRoyaltyBalance(author.id);

        return {
          id: author.id,
          name: author.name,
          email: author.email,
          bookCount: author._count.books,
          overrideRatePct: author.royaltyOverride?.isActive
            ? Number(author.royaltyOverride.ratePct)
            : null,
          ...balance,
        };
      })
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty authors GET error:", error);
    return errorResponse("Failed to load author royalty balances", 500);
  }
}
