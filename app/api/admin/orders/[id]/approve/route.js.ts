import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { resend } from "../../../../../../lib/resend";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "ACTIVATED" },
      include: { user: true, items: { include: { book: true } } },
    });

    const receipt = await prisma.receipt.create({
      data: {
        receiptNo: `REC-${Date.now()}`,
        orderId: updatedOrder.id,
        pdfUrl: `/api/receipts/${updatedOrder.id}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        title: "Payment Approved! 🎉",
        message: `Your payment for Order ${updatedOrder.orderNumber} has been verified. Your PDF downloads are now active!`,
      },
    });

    await resend.emails.send({
      from: "Islamic Peace Message <orders@islamicpeacemessage.org>",
      to: [updatedOrder.user.email],
      subject: `Payment Approved - Order #${updatedOrder.orderNumber}`,
      html: `<h2>Assalamu Alaikum ${updatedOrder.user.name},</h2><p>Your order #${updatedOrder.orderNumber} is now active.</p>`,
    });

    return NextResponse.json({ success: true, order: updatedOrder, receipt });
  } catch (error) {
    console.error("Order approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve order" },
      { status: 500 }
    );
  }
}