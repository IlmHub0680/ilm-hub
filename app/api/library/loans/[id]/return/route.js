import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { computeFineUSD } from "@/lib/library-loans";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request, { params }) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.libraryLoan.findUnique({ where: { id } });

      if (!loan) {
        throw new Error("LOAN_NOT_FOUND");
      }

      if (loan.status === "RETURNED") {
        throw new Error("ALREADY_RETURNED");
      }

      const item = await tx.libraryItem.findUnique({ where: { id: loan.itemId } });

      if (item) {
        await tx.libraryItem.update({
          where: { id: loan.itemId },
          data: { availableCopies: item.availableCopies + 1 },
        });
      }

      const returnedAt = new Date();
      const fineUSD = computeFineUSD(loan.dueAt, returnedAt);

      const updatedLoan = await tx.libraryLoan.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnedAt,
          fineAmountUSD: fineUSD,
          fineStatus: fineUSD > 0 ? "UNPAID" : "NONE",
        },
      });

      // Fulfill the oldest pending reservation for this item, if any --
      // returning the copy is exactly the event a reservation is
      // waiting on. The next fulfillment (creating the actual loan for
      // the reserving student) is a separate staff action from
      // add-issue/the reservations view; this only marks the hold
      // ready to be turned into a loan and keeps the copy from
      // silently going back into general circulation ahead of it.
      const nextReservation = await tx.libraryReservation.findFirst({
        where: { itemId: loan.itemId, status: "PENDING" },
        orderBy: { requestedAt: "asc" },
      });

      return { loan: updatedLoan, readyReservation: nextReservation };
    });

    return NextResponse.json({ success: true, data: result.loan, readyReservation: result.readyReservation });
  } catch (error) {
    if (error.message === "LOAN_NOT_FOUND") {
      return errorResponse("Loan not found", 404);
    }
    if (error.message === "ALREADY_RETURNED") {
      return errorResponse("This item has already been returned", 409);
    }

    console.error("Return loan error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to record return", 500);
  }
}
