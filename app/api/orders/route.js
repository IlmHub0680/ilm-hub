import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}

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

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No items provided.",
        },
        { status: 400 }
      );
    }

    const bookIds = items.map((item) => item.bookId);

    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (books.length !== bookIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more books were not found.",
        },
        { status: 400 }
      );
    }

    let totalUSD = 0;

    const orderItems = items.map((item) => {
      const book = books.find(
        (entry) => entry.id === item.bookId
      );

      const quantity = Math.max(
        1,
        Number(item.quantity) || 1
      );

      totalUSD += Number(book.priceUSD) * quantity;

      return {
        bookId: book.id,
        priceUSD: book.priceUSD,
        quantity,
      };
    });

    const orderNumber =
      `ILM-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalUSD,
        paidAmount: 0,
        currencyCode: body.currencyCode || "USD",
        exchangeRate: body.exchangeRate || 1,
        paymentMethod:
          body.paymentMethod || "BANK_TRANSFER",
        status: "ORDER_PLACED",
        paymentStatus: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create order.",
      },
      { status: 500 }
    );
  }
}
