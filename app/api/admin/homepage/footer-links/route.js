import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serialize(group) {
  return {
    id: group.id,
    title: group.title,
    order: group.order,
    isActive: group.isActive,
    links: group.links.map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
      order: link.order,
      isActive: link.isActive,
    })),
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const groups = await prisma.footerLinkGroup.findMany({
      include: { links: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    return json({ success: true, data: groups.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("GET footer links error:", error);
    return json({ success: false, error: "Failed to load footer link groups." }, 500);
  }
}

// Replaces the entire footer link group/link structure in one call —
// same delete-and-recreate-on-save reasoning as social links. Nothing
// else references a FooterLinkGroup or FooterLink by id, and the
// admin editor works on the whole structure (groups containing links)
// as a single form, saved as a unit.
export async function PUT(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const groups = Array.isArray(body.groups) ? body.groups : null;

    if (!groups) {
      return json({ success: false, error: "groups must be an array." }, 400);
    }

    const groupValues = [];

    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi];
      const title = typeof group?.title === "string" ? group.title.trim() : "";

      if (!title) {
        return json({ success: false, error: `Group ${gi + 1}: a title is required.` }, 400);
      }

      const rawLinks = Array.isArray(group.links) ? group.links : [];
      const linkValues = [];

      for (let li = 0; li < rawLinks.length; li++) {
        const link = rawLinks[li];
        const label = typeof link?.label === "string" ? link.label.trim() : "";
        const href = typeof link?.href === "string" ? link.href.trim() : "";

        if (!label || !href) {
          return json(
            { success: false, error: `Group ${gi + 1}, link ${li + 1}: label and href are both required.` },
            400
          );
        }

        linkValues.push({
          label,
          href,
          order: li,
          isActive: link?.isActive !== false,
        });
      }

      groupValues.push({
        title,
        order: gi,
        isActive: group?.isActive !== false,
        links: linkValues,
      });
    }

    const saved = await prisma.$transaction(async (tx) => {
      // FooterLink cascades on FooterLinkGroup delete, so removing the
      // groups is enough to clear both tables.
      await tx.footerLinkGroup.deleteMany({});

      for (const group of groupValues) {
        await tx.footerLinkGroup.create({
          data: {
            title: group.title,
            order: group.order,
            isActive: group.isActive,
            links: {
              create: group.links,
            },
          },
        });
      }

      return tx.footerLinkGroup.findMany({
        include: { links: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      });
    });

    return json({ success: true, data: saved.map(serialize) });
  } catch (error) {
    if (error?.message === "UNAUTHORIZED") return json({ success: false, error: "Unauthorized." }, 401);
    if (error?.message === "FORBIDDEN") return json({ success: false, error: "Admin access required." }, 403);

    console.error("PUT footer links error:", error);
    return json({ success: false, error: "Failed to save footer link groups." }, 500);
  }
}
