# -*- coding: utf-8 -*-
import io

PATH = "lib/legalContentDefaults.js"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def replace_once(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


# ============================================================
# ACADEMY FOUNDATION — §8 Academic Design Rules (leaked brief
# checklist, incl. explicit "AI-assisted design" line) and §10
# Scholarly Review Principles ("AI assistance" mentions).
# ============================================================

old_s8 = """      <h2>8. Academic Design Rules</h2>
      <ul>
      <li>Do not duplicate courses unnecessarily.</li>
      <li>Do not force every department to contribute courses to every program.</li>
      <li>Do not create courses simply to make departments look symmetrical.</li>
      <li>Do not use age alone to determine academic placement.</li>
      <li>Do not allow advanced courses without appropriate prerequisites, unless a placement assessment justifies direct entry.</li>
      <li>Do not create learning outcomes that cannot be assessed.</li>
      <li>Do not create assessments unrelated to the learning outcomes they claim to measure.</li>
      <li>Do not claim external recognition or accreditation without evidence that it has actually been granted.</li>
      <li>Do not allow AI-assisted design to make unreviewed religious determinations.</li>
      <li>Islamic content must eventually undergo appropriate scholarly review before being finalized as institutional teaching.</li>
      </ul>"""

new_s8 = """      <h2>8. Academic Design Rules</h2>
      <ul>
      <li><strong>No unnecessary duplication.</strong> Courses are not duplicated across departments or programs without genuine academic reason.</li>
      <li><strong>No forced symmetry.</strong> Departments are not required to contribute courses to every program, and courses are not created merely to make departments appear symmetrical.</li>
      <li><strong>Placement by readiness, not age.</strong> Age alone does not determine academic placement.</li>
      <li><strong>Prerequisites are enforced.</strong> Advanced courses require their stated prerequisites, unless a placement assessment justifies direct entry.</li>
      <li><strong>Assessable outcomes only.</strong> Learning outcomes are adopted only if they can genuinely be assessed, and assessments are designed to measure the outcomes they claim to measure — not to stand in for them.</li>
      <li><strong>Honest recognition claims.</strong> The Academy does not claim external recognition or accreditation it has not actually been granted.</li>
      <li><strong>Scholarly review before teaching.</strong> Curriculum and content development, however produced, does not by itself make a religious determination. Content bearing on Islamic rulings or positions is finalized as institutional teaching only after appropriate scholarly review (§10).</li>
      </ul>"""

content = replace_once(content, old_s8, new_s8, "Academy Foundation §8")

old_s10_p1 = """      <p>This document, and any planning done with AI assistance, may describe the <em>structure</em> of Islamic education — how knowledge, understanding, character, and practice relate, how learners progress, how competence is defined. It does not and cannot responsibly determine specific religious content: rulings, a school of jurisprudence, hadith-authentication positions, or stances on matters of genuine scholarly difference.</p>"""

new_s10_p1 = """      <p>This document may describe the <em>structure</em> of Islamic education — how knowledge, understanding, character, and practice relate, how learners progress, how competence is defined. It does not and cannot responsibly determine specific religious content: rulings, a school of jurisprudence, hadith-authentication positions, or stances on matters of genuine scholarly difference.</p>"""

content = replace_once(content, old_s10_p1, new_s10_p1, "Academy Foundation §10 para")

old_s10_li = """      <li>AI-assisted tools may support drafting, organization, and instructional design. They do not make religious determinations, and nothing produced with their help is treated as reviewed until a qualified scholar has actually reviewed it.</li>"""

new_s10_li = """      <li>Curriculum and content development, whatever tools or process produced it, does not by itself constitute scholarly review. Nothing is treated as reviewed until a qualified scholar has actually reviewed it.</li>"""

content = replace_once(content, old_s10_li, new_s10_li, "Academy Foundation §10 bullet")

# ============================================================
# ACADEMY GOVERNANCE — "the Academic Governance brief"
# ============================================================

old_gov = """is explicit about which pieces of the Academic Governance brief — committees, cross-cutting units, formal approval workflows — are new design that still needs a founder decision before it becomes real, tracked functionality."""
new_gov = """is explicit about which pieces of it — committees, cross-cutting units, formal approval workflows — are new design that still needs a founder decision before it becomes real, tracked functionality."""

content = replace_once(content, old_gov, new_gov, "Academy Governance 'brief'")

# ============================================================
# ACADEMY CURRICULUM — "the Curriculum Framework brief"
# ============================================================

old_curr = """      <p>The three chains named in the Curriculum Framework brief, using the codes above, plus three more the study plans above imply:</p>"""
new_curr = """      <p>The three chains named earlier in this document, using the codes above, plus three more the study plans above imply:</p>"""

content = replace_once(content, old_curr, new_curr, "Academy Curriculum 'brief'")

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Part 1 done (Academy Foundation, Governance, Curriculum).")
