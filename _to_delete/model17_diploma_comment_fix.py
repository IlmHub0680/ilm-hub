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

# =======================================================================
# app/api/admissions/submit/route.js -- the only remaining occurrence
# in the whole codebase of the old "Diploma in Islamic Sciences" name
# (the code logic itself was already switched to level-matching earlier
# this session; this is a leftover stale comment). The real, seeded
# Program record's name (prisma/seed.js) is "Diploma in Islamic
# Studies" -- fixing the comment for consistency.
# =======================================================================
path = "app/api/admissions/submit/route.js"
c = load(path)

c = r1(
    c,
    "     * Diploma in Islamic Sciences:",
    "     * Diploma in Islamic Studies:",
    "submit route: fix stale comment to the real programme name",
)

save(path, c)
print("app/api/admissions/submit/route.js: comment now matches the real programme name.")
