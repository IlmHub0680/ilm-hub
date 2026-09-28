import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function resolveOwnDepartment(user) {
  const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
  if (!staff) return null;
  return prisma.department.findUnique({ where: { headId: staff.id } });
}

async function loadOwnedProgram(user, id) {
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) return { program: null, allowed: false };

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (isAdmin) return { program, allowed: true };

  const ownDepartment = await resolveOwnDepartment(user);
  return { program, allowed: !!ownDepartment && ownDepartment.id === program.departmentId };
}

export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");

    const { id } = await params;
    const { program, allowed } = await loadOwnedProgram(user, id);

    if (!program) return errorResponse("Programme not found.", 404);
    if (!allowed) return errorResponse("This programme belongs to a different department.", 403);

    const body = await request.json();

    // A Head of Department explicitly submits a DRAFT (or returned)
    // programme for Dean approval (Model 11) — see the matching Course
    // action above for why this is a separate action from an edit.
    if (body.action === "submit_for_review") {
      if (program.approvalStatus !== "DRAFT" && program.approvalStatus !== "RETURNED_FOR_REVISION") {
        return errorResponse(
          `This programme is ${program.approvalStatus.replace(/_/g, " ").toLowerCase()} and cannot be submitted again.`,
          409
        );
      }
      const submitted = await prisma.program.update({
        where: { id },
        data: { approvalStatus: "UNDER_REVIEW", approvalNote: null },
      });
      return NextResponse.json({ success: true, data: submitted });
    }

    const values = {};

    if (body.nameEn !== undefined) values.nameEn = String(body.nameEn).trim();
    if (body.nameAr !== undefined) values.nameAr = String(body.nameAr).trim();
    if (body.descriptionEn !== undefined) {
      values.descriptionEn = body.descriptionEn ? String(body.descriptionEn).slice(0, 2000) : null;
    }
    if (body.descriptionAr !== undefined) {
      values.descriptionAr = body.descriptionAr ? String(body.descriptionAr).slice(0, 2000) : null;
    }
    if (body.durationYears !== undefined) {
      values.durationYears = body.durationYears ? Number(body.durationYears) : null;
    }
    if (body.isActive !== undefined) values.isActive = Boolean(body.isActive);

    if (body.coordinatorId !== undefined) {
      if (!body.coordinatorId) {
        values.coordinatorId = null;
      } else {
        const coordinatorStaff = await prisma.staffProfile.findUnique({
          where: { id: String(body.coordinatorId) },
        });

        if (!coordinatorStaff) {
          return errorResponse("The selected coordinator could not be found.", 400);
        }

        values.coordinatorId = coordinatorStaff.id;
      }
    }

    const updated = await prisma.program.update({ where: { id }, data: values });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);

    console.error("HoD program PUT error:", error);
    return errorResponse("Failed to update this programme.", 500);
  }
}

// Deactivates rather than deletes — a Program carries real Courses and
// StudentProfiles, so removing the row outright would orphan a
// student's actual academic record or fail on a foreign key.
export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();
    await requireModulePermission("DEPARTMENT_MATTERS", "edit");

    const { id } = await params;
    const { program, allowed } = await loadOwnedProgram(user, id);

    if (!program) return errorResponse("Programme not found.", 404);
    if (!allowed) return errorResponse("This programme belongs to a different department.", 403);

    const updated = await prisma.program.update({ where: { id }, data: { isActive: false } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Department Matters edit access required", 403);

    console.error("HoD program DELETE error:", error);
    return errorResponse("Failed to deactivate this programme.", 500);
  }
}
