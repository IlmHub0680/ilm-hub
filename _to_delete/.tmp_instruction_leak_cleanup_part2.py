# -*- coding: utf-8 -*-
import io

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

START = "  'academy-course-specifications': {"
END = "  'academy-assessment-grading': {"

assert content.count(START) == 1, "START marker not unique"
assert content.count(END) == 1, "END marker not unique"

start_idx = content.index(START)
end_idx = content.index(END)
assert start_idx < end_idx

pre = content[:start_idx]
block = content[start_idx:end_idx]
post = content[end_idx:]


def r1(s, old, new, label):
    c = s.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return s.replace(old, new)


def rn(s, old, new, label, n):
    c = s.count(old)
    assert c == n, "%s: expected %d matches, found %d" % (label, n, c)
    return s.replace(old, new)


# ============================================================
# STEP 1-5: numeric self-reference fixes (Decisions section
# moves from §6/§7 to §13 under the new numbering below).
# ============================================================

block = rn(block, "(§6)", "(§13)", "bare (§6) self-refs", 7)
block = rn(block, "(§7)", "(§13)", "bare (§7) self-refs", 17)
block = r1(block, "(§6, decision 36)", "(§13, decision 36)", "§6 decision 36")
block = r1(block, "decision 42, §7)", "decision 42, §13)", "decision 42 §7")
block = r1(block, "guidance, §7)", "guidance, §13)", "guidance §7")

# ============================================================
# STEP 6-7: the two genuine §5 self-references (old Batch
# sections were all mislabeled "5"; Batch 1 -> new §4,
# Batch 8 -> new §11).
# ============================================================

block = r1(
    block,
    "(RL-101 does this — see §5)",
    "(RL-101 does this — see §4)",
    "RL-101 see §5",
)
block = r1(
    block,
    "not a full specification — see §5 above",
    "not a full specification — see §11 above",
    "SPEC-3xx see §5 above",
)

# ============================================================
# STEP 8: delete the §1 bullet describing the batch/status-report
# production process (zero genuine institutional content).
# ============================================================

block = r1(
    block,
    "      <li>Every batch ends with a status report — completed courses, remaining courses, issues discovered, decisions required — matching the brief's output rule exactly (§4).</li>\n",
    "",
    "§1 batch-status bullet",
)

# ============================================================
# STEP 9: delete the entire §4 "Batching Plan" section (header,
# paragraph, and table) — pure production-process content.
# ============================================================

old_s4 = """      <h2>4. Batching Plan</h2>
      <p>Batches run by department or, where a department's courses span very different course types, by a coherent course group. This response is <strong>Batch 1 of 8</strong>:</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Batch</th><th>Scope</th><th>Courses</th><th>Status</th></tr></thead>
      <tbody>
      <tr><td>1</td><td>Foundation Studies (all departments)</td><td>IS-101, QS-101, QS-102, AR-101, IE-101, RL-101</td><td><strong>Complete — this response</strong></td></tr>
      <tr><td>2</td><td>Intermediate Islamic Studies (all departments)</td><td>IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201</td><td><strong>Complete</strong></td></tr>
      <tr><td>3</td><td>Advanced — Islamic Studies</td><td>IS-301, IS-302, IS-303, IS-304, IS-305</td><td><strong>Complete</strong></td></tr>
      <tr><td>4</td><td>Advanced — Qur'anic Studies, Arabic, Civilization &amp; Society, Research</td><td>QS-301, QS-302, AR-301, AR-302, IC-301, RL-301</td><td><strong>Complete</strong></td></tr>
      <tr><td>5</td><td>Diploma — Islamic Studies &amp; Qur'anic Studies</td><td>IS-401, IS-402, IS-403, QS-401, QS-402</td><td><strong>Complete</strong></td></tr>
      <tr><td>6</td><td>Diploma — Arabic, Research &amp; Learning Skills</td><td>AR-401, AR-402, RL-401</td><td><strong>Complete</strong></td></tr>
      <tr><td>7</td><td>Diploma — Islamic Education &amp; Tarbiyah (teaching track)</td><td>IE-401, IE-402 (provisional), IE-403, IE-404, IE-405</td><td><strong>Complete</strong></td></tr>
      <tr><td>8</td><td>Diploma — Islamic Civilization &amp; Society (community track); SPEC-3xx placeholder</td><td>IC-401, IC-402, SPEC-3xx (framework only — no fixed content to specify)</td><td><strong>Complete</strong></td></tr>
      </tbody>
      </table></div>

"""
block = r1(block, old_s4, "", "§4 Batching Plan section")

