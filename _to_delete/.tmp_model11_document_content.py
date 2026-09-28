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


path = "lib/legalContentDefaults.js"
c = load(path)

# ---------------------------------------------------------------------
# 1. Correction to Academic Governance: Course approval / Program
#    approval rows are no longer "Partial" — a real approval workflow
#    now exists (this document, §4).
# ---------------------------------------------------------------------
c = r1(
    c,
    '<tr><td>Course approval</td><td>Programme Coordinator / HoD, in practice</td><td>Partial — a Course has <code>isPublished</code>, but no approval workflow or sign-off trail; see §9</td></tr>\n      <tr><td>Program approval</td><td>Dean, in practice</td><td>Partial — a Program has <code>isActive</code>, but no formal approval workflow; see §9</td></tr>',
    '<tr><td>Course approval</td><td>Programme Coordinator submits, Head of Department approves</td><td>Real — <code>Course.approvalStatus</code> (Draft/Under Review/Approved/Returned for Revision); see Academic Regulations, Records &amp; Quality Assurance §4</td></tr>\n      <tr><td>Program approval</td><td>Head of Department submits, Dean approves</td><td>Real — <code>Program.approvalStatus</code>, same workflow; see Academic Regulations, Records &amp; Quality Assurance §4</td></tr>',
    "Academic Governance table: course/program approval rows",
)

# ---------------------------------------------------------------------
# 2. Correction to Academic Governance §9 decision: split the old
#    all-four-open item now that course/program approval is real,
#    naming what's still genuinely open (curriculum-level, instructor).
# ---------------------------------------------------------------------
c = r1(
    c,
    '<li><strong>Formal approval workflow — open.</strong> Curriculum, course, program and instructor approval are currently informal (edit-permission-based, per §2). Formalizing them as real, enforced states (e.g. a Course moving through Draft → Under Review → Approved rather than just Published/Unpublished) would need a schema change you\'d run as a migration. Confirm if and when you want this built.</li>',
    '<li><strong>Correction applied: course and program approval are now real, enforced states — action taken, not open.</strong> §2: a Course/Program now genuinely moves Draft → Under Review → Approved (or Returned for Revision), enforced by <code>Course.approvalStatus</code> / <code>Program.approvalStatus</code>, not just tracked informally through edit permissions. See Academic Regulations, Records &amp; Quality Assurance §4 for the full workflow and portals.</li>\n      <li><strong>Curriculum-level approval and instructor qualification approval remain informal — open.</strong> §2: this is narrower than the original item above. A Course and a Program each now have a real approval state (previous item), but there is still no distinct "curriculum approved" state above the individual course level, and no qualification-review or authorization step beyond simply assigning an instructor to a course via <code>InstructorCourse</code>. Formalizing either would need its own schema change and is a founder-level decision this document does not make by extension.</li>',
    "Academic Governance §9 decision: formal approval workflow",
)

# ---------------------------------------------------------------------
# 3. Correction to Course Specifications: the academic integrity
#    paragraph is no longer "proposed, not yet founder-confirmed" — a
#    real case-tracking system now implements exactly this policy.
# ---------------------------------------------------------------------
c = r1(
    c,
    '<li><strong>Academic integrity.</strong> Written work must be the learner\'s own; recitation and practical assessments must be the learner\'s own unaided performance; unauthorized assistance on individually-assessed quizzes or exams is not permitted. Suspected violations are reported to the Examinations Officer through the existing Request system (Academic Governance §2); a first violation typically means resubmission or a grade penalty at instructor discretion, a repeat or severe violation escalates to the Head of Department and may engage the Academic Standing process (the existing <code>AcademicStanding</code> enum). Proposed, not yet founder-confirmed.</li>',
    '<li><strong>Academic integrity.</strong> Written work must be the learner\'s own; recitation and practical assessments must be the learner\'s own unaided performance; unauthorized assistance on individually-assessed quizzes or exams is not permitted. <strong>Correction applied: this is now real, not proposed.</strong> A first violation typically means resubmission or a grade penalty at the reporting instructor\'s own discretion; a repeat or severe violation escalates to the Head of Department and may engage the Academic Standing process (the existing <code>AcademicStanding</code> enum) — exactly the escalation described here, now enforced by a real <code>IntegrityCase</code> record rather than only the general Request system. See Academic Regulations, Records &amp; Quality Assurance §3 for the full case-tracking system, violation types, and portals.</li>',
    "Course Specifications: academic integrity paragraph",
)

