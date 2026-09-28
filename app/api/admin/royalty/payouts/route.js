import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createPayoutForAuthor } from "@/lib/royalty";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function serialize(payout) {
  return {
    id: payout.id,
    authorId: payout.authorId,
    authorName: payout.author?.name || "",
    authorEmail: payout.author?.email || "",
    amountUSD: Number(payout.amountUSD),
    method: payout.method,
    reference: payout.reference,
    note: payout.note,
    status: payout.status,
    requestedAt: payout.requestedAt,
    processedAt: payout.processedAt,
    entryCount: payout.ledgerEntries?.length ?? undefined,
  };
}

// Full payout history across every author — admin's real record of
// every royalty payment ever queued, approved, paid or rejected.
export async function GET() {
  try {
    await requireAdmin();

    const payouts = await prisma.authorPayout.findMany({
      include: {
        author: { select: { name: true, email: true } },
        ledgerEntries: { select: { id: true } },
      },
      orderBy: { requestedAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, data: payouts.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty payouts GET error:", error);
    return errorResponse("Failed to load royalty payouts", 500);
  }
}

// Queues a new payout for one author, covering as much of their
// available balance as requested (defaults to the full balance).
// Starts life as PENDING — see PATCH /[id] for approve/mark-paid/reject.
export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const authorId = typeof body.authorId === "string" ? body.authorId.trim() : "";

    if (!authorId) {
      return errorResponse("An author is required.", 400);
    }

    const author = await prisma.user.findUnique({ where: { id: authorId } });

    if (!author || author.role !== "AUTHOR") {
      return errorResponse("Author not found.", 404);
    }

    const payout = await createPayoutForAuthor(authorId, {
      amountUSD: body.amountUSD,
      method: body.method,
      note: body.note,
    });

    const full = await prisma.authorPayout.findUnique({
      where: { id: payout.id },
      include: {
        author: { select: { name: true, email: true } },
        ledgerEntries: { select: { id: true } },
      },
    });

    return NextResponse.json({ success: true, data: serialize(full) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    console.error("Admin royalty payouts POST error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create this payout.",
      400
    );
  }
}
