import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Staff-only internal note log -- never exposed to the student/staff
// member who raised the ticket. Adding a note is also the natural
// point (alongside a status change) to record firstRespondedAt, since
// a note is a real act of engaging the ticket.
export async function GET(request, { params }) {
  try {
    await requireModulePermission("ICT_OPS", "view");

    const { id } = await params;

    const notes = await prisma.iCTTicketNote.findMany({
      where: { ticketId: id },
      include: { authorStaff: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: notes.map((n) => ({
        id: n.id,
        note: n.note,
        attachmentUrl: n.attachmentUrl,
        authorName: n.authorStaff.user.name,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("ICT ticket notes GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("ICT access required", 403);

    return errorResponse("Failed to fetch notes", 500);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireModulePermission("ICT_OPS", "edit");

    const { id } = await params;
    const body = await request.json();
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const attachmentKey =
      typeof body.attachmentKey === "string" && body.attachmentKey.trim()
        ? body.attachmentKey.trim()
        : null;

    if (!note) {
      return errorResponse("Note text is required", 400);
    }

    const ticket = await prisma.iCTTicket.findUnique({ where: { id } });

    if (!ticket) {
      return errorResponse("Ticket not found", 404);
    }

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff) {
      return errorResponse("Staff profile required to add a note", 403);
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.iCTTicketNote.create({
        data: {
          ticketId: id,
          authorStaffId: staff.id,
          note,
          attachmentUrl: attachmentKey,
        },
      });

      // Same first-response hook as the status route: the first time
      // a staffer engages this ticket at all (a note counts, same as
      // a status change), stamp it, and never again.
      const ticketUpdate = {};

      if (!ticket.firstRespondedAt) {
        ticketUpdate.firstRespondedAt = new Date();
      }

      if (ticket.status === "OPEN") {
        ticketUpdate.status = "IN_PROGRESS";
      }

      if (Object.keys(ticketUpdate).length > 0) {
        await tx.iCTTicket.update({ where: { id }, data: ticketUpdate });
      }

      return created;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("ICT ticket notes POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("ICT edit access required", 403);

    return errorResponse("Failed to add note", 500);
  }
}
