import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function resolveOwnStaff(user) {
  return prisma.staffProfile.findUnique({ where: { userId: user.id } });
}

// A Programme Coordinator authors the "study plan" — the real curriculum
// (which courses, in what order via semesterLevel, with what
// prerequisites and credit hours) that lib/courseAssignment.js's
// automatic registration engine walks. Scoped strictly to programmes
// this coordinator actually coordinates (Program.coordinatorId ===
// their own StaffProfile.id); Admin/Super Admin may act on any
// programme by passing programId explicitly.
export async function GET(request) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "view");

    const staff = await resolveOwnStaff(user);
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    const where = {};

    if (programId) {
      if (!isAdmin) {
        const owns = await prisma.program.findFirst({
          where: { id: programId, coordinatorId: staff?.id },
        });
        if (!owns) return errorResponse("You do not coordinate this programme.", 403);
      }
      where.programId = programId;
    } else if (!isAdmin) {
      where.program = { coordinatorId: staff?.id };
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: { select: { nameEn: true } },
        program: { select: { nameEn: true } },
        prerequisites: { select: { id: true, titleEn: true, courseCode: true } },
        // Model 21, Section 6 -- who teaches each course, so a
        // Programme Coordinator can review course offerings and
        // coordinate instructors. Read-only here: assigning/removing an
        // instructor remains the Head of Department's action
        // (app/api/hod/instructor-assignments).
        instructors: {
          where: { status: "ACTIVE" },
          select: {
            role: true,
            instructor: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ semesterLevel: "asc" }, { courseCode: "asc" }],
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Program Matters access required", 403);

    console.error("Coordinator courses GET error:", error);
    return errorResponse("Failed to load courses", 500);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    await requireModulePermission("PROGRAM_MATTERS", "edit");

    const body = await request.json();
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const programId = String(body.programId || "").trim();

    if (!programId) {
      return errorResponse("A programme is required.", 400);
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });

    if (!program) {
      return errorResponse("Programme not found.", 404);
    }

    if (!isAdmin) {
      const staff = await resolveOwnStaff(user);
      if (!staff || program.coordinatorId !== staff.id) {
        return errorResponse("You do not coordinate this programme.", 403);
      }
    }

    const titleEn = String(body.titleEn || "").trim();
    const titleAr = String(body.titleAr || "").trim();
    const courseCode = String(body.courseCode || "").trim().toUpperCase();
    const descriptionEn = String(body.descriptionEn || "").trim();
    const descriptionAr = String(body.descriptionAr || "").trim();
    const categoryId = String(body.categoryId || "").trim();

    if (!titleEn || !titleAr || !courseCode || !descriptionEn || !descriptionAr || !categoryId) {
      return errorResponse(
        "Title (English/Arabic), course code, description (English/Arabic) and category are all required.",
        400
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return errorResponse("The selected category could not be found.", 400);
    }

    const existingCode = await prisma.course.findUnique({ where: { courseCode } });
    if (existingCode) {
      return errorResponse(`A course with the code "${courseCode}" already exists.`, 409);
    }

    let slug = slugify(`${courseCode}-${titleEn}`);
    let slugCandidate = slug;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { slug: slugCandidate } })) {
      suffix += 1;
      slugCandidate = `${slug}-${suffix}`;
    }
    slug = slugCandidate;

    const creditHours = body.creditHours != null && body.creditHours !== "" ? Number(body.creditHours) : 3;
    const semesterLevel =
      body.semesterLevel != null && body.semesterLevel !== "" ? Number(body.semesterLevel) : null;

    if (!Number.isFinite(creditHours) || creditHours <= 0) {
      return errorResponse("Credit hours must be a positive number.", 400);
    }

    const prerequisiteIds = Array.isArray(body.prerequisiteIds)
      ? body.prerequisiteIds.filter((id) => typeof id === "string" && id.trim())
      : [];

    // Model 19 -- all optional. A course has no practical component
    // and no recorded outcome/assessment-type text until Academic
    // Records/the Coordinator explicitly sets one; nothing here is
    // required or defaulted to an invented value.
    const outcomeEn = typeof body.outcomeEn === "string" ? body.outcomeEn.trim() || null : null;
    const assessmentType = typeof body.assessmentType === "string" ? body.assessmentType.trim() || null : null;
    const practicalRequired = Boolean(body.practicalRequired);
    const practicalPassRequirement =
      practicalRequired && typeof body.practicalPassRequirement === "string"
        ? body.practicalPassRequirement.trim() || null
        : null;

    const course = await prisma.course.create({
      data: {
        id: crypto.randomUUID(),
        titleEn,
        titleAr,
        slug,
        courseCode,
        descriptionEn,
        descriptionAr,
        creditHours,
        semesterLevel,
        outcomeEn,
        assessmentType,
        practicalRequired,
        practicalPassRequirement,
        categoryId,
        programId,
        thumbnailUrl:
          body.thumbnailUrl ||
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85",
        isPublished: Boolean(body.isPublished),
        // A brand-new course starts as a real DRAFT (Model 11) — distinct
        // from the APPROVED default this migration gave every existing,
        // already-taught course so as not to retroactively unapprove them.
        approvalStatus: "DRAFT",
        ...(prerequisiteIds.length > 0
          ? { prerequisites: { connect: prerequisiteIds.map((id) => ({ id })) } }
          : {}),
      },
    });

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Program Matters edit access required", 403);

    console.error("Coordinator courses POST error:", error);
    return errorResponse("Failed to create this course.", 500);
  }
}
