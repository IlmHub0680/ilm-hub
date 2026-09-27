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

// This is the platform owner's own personal public reading library --
// Personal Management, not a Delegated Operation. Bare admin-only
// gating (ADMIN/SUPER_ADMIN), matching the sibling personal-content
// admin routes (app/api/admin/media/items/route.js,
// app/api/admin/bookstore/books/route.js). Do NOT gate this on
// LIBRARY_OPS -- that module is the institute Librarian's delegated
// permission for the separate institute Digital Library (see
// app/api/library/institute-resources/route.js) and has no bearing on
// the owner's own personal library CRUD.
async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

function createSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title) {
  const baseSlug = createSlug(title);

  if (!baseSlug) {
    throw new Error("INVALID_TITLE");
  }

  let slug = baseSlug;
  let counter = 2;

  while (
    await prisma.libraryResource.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET() {
  try {
    await requireAdmin();

    const items = await prisma.libraryResource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, items });
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

    console.error("ADMIN LIBRARY GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load Library items." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();

    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" ? body.titleAr.trim() : "";
    const descriptionEn = typeof body.descriptionEn === "string" ? body.descriptionEn.trim() : "";
    const descriptionAr = typeof body.descriptionAr === "string" ? body.descriptionAr.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";
    const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const isPublished = body.isPublished === undefined ? true : Boolean(body.isPublished);

    if (!titleEn || !titleAr || !descriptionEn || !descriptionAr || !category || !fileUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "English title, Arabic title, English description, Arabic description, category and file URL are required.",
        },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid Library category." },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(titleEn);

    const item = await prisma.libraryResource.create({
      data: {
        titleEn,
        titleAr,
        slug,
        descriptionEn,
        descriptionAr,
        category,
        fileUrl,
        thumbnailUrl: thumbnailUrl || null,
        author: author || null,
        isPublished,
        uploadedById: admin.id,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Library item created successfully.", item },
      { status: 201 }
    );
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

    if (error instanceof Error && error.message === "INVALID_TITLE") {
      return NextResponse.json(
        { success: false, error: "A valid title is required." },
        { status: 400 }
      );
    }

    console.error("ADMIN LIBRARY POST ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create the Library item." },
      { status: 500 }
    );
  }
}
