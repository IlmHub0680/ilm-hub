import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Verifies a Private Tutoring payment with Paystack, mirroring
// app/api/media/subscribe/verify/route.js.
export async function POST(request) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "A payment reference is required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "Payments are not configured." },
        { status: 500 }
      );
    }

    const tutoringRequest = await prisma.tutoringRequest.findUnique({
      where: { paymentRef: reference },
      include: {
        student: { include: { user: true } },
        course: true,
        instructor: { include: { user: true } },
      },
    });

    if (!tutoringRequest || tutoringRequest.student.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Tutoring payment not found." },
        { status: 404 }
      );
    }

    if (tutoringRequest.isPaid) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        data: {
          id: tutoringRequest.id,
          course: tutoringRequest.course.titleEn,
          instructor: tutoringRequest.instructor?.user?.name ?? null,
          studentName: tutoringRequest.student.user.name,
          paidAmount:
            tutoringRequest.paidAmount === null ? null : Number(tutoringRequest.paidAmount),
        },
      });
    }

    let verifyResponse;
    try {
      verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
    } catch (err) {
      console.error("Tutoring payment verify network error:", err);
      return NextResponse.json(
        { success: false, error: "Unable to reach Paystack to verify payment." },
        { status: 502 }
      );
    }

    let result;
    try {
      result = await verifyResponse.json();
    } catch {
      result = null;
    }

    const transaction = result?.data;

    if (!verifyResponse.ok || !transaction) {
      console.error("Tutoring payment verify failed:", { status: verifyResponse.status, result });
      return NextResponse.json(
        { success: false, error: "Unable to verify payment with Paystack." },
        { status: 400 }
      );
    }

    if (transaction.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment was not successful." },
        { status: 400 }
      );
    }

    const updated = await prisma.tutoringRequest.update({
      where: { id: tutoringRequest.id },
      data: {
        isPaid: true,
        paidAmount: transaction.amount ? transaction.amount / 100 : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      data: {
        id: updated.id,
        course: tutoringRequest.course.titleEn,
        instructor: tutoringRequest.instructor?.user?.name ?? null,
        studentName: tutoringRequest.student.user.name,
        paidAmount: updated.paidAmount === null ? null : Number(updated.paidAmount),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Tutoring payment verify error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to verify the tutoring payment." },
      { status: 500 }
    );
  }
}
