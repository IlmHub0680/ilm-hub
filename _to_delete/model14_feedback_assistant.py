# -*- coding: utf-8 -*-
import io

def load(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()

def save(path, content):
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(content)

def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:80])
    return content.replace(old, new)

# ---------------------------------------------------------------------
# 1. lib/assistantKnowledge.js -- menuFor() merges student/employee menus
#    with the general institute menu, so a real logged-in student sees
#    "everything about student and institute" (and instructor sees
#    "about him and institute"), using only existing, real menu items.
#    Bookstore/media/library menus stay untouched -- narrow/scoped, as
#    the user asked.
# ---------------------------------------------------------------------
path = "lib/assistantKnowledge.js"
c = load(path)

c = r1(
    c,
    "export function menuFor(zone) {\n  return MENUS[zone] || MENUS.general;\n}",
    "export function menuFor(zone) {\n"
    "  if (zone === 'student') {\n"
    "    return dedupeByLabel([...MENUS.student, ...MENUS.general]);\n"
    "  }\n"
    "  if (zone === 'employee') {\n"
    "    return dedupeByLabel([...MENUS.employee, ...MENUS.general]);\n"
    "  }\n"
    "  return MENUS[zone] || MENUS.general;\n"
    "}\n\n"
    "function dedupeByLabel(items) {\n"
    "  const seen = new Set();\n"
    "  const out = [];\n"
    "  for (const item of items) {\n"
    "    if (seen.has(item.label)) continue;\n"
    "    seen.add(item.label);\n"
    "    out.push(item);\n"
    "  }\n"
    "  return out;\n"
    "}",
    "assistantKnowledge: menuFor merges student/employee with general",
)

save(path, c)
print("lib/assistantKnowledge.js: menuFor() now merges student/employee with general (deduped).")

# ---------------------------------------------------------------------
# 2. components/AssistantWidget.jsx -- real-auth detection + auto-zone
#    routing so the 3-card chooser (Visitor/Employee/Student) only
#    appears when we genuinely don't know who's asking (i.e. logged
#    out, on the homepage/general area). A real logged-in student or
#    instructor skips straight to their merged menu; a logged-out
#    visitor on bookstore/media/library skips straight to that zone's
#    own (already-scoped) menu.
# ---------------------------------------------------------------------
path = "components/AssistantWidget.jsx"
c = load(path)

# 2a. Add authUser/authChecked state + fetch effect, right after the
#     existing zone/identity state declarations.
c = r1(
    c,
    "  const pathZone = useMemo(() => zoneForPath(pathname), [pathname]);\n",
    "  const pathZone = useMemo(() => zoneForPath(pathname), [pathname]);\n"
    "\n"
    "  const [authUser, setAuthUser] = useState(null);\n"
    "  const [authChecked, setAuthChecked] = useState(false);\n"
    "\n"
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "    fetch('/api/auth/me', { credentials: 'include' })\n"
    "      .then((res) => (res.ok ? res.json() : null))\n"
    "      .then((data) => {\n"
    "        if (cancelled) return;\n"
    "        if (data && data.success) setAuthUser(data.user);\n"
    "      })\n"
    "      .catch(() => {})\n"
    "      .finally(() => {\n"
    "        if (!cancelled) setAuthChecked(true);\n"
    "      });\n"
    "    return () => {\n"
    "      cancelled = true;\n"
    "    };\n"
    "  }, []);\n"
    "\n"
    "  // Resolves who we're talking to without asking, wherever that's\n"
    "  // already knowable: a real logged-in student/instructor always gets\n"
    "  // their own (institute-merged) zone, and a logged-out visitor on\n"
    "  // bookstore/media/library gets that zone directly. Only a logged-out\n"
    "  // visitor on the homepage/general area still needs to be asked.\n"
    "  // undefined = auth check still in flight (wait); null = genuinely ask.\n"
    "  const autoIdentity = useMemo(() => {\n"
    "    if (!authChecked) return undefined;\n"
    "    if (authUser?.role === 'STUDENT') return 'student';\n"
    "    if (\n"
    "      authUser?.role === 'INSTRUCTOR' ||\n"
    "      authUser?.role === 'ADMIN' ||\n"
    "      authUser?.role === 'SUPER_ADMIN'\n"
    "    ) {\n"
    "      return 'employee';\n"
    "    }\n"
    "    if (['bookstore', 'media', 'library'].includes(pathZone)) return 'visitor';\n"
    "    return null;\n"
    "  }, [authChecked, authUser, pathZone]);\n",
    "AssistantWidget: add authUser/authChecked state + autoIdentity resolution",
)

save(path, c)
print("components/AssistantWidget.jsx: authUser/authChecked + autoIdentity added (step 1 of 2).")
