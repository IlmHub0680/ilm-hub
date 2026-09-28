'use client';
import { useState, useEffect, type CSSProperties } from 'react';

type Department = {
    id: string;
    nameEn: string;
    nameAr: string;
    code: string;
    description: string | null;
    isActive: boolean;
    head?: { user: { name: string } } | null;
    _count: { programs: number; staff: number; students: number };
};

const EMPTY_FORM = { nameEn: '', nameAr: '', code: '', description: '' };

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

export default function DeanDepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
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
            const response = await fetch('/api/dean/departments', { cache: 'no-store' });
            const result = await response.json();
            if (response.ok && result.success) {
                setDepartments(result.data || []);
            } else {
                setError(result.error || 'Failed to load departments.');
            }
        } catch {
            setError('Failed to load departments.');
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
            const response = await fetch('/api/dean/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create this department.');
            }

            setForm({ ...EMPTY_FORM });
            setMessage(`"${result.data.nameEn}" was added.`);
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to create this department.');
        } finally {
            setCreating(false);
        }
    }

    function startEdit(department: Department) {
        setEditingId(department.id);
        setEditForm({
            nameEn: department.nameEn,
            nameAr: department.nameAr,
            code: department.code,
            description: department.description || '',
        });
        setMessage('');
        setError('');
    }

    async function handleSaveEdit(id: string) {
        setSavingId(id);
        setError('');

        try {
            const response = await fetch(`/api/dean/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nameEn: editForm.nameEn, nameAr: editForm.nameAr, description: editForm.description }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update this department.');
            }

            setEditingId('');
            setMessage('Department updated.');
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to update this department.');
        } finally {
            setSavingId('');
        }
    }

    async function handleToggleActive(department: Department) {
        setTogglingId(department.id);
        setError('');
        setMessage('');

        try {
            if (department.isActive) {
                const response = await fetch(`/api/dean/departments/${department.id}`, { method: 'DELETE' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to deactivate this department.');
                setMessage('Department deactivated.');
            } else {
                const response = await fetch(`/api/dean/departments/${department.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: true }),
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || 'Failed to reactivate this department.');
                setMessage('Department reactivated.');
            }
            await load();
        } catch (err: any) {
            setError(err.message || 'Failed to update this department.');
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

            <form onSubmit={handleCreate} className="ih-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
                <label style={{ flex: '1 1 200px' }}>
                    <span style={labelStyle}>English name</span>
                    <input required style={inputStyle} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} placeholder="e.g. Department of Hadith Studies" />
                </label>
                <label style={{ flex: '1 1 200px' }}>
                    <span style={labelStyle}>Arabic name</span>
                    <input required dir="rtl" style={inputStyle} value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} />
                </label>
                <label style={{ flex: '0 1 140px' }}>
                    <span style={labelStyle}>Code</span>
                    <input required style={inputStyle} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="HADITH" />
                </label>
                <label style={{ flex: '1 1 220px' }}>
                    <span style={labelStyle}>Description (optional)</span>
                    <input style={inputStyle} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </label>
                <button type="submit" disabled={creating} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {creating ? 'Adding…' : 'Add Department'}
                </button>
            </form>

            <div className="ih-tbl-wrap">
                <table className="ih-tbl">
                    <thead>
                        <tr>
                            <th>Department</th><th>Head</th><th>Programmes</th><th>Staff</th><th>Students</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={7}>Loading…</td></tr>
                        ) : departments.length === 0 ? (
                            <tr><td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={7}>No departments yet — add the first one above.</td></tr>
                        ) : (
                            departments.map((d) => (
                                editingId === d.id ? (
                                    <tr key={d.id}>
                                        <td colSpan={7}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, padding: '12px 0' }}>
                                                <label>
                                                    <span style={labelStyle}>English name</span>
                                                    <input style={inputStyle} value={editForm.nameEn} onChange={(e) => setEditForm((p) => ({ ...p, nameEn: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Arabic name</span>
                                                    <input dir="rtl" style={inputStyle} value={editForm.nameAr} onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))} />
                                                </label>
                                                <label>
                                                    <span style={labelStyle}>Description</span>
                                                    <input style={inputStyle} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button type="button" disabled={savingId === d.id} onClick={() => handleSaveEdit(d.id)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--brand)', color: 'var(--on-accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                                                    {savingId === d.id ? 'Saving…' : 'Save'}
                                                </button>
                                                <button type="button" onClick={() => setEditingId('')} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 500 }}>{d.nameEn}</td>
                                        <td>{d.head ? d.head.user.name : <span style={{ color: 'var(--ink-soft)' }}>Unassigned</span>}</td>
                                        <td>{d._count.programs}</td>
                                        <td>{d._count.staff}</td>
                                        <td>{d._count.students}</td>
                                        <td>
                                            <span className={`ih-badge ${d.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}>
                                                {d.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <button type="button" onClick={() => startEdit(d)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={togglingId === d.id}
                                                    onClick={() => handleToggleActive(d)}
                                                    style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${d.isActive ? 'var(--danger-tint)' : 'var(--border)'}`, background: 'var(--surface)', color: d.isActive ? 'var(--danger)' : 'var(--ink)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {togglingId === d.id ? 'Working…' : d.isActive ? 'Deactivate' : 'Reactivate'}
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
