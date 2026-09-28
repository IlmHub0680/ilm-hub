import { prisma } from "@/lib/prisma";

// Charges the Author Application Fee (set separately from the Student
// Admission Fee — see AuthorFeeSettings / /admin/author-fees) via
// Paystack, mirroring app/api/admissions/paystack/initialize/route.js.

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

    const admissionId = normalizeString(body.admissionId);

    if (!admissionId) {
      return response(
        {
          success: false,
          error: "admissionId is required.",
        },
        400
      );
    }

    const admission = await prisma.authorAdmission.findUnique({
      where: { id: admissionId },
      include: { user: true, payment: true },
    });

    if (!admission) {
      return response(
        {
          success: false,
          error: "Author application not found.",
        },
        404
      );
    }

    if (!admission.applicationFee || !admission.currencyCode) {
      return response(
        {
          success: false,
          error:
            "This application does not have a fee recorded. Please contact the administration.",
        },
        400
      );
    }

    /*
     * Once payment succeeds this application moves past PENDING, so a
     * second initialize attempt on an already-paid (or already
     * decided) application is refused rather than silently re-charged.
     */
    if (admission.status !== "PENDING") {
      return response(
        {
          success: false,
          error: `This application is already ${admission.status.toLowerCase()} and cannot be paid for again.`,
        },
        409
      );
    }

    if (admission.feeExpiresAt && admission.feeExpiresAt < new Date()) {
      return response(
        {
          success: false,
          error:
            "This application's fee window has expired. Please submit a new application.",
        },
        410
      );
    }

    const applicationFee = Number(admission.applicationFee);
    const feeCurrency = admission.currencyCode;

    /*
     * Same Paystack representation convention as student admissions:
     * Ghana resident fees are already in GHS and charged as-is;
     * international fees are quoted in USD and converted to GHS using
     * the configured rate, since Paystack settles in GHS here.
     */
    let paystackAmount = applicationFee;
    let paystackCurrency = feeCurrency;
    let exchangeRate = 1;

    if (feeCurrency === "USD") {
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

      paystackAmount = applicationFee * exchangeRate;
      paystackCurrency = "GHS";
    }

    if (!Number.isFinite(paystackAmount) || paystackAmount <= 0) {
      return response(
        {
          success: false,
          error: "Unable to calculate the Paystack payment amount.",
        },
        500
      );
    }

    // Paystack accepts the amount in the smallest currency unit
    // (pesewas for GHS), hence * 100.
    const paystackAmountMinor = Math.round(paystackAmount * 100);

    if (paystackAmountMinor <= 0) {
      return response(
        {
          success: false,
          error: "Invalid Paystack payment amount.",
        },
        500
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return response(
        {
          success: false,
          error: "Paystack is not configured.",
        },
        500
      );
    }

    const reference = `AUTH-${admission.id}-${Date.now()}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const callbackUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/author-portal/admission/track?admissionId=${admission.id}`
      : undefined;

    const paystackBody = {
      email: admission.user.email,
      amount: paystackAmountMinor,
      currency: paystackCurrency,
      reference,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      metadata: {
        admissionId: admission.id,
        applicationFee,
        feeCurrency,
        ...(feeCurrency === "USD" ? { exchangeRate } : {}),
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
      console.error("Paystack initialization network error:", paystackError);

      return response(
        {
          success: false,
          error: "Unable to connect to Paystack.",
        },
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
      console.error("Paystack initialization failed:", {
        status: paystackResponse.status,
        result,
        admissionId: admission.id,
        reference,
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
      console.error(
        "Paystack returned incomplete initialization data:",
        paystackData
      );

      return response(
        {
          success: false,
          error:
            "Paystack returned an incomplete payment initialization response.",
        },
        502
      );
    }

    /*
     * Store the exact amount/currency Paystack was initialized with —
     * verification compares Paystack's final transaction against
     * THESE values, not the original applicationFee/currencyCode.
     */
    await prisma.authorPayment.upsert({
      where: { admissionId: admission.id },
      create: {
        admissionId: admission.id,
        gateway: "PAYSTACK",
        status: "PENDING",
        amount: paystackAmountMinor / 100,
        currencyCode: paystackCurrency,
        exchangeRate,
        gatewayReference: paystackData.reference,
        checkoutReference: paystackData.access_code,
        checkoutUrl: paystackData.authorization_url,
      },
      update: {
        gateway: "PAYSTACK",
        // A fresh Paystack session was just initialized, so any
        // previous attempt on this application is superseded.
        status: "PENDING",
        amount: paystackAmountMinor / 100,
        currencyCode: paystackCurrency,
        exchangeRate,
        gatewayReference: paystackData.reference,
        checkoutReference: paystackData.access_code,
        checkoutUrl: paystackData.authorization_url,
        transactionId: null,
        paidAt: null,
      },
    });

    return response({
      success: true,
      data: {
        admissionId: admission.id,
        reference: paystackData.reference,
        accessCode: paystackData.access_code,
        authorizationUrl: paystackData.authorization_url,
        amount: paystackAmountMinor / 100,
        currency: paystackCurrency,
        applicationFee,
        feeCurrency,
        ...(feeCurrency === "USD" ? { exchangeRate } : {}),
      },
    });
  } catch (error) {
    console.error("Author Paystack initialization error:", error);

    return response(
      {
        success: false,
        error: error?.message || "Unable to initialize author application payment.",
      },
      500
    );
  }
}
