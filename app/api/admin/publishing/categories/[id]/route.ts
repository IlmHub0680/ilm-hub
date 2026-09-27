import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
    }

    const body = await request.json();
    const nameEn = body.nameEn !== undefined ? String(body.nameEn).trim() : existing.nameEn;
    const nameAr = body.nameAr !== undefined ? String(body.nameAr).trim() : existing.nameAr;

    if (!nameEn || !nameAr) {
      return NextResponse.json(
        { success: false, error: "English and Arabic names are required." },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { nameEn, nameAr },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Admin category update error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update this category." },
      { status: 500 }
    );
  }
}

// A category in real use by any Book, Course or Program is never
// deleted outright — every one of those has a required (or, for
// Program, referenced) categoryId, so removing it would either break
// referential integrity or fail on the database's own foreign key.
// This checks first and gives a clear, honest reason instead of
// surfacing a raw database error.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
    }

    const [bookCount, courseCount, programCount] = await Promise.all([
      prisma.book.count({ where: { categoryId: id } }),
      prisma.course.count({ where: { categoryId: id } }),
      prisma.program.count({ where: { categoryId: id } }),
    ]);

    if (bookCount + courseCount + programCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `This category is still used by ${bookCount} book(s), ${courseCount} course(s) and ${programCount} programme(s). Reassign them to a different category before deleting it.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Admin category delete error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete this category." },
      { status: 500 }
    );
  }
}