# ============================================================
# STEP 10: rewrite the intro paragraph's closing sentence, which
# pointed at the now-deleted §4.
# ============================================================

block = r1(
    block,
    "Because 42 courses is too much to specify at once, this document was compiled in batches — see §4 for how batches are sequenced and reported.",
    "This document proceeds by department and tier group, working from Foundation through Diploma (§4–§11), followed by a summary of all 42 specifications (§12) and a consolidated list of decisions requiring founder or Scholarly Review Committee approval (§13).",
    "intro paragraph",
)

# ============================================================
# STEP 11: rename and renumber all section headers.
# ============================================================

block = r1(block, "      <h2>5. Batch 1 — Foundation Studies</h2>", "      <h2>4. Foundation Studies</h2>", "h2 Batch 1")
block = r1(block, "      <h2>5. Batch 2 — Intermediate Islamic Studies</h2>", "      <h2>5. Intermediate Islamic Studies</h2>", "h2 Batch 2")
block = r1(block, "      <h2>5. Batch 3 — Advanced Islamic Studies</h2>", "      <h2>6. Advanced Islamic Studies</h2>", "h2 Batch 3")
block = r1(
    block,
    "      <h2>5. Batch 4 — Advanced Qur'anic Studies, Arabic, Civilization &amp; Society, Research</h2>",
    "      <h2>7. Advanced Qur'anic Studies, Arabic, Civilization &amp; Society, Research</h2>",
    "h2 Batch 4",
)
block = r1(
    block,
    "      <h2>5. Batch 5 — Diploma: Islamic Studies &amp; Qur'anic Studies</h2>",
    "      <h2>8. Diploma: Islamic Studies &amp; Qur'anic Studies</h2>",
    "h2 Batch 5",
)
block = r1(block, "      <h2>5. Batch 6 — Diploma: Arabic &amp; Research</h2>", "      <h2>9. Diploma: Arabic &amp; Research</h2>", "h2 Batch 6")
block = r1(
    block,
    "      <h2>5. Batch 7 — Diploma: Islamic Education &amp; Tarbiyah (Teaching Track)</h2>",
    "      <h2>10. Diploma: Islamic Education &amp; Tarbiyah (Teaching Track)</h2>",
    "h2 Batch 7",
)
block = r1(
    block,
    "      <h2>5. Batch 8 — Diploma: Islamic Civilization &amp; Society (Community Track), Plus SPEC-3xx</h2>",
    "      <h2>11. Diploma: Islamic Civilization &amp; Society (Community Track), Plus SPEC-3xx</h2>",
    "h2 Batch 8",
)
block = r1(block, "      <h2>6. Status Report (Cumulative)</h2>", "      <h2>12. Course Specifications Summary</h2>", "h2 Status Report")
block = r1(block, "      <h2>7. Decisions Requiring Approval</h2>", "      <h2>13. Decisions Requiring Approval</h2>", "h2 Decisions")

# ============================================================
# STEP 12: remaining inline "batch"/"brief" production-process
# wording, reworded as genuine institutional document text.
# ============================================================

block = r1(
    block,
    "flagged with the rest of this batch as decision 41 (§13); instructor-curated readings are a placeholder.",
    "flagged along with the rest of this section as decision 41 (§13); instructor-curated readings are a placeholder.",
    "IS-301 rest of this batch",
)

block = r1(
    block,
    "matching how IE-101 was treated in Batch 1.</p>",
    "matching how IE-101 was treated in Foundation Studies (§4).</p>",
    "IE-201 Batch 1 ref",
)

