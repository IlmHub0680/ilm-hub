'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const fieldStyle = { border: '1px solid var(--border)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, width: '100%', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)' };

export default function AdminStaffPage() {
    const [staff, setStaff] = useState([]);
    const [positions, setPositions] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [credentials, setCredentials] = useState(null);
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        positionId: '',
        facultyId: '',
        departmentId: '',
        employeeNo: '',
    });

    const fetchData = () => {
        setLoading(true);
        fetch('/api/admin/staff', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load staff.');
                setStaff(result.staff || []);
                setPositions(result.positions || []);
                setFaculties(result.faculties || []);
                setDepartments(result.departments || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredDepartments = form.facultyId
        ? departments.filter((d) => d.facultyId === form.facultyId)
        : departments;

    const handleCreate = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.positionId) {
            setMessage('Name, email, and a position are required.');
            return;
        }

        setCreating(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const result = await res.json();

            if (res.ok) {
                setCredentials(result.data);
                setForm({
                    name: '',
                    email: '',
                    positionId: '',
                    facultyId: '',
                    departmentId: '',
                    employeeNo: '',
                });
                fetchData();
            } else {
                setMessage(result.error || 'Failed to create staff member.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setCreating(false);
        }
    };

    // Staff status (Model 21, Section 11) — Active/On Leave/Inactive/Former.
    // Every status change is a plain field update (no row is ever
    // deleted), so qualifications, development records, performance
    // reviews and everything this person taught stay on record
    // regardless of their current status.
    const STAFF_STATUS_OPTIONS = ['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'FORMER'];
    const STAFF_STATUS_LABELS = {
        ACTIVE: 'Active',
        ON_LEAVE: 'On Leave',
        INACTIVE: 'Inactive',
        FORMER: 'Former',
    };
    const STAFF_STATUS_BADGE = {
        ACTIVE: 'ih-b-success',
        ON_LEAVE: 'ih-b-warning',
        INACTIVE: 'ih-b-danger',
        FORMER: 'ih-b-danger',
    };

    const changeStatus = async (id, status) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/admin/staff/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const result = await res.json();
            if (res.ok) {
                fetchData();
            } else {
                setMessage(result.error || 'Failed to update staff member.');
            }
        } catch {
            setMessage('An error occurred.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
                <Link href="/admin" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                    ← Back to Admin Overview
                </Link>

                <h1 style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 28, margin: '20px 0 6px' }}>
                    Staff Management
                </h1>
                <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 24 }}>
                    Onboard new staff and assign them a position. Their operational
                    dashboard access is determined entirely by the position's module
                    permissions.
                </p>

                {error && (
                    <div className="ih-card" style={{ background: 'var(--danger-tint)', color: 'var(--danger)', border: '1px solid var(--danger)', marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="ih-card" style={{ padding: '10px 14px', background: 'var(--danger-tint)', color: 'var(--danger)', marginBottom: 16 }}>
                        {message}
                    </div>
                )}

                {credentials && (
                    <div className="ih-card" style={{ background: 'var(--success-tint)', color: 'var(--success)', border: '1px solid var(--success)', marginBottom: 20 }}>
                        <strong>Staff account created.</strong> Share these credentials
                        with them securely — this password will not be shown again.
                        <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--surface)', color: 'var(--ink)', padding: 10, borderRadius: 6, border: '1px solid var(--success)' }}>
                            Email: {credentials.email}<br />
                            Temporary password: {credentials.temporaryPassword}
                        </div>
                        <button onClick={() => setCredentials(null)} className="ih-btn ih-btn-secondary" style={{ marginTop: 10, padding: '6px 12px', fontSize: 12 }}>
                            Dismiss
                        </button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 20, alignItems: 'start' }}>
                    <section className="ih-card">
                        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Add Staff Member</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={fieldStyle} />
                            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={fieldStyle} />

                            <select value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })} style={fieldStyle}>
                                <option value="">Select position</option>
                                {positions.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nameEn}</option>
                                ))}
                            </select>

                            <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value, departmentId: '' })} style={fieldStyle}>
                                <option value="">Faculty (optional)</option>
                                {faculties.map((f) => (
                                    <option key={f.id} value={f.id}>{f.nameEn}</option>
                                ))}
                            </select>

                            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} style={fieldStyle}>
                                <option value="">Department (optional)</option>
                                {filteredDepartments.map((d) => (
                                    <option key={d.id} value={d.id}>{d.nameEn}</option>
                                ))}
                            </select>

                            <input type="text" placeholder="Employee no. (auto-generated if blank)" value={form.employeeNo} onChange={(e) => setForm({ ...form, employeeNo: e.target.value })} style={fieldStyle} />

                            <button onClick={handleCreate} disabled={creating} className="ih-btn ih-btn-primary">
                                {creating ? 'Creating…' : 'Create Staff Account'}
                            </button>
                        </div>
                    </section>

                    <section className="ih-card">
                        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>All Staff</h2>

                        {loading && <p>Loading staff…</p>}

                        {!loading && staff.length === 0 && (
                            <p style={{ color: 'var(--ink-soft)' }}>No staff members yet.</p>
                        )}

                        {!loading && staff.length > 0 && (
                            <div className="ih-tbl-wrap">
                                <table className="ih-tbl">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Position</th>
                                            <th>Faculty / Dept</th>
                                            <th>Employee No.</th>
                                            <th>Status</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.map((s) => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                    <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{s.email}</div>
                                                </td>
                                                <td>{s.position}</td>
                                                <td>{[s.faculty, s.department].filter(Boolean).join(' / ') || '—'}</td>
                                                <td className="mono">{s.employeeNo}</td>
                                                <td>
                                                    <span className={`ih-badge ${STAFF_STATUS_BADGE[s.status] || (s.isActive ? 'ih-b-success' : 'ih-b-danger')}`}>
                                                        {STAFF_STATUS_LABELS[s.status] || (s.isActive ? 'Active' : 'Inactive')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <select
                                                        disabled={busyId === s.id}
                                                        value={s.status || (s.isActive ? 'ACTIVE' : 'INACTIVE')}
                                                        onChange={(e) => changeStatus(s.id, e.target.value)}
                                                        style={{ ...fieldStyle, padding: '6px 8px', fontSize: 12, width: 'auto' }}
                                                    >
                                                        {STAFF_STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt} value={opt}>{STAFF_STATUS_LABELS[opt]}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <Link href={`/admin/staff/${s.id}`} style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                                                        Profile →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
