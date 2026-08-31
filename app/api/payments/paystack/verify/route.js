import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Paystack is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.message ||
            "Unable to verify payment.",
        },
        { status: 400 }
      );
    }

    const transaction = result.data;

    if (transaction.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment was not successful.",
        },
        { status: 400 }
      );
    }

    const orderId =
      transaction.metadata?.orderId ||
      body.orderId;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is missing.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const amountPaid =
      Number(transaction.amount || 0) / 100;

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PAID",
        status: "PAYMENT_SUBMITTED",
        paidAmount: amountPaid,
        paymentGateway: "PAYSTACK",
        paymentRef: reference,
        paidAt: new Date(),
      },
    });

    await prisma.payment.upsert({
      where: {
        id:
          body.paymentId ||
          `paystack-${reference}`,
      },
      update: {
        status: "PAID",
        gatewayReference: reference,
        transactionId: String(
          transaction.id || reference
        ),
        paidAt: new Date(),
      },
      create: {
        id:
          body.paymentId ||
          `paystack-${reference}`,
        orderId: order.id,
        gateway: "PAYSTACK",
        method: order.paymentMethod,
        status: "PAID",
        amount: amountPaid,
        currencyCode:
          transaction.currency ||
          order.currencyCode ||
          "GHS",
        exchangeRate: order.exchangeRate,
        gatewayReference: reference,
        transactionId: String(
          transaction.id || reference
        ),
        paidAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
