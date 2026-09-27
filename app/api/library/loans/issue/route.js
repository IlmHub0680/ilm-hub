import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const body = await request.json();

    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const dueAtRaw = typeof body.dueAt === "string" ? body.dueAt : "";

    if (!itemId || !studentId || !dueAtRaw) {
      return errorResponse("Item, student, and due date are required", 400);
    }

    const dueAt = new Date(dueAtRaw);

    if (Number.isNaN(dueAt.getTime())) {
      return errorResponse("Invalid due date", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.libraryItem.findUnique({ where: { id: itemId } });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (item.availableCopies <= 0) {
        throw new Error("NO_COPIES_AVAILABLE");
      }

      const student = await tx.studentProfile.findUnique({ where: { id: studentId } });

      if (!student) {
        throw new Error("STUDENT_NOT_FOUND");
      }

      await tx.libraryItem.update({
        where: { id: itemId },
        data: { availableCopies: item.availableCopies - 1 },
      });

      return tx.libraryLoan.create({
        data: {
          itemId,
          studentId,
          dueAt,
          status: "BORROWED",
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return errorResponse("Library item not found", 404);
    }
    if (error.message === "NO_COPIES_AVAILABLE") {
      return errorResponse("No copies of this item are available", 409);
    }
    if (error.message === "STUDENT_NOT_FOUND") {
      return errorResponse("Student not found", 404);
    }

    console.error("Issue loan error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to issue loan", 500);
  }
}
