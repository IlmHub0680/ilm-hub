import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

const VALID_STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED", "DISCONTINUED"];

function serialize(s) {
  return {
    id: s.id,
    studentId: s.studentId,
    studentName: s.student?.user?.name || "Unknown",
    supervisorId: s.supervisorId,
    supervisorName: s.supervisor?.user?.name || "Unknown",
    coSupervisors: (s.coSupervisors || []).map((c) => ({ id: c.id, staffId: c.staffId, name: c.staff?.user?.name || "Unknown" })),
    topic: s.topic,
    status: s.status,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    progressNotes: s.progressNotes,
    meetingCount: s._count?.meetings ?? undefined,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

// Research Supervision -- "if the institute offers research-based
// programmes" (none are currently seeded; see ResearchSupervision's
// schema comment). Built fully here at the API layer so it exists and
// is ready; the dashboard keeps this a light, honest empty-state.
export async function GET() {
  try {
    await requireModulePermission("RESEARCH_OPS", "view");

    const supervisions = await prisma.researchSupervision.findMany({
      include: {
        student: { include: { user: { select: { name: true } } } },
        supervisor: { include: { user: { select: { name: true } } } },
        coSupervisors: { include: { staff: { include: { user: { select: { name: true } } } } } },
        _count: { select: { meetings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ success: true, data: supervisions.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs access required." }, 403);
    console.error("GET research supervision error:", error);
    return json({ success: false, error: "Failed to load supervisions." }, 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("RESEARCH_OPS", "edit");

    const body = await request.json();
    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const supervisorId = typeof body.supervisorId === "string" ? body.supervisorId : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const coSupervisorIds = Array.isArray(body.coSupervisorIds) ? body.coSupervisorIds.filter((x) => typeof x === "string" && x) : [];

    if (!studentId) return json({ success: false, error: "A student is required." }, 400);
    if (!supervisorId) return json({ success: false, error: "A supervisor is required." }, 400);
    if (!topic) return json({ success: false, error: "A research topic is required." }, 400);

    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) return json({ success: false, error: "The selected student was not found." }, 400);

    const supervisor = await prisma.staffProfile.findUnique({ where: { id: supervisorId } });
    if (!supervisor) return json({ success: false, error: "The selected supervisor was not found." }, 400);

    const supervision = await prisma.researchSupervision.create({
      data: {
        studentId,
        supervisorId,
        topic,
        coSupervisors: {
          create: coSupervisorIds.map((staffId) => ({ staffId })),
        },
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        supervisor: { include: { user: { select: { name: true } } } },
        coSupervisors: { include: { staff: { include: { user: { select: { name: true } } } } } },
      },
    });

    return json({ success: true, data: serialize(supervision) }, 201);
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Research & Scholarly Affairs edit access required." }, 403);
    console.error("POST research supervision error:", error);
    return json({ success: false, error: "Failed to create the supervision record." }, 500);
  }
}
