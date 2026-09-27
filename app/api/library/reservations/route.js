import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("LIBRARY_OPS", "view");

    const reservations = await prisma.libraryReservation.findMany({
      where: { status: "PENDING" },
      include: {
        item: { select: { title: true, author: true, availableCopies: true } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { requestedAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: reservations.map((r) => ({
        id: r.id,
        item: r.item.title,
        author: r.item.author,
        itemAvailable: r.item.availableCopies,
        studentName: r.student.user.name,
        studentEmail: r.student.user.email,
        requestedAt: r.requestedAt,
      })),
    });
  } catch (error) {
    console.error("Library reservations GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library access required", 403);

    return errorResponse("Failed to fetch reservations", 500);
  }
}

// Places a hold for a student on an item. Reservations are meant for
// items with no available copies right now (queueing); an item that
// does have a copy available should be issued as a loan directly
// instead, so that case is rejected here rather than silently
// creating a hold nobody needs to wait for.
export async function POST(request) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const body = await request.json();
    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const studentId = typeof body.studentId === "string" ? body.studentId : "";

    if (!itemId || !studentId) {
      return errorResponse("Item and student are required", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.libraryItem.findUnique({ where: { id: itemId } });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (item.availableCopies > 0) {
        throw new Error("COPIES_AVAILABLE");
      }

      const student = await tx.studentProfile.findUnique({ where: { id: studentId } });

      if (!student) {
        throw new Error("STUDENT_NOT_FOUND");
      }

      const existing = await tx.libraryReservation.findFirst({
        where: { itemId, studentId, status: "PENDING" },
      });

      if (existing) {
        throw new Error("ALREADY_RESERVED");
      }

      return tx.libraryReservation.create({
        data: { itemId, studentId, status: "PENDING" },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return errorResponse("Library item not found", 404);
    }
    if (error.message === "COPIES_AVAILABLE") {
      return errorResponse("This item has copies available -- issue a loan instead of reserving", 409);
    }
    if (error.message === "STUDENT_NOT_FOUND") {
      return errorResponse("Student not found", 404);
    }
    if (error.message === "ALREADY_RESERVED") {
      return errorResponse("This student already has a pending reservation for this item", 409);
    }

    console.error("Create reservation error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Library edit access required", 403);

    return errorResponse("Failed to create reservation", 500);
  }
}
