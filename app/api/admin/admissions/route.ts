import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    const validStatuses = [
      "PENDING_PAYMENT",
      "PAID",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
    ] as const;

    const where: any = {};

    if (
      status &&
      validStatuses.includes(
        status as (typeof validStatuses)[number]
      )
    ) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          applicationNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phoneNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const applications =
      await prisma.admissionApplication.findMany({
        where,
        include: {
          payment: {
            select: {
              id: true,
              gateway: true,
              method: true,
              status: true,
              amount: true,
              currencyCode: true,
              gatewayReference: true,
              transactionId: true,
              paidAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Administrator access required.",
          },
          { status: 403 }
        );
      }
    }

    console.error("Admin admissions list error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load admission applications.",
      },
      { status: 500 }
    );
  }
}
