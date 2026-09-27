'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FeedbackBanner, fieldStyle, STATUS_TONE_CLASS } from '../_shared';

type CourseWeights = {
    quiz1: number;
    quiz2: number;
    assignment: number;
    midterm: number;
    final: number;
};

type Course = {
    id: string;
    title: string;
    code: string;
    quiz1Weight: number;
    quiz2Weight: number;
    assignWeight: number;
    midtermWeight: number;
    finalWeight: number;
    // Model 19 -- only true for a course with an approved practical
    // assessment component. Gates the Practical column below.
    practicalRequired: boolean;
};

type StudentGrade = {
    studentId: string;
    studentName: string;
    quiz1: number;
    quiz2: number;
    assignment: number;
    midterm: number;
    final: number;
    // Model 19 -- recorded and shown on its own; deliberately never
    // read by calculateTotal below.
    practical: number;
    termId?: string | null;
    // Grade finalization -- a FINALIZED row is locked: its inputs
    // are shown read-only and it is excluded from Save & Submit and
    // from Finalize. Changing a FINALIZED row after the fact goes
    // through the Registrar's grade-correction workflow
    // (Academic Records), not this page.
    status?: 'DRAFT' | 'FINALIZED';
    finalizedAt?: string | null;
};

type Term = {
    id: string;
    name: string;
};

