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
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)

# 1. prisma/seed.js -- footer link group title "Academics" -> "Academy"
#    (id and links untouched, so re-seeding stays idempotent on the
#    same stable row).
path = "prisma/seed.js"
c = load(path)
c = r1(
    c,
    '    id: "footer-group-academics",\n    title: "Academics",\n',
    '    id: "footer-group-academics",\n    title: "Academy",\n',
    "seed.js: footer group title Academics -> Academy",
)
save(path, c)
print("prisma/seed.js: footer group title fixed.")

# 2. app/api/homepage-content/route.js -- matching code-fallback default
#    (only renders if the DB has zero footer link groups).
path = "app/api/homepage-content/route.js"
c = load(path)
c = r1(
    c,
    '  {\n    title: "Academics",\n    links: [\n      { label: "Academic Departments", href: "/programs" },',
    '  {\n    title: "Academy",\n    links: [\n      { label: "Academic Departments", href: "/programs" },',
    "homepage-content route: DEFAULT_FOOTER_LINK_GROUPS title Academics -> Academy",
)
save(path, c)
print("app/api/homepage-content/route.js: default footer group title fixed.")
