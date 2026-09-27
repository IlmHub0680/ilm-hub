import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/auditLog";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

// Full Instructor Profile detail (Model 10) — qualifications,
// professional development, performance reviews received, and the
// courses they are actually authorized to teach (InstructorCourse,
// keyed by userId, not staffId — matching how every other instructor
// API in this codebase already resolves course assignment).
export async function GET(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    const staff = await prisma.staffProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        position: { select: { nameEn: true, isAcademic: true } },
        faculty: { select: { nameEn: true } },
        department: { select: { nameEn: true } },
        qualifications: { orderBy: { yearObtained: "desc" } },
        developmentRecords: { orderBy: { completedAt: "desc" } },
        performanceReviewsReceived: {
          orderBy: { createdAt: "desc" },
          include: { reviewer: { select: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!staff) return errorResponse("Staff member not found", 404);

    const authorizedCourses = await prisma.instructorCourse.findMany({
      where: { instructorId: staff.userId },
      include: { course: { select: { id: true, titleEn: true, courseCode: true } } },
      orderBy: { createdAt: "asc" },
    });

    // For the "Change Position" control on this page -- only active
    // positions are offered, matching the same rule the PATCH handler
    // enforces server-side.
    const availablePositions = await prisma.position.findMany({
      where: { isActive: true },
      select: { id: true, nameEn: true },
      orderBy: { nameEn: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...staff,
        authorizedCourses: authorizedCourses.map((a) => a.course),
        availablePositions,
      },
    });
  } catch (error) {
    console.error("Admin staff GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to load staff member", 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const actor = await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const data = {};

    // Staff status (Model 21, Section 11) — the real employment status
    // an admin sets. isActive is derived from it so every existing
    // access-control check (requireModulePermission, the public
    // faculty gate, community posting, etc.) keeps working unchanged:
    // ACTIVE/ON_LEAVE both grant login/module access, INACTIVE/FORMER
    // both revoke it. No StaffProfile row is ever deleted here — only
    // its status changes — so qualifications, development records,
    // grades, InstructorCourse assignments and every other historical
    // record stay intact regardless of status.
    const STAFF_STATUSES = ["ACTIVE", "ON_LEAVE", "INACTIVE", "FORMER"];
    if (typeof body.status === "string") {
      if (!STAFF_STATUSES.includes(body.status)) {
        return errorResponse(`Invalid status. Must be one of: ${STAFF_STATUSES.join(", ")}`, 400);
      }
      data.status = body.status;
      data.isActive = body.status === "ACTIVE" || body.status === "ON_LEAVE";
    } else if (typeof body.isActive === "boolean") {
      // Back-compat: a plain isActive toggle (e.g. an older client)
      // still works, mapped onto the richer status field.
      data.isActive = body.isActive;
      data.status = body.isActive ? "ACTIVE" : "INACTIVE";
    }

    // Model 26 addendum: reassigning a staff member's Position is the
    // one real "role change" this codebase previously had no admin
    // path for at all (positionId was only ever set once, at staff
    // creation) -- this is the genuinely missing piece the standing
    // audit-log rule was waiting on. Validated against real, active
    // Position rows and audit-logged with the before/after position
    // name, since a reassignment silently changes everything that
    // member's account can view or edit.
    let positionChange = null;
    if (Object.prototype.hasOwnProperty.call(body, "positionId") && typeof body.positionId === "string" && body.positionId) {
      const newPosition = await prisma.position.findUnique({ where: { id: body.positionId } });
      if (!newPosition) {
        return errorResponse("Selected position not found.", 400);
      }
      if (!newPosition.isActive) {
        return errorResponse("That position is not active and cannot be assigned.", 400);
      }
      const existing = await prisma.staffProfile.findUnique({
        where: { id },
        include: { position: { select: { nameEn: true } } },
      });
      if (!existing) {
        return errorResponse("Staff member not found", 404);
      }
      if (existing.positionId !== body.positionId) {
        positionChange = { fromName: existing.position?.nameEn || "Unknown", toName: newPosition.nameEn };
        data.positionId = body.positionId;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "specialization")) {
      data.specialization =
        typeof body.specialization === "string" ? body.specialization.trim() || null : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "yearsExperience")) {
      const n = Number(body.yearsExperience);
      data.yearsExperience = Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "languages")) {
      data.languages = Array.isArray(body.languages)
        ? body.languages.map((l) => String(l).trim()).filter(Boolean)
        : [];
    }

    // Model 21, Section 3/10 -- public faculty directory fields. bio is
    // length-capped (matches the scale of every other free-text bio in
    // this codebase, e.g. AlumniProfile); photoUrl is a plain URL field
    // (same convention as AlumniProfile.photoUrl -- no upload pipeline
    // exists here to invent); isPublic is the actual publish gate the
    // public faculty routes check, defaulting to false (opt-in, never
    // auto-published just because a bio/photo happens to be on file).
    if (Object.prototype.hasOwnProperty.call(body, "bio")) {
      const bio = typeof body.bio === "string" ? body.bio.trim() : "";
      if (bio.length > 2000) {
        return errorResponse("Bio must be 2000 characters or fewer.", 400);
      }
      data.bio = bio || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "photoUrl")) {
      data.photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() || null : null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "isPublic")) {
      data.isPublic = Boolean(body.isPublic);
    }

    if (Object.keys(data).length === 0) {
      return errorResponse("No recognized fields to update", 400);
    }

    const staff = await prisma.staffProfile.update({
      where: { id },
      data,
      include: { user: { select: { name: true } } },
    });

    if (positionChange) {
      await logAudit({
        actor,
        action: "STAFF_POSITION_REASSIGNED",
        category: "ACADEMIC_RECORD_ADJUSTMENT",
        targetType: "StaffProfile",
        targetId: staff.id,
        summary: `${staff.user?.name || staff.id}'s position changed from "${positionChange.fromName}" to "${positionChange.toName}"`,
        metadata: positionChange,
      });
    }

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Admin staff PATCH error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    if (error?.code === "P2025") return errorResponse("Staff member not found", 404);

    return errorResponse("Failed to update staff member", 500);
  }
}
