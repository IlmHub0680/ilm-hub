import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { getR2PresignedUrl } from "../../../../../lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string; bookId: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.orderId,
      userId: user.id,
      status: { in: ["APPROVED", "ACTIVATED", "COMPLETED"] },
    },
    include: { items: { include: { book: true } } },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Download not authorized or payment pending approval" },
      { status: 403 }
    );
  }

  const orderItem = order.items.find((item) => item.bookId === params.bookId);
  if (!orderItem) {
    return NextResponse.json({ error: "Book not found in this order" }, { status: 404 });
  }

  await prisma.downloadLog.create({
    data: {
      userId: user.id,
      orderId: order.id,
      bookId: orderItem.bookId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    },
  });

  const signedUrl = await getR2PresignedUrl(orderItem.book.r2FileKey, 60);

  return NextResponse.json({ downloadUrl: signedUrl });
}