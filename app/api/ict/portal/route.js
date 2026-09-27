import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("ICT_OPS", "view");

    const tickets = await prisma.iCTTicket.findMany({
      include: {
        raisedBy: { select: { name: true, email: true, role: true } },
        assignedStaff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        category: t.category,
        raisedBy: t.raisedBy.name,
        raisedByEmail: t.raisedBy.email,
        raisedByRole: t.raisedBy.role,
        assignedTo: t.assignedStaff?.user?.name ?? null,
        createdAt: t.createdAt,
        resolvedAt: t.resolvedAt,
        firstRespondedAt: t.firstRespondedAt,
        escalated: t.escalated,
        escalatedAt: t.escalatedAt,
        reopenedCount: t.reopenedCount,
        lastReopenedAt: t.lastReopenedAt,
      })),
    });
  } catch (error) {
    console.error("ICT portal GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("ICT access required", 403);

    return errorResponse("Failed to fetch ICT tickets", 500);
  }
}