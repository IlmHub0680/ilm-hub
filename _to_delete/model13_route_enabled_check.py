# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

path = "app/api/assistant/route.js"
with io.open(path, "r", encoding="utf-8") as f:
    c = f.read()

c = r1(
    c,
    "  const zone = sanitizeZone(body?.zone);",
    """  // Defense in depth: the widget already hides itself when an admin has
  // disabled the assistant (GET /api/assistant/settings), but this
  // endpoint enforces it too, since it can be called directly.
  try {
    const settings = await prisma.assistantSettings.findUnique({
      where: { id: 'default-assistant-settings' },
      select: { isEnabled: true },
    });
    if (settings && settings.isEnabled === false) {
      return NextResponse.json(
        { reply: 'The assistant is currently unavailable.', department: null, options: [] },
        { status: 200 }
      );
    }
  } catch {
    // If the settings lookup itself fails, fail open rather than take
    // the whole assistant down over an unrelated database hiccup.
  }

  const zone = sanitizeZone(body?.zone);""",
    "route.js: enforce isEnabled server-side too",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("app/api/assistant/route.js: server-side isEnabled check added.")
