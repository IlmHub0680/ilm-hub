import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function json(data, status = 200) {
  return Response.json(data, { status });
}

// Resolves real Course rows (with their id/courseCode, which the
// public /api/search endpoint intentionally omits from its payload)
// for the Course Readings admin picker.
export async function GET(request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return json({ success: true, data: [] });
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { titleEn: { contains: q, mode: "insensitive" } },
          { courseCode: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, titleEn: true, courseCode: true },
      take: 10,
    });

    return json({ success: true, data: courses });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);
    console.error("GET course lookup error:", error);
    return json({ success: false, error: "Search failed." }, 500);
  }
}
