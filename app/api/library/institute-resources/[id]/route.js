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

// See app/api/library/institute-resources/route.js's top comment --
// same LIBRARY_OPS delegated-operation gating.

export async function PATCH(request, { params }) {
  try {
    const admin = await requireModulePermission("LIBRARY_OPS", "edit");

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Digital Library item ID is required." },
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
    if (typeof body.fileUrl === "string") data.fileUrl = body.fileUrl.trim() || null;
    if (typeof body.externalUrl === "string") data.externalUrl = body.externalUrl.trim() || null;
    if (typeof body.thumbnailUrl === "string") data.thumbnailUrl = body.thumbnailUrl.trim() || null;
    if (typeof body.author === "string") data.author = body.author.trim() || null;
    if (typeof body.subject === "string") data.subject = body.subject.trim() || null;
    if (typeof body.topic === "string") data.topic = body.topic.trim() || null;

    if (typeof body.category === "string") {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: "Invalid Digital Library category." },
          { status: 400 }
        );
      }
      data.category = body.category;
    }

    if (typeof body.status === "string") {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid Digital Library resource status." },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    if (typeof body.visibility === "string") {
      if (!VALID_INSTITUTE_LIBRARY_VISIBILITIES.includes(body.visibility)) {
        return NextResponse.json(
          { success: false, error: "Invalid Digital Library visibility tier." },
          { status: 400 }
        );
      }
      data.visibility = body.visibility;
    }

    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No changes supplied." },
        { status: 400 }
      );
    }

    const existing = await prisma.instituteLibraryResource.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Digital Library item not found." },
        { status: 404 }
      );
    }

    if (
      (data.fileUrl === null && existing.externalUrl === null && !data.externalUrl) ||
      (data.externalUrl === null && existing.fileUrl === null && !data.fileUrl)
    ) {
      return NextResponse.json(
        { success: false, error: "Either a file URL or an external resource link is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.instituteLibraryResource.update({
      where: { id: itemId },
      data,
      include: {
        uploadedBy: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Publication-transition audit: the single most sensitive
    // transition -- a resource's visibility changing TO PUBLIC -- is
    // always logged. Every other visibility change is not separately
    // logged, matching the same convention used for the personal
    // library's own (now-reverted) attempt at this feature.
    if (data.visibility === "PUBLIC" && existing.visibility !== "PUBLIC") {
      await logAudit({
        actor: admin,
        action: "INSTITUTE_LIBRARY_RESOURCE_PUBLISHED_PUBLIC",
        category: "OTHER",
        module: "LIBRARY_OPS",
        targetType: "InstituteLibraryResource",
        targetId: updated.id,
        summary: `Digital Library resource "${updated.titleEn}" re-tiered to Public (was ${existing.visibility})`,
        metadata: { previousVisibility: existing.visibility, newVisibility: "PUBLIC" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Digital Library item updated successfully.",
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
        { success: false, error: "Library Services access is required." },
        { status: 403 }
      );
    }

    console.error("INSTITUTE LIBRARY ADMIN PATCH ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update Digital Library item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const itemId = params?.id?.trim();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Digital Library item ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.instituteLibraryResource.findUnique({ where: { id: itemId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Digital Library item not found." },
        { status: 404 }
      );
    }

    await prisma.instituteLibraryResource.delete({ where: { id: itemId } });

    return NextResponse.json({
      success: true,
      message: "Digital Library item deleted successfully.",
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
        { success: false, error: "Library Services access is required." },
        { status: 403 }
      );
    }

    console.error("INSTITUTE LIBRARY ADMIN DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Unable to delete Digital Library item." },
      { status: 500 }
    );
  }
}
