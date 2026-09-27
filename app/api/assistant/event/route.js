import { prisma } from "@/lib/prisma";

// Logs a single, non-identifying assistant interaction event for the
// admin analytics tile group. Deliberately narrow: only a fixed set of
// event `type`s is accepted, and nothing here ever stores a visitor's
// raw typed message or any personal data — just what happened, not what
// was said. No authentication required (visitors generate these events
// too, e.g. picking a Visitor identity card), and a failure here must
// never break the assistant conversation itself.
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "open",
  "identity_selected",
  "language_selected",
  "quick_option",
  "query_matched",
  "query_unmatched",
]);

const ALLOWED_ZONES = new Set(["student", "employee", "bookstore", "media", "library", "general"]);
const ALLOWED_IDENTITIES = new Set(["student", "employee", "visitor"]);
const ALLOWED_LANGUAGES = new Set(["en", "ar"]);

function clean(value, maxLength = 80) {
  return typeof value === "string" ? value.slice(0, maxLength) : null;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const type = typeof body?.type === "string" ? body.type : "";
    if (!ALLOWED_TYPES.has(type)) {
      return Response.json({ success: false, error: "Unknown event type." }, { status: 400 });
    }

    const zoneRaw = clean(body?.zone);
    const identityRaw = clean(body?.identity);
    const languageRaw = clean(body?.language);

    await prisma.assistantEvent.create({
      data: {
        type,
        zone: zoneRaw && ALLOWED_ZONES.has(zoneRaw) ? zoneRaw : null,
        identity: identityRaw && ALLOWED_IDENTITIES.has(identityRaw) ? identityRaw : null,
        language: languageRaw && ALLOWED_LANGUAGES.has(languageRaw) ? languageRaw : null,
        // A quick-option label or a knowledge-entry id only — validated
        // as a short, plain string, never the visitor's own free text.
        label: clean(body?.label, 80),
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST assistant event error:", error);
    // Analytics is best-effort — never surface this as a user-facing error.
    return Response.json({ success: false }, { status: 200 });
  }
}
