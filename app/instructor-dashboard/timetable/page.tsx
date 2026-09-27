'use client';
import { useState, useEffect } from 'react';

type TimetableItem = {
    kind: 'LIVE_CLASS' | 'EXAM';
    id: string;
    courseTitle: string;
    courseCode: string;
    title: string;
    scheduledAt: string;
    durationMin: number;
    location: string | null;
    termName: string | null;
};

function groupByDay(items: TimetableItem[]) {
    const groups: { day: string; items: TimetableItem[] }[] = [];
    for (const item of items) {
        const day = new Date(item.scheduledAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const existing = groups.find((g) => g.day === day);
        if (existing) {
            existing.items.push(item);
        } else {
            groups.push({ day, items: [item] });
        }
    }
    return groups;
}

export default function InstructorTimetablePage() {
    const [items, setItems] = useState<TimetableItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [filter, setFilter] = useState<'ALL' | 'LIVE_CLASS' | 'EXAM'>('ALL');

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/instructor/timetable');
                const data = await res.json();
                if (res.ok) {
                    setItems(data.items || []);
                } else {
                    setError(data.error || 'Failed to load your timetable.');
                }
            } catch (err) {
                setError('An error occurred while loading your timetable.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const now = new Date();
    const upcoming = items
        .filter((i) => new Date(i.scheduledAt) >= now)
        .filter((i) => filter === 'ALL' || i.kind === filter);

    const grouped = groupByDay(upcoming);

    return (
        <div className="ih-card">
            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>My Timetable</h2>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: 14 }}>
                    Every live class and exam tied to your assigned courses, in one chronological
                    schedule. Create or edit sessions from the Live Classes and Exams tools — this
                    view is read-only.
                </p>
            </div>

            <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                {(['ALL', 'LIVE_CLASS', 'EXAM'] as const).map((f) => (
                    <button
                        key={f}
                        className={f === filter ? 'ih-btn ih-btn-primary' : 'ih-btn ih-btn-ghost'}
                        onClick={() => setFilter(f)}
                        type="button"
                    >
                        {f === 'ALL' ? 'All' : f === 'LIVE_CLASS' ? 'Live Classes' : 'Exams'}
                    </button>
                ))}
            </div>

            {error && (
                <div style={{ padding: '12px 14px', marginBottom: 20, borderRadius: 8, background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Loading your timetable...</div>
            ) : grouped.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                    Nothing scheduled ahead. Live classes and exams you create will appear here automatically.
                </div>
            ) : (
                grouped.map((group) => (
                    <div key={group.day} style={{ marginBottom: 20, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>{group.day}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {group.items.map((item) => {
                                const dt = new Date(item.scheduledAt);
                                const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div
                                        key={`${item.kind}-${item.id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                padding: '3px 8px',
                                                borderRadius: 999,
                                                background: item.kind === 'LIVE_CLASS' ? 'var(--brand-tint)' : 'var(--warning-tint)',
                                                color: item.kind === 'LIVE_CLASS' ? 'var(--brand-dark)' : 'var(--ink)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {item.kind === 'LIVE_CLASS' ? 'Live Class' : 'Exam'}
                                        </span>
                                        <span style={{ fontWeight: 700, minWidth: 70 }}>{time}</span>
                                        <span style={{ flex: 1 }}>
                                            <strong>{item.courseCode}</strong> — {item.courseTitle}
                                            {item.title ? ` · ${item.title}` : ''}
                                        </span>
                                        <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>
                                            {item.durationMin} min
                                            {item.location ? ` · ${item.location}` : ''}
                                            {item.termName ? ` · ${item.termName}` : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
