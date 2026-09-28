import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(link) {
  return {
    id: link.id,
    name: link.name,
    icon: link.icon,
    url: link.url,
    order: link.order,
    isActive: link.isActive,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const links = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });

    return json({ success: true, data: links.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET social links error:", error);
    return json({ success: false, error: "Failed to load social links." }, 500);
  }
}

// Replaces the entire ordered list in one call — social links are a
// short, simple list with nothing else referencing them by id, so a
// delete-and-recreate-on-save keeps both the API and the admin editor
// (add/remove/reorder rows, then Save) simple.
export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const links = Array.isArray(body.links) ? body.links : null;

    if (!links) {
      return json({ success: false, error: "links must be an array." }, 400);
    }

    const values = [];

    for (let i = 0; i < links.length; i++) {
      const item = links[i];
      const name = typeof item?.name === "string" ? item.name.trim() : "";
      const icon = typeof item?.icon === "string" ? item.icon.trim() : "";
      const url = typeof item?.url === "string" ? item.url.trim() : "";

      if (!name || !icon || !url) {
        return json(
          { success: false, error: `Row ${i + 1}: name, icon and url are all required.` },
          400
        );
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(url);
      } catch {
        return json({ success: false, error: `Row ${i + 1}: "${url}" is not a valid URL.` }, 400);
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return json({ success: false, error: `Row ${i + 1}: URL must start with http:// or https://.` }, 400);
      }

      values.push({
        name,
        icon,
        url,
        order: i,
        isActive: item?.isActive !== false,
      });
    }

    const links_ = await prisma.$transaction(async (tx) => {
      await tx.socialLink.deleteMany({});

      if (values.length === 0) return [];

      await tx.socialLink.createMany({ data: values });

      return tx.socialLink.findMany({ orderBy: { order: "asc" } });
    });

    return json({ success: true, data: links_.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT social links error:", error);
    return json({ success: false, error: "Failed to save social links." }, 500);
  }
}
