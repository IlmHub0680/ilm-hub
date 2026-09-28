# -*- coding: utf-8 -*-
import io
import re
import sys

sys.path.insert(0, ".")
from model_cleanup_pairs_tmp import OPENING_PAIRS, CLOSING_PAIRS

TITLE = {
    1: "Institutional Foundation",
    2: "Academic Governance",
    3: "Academic Pathways",
    4: "Curriculum Framework",
    5: "Department Curriculum Design",
    6: "Course Catalogue",
    7: "Course Specifications",
    8: "Assessment, Grading & Progression Framework",
}

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

orig_len = len(content)
before_count = len(re.findall(r"Model [0-9]", content))
print("BEFORE total 'Model N' token matches:", before_count)

# Step 1: apply the 8 opening paragraph rewrites (exact, count==1 each)
for i, (old, new) in enumerate(OPENING_PAIRS, start=1):
    c = content.count(old)
    assert c == 1, "opening pair %d matched %d times, expected 1" % (i, c)
    content = content.replace(old, new)

# Step 2: apply the 8 closing paragraph rewrites (exact, count==1 each)
for i, (old, new) in enumerate(CLOSING_PAIRS, start=1):
    c = content.count(old)
    assert c == 1, "closing pair %d matched %d times, expected 1" % (i, c)
    content = content.replace(old, new)

after_pairs_count = len(re.findall(r"Model [0-9]", content))
print("AFTER paragraph rewrites, remaining 'Model N' matches:", after_pairs_count)

# Step 3: handle "Models A-B" / "Models A–B" ranges BEFORE single-number pass
def range_repl(m):
    a = int(m.group(1))
    b = int(m.group(2))
    return "%s through %s" % (TITLE[a], TITLE[b])

range_pattern = re.compile(r"Models (\d+)[–\-](\d+)")
range_matches_before = len(range_pattern.findall(content))
content = range_pattern.sub(range_repl, content)
print("Range 'Models A-B' replacements made:", range_matches_before)

# Step 4: handle remaining single "Model N" references
def single_repl(m):
    n = int(m.group(1))
    return TITLE[n]

single_pattern = re.compile(r"Model (\d+)")
single_matches_before = len(single_pattern.findall(content))
content = single_pattern.sub(single_repl, content)
print("Single 'Model N' replacements made:", single_matches_before)

remaining = len(re.findall(r"Model [0-9]", content))
print("REMAINING 'Model N' matches after full pass:", remaining)
assert remaining == 0, "cleanup incomplete"

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Done. New file length:", len(content), "(was %d)" % orig_len)
