import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public, unauthenticated endpoint for the /sponsored page. Only ever
// returns sponsors that are both ACTIVE and marked public, and only
// non-sensitive display fields — no financial (amountUSD) or audit data.
export async function GET() {
  try {
    const now = new Date();

    const sponsors = await prisma.sponsor.findMany({
      where: {
        status: "ACTIVE",
        isPublic: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, sponsors });
  } catch (error) {
    console.error("Public sponsors GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load sponsors." }, { status: 500 });
  }
}
