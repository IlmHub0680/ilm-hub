import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// action: "cancel" drops the hold. action: "fulfill" turns it into a
// real loan (requires a copy to actually be available -- e.g. after a
// return) and links the two records via fulfilledLoanId, exactly like
// issuing any other loan (LibraryItem.availableCopies is decremented
// for real, never assumed).
export async function POST(request, { params }) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const dueAtRaw = typeof body.dueAt === "string" ? body.dueAt : "";

    if (action !== "cancel" && action !== "fulfill") {
      return errorResponse("Action must be cancel or fulfill", 400);
    }

    if (action === "fulfill") {
      const dueAt = new Date(dueAtRaw);
      if (!dueAtRaw || Number.isNaN(dueAt.getTime())) {
        return errorResponse("A valid due date is required to fulfill a reservation", 400);
      }

      const result = await prisma.$transaction(async (tx) => {
        const reservation = await tx.libraryReservation.findUnique({ where: { id } });

        if (!reservation) {
          throw new Error("RESERVATION_NOT_FOUND");
        }

        if (reservation.status !== "PENDING") {
          throw new Error("NOT_PENDING");
        }

        const item = await tx.libraryItem.findUnique({ where: { id: reservation.itemId } });

        if (!item) {
          throw new Error("ITEM_NOT_FOUND");
        }

        if (item.availableCopies <= 0) {
          throw new Error("NO_COPIES_AVAILABLE");
        }

        await tx.libraryItem.update({
          where: { id: item.id },
          data: { availableCopies: item.availableCopies - 1 },
        });

        const loan = await tx.libraryLoan.create({
          data: {
            itemId: reservation.itemId,
            studentId: reservation.studentId,
            dueAt,
            status: "BORROWED",
          },
        });

        return tx.libraryReservation.update({
          where: { id },
          data: { status: "FULFILLED", fulfilledAt: new Date(), fulfilledLoanId: loan.id },
        });
      });

      return NextResponse.json({ success: true, data: result });
    }

    // cancel
    const reservation = await prisma.libraryReservation.findUnique({ where: { id } });

    if (!reservation) {
      return errorResponse("Reservation not found", 404);
    }

    if (reservation.status !== "PENDING") {
      return errorResponse("Only a pending reservation can be cancelled", 409);
    }

    const updated = await prisma.libraryReservation.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error.message === "RESERVATION_NOT_FOUND") return errorResponse("Reservation not found", 404);
    if (error.message === "NOT_PENDING") return errorResponse("This reservation is no longer pending", 409);
    if (error.message === "ITEM_NOT_FOUND") return errorResponse("Library item not found", 404);
    if (error.message === "NO_COPIES_AVAILABLE") return errorResponse("No copies are currently available to fulfill this reservation", 409);

    console.error("Update reservation error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to update reservation", 500);
  }
}
