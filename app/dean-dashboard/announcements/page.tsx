'use client';
import { useState } from 'react';
import { useDean } from '../context';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)' };

export default function DeanAnnouncementsPage() {
    const { data, refetch } = useDean();
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({ titleEn: '', bodyEn: '', titleAr: '', bodyAr: '' });
    const [posting, setPosting] = useState(false);

    if (!data?.faculty) {
        return (
            <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                {data?.message || 'You are not currently assigned as Dean of a faculty.'}
            </div>
        );
    }

    const handlePublish = async () => {
        if (!form.titleEn.trim() || !form.bodyEn.trim()) {
            setMessage('Title and body are required.');
            return;
        }
        setPosting(true);
        setMessage('');
        try {
            const res = await fetch('/api/dean/announcements', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await res.json();
            if (res.ok) {
                setMessage('Announcement published.');
                setForm({ titleEn: '', bodyEn: '', titleAr: '', bodyAr: '' });
                refetch();
            } else {
                setMessage(result.error || 'Failed to publish.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <>
            {message && <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', marginBottom: 20 }}>{message}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 20, alignItems: 'start' }}>
                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Publish Faculty Announcement</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input type="text" placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} style={fieldStyle} />
                        <textarea placeholder="Body (English)" value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} style={{ ...fieldStyle, minHeight: 70 }} />
                        <input type="text" placeholder="Title (Arabic, optional)" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} style={{ ...fieldStyle, fontFamily: 'var(--font-arabic)' }} dir="rtl" />
                        <textarea placeholder="Body (Arabic, optional)" value={form.bodyAr} onChange={(e) => setForm({ ...form, bodyAr: e.target.value })} style={{ ...fieldStyle, minHeight: 70, fontFamily: 'var(--font-arabic)' }} dir="rtl" />
                        <button onClick={handlePublish} disabled={posting} className="ih-btn ih-btn-primary">
                            {posting ? 'Publishing…' : 'Publish Announcement'}
                        </button>
                    </div>
                </div>

                <div className="ih-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: 17 }}>Faculty Announcements</h3>
                    {(!data.announcements || data.announcements.length === 0) && (
                        <p style={{ color: 'var(--ink-soft)' }}>No announcements published yet.</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {data.announcements?.map((a) => (
                            <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: 14 }}>
                                <div style={{ fontWeight: 700 }}>{a.titleEn}</div>
                                <div style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '4px 0 8px' }}>
                                    {new Date(a.publishedAt).toLocaleDateString()}
                                </div>
                                <p style={{ margin: 0, fontSize: 14 }}>{a.bodyEn}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
