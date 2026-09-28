import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  uploadToR2,
  deleteFromR2,
} from "@/lib/r2";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    const admin = await requireUser();

    if (
      admin.role !== "ADMIN" &&
      admin.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access is required.",
        },
        { status: 403 }
      );
    }

    const bookId = params.id?.trim();

    if (!bookId) {
      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
      select: {
        id: true,
        titleEn: true,
        r2FileKey: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: "Book not found.",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select a PDF file.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name || "book.pdf";

    const lowerName =
      fileName.toLowerCase();

    const isPdf =
      file.type === "application/pdf" ||
      lowerName.endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected PDF is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "The PDF must be 100 MB or smaller.",
        },
        { status: 400 }
      );
    }

    const safeFileName =
      lowerName
        .replace(/\.pdf$/, "")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100) || "book";

    const r2FileKey =
      `books/${book.id}/${Date.now()}-${safeFileName}.pdf`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    await uploadToR2(
      r2FileKey,
      buffer,
      "application/pdf"
    );

    try {
      await prisma.book.update({
        where: {
          id: book.id,
        },
        data: {
          r2FileKey,
        },
      });
    } catch (databaseError) {
      try {
        await deleteFromR2(r2FileKey);
      } catch (cleanupError) {
        console.error(
          "Unable to clean up uploaded R2 file:",
          cleanupError
        );
      }

      throw databaseError;
    }

    /*
     * Remove the previous asset only after the new asset
     * has successfully been uploaded and attached to the book.
     */
    if (
      book.r2FileKey &&
      book.r2FileKey !== r2FileKey
    ) {
      try {
        await deleteFromR2(
          book.r2FileKey
        );
      } catch (cleanupError) {
        /*
         * The new file is already attached to the book,
         * so a cleanup failure must not make the upload
         * appear unsuccessful.
         */
        console.error(
          "Unable to remove previous R2 file:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          book.r2FileKey
            ? "PDF replaced successfully."
            : "PDF uploaded successfully.",
        data: {
          bookId: book.id,
          r2FileKey,
          fileName,
          fileSize: file.size,
          contentType: "application/pdf",
        },
      },
      { status: 200 }
    );
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

    console.error(
      "Admin book PDF upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to upload the PDF.",
      },
      { status: 500 }
    );
  }
}
