'use client';
import { useEffect, useState } from 'react';
import { fieldStyle, FeedbackBanner } from '../_shared';

type Course = {
    id: string;
    titleEn: string;
    courseCode: string;
};

type Announcement = {
    id: string;
    titleEn: string;
    bodyEn: string;
    courseId: string | null;
    publishedAt: string;
    expiresAt: string | null;
    createdBy: { name: string } | null;
};

export default function InstructorAnnouncementsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [posting, setPosting] = useState(false);

    const [courseId, setCourseId] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [bodyEn, setBodyEn] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    function load() {
        setLoading(true);
        Promise.all([
            fetch('/api/instructor/roster', { credentials: 'include' }).then((r) => r.json()),
            fetch('/api/instructor/announcements', { credentials: 'include', cache: 'no-store' }).then((r) => r.json()),
        ])
            .then(([rosterData, announcementsData]) => {
                if (rosterData.success) setCourses(rosterData.courses || []);
                if (announcementsData.success) setAnnouncements(announcementsData.data || []);
            })
            .catch(() => setMessage('Unable to load announcements.'))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        load();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!courseId || !titleEn.trim() || !bodyEn.trim()) {
            setMessage('Select a course and fill in a title and message.');
            return;
        }
        setPosting(true);
        setMessage('');
        try {
            const res = await fetch('/api/instructor/announcements', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    titleEn: titleEn.trim(),
                    bodyEn: bodyEn.trim(),
                    expiresAt: expiresAt || undefined,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Announcement posted successfully.');
                setTitleEn('');
                setBodyEn('');
                setExpiresAt('');
                load();
            } else {
                setMessage(result.error || 'Failed to post announcement.');
            }
        } catch {
            setMessage('An error occurred while posting the announcement.');
        } finally {
            setPosting(false);
        }
    }

    const courseLabel = (id: string | null) => {
        const c = courses.find((c) => c.id === id);
        return c ? `${c.courseCode} — ${c.titleEn}` : id || '—';
    };

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <div className="ih-card">
                <h2 style={{ marginTop: 0, fontSize: 20 }}>Post a Course Announcement</h2>
                <p style={{ color: 'var(--ink-soft)', marginTop: 0, fontSize: 14 }}>
                    Visible to every student enrolled in the selected course.
                </p>

                {message && <FeedbackBanner text={message} />}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
                    <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                        Course
                        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={fieldStyle} required>
                            <option value="">Select a course…</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.courseCode} — {c.titleEn}</option>
                            ))}
                        </select>
                    </label>

                    <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                        Title
                        <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} style={fieldStyle} required />
                    </label>

                    <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                        Message
                        <textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }} required />
                    </label>

                    <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
                        Expires on (optional)
                        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={fieldStyle} />
                    </label>

                    <button type="submit" disabled={posting} className="ih-btn ih-btn-primary" style={{ justifySelf: 'start' }}>
                        {posting ? 'Posting…' : 'Post Announcement'}
                    </button>
                </form>
            </div>

            <div className="ih-card">
                <h2 style={{ marginTop: 0, fontSize: 20 }}>Your Course Announcements</h2>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Loading…</div>
                ) : announcements.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
                        You haven't posted any course announcements yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {announcements.map((a) => (
                            <div key={a.id} className="ih-card" style={{ padding: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                    <strong>{a.titleEn}</strong>
                                    <span className="ih-badge ih-b-neutral">{courseLabel(a.courseId)}</span>
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '8px 0' }}>{a.bodyEn}</p>
                                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                                    Posted {new Date(a.publishedAt).toLocaleDateString()}
                                    {a.expiresAt ? ` · Expires ${new Date(a.expiresAt).toLocaleDateString()}` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
