import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModulePermission } from "@/lib/permissions";
import { computeFineUSD } from "@/lib/library-loans";

export const dynamic = "force-dynamic";

function errorResponse(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    await requireModulePermission("LIBRARY_OPS", "view");

    const [items, loans, students] = await Promise.all([
      prisma.libraryItem.findMany({ orderBy: { title: "asc" } }),
      prisma.libraryLoan.findMany({
        where: {
          OR: [
            { status: { in: ["BORROWED", "OVERDUE"] } },
            { fineStatus: "UNPAID" },
          ],
        },
        include: {
          item: { select: { title: true, author: true } },
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { dueAt: "asc" },
      }),
      prisma.studentProfile.findMany({
        where: { status: "ACTIVE" },
        include: {
          user: { select: { name: true } },
        },
        orderBy: { studentNo: "asc" },
      }),
    ]);

    return NextResponse.json({
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        author: i.author,
        isbn: i.isbn,
        category: i.category,
        totalCopies: i.totalCopies,
        availableCopies: i.availableCopies,
      })),
      loans: loans.map((l) => ({
        id: l.id,
        item: l.item.title,
        author: l.item.author,
        studentName: l.student.user.name,
        studentEmail: l.student.user.email,
        borrowedAt: l.borrowedAt,
        dueAt: l.dueAt,
        status:
          l.status === "BORROWED" && new Date() > new Date(l.dueAt)
            ? "OVERDUE"
            : l.status,
        renewalCount: l.renewalCount,
        // Live estimate for a still-outstanding fine on an overdue,
        // not-yet-returned loan -- the real fineAmountUSD/fineStatus
        // are only ever written to the DB when the item is actually
        // returned (or a fine is resolved); this is a read-time
        // projection, not a stored charge.
        projectedFineUSD:
          l.status !== "RETURNED" ? computeFineUSD(l.dueAt) : l.fineAmountUSD,
        fineAmountUSD: l.fineAmountUSD,
        fineStatus: l.fineStatus,
      })),
      students: students.map((s) => ({
        id: s.id,
        name: s.user.name,
        studentNo: s.studentNo,
      })),
    });
  } catch (error) {
    console.error("Library portal GET error:", error);

    if (error?.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }

    if (error?.message === "FORBIDDEN") {
      return errorResponse("Library access required", 403);
    }

    return errorResponse("Failed to fetch library data", 500);
  }
}

export async function POST(request) {
  try {
    await requireModulePermission("LIBRARY_OPS", "edit");

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const isbn =
      typeof body.isbn === "string" && body.isbn
        ? body.isbn.trim()
        : null;
    const category =
      typeof body.category === "string" && body.category
        ? body.category.trim()
        : null;
    const totalCopies = Number(body.totalCopies) || 1;

    if (!title || !author) {
      return errorResponse("Title and author are required", 400);
    }

    const item = await prisma.libraryItem.create({
      data: {
        title,
        author,
        isbn,
        category,
        totalCopies,
        availableCopies: totalCopies,
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Library portal POST error:", error);

    if (error?.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized", 401);
    }

    if (error?.message === "FORBIDDEN") {
      return errorResponse("Library edit access required", 403);
    }

    return errorResponse("Failed to create library item", 500);
  }
}
