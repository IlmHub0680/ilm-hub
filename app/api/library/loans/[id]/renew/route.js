import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// Renewals are capped so a loan can't be extended indefinitely, and
// each renewal pushes the due date forward by a fixed period from
// today (not from the old due date), matching how a real desk renewal
// works -- the borrower gets a fresh loan period from the moment
// they're granted the renewal.
const MAX_RENEWALS = 2;
const RENEWAL_PERIOD_DAYS = 14;

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

      if (loan.renewalCount >= MAX_RENEWALS) {
        throw new Error("RENEWAL_LIMIT_REACHED");
      }

      if (loan.fineStatus === "UNPAID") {
        throw new Error("UNPAID_FINE");
      }

      // A pending reservation on this item means someone else is
      // queued for it -- renewing would keep it away from them
      // indefinitely, so it's blocked instead.
      const pendingReservation = await tx.libraryReservation.findFirst({
        where: { itemId: loan.itemId, status: "PENDING" },
      });

      if (pendingReservation) {
        throw new Error("ITEM_RESERVED");
      }

      const newDueAt = new Date();
      newDueAt.setDate(newDueAt.getDate() + RENEWAL_PERIOD_DAYS);

      return tx.libraryLoan.update({
        where: { id },
        data: {
          dueAt: newDueAt,
          renewalCount: loan.renewalCount + 1,
          status: "BORROWED",
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "LOAN_NOT_FOUND") {
      return errorResponse("Loan not found", 404);
    }
    if (error.message === "ALREADY_RETURNED") {
      return errorResponse("This item has already been returned", 409);
    }
    if (error.message === "RENEWAL_LIMIT_REACHED") {
      return errorResponse(`This loan has already been renewed ${MAX_RENEWALS} times`, 409);
    }
    if (error.message === "UNPAID_FINE") {
      return errorResponse("This loan has an unpaid fine; it must be paid or waived before renewing", 409);
    }
    if (error.message === "ITEM_RESERVED") {
      return errorResponse("Another student has a pending reservation for this item", 409);
    }

    console.error("Renew loan error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to renew loan", 500);
  }
}