block = r1(
    block,
    """<p>The first Diploma-tier batch: three Islamic Studies courses reaching "comparative"/mastery depth on their respective strands (Curriculum Framework §3), plus two Qur'anic Studies courses. IS-403 (Contemporary Islamic Issues) is new at Curriculum Framework and carries the batch's main scholarly-review flag, since applied contemporary topics are inherently higher-risk than historical or methodological content. QS-402 (Ulum al-Qur'an) revisits the same subject area as QS-202's <em>Introduction to Quranic Sciences</em> at Diploma depth — reused as a starting text with the depth gap flagged rather than assumed adequate.</p>""",
    """<p>Three Islamic Studies courses reaching "comparative"/mastery depth on their respective strands (Curriculum Framework §3), plus two Qur'anic Studies courses, make up this section. IS-403 (Contemporary Islamic Issues) is new at Curriculum Framework and carries this section's main scholarly-review flag, since applied contemporary topics are inherently higher-risk than historical or methodological content. QS-402 (Ulum al-Qur'an) revisits the same subject area as QS-202's <em>Introduction to Quranic Sciences</em> at Diploma depth — reused as a starting text with the depth gap flagged rather than assumed adequate.</p>""",
    "IS-401 section intro",
)

block = r1(
    block,
    "and the batch's highest scholarly-risk course, since it engages live",
    "and the highest scholarly-risk course in this section, since it engages live",
    "IS-403 highest scholarly-risk",
)

block = r1(
    block,
    """restated here rather than resolved, per the "flag inconsistencies for approval" rule (this brief's opening instruction).""",
    """restated here rather than resolved, consistent with this document's practice (§1) of flagging inconsistencies for approval rather than resolving them unilaterally.""",
    "IE section flag-inconsistencies rule",
)
block = r1(
    block,
    "This batch also carries forward, rather than resolves, Course Catalogue's audited gap",
    "This section also carries forward, rather than resolves, Course Catalogue's audited gap",
    "IE section carries forward",
)
block = r1(
    block,
    "but adding one is a catalogue-level change outside this brief's scope and is flagged again below rather than invented.",
    "but adding one is a catalogue-level change outside this document's scope and is flagged again below rather than invented.",
    "IE section outside brief scope",
)

block = r1(
    block,
    "<p>The final batch: the community track's two Diploma companions",
    "<p>This final section covers the community track's two Diploma companions",
    "IC-401 final batch",
)
block = r1(
    block,
    "so it receives a framework note rather than a full 28-field specification, exactly as Course Catalogue's batching plan anticipated.",
    "so it receives a framework note rather than a full 28-field specification, exactly as anticipated when SPEC-3xx was left open in Course Catalogue §3.",
    "SPEC-3xx batching plan anticipated (1)",
)
block = r1(
    block,
    "restated once at the end of this batch rather than as two more near-identical gap entries.",
    "restated once at the end of this section rather than as two more near-identical gap entries.",
    "IC-401 end of this batch",
)

block = r1(
    block,
    """No further action is needed on SPEC-3xx in Course Specifications beyond recording this framework — Course Catalogue's batching plan anticipated exactly this outcome ("framework only — no fixed content to specify").""",
    """No further action is needed on SPEC-3xx in Course Specifications beyond recording this framework — exactly the outcome anticipated when SPEC-3xx was left as a placeholder in Course Catalogue §3 ("framework only — no fixed content to specify").""",
    "SPEC-3xx batching plan anticipated (2)",
)

