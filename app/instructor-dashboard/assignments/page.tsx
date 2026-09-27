'use client';
import { useState, useEffect } from 'react';
import { FeedbackBanner, fieldStyle } from '../_shared';

type Assignment = {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxScore: number;
    attachmentUrl: boolean | null;
};

type RosterSubmission = {
    id: string;
    status: string;
    answerText: string | null;
    hasFile: boolean;
    submittedAt: string | null;
    score: number | null;
    feedback: string | null;
};

type RosterEntry = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentNo: string | null;
    submission: RosterSubmission | null;
};

export default function AssignmentsPage() {
    const [assignmentCourses, setAssignmentCourses] = useState<{ id: string; title: string; code: string }[]>([]);
    const [assignmentCourseId, setAssignmentCourseId] = useState<string>("");
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState<boolean>(false);
    const [assignmentMessage, setAssignmentMessage] = useState<string>("");
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
    const [creatingAssignment, setCreatingAssignment] = useState<boolean>(false);
    const [newAssignmentFile, setNewAssignmentFile] = useState<File | null>(null);
    const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
    const [editingAssignmentId, setEditingAssignmentId] = useState<string>("");
    const [editAssignment, setEditAssignment] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
    const [savingAssignmentId, setSavingAssignmentId] = useState<string>("");
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<string>("");

    // --- Submissions review/grading ---
    const [reviewingAssignment, setReviewingAssignment] = useState<Assignment | null>(null);
    const [roster, setRoster] = useState<RosterEntry[]>([]);
    const [loadingRoster, setLoadingRoster] = useState<boolean>(false);
    const [rosterMessage, setRosterMessage] = useState<string>("");
    const [gradeDrafts, setGradeDrafts] = useState<Record<string, { score: string; feedback: string }>>({});
    const [savingGradeFor, setSavingGradeFor] = useState<string | null>(null);
    const [expandedAnswerFor, setExpandedAnswerFor] = useState<string | null>(null);
    const [openingFileFor, setOpeningFileFor] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignmentsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAssignmentsData = async (courseId?: string) => {
        setLoadingAssignments(true);
        try {
            const url = courseId
                ? `/api/instructor/assignments?courseId=${courseId}`
                : `/api/instructor/assignments`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.courses) {
                setAssignmentCourses(data.courses);
                setAssignmentCourseId(data.activeCourseId || '');
                setAssignments(data.assignments || []);
            }
        } catch (err) {
            console.error("Error loading assignments", err);
        } finally {
            setLoadingAssignments(false);
        }
    };

    const handleAssignmentCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCourseId = e.target.value;
        setAssignmentCourseId(newCourseId);
        fetchAssignmentsData(newCourseId);
    };

    const handleCreateAssignment = async () => {
        if (!newAssignment.title || !newAssignment.dueDate) {
            setAssignmentMessage('Title and due date are required.');
            return;
        }

        setCreatingAssignment(true);
        setAssignmentMessage("");

        try {
            let attachmentKey: string | null = null;

            if (newAssignmentFile) {
                const formData = new FormData();
                formData.append('file', newAssignmentFile);

                const uploadRes = await fetch('/api/instructor/assignments/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadRes.json();

                if (!uploadData.success) {
                    setAssignmentMessage(uploadData.error || 'Unable to upload attachment.');
                    setCreatingAssignment(false);
                    return;
                }

                attachmentKey = uploadData.key;
            }

            const res = await fetch('/api/instructor/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: assignmentCourseId,
                    title: newAssignment.title,
                    description: newAssignment.description,
                    dueDate: newAssignment.dueDate,
                    maxScore: Number(newAssignment.maxScore),
                    attachmentKey,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setAssignmentMessage('Assignment created successfully!');
                setNewAssignment({ title: '', description: '', dueDate: '', maxScore: 100 });
                setNewAssignmentFile(null);
                fetchAssignmentsData(assignmentCourseId);
            } else {
                setAssignmentMessage(data.error || 'Failed to create assignment.');
            }
        } catch (err) {
            setAssignmentMessage('An error occurred while creating the assignment.');
        } finally {
            setCreatingAssignment(false);
        }
    };

    const handleViewAssignmentFile = async (assignmentId: string) => {
        setViewingAssignmentId(assignmentId);
        try {
            const res = await fetch(`/api/instructor/assignments/file?type=attachment&id=${assignmentId}`);
            const data = await res.json();
            if (!data.success) {
                setAssignmentMessage(data.error || 'Unable to open file.');
                return;
            }
            window.open(data.url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            setAssignmentMessage('Unable to open file.');
        } finally {
            setViewingAssignmentId(null);
        }
    };

    const openSubmissions = async (assignment: Assignment) => {
        setReviewingAssignment(assignment);
        setRoster([]);
        setRosterMessage("");
        setLoadingRoster(true);

        try {
            const res = await fetch(`/api/instructor/assignments/${assignment.id}/submissions`);
            const data = await res.json();

            if (!res.ok) {
                setRosterMessage(data.error || 'Failed to load submissions.');
                return;
            }

            setRoster(data.roster || []);

            const drafts: Record<string, { score: string; feedback: string }> = {};
            for (const entry of data.roster || []) {
                drafts[entry.studentId] = {
                    score: entry.submission?.score != null ? String(entry.submission.score) : '',
                    feedback: entry.submission?.feedback || '',
                };
            }
            setGradeDrafts(drafts);
        } catch (err) {
            setRosterMessage('Failed to load submissions.');
        } finally {
            setLoadingRoster(false);
        }
    };

    const closeSubmissions = () => {
        setReviewingAssignment(null);
        setRoster([]);
        setExpandedAnswerFor(null);
    };

    const handleViewSubmissionFile = async (submissionId: string) => {
        setOpeningFileFor(submissionId);
        try {
            const res = await fetch(`/api/student/submissions/${submissionId}/download`);
            const data = await res.json();
            if (!data.success) {
                setRosterMessage(data.error || 'Unable to open file.');
                return;
            }
            window.open(data.url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            setRosterMessage('Unable to open file.');
        } finally {
            setOpeningFileFor(null);
        }
    };

    const handleSaveGrade = async (entry: RosterEntry) => {
        if (!entry.submission) return;

        const draft = gradeDrafts[entry.studentId] || { score: '', feedback: '' };
        const scoreValue = Number(draft.score);

        if (!draft.score || !Number.isFinite(scoreValue)) {
            setRosterMessage(`Enter a valid score for ${entry.studentName}.`);
            return;
        }

        setSavingGradeFor(entry.studentId);
        setRosterMessage("");

        try {
            const res = await fetch(`/api/instructor/submissions/${entry.submission.id}/grade`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: scoreValue, feedback: draft.feedback }),
            });
            const data = await res.json();

            if (!res.ok) {
                setRosterMessage(data.error || 'Failed to save grade.');
                return;
            }

            setRoster((prev) =>
                prev.map((r) =>
                    r.studentId === entry.studentId && r.submission
                        ? { ...r, submission: { ...r.submission, ...data.data } }
                        : r
                )
            );
            setRosterMessage(`Grade saved for ${entry.studentName}.`);
        } catch (err) {
            setRosterMessage('Failed to save grade.');
        } finally {
            setSavingGradeFor(null);
        }
    };

    function toDateInputValue(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function startEditAssignment(a: Assignment) {
        setEditingAssignmentId(a.id);
        setEditAssignment({
            title: a.title,
            description: a.description || '',
            dueDate: toDateInputValue(a.dueDate),
            maxScore: a.maxScore,
        });
        setAssignmentMessage('');
    }

    async function handleSaveAssignment(assignmentId: string) {
        setSavingAssignmentId(assignmentId);
        setAssignmentMessage('');

        try {
            const res = await fetch(`/api/instructor/assignments/${assignmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editAssignment.title,
                    description: editAssignment.description,
                    dueDate: editAssignment.dueDate,
                    maxScore: Number(editAssignment.maxScore),
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setAssignmentMessage('Assignment updated successfully.');
                setEditingAssignmentId('');
                fetchAssignmentsData(assignmentCourseId);
            } else {
                setAssignmentMessage(data.error || 'Failed to update assignment.');
            }
        } catch {
            setAssignmentMessage('An error occurred while updating the assignment.');
        } finally {
            setSavingAssignmentId('');
        }
    }

    async function handleDeleteAssignment(assignmentId: string) {
        setDeletingAssignmentId(assignmentId);
        setAssignmentMessage('');

        try {
            const res = await fetch(`/api/instructor/assignments/${assignmentId}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setAssignmentMessage('Assignment removed.');
                fetchAssignmentsData(assignmentCourseId);
            } else {
                setAssignmentMessage(data.error || 'Failed to remove assignment.');
            }
        } catch {
            setAssignmentMessage('An error occurred while removing the assignment.');
        } finally {
            setDeletingAssignmentId('');
        }
    }

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Assignments</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>Post assignments for your course and set due dates.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 350 }}>
                    <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select value={assignmentCourseId} onChange={handleAssignmentCourseChange} style={{ ...fieldStyle, width: '100%' }}>
                        {assignmentCourses.map((course) => (
                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {assignmentMessage && <FeedbackBanner text={assignmentMessage} />}

            <div style={{ background: 'var(--brand-tint)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Post New Assignment</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="text" placeholder="Assignment title" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} style={{ ...fieldStyle, padding: 10 }} />
                    <textarea placeholder="Description (optional)" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} style={{ ...fieldStyle, padding: 10, minHeight: 70 }} />
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Due date</label>
                            <input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} style={fieldStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Max score</label>
                            <input type="number" value={newAssignment.maxScore} onChange={(e) => setNewAssignment({ ...newAssignment, maxScore: Number(e.target.value) })} style={{ ...fieldStyle, width: 100 }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Supporting file (optional)</label>
                        <input
                            type="file"
                            accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                            onChange={(e) => setNewAssignmentFile(e.target.files?.[0] || null)}
                            style={fieldStyle}
                        />
                    </div>
                    <button onClick={handleCreateAssignment} disabled={creatingAssignment} className="ih-btn ih-btn-primary" style={{ alignSelf: 'flex-start' }}>
                        {creatingAssignment ? 'Posting…' : 'Post Assignment'}
                    </button>
                </div>
            </div>

            {loadingAssignments ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading assignments…</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr><th>Title</th><th>Due Date</th><th>Max Score</th><th>Attachment</th><th>Submissions</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No assignments posted yet.</td></tr>
                            ) : (
                                assignments.map((a) => (
                                    editingAssignmentId === a.id ? (
                                        <tr key={a.id}>
                                            <td colSpan={6}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
                                                    <input type="text" placeholder="Assignment title" value={editAssignment.title} onChange={(e) => setEditAssignment({ ...editAssignment, title: e.target.value })} style={{ ...fieldStyle, padding: 10 }} />
                                                    <textarea placeholder="Description (optional)" value={editAssignment.description} onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })} style={{ ...fieldStyle, padding: 10, minHeight: 60 }} />
                                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Due date</label>
                                                            <input type="date" value={editAssignment.dueDate} onChange={(e) => setEditAssignment({ ...editAssignment, dueDate: e.target.value })} style={fieldStyle} />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Max score</label>
                                                            <input type="number" value={editAssignment.maxScore} onChange={(e) => setEditAssignment({ ...editAssignment, maxScore: Number(e.target.value) })} style={{ ...fieldStyle, width: 100 }} />
                                                        </div>
                                                        <button onClick={() => handleSaveAssignment(a.id)} disabled={savingAssignmentId === a.id} className="ih-btn ih-btn-primary">
                                                            {savingAssignmentId === a.id ? 'Saving…' : 'Save'}
                                                        </button>
                                                        <button onClick={() => setEditingAssignmentId('')} className="ih-btn ih-btn-secondary">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={a.id}>
                                            <td style={{ fontWeight: 500 }}>{a.title}</td>
                                            <td className="mono">{new Date(a.dueDate).toLocaleDateString()}</td>
                                            <td>{a.maxScore}</td>
                                            <td>
                                                {a.attachmentUrl ? (
                                                    <button
                                                        className="ih-btn ih-btn-ghost"
                                                        disabled={viewingAssignmentId === a.id}
                                                        onClick={() => handleViewAssignmentFile(a.id)}
                                                    >
                                                        {viewingAssignmentId === a.id ? 'Opening…' : 'View file'}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--ink-soft)' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="ih-btn ih-btn-primary" onClick={() => openSubmissions(a)}>
                                                    Review Submissions
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    <button onClick={() => startEditAssignment(a)} className="ih-btn ih-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAssignment(a.id)}
                                                        disabled={deletingAssignmentId === a.id}
                                                        className="ih-btn ih-btn-danger"
                                                        style={{ padding: '6px 12px', fontSize: 12 }}
                                                    >
                                                        {deletingAssignmentId === a.id ? 'Removing…' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {reviewingAssignment && (
                <div style={{ marginTop: 28, border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: 17 }}>
                                Submissions — {reviewingAssignment.title}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 13.5 }}>
                                Max score: {reviewingAssignment.maxScore}
                            </p>
                        </div>
                        <button className="ih-btn ih-btn-ghost" onClick={closeSubmissions}>Close</button>
                    </div>

                    {rosterMessage && <FeedbackBanner text={rosterMessage} />}

                    {loadingRoster ? (
                        <div style={{ padding: 30, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading submissions…</div>
                    ) : roster.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)' }}>
                            No approved students are enrolled in this course yet.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 14 }}>
                            {roster.map((entry) => {
                                const draft = gradeDrafts[entry.studentId] || { score: '', feedback: '' };
                                const answerOpen = expandedAnswerFor === entry.studentId;

                                return (
                                    <div
                                        key={entry.studentId}
                                        style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 16, background: 'var(--surface)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                            <div>
                                                <strong>{entry.studentName}</strong>
                                                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                                                    {entry.studentNo || entry.studentEmail}
                                                </div>
                                            </div>
                                            <span
                                                className={
                                                    !entry.submission
                                                        ? 'ih-badge ih-b-neutral'
                                                        : entry.submission.status === 'GRADED'
                                                        ? 'ih-badge ih-b-success'
                                                        : entry.submission.status === 'LATE'
                                                        ? 'ih-badge ih-b-warning'
                                                        : 'ih-badge ih-b-neutral'
                                                }
                                            >
                                                {entry.submission ? entry.submission.status : 'NOT SUBMITTED'}
                                            </span>
                                        </div>

                                        {entry.submission ? (
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
                                                    Submitted:{' '}
                                                    {entry.submission.submittedAt
                                                        ? new Date(entry.submission.submittedAt).toLocaleString()
                                                        : '—'}
                                                </div>

                                                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                                    {entry.submission.answerText && (
                                                        <button
                                                            className="ih-btn ih-btn-ghost"
                                                            onClick={() =>
                                                                setExpandedAnswerFor(answerOpen ? null : entry.studentId)
                                                            }
                                                        >
                                                            {answerOpen ? 'Hide answer' : 'View written answer'}
                                                        </button>
                                                    )}
                                                    {entry.submission.hasFile && (
                                                        <button
                                                            className="ih-btn ih-btn-ghost"
                                                            disabled={openingFileFor === entry.submission.id}
                                                            onClick={() => handleViewSubmissionFile(entry.submission!.id)}
                                                        >
                                                            {openingFileFor === entry.submission.id ? 'Opening…' : 'View attached file'}
                                                        </button>
                                                    )}
                                                </div>

                                                {answerOpen && entry.submission.answerText && (
                                                    <div
                                                        style={{
                                                            border: '1px solid var(--border)',
                                                            borderRadius: 8,
                                                            padding: 14,
                                                            marginBottom: 12,
                                                            background: 'var(--paper)',
                                                            lineHeight: 1.6,
                                                            fontSize: 14,
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: entry.submission.answerText }}
                                                    />
                                                )}

                                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
                                                            Score (out of {reviewingAssignment.maxScore})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={reviewingAssignment.maxScore}
                                                            value={draft.score}
                                                            onChange={(e) =>
                                                                setGradeDrafts((prev) => ({
                                                                    ...prev,
                                                                    [entry.studentId]: { ...draft, score: e.target.value },
                                                                }))
                                                            }
                                                            style={{ ...fieldStyle, width: 110 }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 220 }}>
                                                        <label style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
                                                            Feedback (optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={draft.feedback}
                                                            onChange={(e) =>
                                                                setGradeDrafts((prev) => ({
                                                                    ...prev,
                                                                    [entry.studentId]: { ...draft, feedback: e.target.value },
                                                                }))
                                                            }
                                                            style={fieldStyle}
                                                        />
                                                    </div>
                                                    <button
                                                        className="ih-btn ih-btn-primary"
                                                        disabled={savingGradeFor === entry.studentId}
                                                        onClick={() => handleSaveGrade(entry)}
                                                    >
                                                        {savingGradeFor === entry.studentId ? 'Saving…' : 'Save Grade'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-soft)' }}>
                                                This student has not submitted yet.
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
