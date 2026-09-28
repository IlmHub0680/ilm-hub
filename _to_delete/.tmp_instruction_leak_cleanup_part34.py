# -*- coding: utf-8 -*-
import io

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


def rn(content, old, new, label, n):
    c = content.count(old)
    assert c == n, "%s: expected %d matches, found %d" % (label, n, c)
    return content.replace(old, new)


# ============================================================
# PART 3 — Academy Assessment, Grading & Progression's two
# external cross-references into Course Specifications' old §5
# (Batch 8 / SPEC-3xx framework note), which is now §11.
# ============================================================

content = rn(content, "Course Specifications §5", "Course Specifications §11", "Course Specifications §5 -> §11", 2)

# ============================================================
# PART 4 — Academy Assessment, Grading & Progression's own two
# leaks paraphrasing this project's standing instruction to me
# about updating earlier documents when a later one reveals an
# inconsistency.
# ============================================================

content = r1(
    content,
    "it is corrected here and then mechanically applied back to all 42 Course Specifications course specifications (§9, decision 52), consistent with this project's standing practice of updating earlier documents when a later one reveals they need it, rather than leaving two documents disagreeing.",
    "it is corrected here and then mechanically applied back to all 42 Course Specifications course specifications (§9, decision 52), rather than leaving two published documents disagreeing.",
    "standing practice leak",
)

content = r1(
    content,
    "This is exactly the kind of serious inconsistency this project's standing instructions say to correct rather than let stand once found.",
    "This is exactly the kind of serious inconsistency that should be corrected rather than left standing once found.",
    "standing instructions leak",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Parts 3 and 4 done (Assessment/Grading cross-references and standing-practice wording).")
