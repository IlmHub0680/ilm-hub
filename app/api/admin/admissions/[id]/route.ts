import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmissionsView, requireAdmissionsEdit } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmissionsView();

    // Model 32/Admin-Portal-scope rule: the API's own decision/letter/
    // status-transition routes already correctly require
    // requireAdmissionsEdit() (ADMISSIONS.edit -- SUPER_ADMIN bypasses,
    // but plain ADMIN must hold the permission like any other staff
    // member, exactly like every other delegated operation). This
    // detail page is viewable by anyone who can view, but its action
    // buttons must not be presented as available to a viewer who
    // cannot actually use them -- so resolve that real edit authority
    // here, once, server-side, and let the client hide/disable
    // accordingly instead of discovering a 403 after clicking.
    let canEdit = false;
    try {
      await requireAdmissionsEdit();
      canEdit = true;
    } catch {
      canEdit = false;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID is required.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.admissionApplication.findUnique({
        where: {
          id,
        },
        include: {
          payment: true,
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Admission application not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
      canEdit,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Admissions access required.",
          },
          { status: 403 }
        );
      }
    }

    console.error("Admin admission detail error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load admission application.",
      },
      { status: 500 }
    );
  }
}
