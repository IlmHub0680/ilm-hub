'use client';
import { useState, useEffect } from 'react';
import { FeedbackBanner, fieldStyle } from '../_shared';

type LiveClass = {
    id: string;
    topic: string;
    scheduledAt: string;
    durationMin: number;
    meetingLink: string;
    notes: string | null;
};

export default function LiveClassesPage() {
    const [courses, setCourses] = useState<{ id: string; title: string; code: string }[]>([]);
    const [courseId, setCourseId] = useState<string>("");
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [newClass, setNewClass] = useState({
        topic: '',
        scheduledAt: '',
        durationMin: 60,
        meetingLink: '',
        notes: '',
    });
    const [creating, setCreating] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string>("");
    const [editClass, setEditClass] = useState({
        topic: '',
        scheduledAt: '',
        durationMin: 60,
        meetingLink: '',
        notes: '',
    });
    const [savingId, setSavingId] = useState<string>("");
    const [deletingId, setDeletingId] = useState<string>("");

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async (nextCourseId?: string) => {
        setLoading(true);
        try {
            const url = nextCourseId
                ? `/api/instructor/live-classes?courseId=${nextCourseId}`
                : `/api/instructor/live-classes`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.courses) {
                setCourses(data.courses);
                setCourseId(data.activeCourseId || '');
                setLiveClasses(data.liveClasses || []);
            }
        } catch (err) {
            console.error("Error loading live classes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextCourseId = e.target.value;
        setCourseId(nextCourseId);
        fetchData(nextCourseId);
    };

    const handleCreate = async () => {
        if (!newClass.topic.trim() || !newClass.scheduledAt || !newClass.meetingLink.trim()) {
            setMessage('Topic, scheduled date/time, and a meeting link are required.');
            return;
        }

        setCreating(true);
        setMessage("");

        try {
            const res = await fetch('/api/instructor/live-classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    topic: newClass.topic,
                    scheduledAt: newClass.scheduledAt,
                    durationMin: Number(newClass.durationMin),
                    meetingLink: newClass.meetingLink,
                    notes: newClass.notes,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Live class scheduled successfully!');
                setNewClass((prev) => ({ ...prev, topic: '', scheduledAt: '', meetingLink: '', notes: '' }));
                fetchData(courseId);
            } else {
                setMessage(data.error || 'Failed to schedule live class.');
            }
        } catch (err) {
            setMessage('An error occurred while scheduling the live class.');
        } finally {
            setCreating(false);
        }
    };

    function toLocalInputValue(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function startEdit(item: LiveClass) {
        setEditingId(item.id);
        setEditClass({
            topic: item.topic,
            scheduledAt: toLocalInputValue(item.scheduledAt),
            durationMin: item.durationMin,
            meetingLink: item.meetingLink,
            notes: item.notes || '',
        });
        setMessage('');
    }

    async function handleSave(id: string) {
        setSavingId(id);
        setMessage('');

        try {
            const res = await fetch(`/api/instructor/live-classes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: editClass.topic,
                    scheduledAt: editClass.scheduledAt,
                    durationMin: Number(editClass.durationMin),
                    meetingLink: editClass.meetingLink,
                    notes: editClass.notes,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Live class updated successfully.');
                setEditingId('');
                fetchData(courseId);
            } else {
                setMessage(data.error || 'Failed to update live class.');
            }
        } catch {
            setMessage('An error occurred while updating the live class.');
        } finally {
            setSavingId('');
        }
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        setMessage('');

        try {
            const res = await fetch(`/api/instructor/live-classes/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok) {
                setMessage('Live class removed.');
                fetchData(courseId);
            } else {
                setMessage(data.error || 'Failed to remove live class.');
            }
        } catch {
            setMessage('An error occurred while removing the live class.');
        } finally {
            setDeletingId('');
        }
    }

    return (
        <div className="ih-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Live Classes</h2>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>Schedule virtual class sessions for your students to join.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 350 }}>
                    <label style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>Course:</label>
                    <select value={courseId} onChange={handleCourseChange} style={{ ...fieldStyle, width: '100%' }}>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {message && <FeedbackBanner text={message} />}

            <div style={{ background: 'var(--brand-tint)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Schedule New Live Class</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Topic</label>
                        <input type="text" value={newClass.topic} onChange={(e) => setNewClass({ ...newClass, topic: e.target.value })} style={fieldStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Date & time</label>
                        <input type="datetime-local" value={newClass.scheduledAt} onChange={(e) => setNewClass({ ...newClass, scheduledAt: e.target.value })} style={fieldStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Duration (min)</label>
                        <input type="number" value={newClass.durationMin} onChange={(e) => setNewClass({ ...newClass, durationMin: Number(e.target.value) })} style={{ ...fieldStyle, width: 90 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Meeting link</label>
                        <input type="text" placeholder="https://meet.google.com/..." value={newClass.meetingLink} onChange={(e) => setNewClass({ ...newClass, meetingLink: e.target.value })} style={{ ...fieldStyle, width: 220 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Notes (optional)</label>
                        <input type="text" value={newClass.notes} onChange={(e) => setNewClass({ ...newClass, notes: e.target.value })} style={fieldStyle} />
                    </div>
                    <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                        {creating ? 'Scheduling…' : 'Schedule Session'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading live classes…</div>
            ) : (
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead>
                            <tr><th>Topic</th><th>Date & Time</th><th>Duration</th><th>Meeting Link</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {liveClasses.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No live classes scheduled yet.</td></tr>
                            ) : (
                                liveClasses.map((c) => (
                                    editingId === c.id ? (
                                        <tr key={c.id}>
                                            <td colSpan={5}>
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', padding: '10px 0' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Topic</label>
                                                        <input type="text" value={editClass.topic} onChange={(ev) => setEditClass({ ...editClass, topic: ev.target.value })} style={fieldStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Date & time</label>
                                                        <input type="datetime-local" value={editClass.scheduledAt} onChange={(ev) => setEditClass({ ...editClass, scheduledAt: ev.target.value })} style={fieldStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Duration (min)</label>
                                                        <input type="number" value={editClass.durationMin} onChange={(ev) => setEditClass({ ...editClass, durationMin: Number(ev.target.value) })} style={{ ...fieldStyle, width: 90 }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Meeting link</label>
                                                        <input type="text" value={editClass.meetingLink} onChange={(ev) => setEditClass({ ...editClass, meetingLink: ev.target.value })} style={{ ...fieldStyle, width: 220 }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>Notes</label>
                                                        <input type="text" value={editClass.notes} onChange={(ev) => setEditClass({ ...editClass, notes: ev.target.value })} style={fieldStyle} />
                                                    </div>
                                                    <button onClick={() => handleSave(c.id)} disabled={savingId === c.id} className="ih-btn ih-btn-primary">
                                                        {savingId === c.id ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button onClick={() => setEditingId('')} className="ih-btn ih-btn-secondary">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={c.id}>
                                            <td>{c.topic}</td>
                                            <td className="mono">{new Date(c.scheduledAt).toLocaleString()}</td>
                                            <td>{c.durationMin} min</td>
                                            <td>
                                                <a href={c.meetingLink} target="_blank" rel="noreferrer">Join Link ↗</a>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    <button onClick={() => startEdit(c)} className="ih-btn ih-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        disabled={deletingId === c.id}
                                                        className="ih-btn ih-btn-danger"
                                                        style={{ padding: '6px 12px', fontSize: 12 }}
                                                    >
                                                        {deletingId === c.id ? 'Removing…' : 'Delete'}
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
        </div>
    );
}
