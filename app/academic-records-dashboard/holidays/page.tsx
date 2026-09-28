'use client';

import { useEffect, useState, type CSSProperties } from 'react';

type HolidayDraft = {
    id: string | null;
    name: string;
    startDate: string;
    endDate: string;
    note: string;
    isActive: boolean;
};

function emptyHoliday(): HolidayDraft {
    return { id: null, name: '', startDate: '', endDate: '', note: '', isActive: true };
}

const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid var(--border)',
    borderRadius: 7,
    fontSize: 13.5,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
};

export default function HolidaysPage() {
    const [holidays, setHolidays] = useState<HolidayDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/records/holidays', { credentials: 'include' });
            const result = await res.json();
            if (res.ok && result.success) {
                setHolidays(result.holidays.length > 0 ? result.holidays : [emptyHoliday()]);
            } else {
                setMessage(result.error || 'Unable to load holidays.');
            }
        } catch {
            setMessage('Unable to load holidays.');
        } finally {
            setLoading(false);
        }
    }

    function updateHoliday(index: number, field: keyof HolidayDraft, value: string | boolean) {
        setHolidays((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
    }

    function moveHoliday(index: number, direction: number) {
        setHolidays((prev) => {
            const next = [...prev];
            const target = index + direction;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    }

    function addHoliday() {
        setHolidays((prev) => [...prev, emptyHoliday()]);
    }

    function removeHoliday(index: number) {
        setHolidays((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSave() {
        setSaving(true);
        setMessage('');
        try {
            const cleaned = holidays.filter((h) => h.name.trim() && h.startDate && h.endDate);
            const res = await fetch('/api/records/holidays', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ holidays: cleaned }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || 'Unable to save holidays.');
            setHolidays(result.holidays.length > 0 ? result.holidays : [emptyHoliday()]);
            setMessage('Holidays saved successfully.');
        } catch (err: any) {
            setMessage(err.message || 'Unable to save holidays.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <main style={{ padding: 32, color: 'var(--ink)' }}>Loading holidays...</main>;
    }

    return (
        <main style={{ padding: '32px', color: 'var(--ink)', maxWidth: 900 }}>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Institution Holidays</h1>
                <p style={{ marginTop: 8, color: 'var(--ink-soft)', lineHeight: 1.6, fontSize: 13.5 }}>
                    Shown publicly at /academic-calendar, alongside the published Academic Calendar. A holiday is
                    live as soon as it is saved and marked Active -- there's no separate publish step.
                </p>
            </div>

            <div className="ih-card" style={{ padding: 20, marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {holidays.map((h, i) => (
                        <div
                            key={h.id || i}
                            style={{
                                display: 'flex',
                                gap: 8,
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                paddingBottom: 12,
                                borderBottom: i < holidays.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            <input
                                value={h.name}
                                onChange={(e) => updateHoliday(i, 'name', e.target.value)}
                                style={{ ...inputStyle, flex: '2 1 180px' }}
                                placeholder="Eid al-Fitr Break"
                            />
                            <label style={{ flex: '1 1 130px' }}>
                                <input
                                    type="date"
                                    value={h.startDate}
                                    onChange={(e) => updateHoliday(i, 'startDate', e.target.value)}
                                    style={inputStyle}
                                />
                            </label>
                            <label style={{ flex: '1 1 130px' }}>
                                <input
                                    type="date"
                                    value={h.endDate}
                                    onChange={(e) => updateHoliday(i, 'endDate', e.target.value)}
                                    style={inputStyle}
                                />
                            </label>
                            <input
                                value={h.note}
                                onChange={(e) => updateHoliday(i, 'note', e.target.value)}
                                style={{ ...inputStyle, flex: '2 1 160px' }}
                                placeholder="Note (optional)"
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, flexShrink: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={h.isActive !== false}
                                    onChange={(e) => updateHoliday(i, 'isActive', e.target.checked)}
                                />
                                Active
                            </label>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button type="button" onClick={() => moveHoliday(i, -1)} disabled={i === 0} className="ih-btn ih-btn-ghost" style={{ fontSize: 12, padding: '5px 9px' }}>↑</button>
                                <button type="button" onClick={() => moveHoliday(i, 1)} disabled={i === holidays.length - 1} className="ih-btn ih-btn-ghost" style={{ fontSize: 12, padding: '5px 9px' }}>↓</button>
                                <button type="button" onClick={() => removeHoliday(i)} className="ih-btn ih-btn-danger" style={{ fontSize: 12, padding: '5px 9px' }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <button type="button" onClick={addHoliday} className="ih-btn ih-btn-ghost" style={{ marginTop: 14 }}>
                    + Add Holiday
                </button>
            </div>

            {message && (
                <div
                    className="ih-card"
                    style={{
                        marginBottom: 16,
                        padding: '10px 14px',
                        background: message.includes('successfully') ? 'var(--success-tint)' : 'var(--danger-tint)',
                        color: message.includes('successfully') ? 'var(--brand-light)' : 'var(--danger)',
                    }}
                >
                    {message}
                </div>
            )}

            <button onClick={handleSave} disabled={saving} className="ih-btn ih-btn-gold">
                {saving ? 'Saving...' : 'Save Holidays'}
            </button>
        </main>
    );
}
