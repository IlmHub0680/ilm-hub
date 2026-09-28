import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12);
}

export async function GET() {
  try {
    await requireAdmin();

    const [staff, positions, faculties, departments] = await Promise.all([
      prisma.staffProfile.findMany({
        include: {
          user: { select: { name: true, email: true, createdAt: true } },
          position: { select: { nameEn: true, isAcademic: true } },
          faculty: { select: { nameEn: true } },
          department: { select: { nameEn: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.position.findMany({
        select: { id: true, nameEn: true, isAcademic: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.faculty.findMany({
        select: { id: true, nameEn: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, nameEn: true, facultyId: true },
        orderBy: { nameEn: "asc" },
      }),
    ]);

    return NextResponse.json({
      staff: staff.map((s) => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        position: s.position.nameEn,
        faculty: s.faculty?.nameEn ?? null,
        department: s.department?.nameEn ?? null,
        employeeNo: s.employeeNo,
        isActive: s.isActive,
        status: s.status,
        createdAt: s.createdAt,
      })),
      positions,
      faculties,
      departments,
    });
  } catch (error) {
    console.error("Admin staff GET error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);

    return errorResponse("Failed to fetch staff", 500);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const positionId =
      typeof body.positionId === "string" ? body.positionId : "";
    const facultyId =
      typeof body.facultyId === "string" && body.facultyId
        ? body.facultyId
        : null;
    const departmentId =
      typeof body.departmentId === "string" && body.departmentId
        ? body.departmentId
        : null;

    if (!name || !email || !positionId) {
      return errorResponse("Name, email, and a position are required", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return errorResponse("A user with this email already exists", 409);
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return errorResponse("Position not found", 404);
    }

    // Role drives two things independent of Position/Module permissions:
    // the SUPER_ADMIN bypass in requireModulePermission, and the priority-1
    // check in getStaffDestination. The four top-tier oversight positions
    // need it set accordingly so they land on /admin (or bypass entirely)
    // instead of being routed by whichever module happens to match first.
    // Academy Director joins Rector/Vice Rector here for the same reason:
    // it holds view-only permissions across several modules and no single
    // edit permission, so it would otherwise fall through every
    // operational-dashboard check in getStaffDestination and land nowhere.
    const role =
      position.nameEn === "Super Admin"
        ? "SUPER_ADMIN"
        : position.nameEn === "Rector" ||
          position.nameEn === "Vice Rector" ||
          position.nameEn === "Academy Director"
        ? "ADMIN"
        : "USER";

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const employeeNo =
      typeof body.employeeNo === "string" && body.employeeNo.trim()
        ? body.employeeNo.trim()
        : `EMP-${Date.now().toString(36).toUpperCase()}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

      const staff = await tx.staffProfile.create({
        data: {
          userId: user.id,
          positionId,
          facultyId,
          departmentId,
          employeeNo,
        },
      });

      return { user, staff };
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        email: result.user.email,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("Admin staff POST error:", error);

    if (error?.message === "UNAUTHORIZED") return errorResponse("Unauthorized", 401);
    if (error?.message === "FORBIDDEN") return errorResponse("Admin access required", 403);
    if (error?.code === "P2002") {
      return errorResponse("Employee number already in use", 409);
    }

    return errorResponse("Failed to create staff member", 500);
  }
}
