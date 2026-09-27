import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// QA-facing aggregate view of student course evaluations (Model 10 §8
// "course evaluations"). Evaluations are anonymous by design: this
// endpoint only ever returns per-course averages, counts, and comment
// text — never studentId or anything that identifies who submitted a
// given evaluation, anonymous or not.
export async function GET() {
  try {
    await requireModulePermission("QUALITY_ASSURANCE", "view");

    const evaluations = await prisma.courseEvaluation.findMany({
      select: {
        courseId: true,
        ratingOverall: true,
        ratingContent: true,
        ratingInstructor: true,
        comments: true,
        createdAt: true,
        course: { select: { titleEn: true, courseCode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byCourse = new Map();
    for (const ev of evaluations) {
      if (!byCourse.has(ev.courseId)) {
        byCourse.set(ev.courseId, {
          courseId: ev.courseId,
          courseTitle: ev.course.titleEn,
          courseCode: ev.course.courseCode,
          count: 0,
          sumOverall: 0,
          sumContent: 0,
          countContent: 0,
          sumInstructor: 0,
          countInstructor: 0,
          comments: [],
        });
      }
      const bucket = byCourse.get(ev.courseId);
      bucket.count += 1;
      bucket.sumOverall += ev.ratingOverall;
      if (ev.ratingContent != null) {
        bucket.sumContent += ev.ratingContent;
        bucket.countContent += 1;
      }
      if (ev.ratingInstructor != null) {
        bucket.sumInstructor += ev.ratingInstructor;
        bucket.countInstructor += 1;
      }
      if (ev.comments && bucket.comments.length < 10) {
        bucket.comments.push({ text: ev.comments, createdAt: ev.createdAt });
      }
    }

    const courses = Array.from(byCourse.values())
      .map((b) => ({
        courseId: b.courseId,
        courseTitle: b.courseTitle,
        courseCode: b.courseCode,
        responseCount: b.count,
        avgOverall: b.count ? b.sumOverall / b.count : null,
        avgContent: b.countContent ? b.sumContent / b.countContent : null,
        avgInstructor: b.countInstructor ? b.sumInstructor / b.countInstructor : null,
        recentComments: b.comments,
      }))
      .sort((a, b) => b.responseCount - a.responseCount);

    const totalResponses = evaluations.length;
    const overallAvg = totalResponses
      ? evaluations.reduce((s, e) => s + e.ratingOverall, 0) / totalResponses
      : null;

    return NextResponse.json({
      success: true,
      totalResponses,
      overallAvg,
      courses,
    });
  } catch (error: any) {
    console.error("QA course evaluations GET error:", error);
    if (error?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to load course evaluations" }, { status: 500 });
  }
}
