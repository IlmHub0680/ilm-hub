# -*- coding: utf-8 -*-
import io

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

path = "app/api/assistant/route.js"
c = load(path)

# 1. Import getStaffDestination (already the real, existing function that
#    drives post-login staff routing) for the "My Dashboard" intent.
c = r1(
    c,
    "import { matchKnowledge, menuFor } from '@/lib/assistantKnowledge';",
    "import { matchKnowledge, menuFor } from '@/lib/assistantKnowledge';\n"
    "import { getStaffDestination } from '@/lib/permissions';",
    "route.js: import getStaffDestination",
)

# 2. Recognize the 'employee' zone.
c = r1(
    c,
    "const KNOWN_ZONES = new Set(['student', 'bookstore', 'media', 'library', 'general']);",
    "const KNOWN_ZONES = new Set(['student', 'employee', 'bookstore', 'media', 'library', 'general']);",
    "route.js: add employee to KNOWN_ZONES",
)

# 3. Add a 'staff-dashboard' personal intent alongside the existing ones.
c = r1(
    c,
    """  if (/\\bwho am i\\b|\\bmy (account|profile)\\b/.test(text)) return 'profile';""",
    """  if (/\\bwho am i\\b|\\bmy (account|profile)\\b/.test(text)) return 'profile';

  // "My Dashboard" (Employee identity quick option) -- the destination
  // depends entirely on the signed-in staff member's real position and
  // PositionPermission rows, resolved server-side, never guessed.
  if (/\\bmy (staff )?dashboard\\b/.test(text) || /\\bwhere('?s| is) my dashboard\\b/.test(text)) {
    return 'staff-dashboard';
  }""",
    "route.js: add staff-dashboard intent detection",
)

# 4. Handle the new intent using the real getStaffDestination() logic,
#    right alongside the existing 'profile' handler.
c = r1(
    c,
    """      if (intent === 'profile') {
        return NextResponse.json({
          reply: `You're signed in as ${user.name} (${user.email}).`,
          department: null,
          options: menuFor(zone),
        });
      }""",
    """      if (intent === 'profile') {
        return NextResponse.json({
          reply: `You're signed in as ${user.name} (${user.email}).`,
          department: null,
          options: menuFor(zone),
        });
      }

      if (intent === 'staff-dashboard') {
        const destination = await getStaffDestination(user.id);
        if (!destination) {
          return NextResponse.json({
            reply:
              "I don't see a staff position on your account, so there's no staff dashboard to send you to. If that's not right, contact ICT or your supervisor.",
            department: null,
            options: menuFor(zone),
          });
        }
        return NextResponse.json({
          reply: 'Here is your dashboard.',
          department: null,
          href: destination,
          options: menuFor(zone),
        });
      }""",
    "route.js: handle staff-dashboard intent",
)

# 5. Forward `href` from a matched KNOWLEDGE entry, when it has one.
c = r1(
    c,
    """  const match = matchKnowledge(text, zone);
  if (match) {
    return NextResponse.json({
      reply: match.answer,
      department: match.department,
      options: menuFor(zone),
    });
  }""",
    """  const match = matchKnowledge(text, zone);
  if (match) {
    return NextResponse.json({
      reply: match.answer,
      department: match.department,
      href: match.href || null,
      options: menuFor(zone),
    });
  }""",
    "route.js: forward match.href",
)

save(path, c)
print("app/api/assistant/route.js: employee zone + staff-dashboard intent + href forwarding wired in.")
