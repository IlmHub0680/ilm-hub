import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Marks an already-assessed fine as PAID or WAIVED. Library staff
// (LIBRARY_OPS) resolve this themselves -- it never routes through
// Finance's StudentFee/payment system (see the schema comment on
// LibraryFineStatus for why), so this is the only place a fine's
// outcome is recorded.
export async function POST(request, { params }) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const { id } = await params;
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (action !== "PAID" && action !== "WAIVED") {
      return errorResponse("Action must be PAID or WAIVED", 400);
    }

    if (action === "WAIVED" && !note) {
      return errorResponse("A note is required when waiving a fine", 400);
    }

    const loan = await prisma.libraryLoan.findUnique({ where: { id } });

    if (!loan) {
      return errorResponse("Loan not found", 404);
    }

    if (loan.fineStatus !== "UNPAID") {
      return errorResponse("This loan has no unpaid fine to resolve", 409);
    }

    const updated = await prisma.libraryLoan.update({
      where: { id },
      data: {
        fineStatus: action,
        fineClearedAt: new Date(),
        fineWaivedNote: action === "WAIVED" ? note : loan.fineWaivedNote,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Resolve fine error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to update fine", 500);
  }
}
