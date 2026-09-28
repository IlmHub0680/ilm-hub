import { prisma } from "@/lib/prisma";

// Mirrors app/api/admissions/paystack/initialize/route.js's pattern
// exactly (same env vars, same GHS-minor-unit handling, same upsert
// shape) but without any of the admission-specific age/programme fee
// calculation -- a donor picks their own amount and currency
// directly, there is no "application" to attach this to first, and
// giving is anonymous-friendly (donorName/donorEmail are optional).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PURPOSES = [
  "General Institute Support",
  "Student Scholarship Fund",
  "Library & Publication Expansion",
  "Online Media & Broadcasting",
];

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request) {
  try {
    const body = await request.json();

    const amountInput = Number(body.amount);
    const currencyInput = normalizeString(body.currency).toUpperCase();
    const purposeInput = normalizeString(body.purpose);
    const donorName = normalizeString(body.donorName) || null;
    const donorEmail = normalizeString(body.donorEmail) || null;

    if (!Number.isFinite(amountInput) || amountInput <= 0) {
      return response(
        { success: false, error: "Enter a valid donation amount." },
        400
      );
    }

    if (!["GHS", "USD"].includes(currencyInput)) {
      return response(
        { success: false, error: "Unsupported currency." },
        400
      );
    }

    const purpose = ALLOWED_PURPOSES.includes(purposeInput)
      ? purposeInput
      : ALLOWED_PURPOSES[0];

    // Paystack email is required by their API even for a donor who
    // declined to give a name -- fall back to a clearly-marked
    // placeholder rather than reject anonymous giving outright.
    const paystackEmail = donorEmail || "anonymous-donor@ululazm.org";

    /*
     * Paystack accepts the amount in the smallest currency unit
     * (pesewas for GHS). A USD donation is still charged to
     * Paystack in GHS, same conversion the admissions flow uses.
     */
    let paystackAmount = amountInput;
    let paystackCurrency = currencyInput;
    let exchangeRate = null;

    if (currencyInput === "USD") {
      exchangeRate = Number(process.env.PAYSTACK_USD_GHS_RATE);

      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
        return response(
          {
            success: false,
            error: "PAYSTACK_USD_GHS_RATE is missing or invalid.",
          },
          500
        );
      }

      paystackAmount = amountInput * exchangeRate;
      paystackCurrency = "GHS";
    }

    const paystackAmountMinor = Math.round(paystackAmount * 100);

    if (paystackAmountMinor <= 0) {
      return response(
        { success: false, error: "Invalid donation amount." },
        400
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        { success: false, error: "Paystack is not configured." },
        500
      );
    }

    // Create the Donation row first (PENDING) so it has an id to
    // reference in Paystack's metadata, mirroring how the admission
    // flow always has an AdmissionApplication row to point back to
    // before it ever calls out to Paystack.
    const donation = await prisma.donation.create({
      data: {
        donorName,
        donorEmail,
        isRecurring: false,
        purpose,
        amount: paystackAmountMinor / 100,
        currencyCode: paystackCurrency,
        gateway: "PAYSTACK",
        status: "PENDING",
      },
    });

    const reference = `DON-${donation.id}-${Date.now()}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const callbackUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/donate`
      : undefined;

    const paystackBody = {
      email: paystackEmail,
      amount: paystackAmountMinor,
      currency: paystackCurrency,
      reference,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      metadata: {
        donationId: donation.id,
        purpose,
        donationAmount: amountInput,
        donationCurrency: currencyInput,
        ...(exchangeRate !== null ? { exchangeRate } : {}),
      },
    };

    let paystackResponse;

    try {
      paystackResponse = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paystackBody),
        }
      );
    } catch (paystackError) {
      console.error("Donation Paystack initialization network error:", paystackError);

      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      });

      return response(
        { success: false, error: "Unable to connect to Paystack." },
        502
      );
    }

    let result;

    try {
      result = await paystackResponse.json();
    } catch {
      result = null;
    }

    if (!paystackResponse.ok || !result?.status || !result?.data) {
      console.error("Donation Paystack initialization failed:", {
        status: paystackResponse.status,
        result,
        donationId: donation.id,
        reference,
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      });

      return response(
        {
          success: false,
          error: result?.message || "Unable to initialize Paystack payment.",
        },
        400
      );
    }

    const paystackData = result.data;

    if (
      !paystackData.reference ||
      !paystackData.access_code ||
      !paystackData.authorization_url
    ) {
      console.error("Paystack returned incomplete initialization data:", paystackData);

      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      });

      return response(
        {
          success: false,
          error: "Paystack returned an incomplete payment initialization response.",
        },
        502
      );
    }

    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        gatewayReference: paystackData.reference,
        checkoutReference: paystackData.access_code,
        authorizationUrl: paystackData.authorization_url,
      },
    });

    return response({
      success: true,
      data: {
        donationId: donation.id,
        reference: paystackData.reference,
        accessCode: paystackData.access_code,
        authorizationUrl: paystackData.authorization_url,
        amount: paystackAmountMinor / 100,
        currency: paystackCurrency,
        donationAmount: amountInput,
        donationCurrency: currencyInput,
        purpose,
        ...(exchangeRate !== null ? { exchangeRate } : {}),
      },
    });
  } catch (error) {
    console.error("Donation Paystack initialization error:", error);

    return response(
      {
        success: false,
        error: error?.message || "Unable to initialize donation payment.",
      },
      500
    );
  }
}
