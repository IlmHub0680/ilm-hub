import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public "did you find this page helpful?" widget submissions. Accepts
// a pageSlug (which page) and a yes/no response. No auth -- this is
// meant to be usable by anonymous visitors, same as the pages it lives
// on. Deliberately minimal: one row per click, no editing, no update.
const ALLOWED_RESPONSES = new Set(["yes", "no"]);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const pageSlug = String(body?.pageSlug || "").trim().slice(0, 120);
  const response = String(body?.response || "").trim().toLowerCase();

  if (!pageSlug || !ALLOWED_RESPONSES.has(response)) {
    return Response.json({ success: false, error: "Missing or invalid pageSlug/response." }, { status: 400 });
  }

  try {
    await prisma.pageFeedback.create({
      data: { pageSlug, response },
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Page feedback submission error:", error);
    return Response.json({ success: false, error: "Unable to record feedback right now." }, { status: 500 });
  }
}
