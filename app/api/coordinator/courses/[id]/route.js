import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function loadOwnedCourse(user, id) {
  const course = await prisma.course.findUnique({ where: { id }, include: { program: true } });
  if (!course) return { course: null, allowed: false };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) return { course, allowed: true };

  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  const allowed = !!staff && course.program?.coordinatorId === staff.id;

  return { course, allowed };
}

export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "edit");

    const { id } = await params;
    const { course, allowed } = await loadOwnedCourse(user, id);

    if (!course) return errorResponse("Course not found.", 404);
    if (!allowed) return errorResponse("You do not coordinate this course's programme.", 403);

    const body = await request.json();

    // A coordinator explicitly submits a DRAFT (or returned) course for
    // Head of Department review (Model 11) — a distinct action from an
    // ordinary field edit, so a coordinator's routine typo fix never
    // accidentally re-submits an already-approved course.
    if (body.action === "submit_for_review") {
      if (course.approvalStatus !== "DRAFT" && course.approvalStatus !== "RETURNED_FOR_REVISION") {
        return errorResponse(
          `This course is ${course.approvalStatus.replace(/_/g, " ").toLowerCase()} and cannot be submitted again.`,
          409
        );
      }
      const submitted = await prisma.course.update({
        where: { id },
        data: { approvalStatus: "UNDER_REVIEW", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: submitted });
    }

    const values = {};

    if (body.titleEn !== undefined) values.titleEn = String(body.titleEn).trim();
    if (body.titleAr !== undefined) values.titleAr = String(body.titleAr).trim();
    if (body.descriptionEn !== undefined) values.descriptionEn = String(body.descriptionEn).trim();
    if (body.descriptionAr !== undefined) values.descriptionAr = String(body.descriptionAr).trim();
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: String(body.categoryId) } });
      if (!category) return errorResponse("The selected category could not be found.", 400);
      values.categoryId = category.id;
    }
    if (body.creditHours !== undefined) {
      const creditHours = Number(body.creditHours);
      if (!Number.isFinite(creditHours) || creditHours <= 0) {
        return errorResponse("Credit hours must be a positive number.", 400);
      }
      values.creditHours = creditHours;
    }
    if (body.semesterLevel !== undefined) {
      values.semesterLevel = body.semesterLevel === "" || body.semesterLevel == null
        ? null
        : Number(body.semesterLevel);
    }
    // Model 19 -- the course's approved learning outcome / assessment
    // type (already-existing schema columns that had no edit form
    // until now), and whether/how a practical component applies.
    if (body.outcomeEn !== undefined) {
      values.outcomeEn = body.outcomeEn === "" || body.outcomeEn == null ? null : String(body.outcomeEn).trim();
    }
    if (body.assessmentType !== undefined) {
      values.assessmentType =
        body.assessmentType === "" || body.assessmentType == null ? null : String(body.assessmentType).trim();
    }
    if (body.practicalRequired !== undefined) {
      values.practicalRequired = Boolean(body.practicalRequired);
      // Turning the practical component off clears its pass
      // requirement text too, rather than leaving stale policy text
      // attached to a course that no longer has one.
      if (!values.practicalRequired) values.practicalPassRequirement = null;
    }
    if (body.practicalPassRequirement !== undefined) {
      values.practicalPassRequirement =
        body.practicalPassRequirement === "" || body.practicalPassRequirement == null
          ? null
          : String(body.practicalPassRequirement).trim();
    }
    if (body.isPublished !== undefined) values.isPublished = Boolean(body.isPublished);
    if (body.thumbnailUrl !== undefined && body.thumbnailUrl) {
      values.thumbnailUrl = String(body.thumbnailUrl);
    }

    if (body.prerequisiteIds !== undefined) {
      const prerequisiteIds = Array.isArray(body.prerequisiteIds)
        ? body.prerequisiteIds.filter((pid) => typeof pid === "string" && pid.trim() && pid !== id)
        : [];

      values.prerequisites = { set: prerequisiteIds.map((pid) => ({ id: pid })) };
    }

    const updated = await prisma.course.update({ where: { id }, data: values });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Program Matters edit access required", 403);

    console.error("Coordinator course PUT error:", error);
    return errorResponse("Failed to update this course.", 500);
  }
}

// Courses with any real enrollment/grade history are never hard-deleted
// — unpublishing is the safe, reversible equivalent (Course has no
// isActive field; isPublished is what every listing already filters
// on). A brand new course with no history yet can be removed outright.
export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "edit");

    const { id } = await params;
    const { course, allowed } = await loadOwnedCourse(user, id);

    if (!course) return errorResponse("Course not found.", 404);
    if (!allowed) return errorResponse("You do not coordinate this course's programme.", 403);

    const [enrollmentCount, gradeCount] = await Promise.all([
      prisma.enrollment.count({ where: { courseId: id } }),
      prisma.grade.count({ where: { courseId: id } }),
    ]);

    if (enrollmentCount === 0 && gradeCount === 0) {
      await prisma.course.delete({ where: { id } });
      return NextResponse.json({ success: true, data: { deleted: true } });
    }

    const updated = await prisma.course.update({ where: { id }, data: { isPublished: false } });

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        "This course has real enrollment or grade history, so it was unpublished rather than deleted.",
    });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Program Matters edit access required", 403);

    console.error("Coordinator course DELETE error:", error);
    return errorResponse("Failed to remove this course.", 500);
  }
}
