import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireModulePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET /api/dean/staff -- named faculty staff roster (gap #1 from this
// session's audit: app/api/dean/portal only ever returned staffCount,
// a number -- there was no page listing the actual staff members by
// name/position/department). Read-only: the Dean has no action here,
// this mirrors the exact faculty-scoping pattern already established
// in app/api/dean/portal/route.ts (re-derive faculty from the caller's
// own StaffProfile.deanId, never from client input; SUPER_ADMIN/ADMIN
// with no Dean assignment of their own sees every faculty, matching
// how the portal route already treats that case).
export async function GET() {
  try {
    const user = await requireUser();
    await requireModulePermission("FACULTY_MATTERS", "view");

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });

    if (!staff && !isAdmin) {
      return NextResponse.json({ error: "No staff profile found" }, { status: 403 });
    }

    const faculty = staff
      ? await prisma.faculty.findUnique({ where: { deanId: staff.id } })
      : null;

    if (!faculty && !isAdmin) {
      return NextResponse.json({
        faculty: null,
        message: "You are not currently assigned as Dean of a faculty.",
      });
    }

    const facultyScope = faculty ? { facultyId: faculty.id } : {};

    const staffList = await prisma.staffProfile.findMany({
      where: facultyScope,
      select: {
        id: true,
        employeeNo: true,
        title: true,
        isActive: true,
        status: true,
        specialization: true,
        user: { select: { name: true, email: true } },
        position: { select: { nameEn: true, isAcademic: true } },
        department: { select: { nameEn: true } },
      },
      orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json({
      faculty: faculty ? { id: faculty.id, nameEn: faculty.nameEn } : null,
      staff: staffList,
    });
  } catch (error) {
    console.error("Dean staff roster error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Faculty Matters access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to load faculty staff roster." }, { status: 500 });
  }
}
