'use client';
import { useState, useEffect, type CSSProperties } from 'react';

type Program = {
    id: string;
    nameEn: string;
    nameAr: string;
    code: string;
    level: string;
    descriptionEn: string | null;
    descriptionAr: string | null;
    durationYears: number | null;
    weeksPerLevel: number | null;
    studyMode: string | null;
    isActive: boolean;
    coordinator?: { user: { name: string } } | null;
    _count: { courses: number; students: number };
};

const PROGRAM_LEVELS = ['FOUNDATION', 'INTERMEDIATE', 'ADVANCED', 'CERTIFICATE', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'MASTERS', 'DOCTORATE', 'SHORT_COURSE'];
const STUDY_MODES = ['', 'FULL_TIME', 'PART_TIME'];
const STUDY_MODE_LABELS: Record<string, string> = { '': 'Not set', FULL_TIME: 'Full-Time', PART_TIME: 'Part-Time' };

const EMPTY_FORM = { nameEn: '', nameAr: '', code: '', level: 'UNDERGRADUATE', descriptionEn: '', descriptionAr: '', durationYears: '', weeksPerLevel: '', studyMode: '' };

const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 13.5,
    color: 'var(--ink)',
    backgroundColor: 'var(--surface)',
};

const labelStyle: CSSProperties = { display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 12.5, color: 'var(--ink-soft)' };

