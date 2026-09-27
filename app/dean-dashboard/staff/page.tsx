'use client';
import { useEffect, useState } from 'react';

type StaffRow = {
    id: string;
    employeeNo: string;
    title: string | null;
    isActive: boolean;
    status: string;
    specialization: string | null;
    user: { name: string; email: string };
    position: { nameEn: string; isAcademic: boolean };
    department: { nameEn: string } | null;
};

export default function DeanStaffPage() {
    const [staff, setStaff] = useState<StaffRow[]>([]);
    const [faculty, setFaculty] = useState<{ id: string; nameEn: string } | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [q, setQ] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/dean/staff', { credentials: 'include' })
            .then(async (res) => {
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Failed to load faculty staff.');
                setFaculty(result.faculty || null);
                setMessage(result.message || '');
                setStaff(result.staff || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="ih-card">Loading…</div>;
    if (error) return <div className="ih-card" style={{ color: 'var(--danger)' }}>{error}</div>;
    if (!faculty && message) {
        return <div className="ih-card" style={{ background: 'var(--warning-tint)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>{message}</div>;
    }

    const filtered = q.trim()
        ? staff.filter((s) =>
              s.user.name.toLowerCase().includes(q.toLowerCase()) ||
              s.user.email.toLowerCase().includes(q.toLowerCase()) ||
              s.position.nameEn.toLowerCase().includes(q.toLowerCase()) ||
              (s.department?.nameEn || '').toLowerCase().includes(q.toLowerCase())
          )
        : staff;

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <section className="ih-card">
                <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Faculty Staff Roster</h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                    Every staff member in this faculty, by name, position and department.
                </p>
                <input
                    placeholder="Search by name, email, position or department…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ width: '100%', maxWidth: 420, boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13.5, background: 'var(--surface)', color: 'var(--ink)', marginBottom: 14 }}
                />
                <div className="ih-tbl-wrap">
                    <table className="ih-tbl">
                        <thead><tr><th>Name</th><th>Position</th><th>Department</th><th>Specialization</th><th>Status</th></tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>No staff match.</td></tr>
                            ) : filtered.map((s) => (
                                <tr key={s.id}>
                                    <td><div style={{ fontWeight: 600 }}>{s.user.name}</div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{s.user.email}</div></td>
                                    <td>{s.position.nameEn}{s.position.isAcademic ? '' : <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-soft)' }}>(non-academic)</span>}</td>
                                    <td>{s.department?.nameEn || '—'}</td>
                                    <td>{s.specialization || '—'}</td>
                                    <td>
                                        <span className={`ih-badge ${s.isActive ? 'ih-b-success' : 'ih-b-neutral'}`}>{s.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
