import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Permanently deletes a bookstore order — used by admins to clean up
 * demo/test orders before going live.
 *
 * Every related record (Payment, OrderItem, BookAccess, DownloadLog,
 * Receipt) has onDelete: Cascade back to Order in the schema, so
 * Postgres itself removes them in the same transaction. No orphaned
 * rows are left behind.
 */
export async function DELETE(request, { params }) {
  try {
    const admin = await requireUser();

    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Order ${existing.orderNumber} was deleted.`,
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    console.error("Admin delete order error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete this order." },
      { status: 500 }
    );
  }
}
