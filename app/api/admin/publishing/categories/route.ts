import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();

    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        nameEn: "asc",
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error("Admin categories error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load categories.",
      },
      { status: 500 }
    );
  }
}

function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// This Category table is shared across the Bookstore (Book), the
// academic Course catalog, and Program — one set of categories (e.g.
// "Fiqh", "Aqidah", "Tafsir") spans all three, so a category created
// here from the admin Categories screen immediately becomes
// selectable when a Programme Coordinator authors a new course (see
// app/api/coordinator/courses) as well as when a book is added.
export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Administrator access is required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();

    if (!nameEn || !nameAr) {
      return NextResponse.json(
        { success: false, error: "English and Arabic names are required." },
        { status: 400 }
      );
    }

    let slug = slugify(nameEn);
    let candidate = slug;
    let suffix = 1;

    while (await prisma.category.findUnique({ where: { slug: candidate } })) {
      suffix += 1;
      candidate = `${slug}-${suffix}`;
    }

    slug = candidate;

    const category = await prisma.category.create({
      data: { id: crypto.randomUUID(), nameEn, nameAr, slug },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("Admin category create error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create this category." },
      { status: 500 }
    );
  }
}
