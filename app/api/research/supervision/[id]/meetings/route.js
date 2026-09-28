import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED", "DISCONTINUED"];

// Supervision meetings -- progress tracking, and status/completion
// transitions for a single supervision record.
export async function POST(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");
    const { id: supervisionId } = await params;

    const supervision = await prisma.researchSupervision.findUnique({ where: { id: supervisionId } });
    if (!supervision) return json({ success: false, error: "Supervision record not found." }, 404);

    const body = await request.json();
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const meetingDate = body.meetingDate ? new Date(body.meetingDate) : new Date();

    if (!notes) return json({ success: false, error: "Meeting notes are required." }, 400);

    const meeting = await prisma.researchSupervisionMeeting.create({
      data: { supervisionId, notes, meetingDate },
    });

    return json({ success: true, data: meeting }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research supervision meeting error:", error);
    return json({ success: false, error: "Failed to log the meeting." }, 500);
  }
}

export async function GET(request, { params }) {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");
    const { id: supervisionId } = await params;

    const meetings = await prisma.researchSupervisionMeeting.findMany({
      where: { supervisionId },
      orderBy: { meetingDate: "desc" },
    });

    return json({ success: true, data: meetings });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research supervision meetings error:", error);
    return json({ success: false, error: "Failed to load meetings." }, 500);
  }
}
