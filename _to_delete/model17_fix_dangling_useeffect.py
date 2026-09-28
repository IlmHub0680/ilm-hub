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
    assert c == 1, "%s: expected 1 match, found %d (context: %r)" % (label, c, old[:160])
    return content.replace(old, new)

# The previous banner-context edit on media/page.jsx and library/page.jsx
# removed the *inner* body of the old banner-fetch useEffect but left its
# opening "useEffect(() => { let cancelled = false;" dangling with no
# matching close, corrupting the file. Removing that leftover opening
# restores valid syntax; bookstore/page.jsx's own edit removed the whole
# useEffect (open+close) correctly and needs no fix.

path = "app/media/page.jsx"
c = load(path)
c = r1(
    c,
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "  const refreshSubscription = () => {",
    "  const refreshSubscription = () => {",
    "media page: remove dangling useEffect opening left by the banner-context edit",
)
save(path, c)
print("app/media/page.jsx: fixed.")

path = "app/library/page.jsx"
c = load(path)
c = r1(
    c,
    "  useEffect(() => {\n"
    "    let cancelled = false;\n"
    "\n"
    "  // Debounce the raw search box input so we don't hit the API on every\n"
    "  // keystroke — the actual query still runs against the real database.\n"
    "  useEffect(() => {",
    "  // Debounce the raw search box input so we don't hit the API on every\n"
    "  // keystroke — the actual query still runs against the real database.\n"
    "  useEffect(() => {",
    "library page: remove dangling useEffect opening left by the banner-context edit",
)
save(path, c)
print("app/library/page.jsx: fixed.")