block = r1(
    block,
    """<p><strong>Completed courses (42/42), plus the SPEC-3xx framework note:</strong> Batch 1 — IS-101, QS-101, QS-102, AR-101, IE-101, RL-101. Batch 2 — IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201. Batch 3 — IS-301, IS-302, IS-303, IS-304, IS-305. Batch 4 — QS-301, QS-302, AR-301, AR-302, IC-301, RL-301. Batch 5 — IS-401, IS-402, IS-403, QS-401, QS-402. Batch 6 — AR-401, AR-402, RL-401. Batch 7 — IE-401, IE-402 (provisional), IE-403, IE-404, IE-405. Batch 8 — IC-401, IC-402, SPEC-3xx (framework note, not a full specification — see §11 above). Course Specifications is now complete: every course in the Course Catalogue has a full specification and syllabus.</p>""",
    """<p><strong>Completed courses (42/42), plus the SPEC-3xx framework note:</strong> §4 Foundation Studies — IS-101, QS-101, QS-102, AR-101, IE-101, RL-101. §5 Intermediate Islamic Studies — IS-201, IS-202, IS-203, QS-201, QS-202, AR-201, IC-201, IE-201, IE-202, RL-201. §6 Advanced Islamic Studies — IS-301, IS-302, IS-303, IS-304, IS-305. §7 Advanced Qur'anic Studies, Arabic, Civilization &amp; Society, Research — QS-301, QS-302, AR-301, AR-302, IC-301, RL-301. §8 Diploma: Islamic Studies &amp; Qur'anic Studies — IS-401, IS-402, IS-403, QS-401, QS-402. §9 Diploma: Arabic &amp; Research — AR-401, AR-402, RL-401. §10 Diploma: Islamic Education &amp; Tarbiyah (Teaching Track) — IE-401, IE-402 (provisional), IE-403, IE-404, IE-405. §11 Diploma: Islamic Civilization &amp; Society (Community Track), Plus SPEC-3xx — IC-401, IC-402, SPEC-3xx (framework note, not a full specification — see §11 above). Course Specifications is now complete: every course in the Course Catalogue has a full specification and syllabus.</p>""",
    "Completed courses summary",
)

block = r1(
    block,
    "<p><strong>Issues discovered (cumulative, all 8 batches):</strong> no structural inconsistency",
    "<p><strong>Issues discovered:</strong> no structural inconsistency",
    "Issues discovered cumulative",
)

block = r1(
    block,
    "First surfaced at IC-201 (needs a dedicated history/civilization text) and IC-301 (Batch 4); Batch 8 confirms the same absence extends to IC-401 and IC-402 as well",
    "First surfaced at IC-201 (needs a dedicated history/civilization text) and IC-301 (§7); IC-401 and IC-402 confirm the same absence extends to them as well",
    "Bookstore gap Batch 4 / Batch 8 refs",
)

block = r1(
    block,
    "this batch drafted IE-402 at its current working placement",
    "this document drafted IE-402 at its current working placement",
    "IE-402 this batch drafted",
)

block = r1(
    block,
    "Whether to add one is a catalogue-level decision outside this brief's scope, flagged again here since Batch 7 is where it would most naturally sit.",
    "Whether to add one is a catalogue-level decision outside this document's scope, flagged again here since §10 (the Diploma teaching track) is where it would most naturally sit.",
    "Practical course decision outside brief scope / Batch 7",
)

block = r1(
    block,
    "COMPLETE, all 8 of 8 batches (Foundation Studies; Intermediate Islamic Studies; Advanced Islamic Studies; Advanced Qur'anic Studies/Arabic/Civilization &amp; Society/Research; Diploma — Islamic Studies &amp; Qur'anic Studies; Diploma — Arabic &amp; Research; Diploma — Islamic Education &amp; Tarbiyah teaching track; Diploma — Islamic Civilization &amp; Society community track plus SPEC-3xx).",
    "COMPLETE across all subject groups (Foundation Studies; Intermediate Islamic Studies; Advanced Islamic Studies; Advanced Qur'anic Studies/Arabic/Civilization &amp; Society/Research; Diploma — Islamic Studies &amp; Qur'anic Studies; Diploma — Arabic &amp; Research; Diploma — Islamic Education &amp; Tarbiyah teaching track; Diploma — Islamic Civilization &amp; Society community track plus SPEC-3xx).",
    "closing signature",
)

# ============================================================
# Sanity check: no "batch"/"Batch"/"brief" production-process
# wording should remain in this document except the unrelated
# word "briefly" (e.g. "consequentialism ... briefly surveyed").
# ============================================================

remaining = [
    line
    for line in block.split("\n")
    if ("atch" in line and "batch" in line.lower()) or "brief" in line.lower()
]
remaining = [line for line in remaining if "briefly" not in line.lower()]
assert not remaining, "Unexpected leftover batch/brief wording:\n" + "\n".join(remaining)

content = pre + block + post

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Part 2 done (Course Specifications restructuring).")
