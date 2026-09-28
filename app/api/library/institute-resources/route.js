import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { logAudit } from "@/lib/auditLog";
import { VALID_INSTITUTE_LIBRARY_VISIBILITIES } from "@/lib/institute-library-visibility";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CATEGORIES = [
  "DIGITAL_BOOKS",
  "EBOOKS",
  "ARTICLES",
  "FATWAS",
  "RESEARCH_PAPERS",
  "MANUSCRIPTS",
  "MUTOON_TEXTS",
  "ACADEMIC_RESOURCES",
  "ISLAMIC_SCHOLARLY_RESOURCES",
  "COURSE_RESOURCES",
];

const VALID_STATUSES = ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"];

// Librarian / Library Services-gated CRUD for the institute Digital
// Library -- same LIBRARY_OPS module the physical circulation system
// (app/api/library/*) already uses, since the Librarian role owns
// both collections. Deliberately NOT under
// /api/admin/library-resources/* -- that namespace is confirmed to be
// the platform owner's PERSONAL library route, a different system
// entirely (bare admin-only gating, no LIBRARY_OPS involvement).
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
    await prisma.instituteLibraryResource.findUnique({
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
    await requireModulePermission("LIBRARY_OPS", "view");

    const items = await prisma.instituteLibraryResource.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
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
        { success: false, error: "Library Services access is required." },
        { status: 403 }
      );
    }

    console.error("INSTITUTE LIBRARY ADMIN GET ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load Digital Library items." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const admin = await requireModulePermission("LIBRARY_OPS", "edit");

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: admin.id },
      select: { id: true },
    });

    const body = await req.json();

    const titleEn = typeof body.titleEn === "string" ? body.titleEn.trim() : "";
    const titleAr = typeof body.titleAr === "string" ? body.titleAr.trim() : "";
    const descriptionEn = typeof body.descriptionEn === "string" ? body.descriptionEn.trim() : "";
    const descriptionAr = typeof body.descriptionAr === "string" ? body.descriptionAr.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl.trim() : "";
    const externalUrl = typeof body.externalUrl === "string" ? body.externalUrl.trim() : "";
    const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "DRAFT";
    const isPublished = body.isPublished === undefined ? false : Boolean(body.isPublished);
    // Safe non-public default, matching the schema column default --
    // a resource only becomes Public via an explicit choice, never by
    // omitting the field on create.
    const visibility =
      typeof body.visibility === "string" ? body.visibility.trim() : "INSTITUTE_ONLY";

    if (!titleEn || !titleAr || !descriptionEn || !descriptionAr || !category) {
      return NextResponse.json(
        {
          success: false,
          error:
            "English title, Arabic title, English description, Arabic description and category are required.",
        },
        { status: 400 }
      );
    }

    if (!fileUrl && !externalUrl) {
      return NextResponse.json(
        { success: false, error: "Either a file URL or an external resource link is required." },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid Digital Library category." },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid Digital Library resource status." },
        { status: 400 }
      );
    }

    if (!VALID_INSTITUTE_LIBRARY_VISIBILITIES.includes(visibility)) {
      return NextResponse.json(
        { success: false, error: "Invalid Digital Library visibility tier." },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(titleEn);

    const item = await prisma.instituteLibraryResource.create({
      data: {
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        slug,
        category,
        status,
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        author: author || null,
        subject: subject || null,
        topic: topic || null,
        isPublished,
        visibility,
        uploadedById: staff?.id || null,
      },
      include: {
        uploadedBy: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Publication-transition audit: matching the requirement that a
    // resource becomes Public only via an authorized, traceable,
    // explicit act -- "created directly as Public" is itself that act.
    if (visibility === "PUBLIC") {
      await logAudit({
        actor: admin,
        action: "INSTITUTE_LIBRARY_RESOURCE_PUBLISHED_PUBLIC",
        category: "OTHER",
        module: "LIBRARY_OPS",
        targetType: "InstituteLibraryResource",
        targetId: item.id,
        summary: `Digital Library resource "${item.titleEn}" created directly as Public`,
        metadata: { previousVisibility: null, newVisibility: "PUBLIC" },
      });
    }

    return NextResponse.json(
      { success: true, message: "Digital Library item created successfully.", item },
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
        { success: false, error: "Library Services access is required." },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "INVALID_TITLE") {
      return NextResponse.json(
        { success: false, error: "A valid title is required." },
        { status: 400 }
      );
    }

    console.error("INSTITUTE LIBRARY ADMIN POST ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to create the Digital Library item." },
      { status: 500 }
    );
  }
}