export default function HODProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const [editingId, setEditingId] = useState('');
    const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
    const [savingId, setSavingId] = useState('');
    const [togglingId, setTogglingId] = useState('');

    async function load() {
        setLoading(true);
        try {
            const response = await fetch('/api/hod/programs', { cache: 'no-store' });
            const result = await response.json();
            if (response.ok && result.success) {
                setPrograms(result.data || []);
            } else {
                setError(result.error || 'Failed to load programmes.');
            }
        } catch {
            setError('Failed to load programmes.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(event: React.FormEvent) {
        event.preventDefault();
        setCreating(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/hod/programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create this programme.');
            }

            setForm({ ...EMPTY_FORM });
            setMessage(`"${result.data.nameEn}" was added.`);
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to create this programme.');
        } finally {
            setCreating(false);
        }
    }

    function startEdit(program: Program) {
        setEditingId(program.id);
        setEditForm({
            nameEn: program.nameEn,
            nameAr: program.nameAr,
            code: program.code,
            level: program.level,
            descriptionEn: program.descriptionEn || '',
            descriptionAr: program.descriptionAr || '',
            durationYears: program.durationYears != null ? String(program.durationYears) : '',
            weeksPerLevel: program.weeksPerLevel != null ? String(program.weeksPerLevel) : '',
            studyMode: program.studyMode || '',
        });
        setMessage('');
        setError('');
    }

    async function handleSaveEdit(id: string) {
        setSavingId(id);
        setError('');

        try {
            const response = await fetch(`/api/hod/programs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameEn: editForm.nameEn,
                    nameAr: editForm.nameAr,
                    descriptionEn: editForm.descriptionEn,
                    descriptionAr: editForm.descriptionAr,
                    durationYears: editForm.durationYears,
                    weeksPerLevel: editForm.weeksPerLevel,
                    studyMode: editForm.studyMode,
                }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update this programme.');
            }

            setEditingId('');
            setMessage('Programme updated.');
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to update this programme.');
        } finally {
            setSavingId('');
        }
    }

    async function handleToggleActive(program: Program) {
        setTogglingId(program.id);
        setError('');
        setMessage('');

        try {
            if (program.isActive) {
                const response = await fetch(`/api/hod/programs/${program.id}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to deactivate this programme.');
                setMessage('Programme deactivated.');
            } else {
                const response = await fetch(`/api/hod/programs/${program.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: true }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to reactivate this programme.');
                setMessage('Programme reactivated.');
            }
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to update this programme.');
        } finally {
            setTogglingId('');
        }
    }

    return (
        <>
            {message && (
                <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', border: '1px solid var(--success)', marginBottom: 20 }}>
                    {message}
                </div>
            )}
            {error && (
                <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleCreate} className="ih-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                    <label>
                        <span style={labelStyle}>English name</span>
                        <input required style={inputStyle} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} placeholder="e.g. Diploma in Hadith Studies" />
                    </label>
                    <label>
                        <span style={labelStyle}>Arabic name</span>
                        <input required dir="rtl" style={inputStyle} value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
                    </label>
                    <label>
                        <span style={labelStyle}>Code</span>
                        <input required style={inputStyle} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="DIP-HADITH" />
                    </label>
                    <label>
                        <span style={labelStyle}>Level</span>
                        <select style={inputStyle} value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
                            {PROGRAM_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                    </label>
                    <label>
                        <span style={labelStyle}>Duration (years)</span>
                        <input type="number" min={1} style={inputStyle} value={form.durationYears} onChange={(e) => setForm((p) => ({ ...p, durationYears: e.target.value }))} placeholder="e.g. 2" />
                    </label>
                    <label>
                        <span style={labelStyle}>Weeks per level (optional)</span>
                        <input type="number" min={1} style={inputStyle} value={form.weeksPerLevel} onChange={(e) => setForm((p) => ({ ...p, weeksPerLevel: e.target.value }))} placeholder="e.g. 15" />
                    </label>
                    <label>
                        <span style={labelStyle}>Education type (optional)</span>
                        <select style={inputStyle} value={form.studyMode} onChange={(e) => setForm((p) => ({ ...p, studyMode: e.target.value }))}>
                            {STUDY_MODES.map((mode) => <option key={mode} value={mode}>{STUDY_MODE_LABELS[mode]}</option>)}
                        </select>
                    </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 }}>
                    <label>
                        <span style={labelStyle}>Description (English, optional)</span>
                        <textarea style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} value={form.descriptionEn} onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))} />
                    </label>
                    <label>
                        <span style={labelStyle}>Description (Arabic, optional)</span>
                        <textarea dir="rtl" style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} value={form.descriptionAr} onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))} />
                    </label>
                </div>
                <div style={{ marginTop: 14 }}>
                    <button type="submit" disabled={creating} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
                        {creating ? 'Adding…' : 'Add Programme'}
                    </button>
                </div>
            </form>

            <div className="ih-tbl-wrap">
                <table className="ih-tbl">
                    <thead>
                        <tr>
                            <th>Programme</th><th>Level</th><th>Coordinator</th><th>Courses</th><th>Students</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={7}>Loading…</td></tr>
                        ) : programs.length === 0 ? (
                            <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={7}>No programmes yet — add the first one above.</td></tr>
                        ) : (
                            programs.map((p) => (
                                editingId === p.id ? (
                                    <tr key={p.id}>
                                        <td colSpan={7}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, padding: '12px 0' }}>
                                                <label>
                                                    <span style={labelStyle}>English name</span>
                                                    <input style={inputStyle} value={editForm.nameEn} onChange={(e) => setEditForm((prev) => ({ ...prev, nameEn: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Arabic name</span>
                                                    <input dir="rtl" style={inputStyle} value={editForm.nameAr} onChange={(e) => setEditForm((prev) => ({ ...prev, nameAr: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Duration (years)</span>
                                                    <input type="number" min={1} style={inputStyle} value={editForm.durationYears} onChange={(e) => setEditForm((prev) => ({ ...prev, durationYears: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Weeks per level (optional)</span>
                                                    <input type="number" min={1} style={inputStyle} value={editForm.weeksPerLevel} onChange={(e) => setEditForm((prev) => ({ ...prev, weeksPerLevel: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Education type (optional)</span>
                                                    <select style={inputStyle} value={editForm.studyMode} onChange={(e) => setEditForm((prev) => ({ ...prev, studyMode: e.target.value }))}>
                                                        {STUDY_MODES.map((mode) => <option key={mode} value={mode}>{STUDY_MODE_LABELS[mode]}</option>)}
                                                    </select>
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                <button type="button" disabled={savingId === p.id} onClick={() => handleSaveEdit(p.id)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                                                    {savingId === p.id ? 'Saving…' : 'Save'}
                                                </button>
                                                <button type="button" onClick={() => setEditingId('')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 500 }}>{p.nameEn}</td>
                                        <td>{p.level}</td>
                                        <td>{p.coordinator ? p.coordinator.user.name : <span style={{ color: 'var(--ink-soft)' }}>Unassigned</span>}</td>
                                        <td>{p._count.courses}</td>
                                        <td>{p._count.students}</td>
                                        <td>
                                            <span className={`ih-badge ${p.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                {p.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <button type="button" onClick={() => startEdit(p)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={togglingId === p.id}
                                                    onClick={() => handleToggleActive(p)}
                                                    style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${p.isActive ? 'var(--danger-tint)' : 'var(--border)'}`, background: 'var(--surface)', color: p.isActive ? 'var(--danger)' : 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {togglingId === p.id ? 'Working…' : p.isActive ? 'Deactivate' : 'Reactivate'}
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
        </>
    );
}