save(path, c)
print("Applied 3 corrections to earlier documents.")

# ---------------------------------------------------------------------
# 4. Insert the new Model 11 document.
# ---------------------------------------------------------------------
NEW_DOC = r"""
  'academy-academic-regulations': {
    title: 'Academic Regulations, Records & Quality Assurance',
    bodyHtml: `
      <p><strong>Academic Regulations, Records &amp; Quality Assurance Framework.</strong> Using every prior framework, from Institutional Foundation through Faculty, Staff &amp; Academic Portals, as the fixed academic foundation, this document is the single place the Academy's academic regulations are named together end to end: admission through certificate, academic integrity, the record framework, the quality assurance cycle, program and course review, and the institution's real, computed academic KPIs. For the large majority of what the brief behind this document asks for, the regulation already exists in full somewhere in that foundation — this document's job for those is to index them together, not redescribe them (§2). Three things did not exist anywhere in the platform before this document and were genuinely built alongside it: a real academic-integrity case-tracking system (§3), replacing a paragraph Course Specifications had already drafted but explicitly marked "proposed, not yet founder-confirmed"; a real course-and-program approval workflow (§4), closing a gap Academic Governance had already flagged twice as informal and partial; and a set of real, computed academic dashboards and KPIs (§9), deliberately built from existing data rather than any invented formula. Two earlier documents are corrected in place because this document's work revealed they were now out of date — Academic Governance's course/program-approval status, and Course Specifications' academic-integrity paragraph — both noted where they occur and recorded again here (§10).</p>

      <h2>1. Scope &amp; Constraints</h2>
      <p>This document states the consolidated index of academic policies (§2), the real academic integrity framework (§3), the real course and program approval workflow (§4), the records framework (§5), the quality assurance cycle (§6), program review (§7), course review (§8), and academic dashboards and KPIs (§9) — followed by a record of what was built, corrected, or remains an open, founder-level decision (§10). Where a regulation already exists and works, this document cross-references it by section rather than restating or redesigning it; grading, progression, graduation, the student journey, placement, faculty roles, and every portal already described elsewhere keep their existing, already-correct behavior. Where a genuine functional gap existed — nowhere to record an integrity case, no enforced approval state for a course or program, no computed institution-wide KPI — this document builds the real thing rather than only describing an intended one. Where building the real thing would require inventing data that does not exist anywhere in the platform today — most importantly, a PLO/CLO achievement percentage — this document names that gap plainly instead of approximating a number for it (§9, §10), matching the same commitment already made in Faculty, Staff &amp; Academic Portals §9.5 and Assessment, Grading &amp; Progression's own PLO paragraph.</p>

      <h2>2. Academic Policies — Consolidated Index</h2>
      <p>Every policy area below already has one governing document and section; this table exists so a reader (or a founder reviewing "is this covered?") finds all of them in one place, rather than having to know which of eleven documents to open. Nothing in this table is redefined — each row links to where the real policy and, where applicable, the real system actually lives.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Policy area</th><th>Governing document &amp; section</th><th>Status</th></tr></thead>
      <tbody>
      <tr><td>Admission</td><td>Student Lifecycle &amp; Academic Administration §3 (application form); Academic Governance §2 (approval)</td><td>Real</td></tr>
      <tr><td>Placement</td><td>Student Lifecycle &amp; Academic Administration §4</td><td>Real</td></tr>
      <tr><td>Recognition of Prior Learning (RPL)</td><td>Academy Curriculum (RPL paragraph) — routed through the same placement assessment every entrant undergoes</td><td>Real</td></tr>
      <tr><td>Registration</td><td>Student Lifecycle &amp; Academic Administration §5</td><td>Real</td></tr>
      <tr><td>Attendance</td><td>Student Lifecycle &amp; Academic Administration §6</td><td>Real</td></tr>
      <tr><td>Assessment</td><td>Assessment, Grading &amp; Progression §4–§6; Course Specifications (per-course design)</td><td>Real</td></tr>
      <tr><td>Examination</td><td>Assessment, Grading &amp; Progression §4 (Final component); Course Specifications</td><td>Real</td></tr>
      <tr><td>Grading</td><td>Assessment, Grading &amp; Progression §4</td><td>Real</td></tr>
      <tr><td>Progression</td><td>Assessment, Grading &amp; Progression §7</td><td>Real</td></tr>
      <tr><td>Academic probation</td><td>Assessment, Grading &amp; Progression §7 (<code>AcademicStanding</code>, <code>TermRecord.standing</code>)</td><td>Real</td></tr>
      <tr><td>Graduation</td><td>Assessment, Grading &amp; Progression §7.9–§8; Student Lifecycle &amp; Academic Administration §9</td><td>Real</td></tr>
      <tr><td>Certificates</td><td>Assessment, Grading &amp; Progression §8 (<code>GraduationDocument</code>)</td><td>Real</td></tr>
      <tr><td>Academic integrity</td><td>This document §3 (was: Course Specifications, proposed only — now corrected there)</td><td>Real — built by this document</td></tr>
      <tr><td>Student records</td><td>Student Lifecycle &amp; Academic Administration §8</td><td>Real</td></tr>
      <tr><td>Appeals</td><td>Academic Governance §6 (Academic Appeals Committee; <code>GRADE_APPEAL</code> request type)</td><td>Real</td></tr>
      <tr><td>Complaints</td><td>Student Lifecycle &amp; Academic Administration §8; Student Affairs (<code>COMPLAINT</code> request type)</td><td>Real</td></tr>
      <tr><td>Academic advising</td><td>Student Lifecycle &amp; Academic Administration §7</td><td>Real</td></tr>
      <tr><td>Instructor qualifications</td><td>Faculty, Staff &amp; Academic Portals §3 (Instructor Profile)</td><td>Real</td></tr>
      <tr><td>Course approval</td><td>This document §4 (was: Academic Governance, informal only — now corrected there)</td><td>Real — built by this document</td></tr>
      <tr><td>Program approval</td><td>This document §4 (was: Academic Governance, informal only — now corrected there)</td><td>Real — built by this document</td></tr>
      </tbody></table></div>
      <p>Two narrower approval gaps Academic Governance §9 also named — a distinct curriculum-level approval state above the individual course, and a formal qualification-review/authorization step for instructors beyond simply assigning them to a course — are outside the course-and-program approval workflow this document builds, and remain open exactly as Academic Governance already flagged them (§10).</p>

      <h2>3. Academic Integrity Framework</h2>
      <p>Course Specifications already drafted the Academy's academic integrity policy in full — what counts as a violation, who it is reported to, and how it escalates — but marked the paragraph "proposed, not yet founder-confirmed" because nothing existed to actually record a case: a suspected violation could only be described as free text through the general Request system, with no violation type, no severity, and no queryable outcome. That paragraph is corrected in place (§10) and this section is the real system behind it: an <code>IntegrityCase</code> record, typed and tracked exactly the way the drafted policy already described.</p>
      <p><strong>Violation types</strong> — a fixed, real enum (<code>IntegrityViolationType</code>) covering the brief's own list directly: Plagiarism, Cheating, Unauthorized Collaboration, Falsification, Impersonation, Assessment Misconduct, AI Misuse, and Other for anything genuinely not covered by the first seven. <strong>Citation and academic honesty</strong> are not separate case types — they are the standard a violation is measured against, and are already taught directly: Course Specifications' Research &amp; Islamic Studies Methodology course (RL-301) has a dedicated citation and academic-integrity teaching unit (its curriculum table, "Citing religious sources accurately; the Academic Integrity policy"), and Institutional Foundation already states academic integrity as a founding principle ("credentials mean what they say; assessment is honest"). This document does not re-teach or redefine either — it is where a violation of them is actually recorded.</p>
      <p><strong>Severity and escalation</strong> — every case is Minor or Major, matching the drafted policy word for word: a Minor case (typically a first violation) is resolved directly by the instructor who reported it — usually resubmission or a grade penalty, recorded as free-text <code>sanction</code> since real sanctions vary too much for a fixed catalogue; a Major case (a repeat or severe violation) requires Head of Department authorization to resolve, reusing the same <code>DEPARTMENT_MATTERS</code> edit permission and department-scoping (<code>Department.headId</code>) already established for every other Head of Department function. A case can, where warranted, be marked as having engaged the Academy's existing Academic Standing process (<code>standingActionTaken</code>) — this is a record that the separate, already-real standing process was engaged because of this case, never a second standing mechanism competing with it.</p>
      <p><strong>Lifecycle and reporting.</strong> A case moves Reported → Under Review → Resolved or Dismissed. Any staff member holding <code>COURSES_GRADES</code>, <code>DEPARTMENT_MATTERS</code>, or <code>QUALITY_ASSURANCE</code> edit access can report one — an instructor grading their own course, a Head of Department, or Quality Assurance following up on something a review surfaced. There is deliberately no student-facing view: this is a staff-side integrity record, not something filed as a Request against a student. An instructor reports a case and manages their own Minor cases from a new Integrity tab on the Instructor Portal, with a real course→student roster lookup (resolving <code>Enrollment</code> to the correct <code>StudentProfile</code>) so a case is always filed against the actual enrolled student, not typed in free text. A Head of Department reviews every case touching their own department — by course or by the student's own department — from a new Approvals &amp; Integrity page on the Department Head Portal, alongside course approvals (§4).</p>

      <h2>4. Course &amp; Program Approval Workflow</h2>
      <p>Academic Governance already named the intended authority for this twice over — "Course approval: Programme Coordinator/HoD, in practice" and "Program approval: Dean, in practice" — but flagged both as partial: a <code>Course</code> only had <code>isPublished</code> and a <code>Program</code> only had <code>isActive</code>, neither a real approval state or a sign-off trail. Both rows, and the decision item naming this as open, are corrected in Academic Governance (§10); this section is the real workflow now behind them.</p>
      <p>Both <code>Course</code> and <code>Program</code> gained a real <code>approvalStatus</code> (Draft → Under Review → Approved, or Returned for Revision, with a free-text <code>approvalNote</code> explaining any return) and nothing already live was disturbed by adding it: every one of the Academy's existing 42 courses and its existing programs defaults to Approved, exactly the state they were already functioning in. Only newly created courses and programs start at Draft. A Programme Coordinator creates and submits a course for review from the Coordinator Dashboard's existing curriculum tab, which now shows the course's approval badge and note and a "Submit for Review" action; a Head of Department approves or returns it, scoped to their own department exactly as every other Head of Department action already is (<code>Department.headId</code>), from the same new Approvals &amp; Integrity page as §3. A Head of Department creates and submits a programme the same way; a Dean approves or returns it from a new Approvals page on the Dean Portal, scoped to their own faculty (<code>Faculty.deanId</code>). A returned course or programme carries the reviewer's note forward so the reason for the return is never lost between the decision and the next revision.</p>

      <h2>5. Records Framework</h2>
      <p>Every record type below is already real, already governed by an earlier document, and is not redefined here — this section exists so the complete set of institutional records is named together once, the same purpose §2's policy index serves for regulations.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Record</th><th>Real mechanism</th><th>Governing section</th></tr></thead>
      <tbody>
      <tr><td>Student records</td><td><code>StudentProfile</code>, academic record aggregation</td><td>Student Lifecycle &amp; Academic Administration §8</td></tr>
      <tr><td>Transcript records</td><td><code>Grade</code>, <code>TermRecord</code>; <code>TRANSCRIPT</code> request type</td><td>Assessment, Grading &amp; Progression §7; Student Lifecycle §8</td></tr>
      <tr><td>Assessment records</td><td><code>Grade</code> (per component, per course, per term)</td><td>Assessment, Grading &amp; Progression §4–§5</td></tr>
      <tr><td>Certificate records</td><td><code>GraduationApplication</code>, <code>GraduationDocument</code></td><td>Assessment, Grading &amp; Progression §8</td></tr>
      <tr><td>Instructor records</td><td><code>StaffProfile</code> plus the Instructor Profile (qualifications, professional development, performance review)</td><td>Faculty, Staff &amp; Academic Portals §3</td></tr>
      <tr><td>Course records</td><td><code>Course</code>, now including <code>approvalStatus</code>/<code>approvalNote</code></td><td>Course Catalogue; this document §4</td></tr>
      <tr><td>Program records</td><td><code>Program</code>, now including <code>approvalStatus</code>/<code>approvalNote</code></td><td>Academy Pathways; this document §4</td></tr>
      </tbody></table></div>

      <h2>6. Quality Assurance Cycle</h2>
      <p>The brief's Plan → Design → Teach → Assess → Measure → Review → Improve cycle is not a new process invented for this document — every stage already maps onto a real, already-built mechanism, and the cycle's value is in naming them as one continuous loop rather than seven disconnected features.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>Stage</th><th>Real mechanism</th></tr></thead>
      <tbody>
      <tr><td>Plan</td><td>A course or programme is proposed and submitted for review before it is taught (§4)</td></tr>
      <tr><td>Design</td><td>Course Specifications — CLOs, weekly content, assessment plan, required texts, per course</td></tr>
      <tr><td>Teach</td><td>Instructor Portal, attendance, course delivery (Faculty, Staff &amp; Academic Portals §5)</td></tr>
      <tr><td>Assess</td><td><code>Grade</code> per component, per the weighting Assessment, Grading &amp; Progression §4 defines</td></tr>
      <tr><td>Measure</td><td>Academic Dashboards &amp; KPIs — newly computed by this document (§9)</td></tr>
      <tr><td>Review</td><td><code>QualityReview</code> — Program, Course, Department, Faculty, and Staff subject types (Academic Governance §5; Faculty, Staff &amp; Academic Portals §9)</td></tr>
      <tr><td>Improve</td><td><code>improvementStatus</code> tracked to completion (Faculty, Staff &amp; Academic Portals §9.2), plus a course or programme returned for revision re-entering Plan (§4)</td></tr>
      </tbody></table></div>
      <p>Review and Improve are where this document's own Course/Program approval workflow (§4) becomes part of the cycle rather than a one-time gate: a <code>QualityReview</code> that finds Major Non-Compliance against a course is exactly the situation the approval workflow's Returned-for-Revision state exists for — the same lever a Head of Department uses to return a newly submitted course can equally return an existing one flagged by review, closing the loop back to Plan without a second, competing mechanism.</p>

      <h2>7. Program Review</h2>
      <p>Annual monitoring and periodic review are carried out through the existing <code>QualityReview</code> mechanism with <code>subjectType: PROGRAM</code> — already real, already scheduled and tracked to an outcome and, where required, an improvement plan (Academic Governance §5). Student feedback rolls up from <code>CourseEvaluation</code> across a programme's courses; instructor feedback from <code>StaffPerformanceReview</code> for instructors teaching in it; course performance and assessment analysis from the course-level pass-rate figures this document now computes (§9); curriculum mapping already exists as Assessment, Grading &amp; Progression's PLO cross-reference table, which indexes each course's contribution to each Programme Learning Outcome against its own Course Specifications content rather than duplicating it. Improvement plans are the same real <code>improvementStatus</code> tracking already described in §6.</p>
      <p><strong>PLO achievement is not computed as a percentage, and this document does not invent one.</strong> Programme Learning Outcomes remain document text cross-referenced to course content (as above), not queryable rows linked to actual per-student assessment results — the same gap Faculty, Staff &amp; Academic Portals §9.5 already named. An honest achievement figure needs a real PLO/CLO data model and a deliberate decision about how a course's grades roll up into it; approximating one now, from data that was never structured to support it, would be exactly the kind of meaningless number this document was explicitly asked not to produce (§9, §10).</p>

      <h2>8. Course Review</h2>
      <p>Course evaluation is real and already live: the first genuinely student-submitted course evaluation system, anonymous by default, built in Faculty, Staff &amp; Academic Portals §9.4. CLO achievement is not computed for the same reason PLO achievement is not (§7) — the "Evidence" column in each course's CLO table (Course Specifications) names what evidence would look like, it is not an attached, queryable result per student per CLO. Assessment analysis is the course pass-rate figure this document computes per course (§9), using the same Final-only convention every other pass/fail determination in the platform already uses. Student feedback is <code>CourseEvaluation</code> itself. <strong>Instructor reflection on a specific course taught is an open gap, named honestly rather than mapped onto something that does not actually do this</strong>: <code>StaffPerformanceReview</code> exists, but it is a whole-staff-member review authored by a reviewer, on a period basis — not a per-course self-reflection an instructor records themselves, and this document does not stretch it to claim otherwise. Required revision and approval of revisions are the same Returned-for-Revision → resubmit → Approved cycle §4 and §6 already describe — a course review's finding is what would trigger it, not a separate revision-tracking system built again for this section alone.</p>

      <h2>9. Academic Dashboards &amp; KPIs</h2>
      <p>Eight KPIs are computed live, on request, directly from real student, grade, attendance, evaluation, and review data — nothing here is a static or seeded number. Consistent with the explicit instruction not to create meaningless KPIs, a metric is only included where the platform's actual data can support computing it honestly; where it cannot (PLO achievement, above all), it is left out entirely rather than filled with a proxy.</p>
      <div class="table-wrap"><table>
      <thead><tr><th>KPI</th><th>How it is computed</th></tr></thead>
      <tbody>
      <tr><td>Retention</td><td>Of every student ever admitted (excludes Applicants, who never became students), the share who did not leave without completing (excludes Withdrawn/Dismissed)</td></tr>
      <tr><td>Completion</td><td>Of students who reached a terminal outcome (Graduated, Withdrawn, or Dismissed), the share who Graduated — students still actively studying are not yet counted either way</td></tr>
      <tr><td>Progression (In Good Standing)</td><td>Current-term <code>TermRecord.standing</code> distribution — Good Standing/Dean's List against Probation/Suspended, scoped to the current <code>AcademicTerm</code></td></tr>
      <tr><td>Course pass rate</td><td>Graded records using <code>gradeLetter(grade.final)</code> — the same Final-score-only convention graduation eligibility and every transcript view already use, deliberately matched rather than computing a theoretically "more correct" figure that would disagree with the rest of the platform</td></tr>
      <tr><td>Average attendance</td><td>Averaged across student-course attendance records — cumulative per student per course, since <code>Attendance</code> has no per-term field, honestly labeled as cumulative rather than presented as a single-term snapshot</td></tr>
      <tr><td>Student satisfaction</td><td>Average overall rating across <code>CourseEvaluation</code> submissions</td></tr>
      <tr><td>Instructor rating (student-rated)</td><td>Average instructor rating across the same <code>CourseEvaluation</code> submissions</td></tr>
      <tr><td>Instructor rating (formal review)</td><td>Rating distribution across submitted/acknowledged <code>StaffPerformanceReview</code> records, on the existing Needs Improvement–Outstanding scale</td></tr>
      </tbody></table></div>
      <p>A ninth figure — the lowest pass-rate courses, among those with at least five graded records — is surfaced alongside the eight KPIs as a starting point for course review (§8), not a judgment on its own. <strong>PLO achievement is deliberately not a ninth KPI</strong>, for the reason already stated in full at §7: no structured PLO/CLO achievement data exists to compute it from, and this document does not manufacture a number to fill the tile. All eight KPIs, and the explanation of how each is computed, are shown together on a new KPIs tab on the Quality Assurance Portal.</p>

      <h2>10. Decisions Requiring Approval</h2>
      <ol start="72">
      <li><strong>Built: the Academic Integrity case-tracking system — action taken, not open.</strong> §3: <code>IntegrityCase</code>, its violation types, Minor/Major severity split, and Reported → Under Review → Resolved/Dismissed lifecycle, implementing exactly the policy Course Specifications had already drafted but marked unconfirmed.</li>
      <li><strong>Correction applied: Course Specifications' academic integrity paragraph is now marked real, not proposed — action taken, not open.</strong> §3: the paragraph is updated in place to reference the real system now behind it.</li>
      <li><strong>Built: the Course &amp; Program approval workflow — action taken, not open.</strong> §4: <code>Course.approvalStatus</code> / <code>Program.approvalStatus</code>, Programme Coordinator → Head of Department for courses and Head of Department → Dean for programmes, exactly the authority Academic Governance had already named as "in practice."</li>
      <li><strong>Correction applied: Academic Governance's course/program-approval status and its "formal approval workflow" decision are updated — action taken, not open.</strong> §2, §4: both are now Real, and the open decision item is split to separate what is now built from what genuinely remains open (next item).</li>
      <li><strong>Curriculum-level approval and instructor qualification approval remain open.</strong> §2: distinct from course and program approval (now real), there is still no approval state above the individual course, and no formal qualification-review step for instructors beyond assignment via <code>InstructorCourse</code> — both are founder-level decisions this document does not make by extension.</li>
      <li><strong>Built: Academic Dashboards &amp; KPIs — action taken, not open.</strong> §9: eight KPIs computed live from real data, plus a lowest-pass-rate-courses list, on a new Quality Assurance Portal tab.</li>
      <li><strong>No PLO/CLO achievement percentage exists — open.</strong> §7, §9: the same gap Faculty, Staff &amp; Academic Portals §9.5 already named; a real PLO/CLO data model is needed before an honest figure can be computed, and this document does not approximate one to fill a KPI tile.</li>
      <li><strong>No per-course instructor reflection and no per-assignment CLO evidence — open.</strong> §8: <code>StaffPerformanceReview</code> is a whole-staff, reviewer-authored record, not an instructor's own per-course reflection; the CLO "Evidence" column in Course Specifications remains descriptive text, not an attached per-student artifact — both distinct from the review-level evidence repository Faculty, Staff &amp; Academic Portals §9.3 already built.</li>
      </ol>
      <p><em>Ulul Azm Academy — Academic Regulations, Records &amp; Quality Assurance Framework. Prepared for Founder review. This framework indexes the Academy's academic policies, records, and quality assurance cycle from across every prior document rather than restating them, and is accompanied by three genuinely new systems built alongside it — academic integrity case-tracking, a real course-and-program approval workflow, and computed academic KPIs — plus two structural corrections to Academic Governance's approval status and Course Specifications' integrity policy. It names, rather than approximates, the two places — PLO/CLO achievement and per-course instructor reflection — where a genuinely complete framework would need further, founder-level work this document does not take upon itself to invent.</em></p>

    `.trim(),
  },
"""

MARKER = "  'academy-faculty-portals': {"
idx = c.index(MARKER)
end_marker = "\n};\n\nexport const DEFAULT_FAQS"
end_idx = c.index(end_marker, idx)
c = c[:end_idx] + NEW_DOC + c[end_idx + 1:]

save(path, c)
print("Inserted Model 11 document into DEFAULT_PAGES.")
