'use client';
import { useState } from 'react';
import { useQA } from '../context';

const REVIEW_TYPE_SUGGESTIONS = [
    'Programme Review',
    'Course Review',
    'Departmental Audit',
    'Exam Moderation',
    'Self-Assessment Report',
];

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' };

export default function ScheduleReviewPage() {
    const { data, refetchOverview, refetchReviews } = useQA();
    const [message, setMessage] = useState('');
    const [subjectType, setSubjectType] = useState('PROGRAM');
    const [subjectId, setSubjectId] = useState('');
    const [reviewType, setReviewType] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [scheduling, setScheduling] = useState(false);

    const subjectOptions = () => {
        if (!data) return [] as { id: string; label: string }[];
        if (subjectType === 'PROGRAM')
            return data.subjects.programs.map((p: any) => ({ id: p.id, label: p.nameEn }));
        if (subjectType === 'COURSE')
            return data.subjects.courses.map((c: any) => ({ id: c.id, label: c.titleEn }));
        if (subjectType === 'DEPARTMENT')
            return data.subjects.departments.map((d: any) => ({ id: d.id, label: d.nameEn }));
        if (subjectType === 'FACULTY')
            return data.subjects.faculties.map((f: any) => ({ id: f.id, label: f.nameEn }));
        return (data.subjects.staff || []).map((s: any) => ({ id: s.id, label: s.nameEn }));
    };

    const handleSchedule = async () => {
        if (!subjectId || !reviewType.trim()) {
            setMessage('Select a subject and a review type.');
            return;
        }

        setScheduling(true);
        setMessage('');
        try {
            const res = await fetch('/api/qa/reviews', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectType,
                    subjectId,
                    reviewType: reviewType.trim(),
                    followUpDate: followUpDate || undefined,
                }),
            });
            const result = await res.json();

            if (res.ok) {
                setMessage('Review scheduled.');
                setSubjectId('');
                setReviewType('');
                setFollowUpDate('');
                refetchReviews();
                refetchOverview();
            } else {
                setMessage(result.error || 'Failed to schedule review.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setScheduling(false);
        }
    };

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>
                    {message}
                </div>
            )}
            <div className="ih-card" style={{ maxWidth: 420 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Schedule a Review</h3>
                <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: 16, fontSize: 13 }}>
                    Programme, course, departmental or faculty quality review.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <select
                        value={subjectType}
                        onChange={(e) => {
                            setSubjectType(e.target.value);
                            setSubjectId('');
                        }}
                        style={fieldStyle}
                    >
                        <option value="PROGRAM">Programme</option>
                        <option value="COURSE">Course</option>
                        <option value="DEPARTMENT">Department</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="STAFF">Staff (Instructor Evaluation)</option>
                    </select>

                    <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={fieldStyle}>
                        <option value="">Select subject</option>
                        {subjectOptions().map((o) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>

                    <input
                        list="review-type-suggestions"
                        type="text"
                        placeholder="Review type (e.g. Programme Review)"
                        value={reviewType}
                        onChange={(e) => setReviewType(e.target.value)}
                        style={fieldStyle}
                    />
                    <datalist id="review-type-suggestions">
                        {REVIEW_TYPE_SUGGESTIONS.map((t) => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>

                    <label style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Follow-up date (optional)</label>
                    <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={fieldStyle} />

                    <button onClick={handleSchedule} disabled={scheduling} className="ih-btn ih-btn-primary">
                        {scheduling ? 'Scheduling…' : 'Schedule Review'}
                    </button>
                </div>
            </div>
        </>
    );
}
