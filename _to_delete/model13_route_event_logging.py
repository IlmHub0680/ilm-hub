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
    """function wantsMenu(text) {""",
    """// Best-effort, never allowed to affect the actual reply -- a logging
// failure must never turn into a broken assistant response.
async function logAssistantEvent(data) {
  try {
    await prisma.assistantEvent.create({ data });
  } catch (err) {
    console.error('Assistant event logging error:', err);
  }
}

function wantsMenu(text) {""",
    "route.js: add logAssistantEvent helper",
)

c = r1(
    c,
    """  const match = matchKnowledge(text, zone);
  if (match) {
    return NextResponse.json({
      reply: match.answer,
      department: match.department,
      href: match.href || null,
      options: menuFor(zone),
    });
  }

  return NextResponse.json({
    reply:
      "I couldn't find anything specific for that — here are a few things I can help with instead:",
    department: null,
    options: menuFor(zone),
  });""",
    """  const match = matchKnowledge(text, zone);
  if (match) {
    await logAssistantEvent({ type: 'query_matched', zone, label: match.id });
    return NextResponse.json({
      reply: match.answer,
      department: match.department,
      href: match.href || null,
      options: menuFor(zone),
    });
  }

  await logAssistantEvent({ type: 'query_unmatched', zone });
  return NextResponse.json({
    reply:
      "I couldn't find anything specific for that — here are a few things I can help with instead:",
    department: null,
    options: menuFor(zone),
  });""",
    "route.js: log matched/unmatched queries",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("app/api/assistant/route.js: matched/unmatched event logging wired in.")
