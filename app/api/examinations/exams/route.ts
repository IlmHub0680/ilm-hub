import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const VALID_EXAM_TYPES = ["QUIZ", "MIDTERM", "FINAL", "MAKEUP"];

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Conflict detection (Model 22): an exam's [scheduledAt, scheduledAt +
// durationMin) window must not overlap another exam that shares either
// (a) an instructor assigned to the exam's course, within the same term
// -- the same person cannot invigilate two exams at once -- or (b) the
// same physical venue, within the same term. Venue is a free-text field
// (not every exam has one -- online/take-home exams leave it null), so
// the venue check only applies when both exams name a venue and it
// matches exactly. excludeId lets an update ignore the row being edited.
async function findExamConflict(
  courseId: string,
  termId: string,
  venue: string | null,
  scheduledAt: Date,
  durationMin: number,
  excludeId: string | null
) {
  const windowStart = scheduledAt;
  const windowEnd = new Date(windowStart.getTime() + durationMin * 60000);

  const instructorAssignments = await prisma.instructorCourse.findMany({
    where: { courseId },
    select: { instructorId: true },
  });
  const instructorIds = instructorAssignments.map((a) => a.instructorId);

  const candidates = await prisma.exam.findMany({
    where: {
      termId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      scheduledAt: {
        gte: new Date(windowStart.getTime() - 24 * 60 * 60000),
        lt: windowEnd,
      },
      OR: [
        ...(instructorIds.length > 0
          ? [{ course: { instructors: { some: { instructorId: { in: instructorIds } } } } }]
          : []),
        ...(venue ? [{ venue }] : []),
      ],
    },
    include: {
      course: { select: { titleEn: true } },
    },
  });

  for (const existing of candidates) {
    const existingStart = new Date(existing.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + existing.durationMin * 60000);

    if (windowStart < existingEnd && existingStart < windowEnd) {
      return existing;
    }
  }

  return null;
}

export async function GET() {
  try {
    await requireModulePermission("EXAMINATIONS", "view");

    const exams = await prisma.exam.findMany({
      include: {
        course: { select: { titleEn: true } },
        term: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 100,
    });

    return NextResponse.json({
      exams: exams.map((e) => ({
        id: e.id,
        courseTitle: e.course.titleEn,
        termName: e.term.name,
        examType: e.examType,
        scheduledAt: e.scheduledAt,
        durationMin: e.durationMin,
        venue: e.venue,
        maxScore: e.maxScore,
      })),
    });
  } catch (error) {
    console.error("Exams GET error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Examinations access required", 403);

    return errorResponse("Failed to fetch exams", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireModulePermission("EXAMINATIONS", "edit");

    const body = await request.json();

    const courseId = typeof body.courseId === "string" ? body.courseId : "";
    const termId = typeof body.termId === "string" ? body.termId : "";
    const examType = typeof body.examType === "string" ? body.examType : "";
    const scheduledAtRaw = typeof body.scheduledAt === "string" ? body.scheduledAt : "";
    const durationMin = Number(body.durationMin);
    const venue = typeof body.venue === "string" && body.venue ? body.venue : null;
    const maxScore = body.maxScore ? Number(body.maxScore) : 100;

    if (!courseId || !termId || !VALID_EXAM_TYPES.includes(examType) || !scheduledAtRaw) {
      return errorResponse("Course, term, a valid exam type, and a scheduled date are required", 400);
    }

    const scheduledAt = new Date(scheduledAtRaw);

    if (Number.isNaN(scheduledAt.getTime())) {
      return errorResponse("Invalid scheduled date", 400);
    }

    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      return errorResponse("A valid duration (minutes) is required", 400);
    }

    const conflict = await findExamConflict(courseId, termId, venue, scheduledAt, durationMin, null);
    if (conflict) {
      return errorResponse(
        `This overlaps an existing exam ("${conflict.course.titleEn}") for the same instructor or venue.`,
        409
      );
    }

    const exam = await prisma.exam.create({
      data: {
        courseId,
        termId,
        examType: examType as any,
        scheduledAt,
        durationMin,
        venue,
        maxScore,
      },
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Exams POST error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return errorResponse("Examinations edit access required", 403);

    return errorResponse("Failed to schedule exam", 500);
  }
}
