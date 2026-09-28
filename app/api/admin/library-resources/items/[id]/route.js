import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "ARTICLES",
  "FATWAS",
  "RESEARCH_PAPERS",
  "HISTORICAL_MATERIALS",
  "MANUSCRIPTS",
  "EDUCATIONAL_RESOURCES",
  "CLASSICAL_TEXTS",
];

// See app/api/admin/library-resources/items/route.js's top comment --
// personal library, bare admin-only gating.
async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Library item ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = {};

    if (typeof body.titleEn === "string") data.titleEn = body.titleEn.trim();
    if (typeof body.titleAr === "string") data.titleAr = body.titleAr.trim();
    if (typeof body.descriptionEn === "string") data.descriptionEn = body.descriptionEn.trim();
    if (typeof body.descriptionAr === "string") data.descriptionAr = body.descriptionAr.trim();
    if (typeof body.slug === "string") data.slug = body.slug.trim();
    if (typeof body.fileUrl === "string") data.fileUrl = body.fileUrl.trim();
    if (typeof body.thumbnailUrl === "string") data.thumbnailUrl = body.thumbnailUrl.trim() || null;
    if (typeof body.author === "string") data.author = body.author.trim() || null;

    if (typeof body.category === "string") {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: "Invalid Library category." },
          { status: 400 }
        );
      }
      data.category = body.category;
    }

    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No changes supplied." },
        { status: 400 }
      );
    }

    const existing = await prisma.libraryResource.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Library item not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.libraryResource.update({
      where: { id: itemId },
      data,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Library item updated successfully.",
      item: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("ADMIN LIBRARY PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update Library item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Library item ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.libraryResource.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Library item not found." },
        { status: 404 }
      );
    }

    await prisma.libraryResource.delete({ where: { id: itemId } });

    return NextResponse.json({
      success: true,
      message: "Library item deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    console.error("ADMIN LIBRARY DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete Library item." },
      { status: 500 }
    );
  }
}