export default function GradesPage() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [weights, setWeights] = useState<CourseWeights>({
        quiz1: 15,
        quiz2: 15,
        assignment: 10,
        midterm: 20,
        final: 40,
    });
    const [studentsGrades, setStudentsGrades] = useState<StudentGrade[]>([]);
    const [loadingGrades, setLoadingGrades] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [gradeTerms, setGradeTerms] = useState<Term[]>([]);
    const [selectedGradeTermId, setSelectedGradeTermId] = useState<string>("");

    useEffect(() => {
        const requestedCourseId = searchParams.get('courseId') || undefined;
        fetchGradesData(requestedCourseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchGradesData = async (courseId?: string) => {
        setLoadingGrades(true);
        try {
            const url = courseId ? `/api/instructor/portal/grades?courseId=${courseId}` : `/api/instructor/portal/grades`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.courses) {
                setCourses(data.courses);
                setSelectedCourseId(data.activeCourseId);
                setWeights(data.weights);
                setStudentsGrades(data.students);
            }
            if (data.terms) {
                setGradeTerms(data.terms);
                setSelectedGradeTermId((prev) => prev || data.terms.find((t: Term & { isCurrent?: boolean }) => (t as any).isCurrent)?.id || data.terms[0]?.id || "");
            }
        } catch (err) {
            console.error("Error loading grade submission data", err);
        } finally {
            setLoadingGrades(false);
        }
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCourseId = e.target.value;
        setSelectedCourseId(newCourseId);

        const selectedCourse = courses.find((c) => c.id === newCourseId);
        if (selectedCourse) {
            setWeights({
                quiz1: selectedCourse.quiz1Weight,
                quiz2: selectedCourse.quiz2Weight,
                assignment: selectedCourse.assignWeight,
                midterm: selectedCourse.midtermWeight,
                final: selectedCourse.finalWeight,
            });
        }

        fetchGradesData(newCourseId);
    };

    const handleScoreChange = (studentId: string, field: keyof StudentGrade, value: string) => {
        const numericValue = value === "" ? 0 : parseFloat(value);
        setStudentsGrades((prev) =>
            prev.map((student) =>
                // A FINALIZED row is locked -- the inputs are also
                // disabled in the markup below, but guard here too
                // so this can never write into a locked row.
                student.studentId === studentId && student.status !== 'FINALIZED'
                    ? { ...student, [field]: numericValue }
                    : student
            )
        );
    };

    const calculateTotal = (student: StudentGrade) => {
        const total =
            (student.quiz1 * weights.quiz1) / 100 +
            (student.quiz2 * weights.quiz2) / 100 +
            (student.assignment * weights.assignment) / 100 +
            (student.midterm * weights.midterm) / 100 +
            (student.final * weights.final) / 100;
        return total.toFixed(2);
    };

    const handleSubmitGrades = async () => {
        setSaving(true);
        setMessage("");
        try {
            // FINALIZED rows are locked -- don't even send them back to
            // the save endpoint, which would reject the whole request
            // otherwise. Their marks were already saved when they were
            // finalized, so leaving them out here changes nothing about
            // what's stored.
            const editableGrades = studentsGrades.filter((s) => s.status !== 'FINALIZED');

            const res = await fetch("/api/instructor/portal/grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: selectedCourseId,
                    grades: editableGrades,
                    termId: selectedGradeTermId || null,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Grades saved successfully!");
                fetchGradesData(selectedCourseId);
            } else {
                setMessage(data.error || "Failed to save grades.");
            }
        } catch (err) {
            setMessage("An error occurred while saving grades.");
        } finally {
            setSaving(false);
        }
    };

    const handleFinalizeGrades = async () => {
        const studentIds = studentsGrades
            .filter((s) => s.status !== 'FINALIZED')
            .map((s) => s.studentId);

        if (studentIds.length === 0) {
            setMessage("There are no draft grades left to finalize for this course and term.");
            return;
        }

        if (!window.confirm(
            `Finalize grades for ${studentIds.length} student(s)? Once finalized, a grade can only be changed by Academic Records through a grade correction.`
        )) {
            return;
        }

        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/instructor/portal/grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: selectedCourseId,
                    termId: selectedGradeTermId || null,
                    action: "finalize",
                    studentIds,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Grades finalized. Locked rows can only be changed via a Registrar grade correction.");
                fetchGradesData(selectedCourseId);
            } else {
                setMessage(data.error || "Failed to finalize grades.");
            }
        } catch (err) {
            setMessage("An error occurred while finalizing grades.");
        } finally {
            setSaving(false);
        }
    };

    // Model 19 -- the selected course's own record of whether it has
    // an approved practical component; gates the Practical column.
    // Never read by calculateTotal, which stays exactly the approved
    // knowledge-assessment weighting it always was.
    const activeCourse = courses.find((c) => c.id === selectedCourseId);

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Grade Submissions Portal</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>Select a course to dynamically apply its weighting structure and submit marks.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 350 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label htmlFor="course-dropdown" style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                        <select id="course-dropdown" value={selectedCourseId} onChange={handleCourseChange} style={{ ...fieldStyle, width: '100%' }}>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label htmlFor="grade-term-dropdown" style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Term:</label>
                        <select id="grade-term-dropdown" value={selectedGradeTermId} onChange={(e) => setSelectedGradeTermId(e.target.value)} style={{ ...fieldStyle, width: '100%' }}>
                            {gradeTerms.length === 0 && <option value="">No active terms</option>}
                            {gradeTerms.map((term) => (
                                <option key={term.id} value={term.id}>{term.name}</option>
                            ))}
                        </select>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)' }}>
                        Grades are recorded against this term so students see it on their transcript and academic progress.
                    </p>
                </div>
            </div>

            {message && <FeedbackBanner text={message} />}

            {loadingGrades && courses.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading grading structure…</div>
            ) : (
                <>
                    <div className="ih-tbl-wrap">
                        <table className="ih-tbl">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th style={{ textAlign: 'center' }}>Quiz 1 ({weights.quiz1}%)</th>
                                    <th style={{ textAlign: 'center' }}>Quiz 2 ({weights.quiz2}%)</th>
                                    <th style={{ textAlign: 'center' }}>Assignment ({weights.assignment}%)</th>
                                    <th style={{ textAlign: 'center' }}>Midterm ({weights.midterm}%)</th>
                                    <th style={{ textAlign: 'center' }}>Final ({weights.final}%)</th>
                                    {activeCourse?.practicalRequired && (
                                        <th style={{ textAlign: 'center' }}>Practical</th>
                                    )}
                                    <th style={{ textAlign: 'center' }}>Calculated Total</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsGrades.length === 0 ? (
                                    <tr><td colSpan={activeCourse?.practicalRequired ? 9 : 8} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No students enrolled in this course yet.</td></tr>
                                ) : (
                                    studentsGrades.map((student) => {
                                        const isFinalized = student.status === 'FINALIZED';
                                        return (
                                        <tr key={student.studentId}>
                                            <td style={{ fontWeight: 500 }}>{student.studentName}</td>
                                            {(['quiz1', 'quiz2', 'assignment', 'midterm', 'final'] as const).map((field) => (
                                                <td key={field} style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={student[field]}
                                                        disabled={isFinalized}
                                                        onChange={(e) => handleScoreChange(student.studentId, field, e.target.value)}
                                                        style={{ width: 64, border: '1px solid var(--border)', borderRadius: 6, padding: 6, textAlign: 'center', background: isFinalized ? 'var(--border-soft)' : 'var(--surface)', color: 'var(--ink)' }}
                                                    />
                                                </td>
                                            ))}
                                            {activeCourse?.practicalRequired && (
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={student.practical}
                                                        disabled={isFinalized}
                                                        onChange={(e) => handleScoreChange(student.studentId, 'practical', e.target.value)}
                                                        style={{ width: 64, border: '1px solid var(--border)', borderRadius: 6, padding: 6, textAlign: 'center', background: isFinalized ? 'var(--border-soft)' : 'var(--surface)', color: 'var(--ink)' }}
                                                    />
                                                </td>
                                            )}
                                            <td className="mono" style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--info)', backgroundColor: 'var(--info-tint)' }}>
                                                {calculateTotal(student)}%
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`ih-badge ${isFinalized ? STATUS_TONE_CLASS.success : STATUS_TONE_CLASS.neutral}`}>
                                                    {isFinalized ? 'Finalized' : 'Draft'}
                                                </span>
                                                {isFinalized && (
                                                    <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                                                        Need a change? Contact Academic Records for a grade correction.
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {activeCourse?.practicalRequired && (
                        <p style={{ margin: '10px 2px 0', fontSize: 12, color: 'var(--ink-soft)' }}>
                            This course has an approved practical assessment component. The Practical mark is recorded on its own and is not part of the Calculated Total shown above.
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <button
                            onClick={handleFinalizeGrades}
                            disabled={saving || studentsGrades.every((s) => s.status === 'FINALIZED')}
                            className="ih-btn"
                            title="Locks the draft grades below so they can no longer be edited here -- a correction after this point goes through Academic Records."
                        >
                            {saving ? "Working…" : "Finalize Grades"}
                        </button>
                        <button onClick={handleSubmitGrades} disabled={saving || studentsGrades.length === 0} className="ih-btn ih-btn-primary">
                            {saving ? "Saving Grades…" : "Save & Submit Grades"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
