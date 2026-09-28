import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Starts a real Paystack payment for an approved Private Tutoring
// request -- the same provider, USD->GHS conversion and initialize/verify
// shape already used for media subscriptions
// (app/api/media/subscribe/route.js). Replaces the previous
// handlePrivatePayment, which just faked a "PAY-<timestamp>" reference
// client-side with no payment ever taken.
export async function POST(request) {
  try {
    const user = await requireUser();

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: "No student profile found for this account." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const requestId = typeof body.requestId === "string" ? body.requestId : "";

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "A tutoring request is required." },
        { status: 400 }
      );
    }

    const tutoringRequest = await prisma.tutoringRequest.findUnique({
      where: { id: requestId },
    });

    if (!tutoringRequest || tutoringRequest.studentId !== studentProfile.id) {
      return NextResponse.json(
        { success: false, error: "Tutoring request not found." },
        { status: 404 }
      );
    }

    if (tutoringRequest.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment is only available after administration approves the tutoring request.",
        },
        { status: 400 }
      );
    }

    if (tutoringRequest.isPaid) {
      return NextResponse.json(
        { success: false, error: "This tutoring request has already been paid for." },
        { status: 400 }
      );
    }

    const feeUSD = Number(tutoringRequest.feeUSD);

    if (!Number.isFinite(feeUSD) || feeUSD <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Administration has not yet set a fee for this tutoring request.",
        },
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

    /*
     * This Paystack account settles in GHS, so a USD fee is converted
     * the same way application fees and media subscriptions are -- see
     * app/api/admissions/paystack/initialize/route.js.
     */
    const exchangeRate = Number(process.env.PAYSTACK_USD_GHS_RATE);

    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      return NextResponse.json(
        { success: false, error: "PAYSTACK_USD_GHS_RATE is missing or invalid." },
        { status: 500 }
      );
    }

    const paystackAmountGHS = feeUSD * exchangeRate;
    const paystackAmountMinor = Math.round(paystackAmountGHS * 100);

    if (paystackAmountMinor <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid tutoring payment amount." },
        { status: 500 }
      );
    }

    const reference = `TUTOR-${tutoringRequest.id}-${Date.now()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const callbackUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/login?tab=private`
      : undefined;

    let paystackResponse;

    try {
      paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: paystackAmountMinor,
          currency: "GHS",
          reference,
          ...(callbackUrl ? { callback_url: callbackUrl } : {}),
          metadata: {
            tutoringRequestId: tutoringRequest.id,
            studentId: studentProfile.id,
            feeUSD,
            exchangeRate,
          },
        }),
      });
    } catch (paystackError) {
      console.error("Tutoring payment Paystack network error:", paystackError);
      return NextResponse.json(
        { success: false, error: "Unable to connect to Paystack." },
        { status: 502 }
      );
    }

    let result;
    try {
      result = await paystackResponse.json();
    } catch {
      result = null;
    }

    if (!paystackResponse.ok || !result?.status || !result?.data) {
      console.error("Tutoring payment Paystack init failed:", {
        status: paystackResponse.status,
        result,
        tutoringRequestId: tutoringRequest.id,
      });
      return NextResponse.json(
        { success: false, error: result?.message || "Unable to initialize payment." },
        { status: 400 }
      );
    }

    const paystackData = result.data;

    if (!paystackData.reference || !paystackData.authorization_url) {
      console.error("Tutoring payment Paystack incomplete data:", paystackData);
      return NextResponse.json(
        { success: false, error: "Paystack returned an incomplete response." },
        { status: 502 }
      );
    }

    await prisma.tutoringRequest.update({
      where: { id: tutoringRequest.id },
      data: { paymentGateway: "PAYSTACK", paymentRef: paystackData.reference },
    });

    return NextResponse.json({
      success: true,
      data: {
        reference: paystackData.reference,
        authorizationUrl: paystackData.authorization_url,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Tutoring payment initialize error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to start the tutoring payment." },
      { status: 500 }
    );
  }
}
