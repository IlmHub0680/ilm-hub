import io

with io.open("lib/legalContentDefaults.js", "r", encoding="utf-8") as f:
    content = f.read()

with io.open(".model7_batch8_tmp.html", "r", encoding="utf-8") as f:
    batch8 = f.read()

anchor1 = "      <h2>6. Status Report (Cumulative)</h2>\n"
assert content.count(anchor1) == 1, f"anchor1 count={content.count(anchor1)}"
content = content.replace(anchor1, batch8 + "\n" + anchor1)

old2 = "<tr><td>8</td><td>Diploma — Islamic Civilization &amp; Society (community track); SPEC-3xx placeholder</td><td>IC-401, IC-402, SPEC-3xx (framework only — no fixed content to specify)</td><td>Not started</td></tr>"
new2 = "<tr><td>8</td><td>Diploma — Islamic Civilization &amp; Society (community track); SPEC-3xx placeholder</td><td>IC-401, IC-402, SPEC-3xx (framework only — no fixed content to specify)</td><td><strong>Complete</strong></td></tr>"
assert content.count(old2) == 1, f"old2 count={content.count(old2)}"
content = content.replace(old2, new2)

old3 = ("      <p><strong>Completed courses (40/42):</strong> Batch 1 — IS-101, QS-101, QS-102, AR-101, IE-101, RL-101. "
        "Batch 2 — IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201. "
        "Batch 3 — IS-301, IS-302, IS-303, IS-304, IS-305. "
        "Batch 4 — QS-301, QS-302, AR-301, AR-302, IC-301, RL-301. "
        "Batch 5 — IS-401, IS-402, IS-403, QS-401, QS-402. "
        "Batch 6 — AR-401, AR-402, RL-401. "
        "Batch 7 — IE-401, IE-402 (provisional), IE-403, IE-404, IE-405. Full specifications above.</p>\n"
        "      <p><strong>Remaining courses (2/42, plus the SPEC-3xx framework note):</strong> Batch 8 — IC-401, IC-402, SPEC-3xx (framework only, no fixed content to specify until a learner's choice determines it).</p>\n")
assert content.count(old3) == 1, f"old3 count={content.count(old3)}"
new3 = ("      <p><strong>Completed courses (42/42), plus the SPEC-3xx framework note:</strong> Batch 1 — IS-101, QS-101, QS-102, AR-101, IE-101, RL-101. "
        "Batch 2 — IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201. "
        "Batch 3 — IS-301, IS-302, IS-303, IS-304, IS-305. "
        "Batch 4 — QS-301, QS-302, AR-301, AR-302, IC-301, RL-301. "
        "Batch 5 — IS-401, IS-402, IS-403, QS-401, QS-402. "
        "Batch 6 — AR-401, AR-402, RL-401. "
        "Batch 7 — IE-401, IE-402 (provisional), IE-403, IE-404, IE-405. "
        "Batch 8 — IC-401, IC-402, SPEC-3xx (framework note, not a full specification — see §5 above). "
        "Model 7 is now complete: every course in the Model 6 catalogue has a full specification and syllabus.</p>\n")
content = content.replace(old3, new3)

with io.open("lib/legalContentDefaults.js", "w", encoding="utf-8") as f:
    f.write(content)

print("OK, new length:", len(content))
